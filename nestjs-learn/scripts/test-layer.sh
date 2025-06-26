#!/bin/bash

# Layer 测试脚本

set -e

echo "🧪 测试 Lambda Layer 构建..."

# 检查必要文件
echo "📋 检查构建产物..."
[ -f "layer.zip" ] && echo "✅ layer.zip 存在" || echo "❌ layer.zip 缺失"
[ -d "dist-slim" ] && echo "✅ dist-slim 目录存在" || echo "❌ dist-slim 目录缺失"

# 检查精简包大小
if [ -d "dist-slim" ]; then
    SLIM_SIZE=$(du -sh dist-slim | cut -f1)
    echo "📦 精简包大小: $SLIM_SIZE"
fi

# 检查Layer大小
if [ -f "layer.zip" ]; then
    LAYER_SIZE=$(ls -lh layer.zip | awk '{print $5}')
    echo "📦 Layer 大小: $LAYER_SIZE"
fi

# 检查Layer内容
if [ -d "layer/nodejs/node_modules" ]; then
    DEPS_COUNT=$(find layer/nodejs/node_modules -maxdepth 1 -type d | wc -l)
    echo "📦 Layer 依赖数量: $((DEPS_COUNT - 1))"
    
    # 检查关键依赖
    echo "🔍 关键依赖检查:"
    [ -d "layer/nodejs/node_modules/@nestjs" ] && echo "  ✅ NestJS" || echo "  ❌ NestJS"
    [ -d "layer/nodejs/node_modules/@prisma" ] && echo "  ✅ Prisma" || echo "  ❌ Prisma"
    [ -d "layer/nodejs/node_modules/@vendia" ] && echo "  ✅ Serverless Express" || echo "  ❌ Serverless Express"
fi

echo "🎉 Layer 测试完成" 