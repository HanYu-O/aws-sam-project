#!/bin/bash

# Lambda Layer 构建脚本
# 用于构建包含所有依赖的 Lambda Layer

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[LAYER-BUILD]${NC} $1"; }
error() { echo -e "${RED}[LAYER-ERROR]${NC} $1"; exit 1; }
success() { echo -e "${GREEN}[LAYER-SUCCESS]${NC} $1"; }

# 配置
LAYER_DIR="layer"
NODEJS_DIR="$LAYER_DIR/nodejs"
NODE_MODULES_DIR="$NODEJS_DIR/node_modules"

# 清理旧的Layer构建
cleanup_layer() {
    log "清理旧的 Layer 构建..."
    rm -rf "$LAYER_DIR"
    rm -rf layer.zip
}

# 创建Layer目录结构
create_layer_structure() {
    log "创建 Layer 目录结构..."
    mkdir -p "$NODEJS_DIR"
}

# 准备生产依赖的package.json
prepare_production_package() {
    log "准备生产环境 package.json..."
    
    # 使用Node.js清理package.json
    node -e "
        const fs = require('fs');
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        // 保留必要字段，移除开发相关
        const prodPkg = {
            name: pkg.name,
            version: pkg.version,
            dependencies: pkg.dependencies || {},
            engines: pkg.engines || {}
        };
        
        fs.writeFileSync('$NODEJS_DIR/package.json', JSON.stringify(prodPkg, null, 2));
    "
    
    success "生产环境 package.json 创建完成"
}

# 安装生产依赖
install_production_dependencies() {
    log "安装生产依赖到 Layer..."
    
    cd "$NODEJS_DIR"
    
    # 配置npm以优化Layer构建
    npm config set audit false
    npm config set fund false
    
    # 安装生产依赖（使用新版npm语法）
    npm install --omit=dev --omit=optional --no-audit --no-fund
    
    cd ../..
    success "生产依赖安装完成"
}

# 处理Prisma特殊要求
handle_prisma_optimization() {
    log "处理 Prisma Layer 优化..."
    
    # 复制Prisma schema到Layer
    if [ -f "prisma/schema.prisma" ]; then
        mkdir -p "$NODEJS_DIR/prisma"
        cp prisma/schema.prisma "$NODEJS_DIR/prisma/"
        log "Prisma schema 已复制到 Layer"
    fi
    
    # 在Layer中生成Prisma客户端
    cd "$NODEJS_DIR"
    
    if [ -f "package.json" ] && grep -q "@prisma/client" package.json; then
        log "在 Layer 中生成 Prisma 客户端..."
        npx prisma generate
        
        # 确保Linux ARM64二进制文件存在
        PRISMA_CLIENT_DIR="node_modules/@prisma/client"
        QUERY_ENGINE_FILE="libquery_engine-linux-arm64-openssl-3.0.x.so.node"
        
        if [ -d "$PRISMA_CLIENT_DIR" ]; then
            # 检查是否存在正确的二进制文件
            if find "$PRISMA_CLIENT_DIR" -name "*linux-arm64*" -type f | grep -q .; then
                success "Prisma Linux ARM64 二进制文件已准备就绪"
            else
                log "强制下载 Linux ARM64 Prisma 二进制文件..."
                PRISMA_CLI_BINARY_TARGETS=linux-arm64-openssl-3.0.x npx prisma generate
            fi
        fi
    fi
    
    cd ../..
    success "Prisma 优化完成"
}

# 优化Layer大小
optimize_layer_size() {
    log "优化 Layer 大小..."
    
    cd "$NODE_MODULES_DIR"
    
    # 移除不必要的文件
    find . -name "*.d.ts" -delete
    find . -name "*.map" -delete  
    find . -name "README*" -delete
    find . -name "CHANGELOG*" -delete
    find . -name "*.md" -delete
    find . -name "test" -type d -exec rm -rf {} + 2>/dev/null || true
    find . -name "tests" -type d -exec rm -rf {} + 2>/dev/null || true
    find . -name "docs" -type d -exec rm -rf {} + 2>/dev/null || true
    find . -name "examples" -type d -exec rm -rf {} + 2>/dev/null || true
    
    cd ../../..
    success "Layer 大小优化完成"
}

# 创建Layer压缩包
create_layer_zip() {
    log "创建 Layer 压缩包..."
    
    cd "$LAYER_DIR"
    zip -r ../layer.zip . -x "*.DS_Store*" "*/.*"
    cd ..
    
    # 显示压缩包信息
    LAYER_SIZE=$(ls -lh layer.zip | awk '{print $5}')
    success "Layer 压缩包创建完成: layer.zip ($LAYER_SIZE)"
}

# 显示Layer内容统计
show_layer_stats() {
    log "Layer 内容统计："
    
    echo "📦 依赖包数量: $(find "$NODE_MODULES_DIR" -maxdepth 1 -type d | wc -l | tr -d ' ')"
    echo "📁 目录大小: $(du -sh "$LAYER_DIR" | cut -f1)"
    echo "🗜️  压缩包大小: $(ls -lh layer.zip | awk '{print $5}')"
    
    # 列出主要依赖
    echo "🔧 主要依赖："
    ls "$NODE_MODULES_DIR" | grep -E "^(@nestjs|@prisma|@vendia)" | head -10 | sed 's/^/  - /'
}

# 主函数
main() {
    log "开始构建 Lambda Layer..."
    
    cleanup_layer
    create_layer_structure
    prepare_production_package
    install_production_dependencies
    handle_prisma_optimization
    optimize_layer_size
    create_layer_zip
    show_layer_stats
    
    success "🎉 Lambda Layer 构建完成！"
    echo ""
    echo "📋 下一步："
    echo "  1. 更新 template.yaml 添加 Layer 定义"
    echo "  2. 修改函数配置使用 Layer"
    echo "  3. 运行 sam build 测试"
}

# 执行主函数
main "$@" 