#!/bin/bash

# ============================================
# Android APK 构建脚本 - 优化版
# 支持多种构建模式和架构拆分
# ============================================

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

# 参数解析
BUILD_TYPE="${1:-release}"
ARCH="${2:-all}"  # all, arm64-v8a, armeabi-v7a, x86, x86_64

# 显示帮助信息
show_help() {
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}  Android APK 构建脚本 (优化版)${NC}"
    echo -e "${CYAN}========================================${NC}"
    echo ""
    echo -e "${GREEN}用法: ./scripts/build-android.sh [build_type] [arch]${NC}"
    echo ""
    echo -e "${YELLOW}构建类型 (build_type):${NC}"
    echo -e "  ${GREEN}debug${NC}   - Debug 版本（用于开发调试）"
    echo -e "  ${GREEN}release${NC} - Release 版本（用于生产发布）"
    echo ""
    echo -e "${YELLOW}架构 (arch):${NC}"
    echo -e "  ${GREEN}all${NC}         - 所有架构（生成 5 个 APK）"
    echo -e "  ${GREEN}arm64-v8a${NC}  - 64 位 ARM（主流手机）"
    echo -e "  ${GREEN}armeabi-v7a${NC} - 32 位 ARM（老设备）"
    echo -e "  ${GREEN}x86${NC}        - x86 模拟器"
    echo -e "  ${GREEN}x86_64${NC}     - 64 位 x86 模拟器"
    echo -e "  ${GREEN}universal${NC}  - 通用 APK（包含所有架构）"
    echo ""
    echo -e "${YELLOW}示例:${NC}"
    echo -e "  ./scripts/build-android.sh release all"
    echo -e "  ./scripts/build-android.sh release arm64-v8a"
    echo -e "  ./scripts/build-android.sh debug"
    echo ""
}

