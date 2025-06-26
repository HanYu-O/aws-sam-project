#!/bin/bash

# Prisma Layer 优化脚本
# 确保Prisma在Lambda Layer中正常工作

set -e

LAYER_PRISMA_DIR="layer/nodejs/node_modules/@prisma/client"

if [ -d "$LAYER_PRISMA_DIR" ]; then
    echo "🔧 优化 Prisma Layer 配置..."
    
    # 确保包含正确的查询引擎二进制文件
    ENGINES_DIR="$LAYER_PRISMA_DIR"
    
    # 检查Linux ARM64二进制文件
    if ! find "$ENGINES_DIR" -name "*linux-arm64*" -type f | grep -q .; then
        echo "⚠️  缺少 Linux ARM64 二进制文件，重新生成..."
        cd layer/nodejs
        PRISMA_CLI_BINARY_TARGETS=linux-arm64-openssl-3.0.x npx prisma generate
        cd ../..
    fi
    
    echo "✅ Prisma Layer 优化完成"
else
    echo "⚠️  未找到 Prisma 客户端，跳过优化"
fi 