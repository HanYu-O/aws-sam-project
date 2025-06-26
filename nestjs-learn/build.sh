#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# 检查必要工具
check_dependencies() {
    log "检查必要工具..."
    
    if ! command -v node &> /dev/null; then
        error "Node.js 未安装"
    fi
    
    if ! command -v npm &> /dev/null; then
        error "npm 未安装"
    fi
    
    if ! command -v sam &> /dev/null; then
        error "AWS SAM CLI 未安装"
    fi
    
    success "所有依赖检查通过 ✓"
}

# 检查Docker（仅用于本地启动）
check_docker() {
    log "检查 Docker 状态..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker 未安装，SAM 本地服务需要 Docker"
    fi
    
    if ! docker info &> /dev/null; then
        error "Docker 未运行，请启动 Docker 后再试"
    fi
    
    success "Docker 检查通过 ✓"
}

# 配置npm镜像和临时缓存
setup_npm_registry() {
    log "配置npm镜像和临时缓存..."
    
    # 创建临时缓存目录
    export NPM_CACHE_DIR=$(mktemp -d)
    export NPM_CONFIG_CACHE="$NPM_CACHE_DIR"
    
    # 配置npm镜像和缓存
    npm config set registry https://registry.npmmirror.com
    npm config set cache "$NPM_CACHE_DIR"
    npm config set audit false
    npm config set fund false
    
    success "npm镜像和临时缓存配置完成 ✓"
}

# 构建NestJS应用
build_nestjs() {
    log "构建 NestJS 应用..."
    log "编译 TypeScript..."
    npm run build
    success "NestJS 构建完成 ✓"
}

# 构建Layer
build_layer() {
    log "构建 Lambda Layer..."
    
    if [ ! -f "scripts/build-layer.sh" ]; then
        error "Layer构建脚本不存在: scripts/build-layer.sh"
    fi
    
    ./scripts/build-layer.sh
    success "Layer 构建完成 ✓"
}

# 准备精简的Lambda部署包（不包含node_modules）
prepare_slim_lambda_package() {
    log "准备精简的 Lambda 部署包..."
    
    # 确保dist目录存在
    if [ ! -d "dist" ]; then
        error "dist 目录不存在，请先运行构建"
    fi
    
    # 创建精简包目录
    rm -rf dist-slim
    mkdir -p dist-slim
    
    # 复制编译后的代码（不包含node_modules）
    cp -r dist/* dist-slim/
    rm -rf dist-slim/node_modules  # 确保移除node_modules
    
    # 创建精简的package.json（仅用于标识，不包含dependencies）
    node -e "
        const pkg = JSON.parse(require('fs').readFileSync('package.json', 'utf8'));
        const slimPkg = {
            name: pkg.name,
            version: pkg.version,
            main: 'lambda.js'
        };
        require('fs').writeFileSync('dist-slim/package.json', JSON.stringify(slimPkg, null, 2));
    "
    
    success "精简的 Lambda 部署包准备完成 ✓"
}

# 准备Lambda部署包（保留原函数以兼容）
prepare_lambda_package() {
    warn "使用精简包模式，prepare_lambda_package 已被 prepare_slim_lambda_package 替代"
    prepare_slim_lambda_package
}

# SAM构建
sam_build() {
    log "执行 SAM 构建..."
    sam build
    
    # SAM构建后手动复制Linux ARM64二进制文件
    log "SAM构建后确保Linux ARM64二进制文件存在..."
    if [ -f "node_modules/@prisma/custom-client/libquery_engine-linux-arm64-openssl-3.0.x.so.node" ]; then
        cp "node_modules/@prisma/custom-client/libquery_engine-linux-arm64-openssl-3.0.x.so.node" \
           ".aws-sam/build/NestJSFunction/node_modules/@prisma/custom-client/"
        success "Linux ARM64二进制文件已复制到SAM构建目录 ✓"
    else
        warn "未找到Linux ARM64二进制文件，Lambda可能无法正常运行"
    fi
    
    success "SAM 构建完成 ✓"
}

# SAM本地启动
sam_start() {
    log "启动 SAM 本地服务..."
    
    # 从env.json中读取PORT
    local port=3000
    if [ -f "env.json" ]; then
        port=$(node -e "
            try {
                const env = JSON.parse(require('fs').readFileSync('env.json', 'utf8'));
                const nestPort = env.NestJSFunction && env.NestJSFunction.PORT;
                console.log(nestPort || '3000');
            } catch(e) {
                console.log('3000');
            }
        ")
    fi
    
    echo -e "${BLUE}🌐 API 将在以下地址可用:${NC}"
    echo -e "${BLUE}  - http://localhost:${port}${NC}"
    echo -e "${BLUE}  - http://localhost:${port}/blog${NC}"
    echo -e "${BLUE}  - http://localhost:${port}/github/repos/your-username${NC}"
    echo ""
    echo -e "${YELLOW}按 Ctrl+C 停止服务${NC}"
    echo ""
    
    sam local start-api --env-vars env.json --host 0.0.0.0 --port ${port}
}

# SAM部署
sam_deploy() {
    log "部署到 AWS..."
    sam deploy --guided
}

# 清理
clean() {
    log "清理构建文件..."
    rm -rf dist
    rm -rf dist-slim
    rm -rf layer
    rm -rf layer.zip
    rm -rf .aws-sam
    success "清理完成 ✓"
}

# 清理临时缓存
cleanup_temp_cache() {
    if [ -n "$NPM_CACHE_DIR" ] && [ -d "$NPM_CACHE_DIR" ]; then
        log "清理临时npm缓存..."
        rm -rf "$NPM_CACHE_DIR"
    fi
}

# 主函数
main() {
    # 设置退出时清理临时缓存
    trap cleanup_temp_cache EXIT
    
    case "$1" in
        --build)
            log "🚀 NestJS Lambda 构建开始..."
            check_dependencies
            setup_npm_registry
            build_nestjs
            build_layer  # 新增Layer构建
            prepare_slim_lambda_package  # 使用精简包
            sam_build
            success "🎉 构建完成！"
            ;;
        --start)
            log "🚀 启动本地开发服务..."
            check_dependencies
            check_docker
            setup_npm_registry
            build_nestjs
            build_layer  # 新增Layer构建
            prepare_slim_lambda_package  # 使用精简包
            sam_build
            sam_start
            ;;
        --deploy)
            log "🚀 部署到 AWS..."
            check_dependencies
            setup_npm_registry
            build_nestjs
            build_layer  # 新增Layer构建
            prepare_slim_lambda_package  # 使用精简包
            sam_build
            sam_deploy
            ;;
        --clean)
            clean
            ;;
        *)
            echo "用法: $0 [--build|--start|--deploy|--clean]"
            echo ""
            echo "选项:"
            echo "  --build   构建Lambda函数和Layer"
            echo "  --start   构建并启动本地API服务"
            echo "  --deploy  构建并部署到AWS"
            echo "  --clean   清理构建文件"
            echo ""
            echo "Layer相关命令:"
            echo "  npm run build:layer   仅构建Layer"
            echo "  npm run test:layer    测试Layer构建"
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@" 