# 显示横幅
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Android APK 构建脚本 (优化版)${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${YELLOW}构建类型: ${BUILD_TYPE}${NC}"
echo -e "${YELLOW}目标架构: ${ARCH}${NC}"
echo -e "${YELLOW}项目路径: ${PROJECT_ROOT}${NC}"
echo ""

# 如果是 help 参数，显示帮助信息
if [ "$BUILD_TYPE" = "help" ] || [ "$BUILD_TYPE" = "--help" ] || [ "$BUILD_TYPE" = "-h" ]; then
    show_help
    exit 0
fi

# Step 1: 清理旧的打包文件
echo -e "${GREEN}[1/5] 清理旧的 bundle 文件...${NC}"
rm -rf android/app/src/main/assets/*.bundle*
rm -rf android/app/build/outputs/apk
mkdir -p android/app/src/main/assets

# Step 2: 打包 JS Bundle
echo -e "${GREEN}[2/5] 打包 JS Bundle...${NC}"
if [ "$BUILD_TYPE" = "debug" ]; then
    npx react-native bundle \
        --entry-file index.js \
        --platform android \
        --dev true \
        --bundle-output android/app/src/main/assets/index.android.bundle \
        --assets-dest android/app/src/main/res \
        --max-workers 4
else
    # Release 模式启用 Hermes 编译优化
    npx react-native bundle \
        --entry-file index.js \
        --platform android \
        --dev false \
        --bundle-output android/app/src/main/assets/index.android.bundle \
        --assets-dest android/app/src/main/res \
        --max-workers 4
fi

# Step 3: 显示打包结果
echo -e "${GREEN}[3/5] Bundle 打包完成，检查生成的文件...${NC}"
BUNDLE_SIZE=$(ls -lh android/app/src/main/assets/index.android.bundle 2>/dev/null | awk '{print $5}')
echo -e "  Bundle 大小: ${YELLOW}$BUNDLE_SIZE${NC}"
echo ""

# Step 4: 构建 APK
echo -e "${GREEN}[4/5] 构建 Android APK...${NC}"
cd android

# 确保 codegen 生成（New Architecture 需要）
echo -e "${YELLOW}  -> 运行 codegen...${NC}"
./gradlew generateCodegenArtifactsFromSchema --quiet 2>/dev/null || true

# 根据架构选择构建命令
case "$ARCH" in
    all)
        echo -e "${YELLOW}  -> 构建所有架构 APK...${NC}"
        if [ "$BUILD_TYPE" = "debug" ]; then
            ./gradlew assembleDebug
            APK_PATTERN="app/build/outputs/apk/debug/*-debug.apk"
        else
            ./gradlew assembleRelease
            APK_PATTERN="app/build/outputs/apk/release/*-release.apk"
        fi
        ;;
    arm64-v8a|armeabi-v7a|x86|x86_64|universal)
        ABI_FILTER="$ARCH"
        echo -e "${YELLOW}  -> 构建 ${ABI_FILTER} 架构 APK...${NC}"
        if [ "$BUILD_TYPE" = "debug" ]; then
            ./gradlew assembleDebug -PabiFilter=$ABI_FILTER
            APK_PATTERN="app/build/outputs/apk/debug/*-${ABI_FILTER}-*.apk"
        else
            ./gradlew assembleRelease -PabiFilter=$ABI_FILTER
            APK_PATTERN="app/build/outputs/apk/release/*-${ABI_FILTER}-*.apk"
        fi
        ;;
    *)
        echo -e "${RED}  -> 未知架构: $ARCH${NC}"
        echo -e "${YELLOW}  -> 构建通用 APK...${NC}"
        if [ "$BUILD_TYPE" = "debug" ]; then
            ./gradlew assembleDebug
            APK_PATTERN="app/build/outputs/apk/debug/*-debug.apk"
        else
            ./gradlew assembleRelease
            APK_PATTERN="app/build/outputs/apk/release/*-release.apk"
        fi
        ;;
esac

cd ..

# Step 5: 显示结果
echo ""
echo -e "${GREEN}[5/5] 构建完成!${NC}"
echo -e "${BLUE}========================================${NC}"

# 查找生成的 APK 文件
APK_FILES=$(find android -name "*.apk" -path "*/outputs/apk/*" 2>/dev/null)

if [ -n "$APK_FILES" ]; then
    echo -e "${GREEN}✅ APK 生成成功!${NC}"
    echo ""
    echo -e "${CYAN}生成的 APK 文件:${NC}"

    TOTAL_SIZE=0
    APK_COUNT=0

    while IFS= read -r apk; do
        if [ -f "$apk" ]; then
            APK_SIZE=$(ls -lh "$apk" | awk '{print $5}')
            APK_NAME=$(basename "$apk")
            REL_PATH=$(realpath --relative-to="$PROJECT_ROOT" "$apk")

            # 计算总大小
            SIZE_NUM=$(echo "$APK_SIZE" | sed 's/M/1024/;s/K/1/;s/G/1024000/' | bc 2>/dev/null || echo "0")
            TOTAL_SIZE=$((TOTAL_SIZE + SIZE_NUM))
            APK_COUNT=$((APK_COUNT + 1))

            echo -e "  ${GREEN}📦 ${APK_NAME}${NC}"
            echo -e "     路径: ${YELLOW}${REL_PATH}${NC}"
            echo -e "     大小: ${YELLOW}${APK_SIZE}${NC}"
            echo ""
        fi
    done <<< "$APK_FILES"

    # 显示总结
    if [ $APK_COUNT -gt 1 ]; then
        echo -e "${CYAN}========================================${NC}"
        echo -e "${CYAN}  构建总结${NC}"
        echo -e "${CYAN}========================================${NC}"
        echo -e "  APK 数量: ${GREEN}$APK_COUNT${NC}"
        echo -e "  总大小:   ${YELLOW}$(echo "scale=2; $TOTAL_SIZE/1024" | bc 2>/dev/null || echo "$TOTAL_SIZE") MB${NC}"
        echo ""
        echo -e "${YELLOW}💡 提示: 按架构拆分可以显著减少用户下载体积${NC}"
        echo -e "   - arm64-v8a: 主流 64 位 ARM 设备 (~8-10MB)"
        echo -e "   - armeabi-v7a: 32 位 ARM 设备 (~7-9MB)"
        echo -e "   - universal: 包含所有架构 (~20-25MB)"
        echo ""
    fi

    # 复制 APK 到项目根目录方便访问
    echo -e "${GREEN}复制 APK 到项目根目录...${NC}"
    for apk in $APK_FILES; do
        if [ -f "$apk" ]; then
            APK_NAME=$(basename "$apk")
            cp "$apk" "./${APK_NAME}"
            echo -e "  ✅ ${APK_NAME}"
        fi
    done
    echo ""
    echo -e "${GREEN}所有 APK 已复制到项目根目录${NC}"
else
    echo -e "${RED}❌ APK 生成失败，请检查错误日志${NC}"
    echo ""
    echo -e "${YELLOW}常见问题:${NC}"
    echo -e "  1. 检查 keystore 文件是否正确配置"
    echo -e "  2. 检查 hermesEnabled 配置"
    echo -e "  3. 查看详细日志: cd android && ./gradlew assembleRelease --stacktrace"
    exit 1
fi

echo -e "${BLUE}========================================${NC}"
