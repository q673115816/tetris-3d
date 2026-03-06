#!/bin/bash

# 3D俄罗斯方块游戏 - 多端打包脚本
# 支持打包到 Web、Android 和 iOS 平台

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目配置
PROJECT_PATH="$(pwd)"
BUILD_DIR="build"
PROJECT_NAME="tetris-3d"

echo -e "${BLUE}3D俄罗斯方块游戏 - 多端打包脚本${NC}"
echo "项目路径: $PROJECT_PATH"
echo ""

# 检查 Cocos Creator 是否已安装
check_cocos_creator() {
    if ! command -v cocos &> /dev/null; then
        echo -e "${RED}错误: 未找到 Cocos Creator 命令行工具${NC}"
        echo "请确保已安装 Cocos Creator 并将命令行工具添加到 PATH 中"
        exit 1
    fi
    echo -e "${GREEN}✓ 检测到 Cocos Creator${NC}"
}

# 检查必要文件
check_project_files() {
    if [ ! -f "package.json" ]; then
        echo -e "${RED}错误: 未找到 package.json 文件${NC}"
        echo "请确保在正确的项目根目录中运行此脚本"
        exit 1
    fi

    if [ ! -d "assets" ]; then
        echo -e "${RED}错误: 未找到 assets 目录${NC}"
        echo "请确保在正确的项目根目录中运行此脚本"
        exit 1
    fi

    echo -e "${GREEN}✓ 检测到项目文件${NC}"
}

# 打印使用说明
show_usage() {
    echo -e "${YELLOW}用法:${NC} $0 [选项]"
    echo ""
    echo -e "${YELLOW}可用选项:${NC}"
    echo "  web      - 打包到 Web 平台"
    echo "  android  - 打包到 Android 平台"
    echo "  ios      - 打包到 iOS 平台"
    echo "  all      - 打包到所有平台"
    echo "  help     - 显示此帮助信息"
    echo ""
    echo -e "${YELLOW}示例:${NC}"
    echo "  $0 web       - 构建 Web 版本"
    echo "  $0 android   - 构建 Android 版本"
    echo "  $0 all       - 构建所有版本"
}

# 打包到 Web 平台
build_web() {
    echo -e "${BLUE}开始打包到 Web 平台...${NC}"

    BUILD_PATH="$BUILD_DIR/web-mobile"

    # 创建构建目录
    mkdir -p "$BUILD_PATH"

    # 使用 Cocos Creator 构建 Web 版本
    if cocos build -p web-mobile -s . -d "$BUILD_DIR"; then
        echo -e "${GREEN}✓ Web 版本构建成功!${NC}"
        echo -e "${YELLOW}构建路径: $BUILD_DIR/web-mobile${NC}"

        # 创建 Web 服务器启动脚本
        cat > "$BUILD_PATH/run_server.sh" << EOF
#!/bin/bash
echo "启动本地 Web 服务器..."
echo "访问 http://localhost:8000 查看游戏"
python3 -m http.server 8000
EOF
        chmod +x "$BUILD_PATH/run_server.sh"

        echo -e "${GREEN}✓ 已创建本地服务器启动脚本: $BUILD_PATH/run_server.sh${NC}"
    else
        echo -e "${RED}✗ Web 版本构建失败${NC}"
        exit 1
    fi
}

# 打包到 Android 平台
build_android() {
    echo -e "${BLUE}开始打包到 Android 平台...${NC}"

    BUILD_PATH="$BUILD_DIR/android"

    # 检查 Android SDK 和 NDK
    if [ -z "$ANDROID_HOME" ]; then
        echo -e "${YELLOW}警告: 未设置 ANDROID_HOME 环境变量${NC}"
        echo -e "${YELLOW}请确保已安装 Android SDK${NC}"
    fi

    # 创建构建目录
    mkdir -p "$BUILD_PATH"

    # 使用 Cocos Creator 构建 Android 版本
    if cocos build -p android -s . -d "$BUILD_DIR"; then
        echo -e "${GREEN}✓ Android 版本构建成功!${NC}"
        echo -e "${YELLOW}构建路径: $BUILD_DIR/android${NC}"

        # 寻找 APK 文件
        APK_FILE=$(find "$BUILD_PATH" -name "*.apk" -type f | head -n 1)
        if [ -n "$APK_FILE" ]; then
            echo -e "${GREEN}✓ APK 文件: $APK_FILE${NC}"
        else
            echo -e "${YELLOW}⚠ 未找到 APK 文件，请检查构建输出${NC}"
        fi
    else
        echo -e "${RED}✗ Android 版本构建失败${NC}"
        exit 1
    fi
}

# 打包到 iOS 平台
build_ios() {
    # 检查平台是否为 macOS
    if [[ "$OSTYPE" != "darwin"* ]]; then
        echo -e "${RED}错误: iOS 打包仅支持 macOS 平台${NC}"
        return 1
    fi

    echo -e "${BLUE}开始打包到 iOS 平台...${NC}"

    BUILD_PATH="$BUILD_DIR/ios"

    # 检查 Xcode
    if ! command -v xcode-select &> /dev/null; then
        echo -e "${RED}错误: 未找到 Xcode 开发工具${NC}"
        return 1
    fi

    # 创建构建目录
    mkdir -p "$BUILD_PATH"

    # 使用 Cocos Creator 构建 iOS 版本
    if cocos build -p ios -s . -d "$BUILD_DIR"; then
        echo -e "${GREEN}✓ iOS 版本构建成功!${NC}"
        echo -e "${YELLOW}构建路径: $BUILD_DIR/ios${NC}"

        # 寻找 Xcode 项目文件
        XCODEPROJ_FILE=$(find "$BUILD_PATH" -name "*.xcodeproj" -type d | head -n 1)
        if [ -n "$XCODEPROJ_FILE" ]; then
            echo -e "${GREEN}✓ Xcode 项目: $XCODEPROJ_FILE${NC}"
            echo "使用 Xcode 打开项目以继续构建 IPA 文件"
        else
            echo -e "${YELLOW}⚠ 未找到 Xcode 项目文件，请检查构建输出${NC}"
        fi
    else
        echo -e "${RED}✗ iOS 版本构建失败${NC}"
        return 1
    fi
}

# 验证参数
validate_params() {
    case $1 in
        "web"|"android"|"ios"|"all"|"help")
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

# 主函数
main() {
    # 检查参数数量
    if [ $# -eq 0 ]; then
        show_usage
        exit 0
    fi

    # 验证参数
    if ! validate_params $1; then
        echo -e "${RED}错误: 无效的参数 '$1'${NC}"
        echo ""
        show_usage
        exit 1
    fi

    # 执行相应的构建任务
    case $1 in
        "web")
            check_cocos_creator
            check_project_files
            build_web
            ;;
        "android")
            check_cocos_creator
            check_project_files
            build_android
            ;;
        "ios")
            check_cocos_creator
            check_project_files
            build_ios
            ;;
        "all")
            check_cocos_creator
            check_project_files

            # 构建所有平台
            build_web
            if [[ "$OSTYPE" == "darwin"* ]]; then
                build_ios
            else
                echo -e "${YELLOW}跳过 iOS 构建 (仅支持 macOS)${NC}"
            fi
            build_android

            echo -e "${GREEN}✓ 所有支持的平台构建完成!${NC}"
            ;;
        "help")
            show_usage
            ;;
    esac
}

# 运行主函数
main "$@"