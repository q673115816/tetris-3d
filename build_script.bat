@echo off
REM 3D俄罗斯方块游戏 - Windows打包脚本
REM 支持打包到 Web 平台

setlocal enabledelayedexpansion

echo --------------------------------------------------------
echo     3D俄罗斯方块游戏 - Windows打包脚本
echo --------------------------------------------------------
echo.

REM 检查 Cocos Creator 是否已安装
cocos -h >nul 2>&1
if errorlevel 1 (
    echo.Error: 未找到 Cocos Creator 命令行工具
    echo.Please ensure Cocos Creator is installed and added to PATH
    pause
    exit /b 1
)

echo.Checking project files...
if not exist "package.json" (
    echo.Error: package.json not found
    pause
    exit /b 1
)

if not exist "assets" (
    echo.Error: assets directory not found
    pause
    exit /b 1
)

echo.

REM 检查参数
if "%~1"=="" (
    echo.Usage: %0 [web^|help]
    echo.
    echo.Available options:
    echo.  web  - Build for Web platform
    echo.  help - Show this help
    echo.
    echo.Examples:
    echo.  %0 web    - Build Web version
    pause
    exit /b 0
)

if /i "%~1"=="web" (
    goto build_web
) else if /i "%~1"=="help" (
    echo.Usage: %0 [web^|help]
    echo.
    echo.Available options:
    echo.  web  - Build for Web platform
    echo.  help - Show this help
    echo.
    echo.Examples:
    echo.  %0 web    - Build Web version
    pause
    exit /b 0
) else (
    echo.Error: Invalid option '%~1'
    echo.
    call :show_help
    pause
    exit /b 1
)

REM 构建Web版本
:build_web
echo.Starting build for Web platform...
echo.

set BUILD_PATH=build\web-mobile

REM 创建构建目录
if not exist "%BUILD_PATH%" (
    mkdir "%BUILD_PATH%"
)

echo.Building Web version...
cocos build -p web -s . -d build
if errorlevel 1 (
    echo.
    echo.Error: Web version build failed
    pause
    exit /b 1
)

echo.
echo.Success: Web version built successfully!
echo.Output path: %BUILD_PATH%
echo.

REM 创建本地服务器批处理文件
set SERVER_FILE=%BUILD_PATH%\run_server.bat
(
    echo.@echo off
    echo.echo Starting local web server...
    echo.echo Access the game at http://localhost:8000
    echo.python -m http.server 8000
) > "%SERVER_FILE%"

echo.Created local server script: %SERVER_FILE%
echo.
echo.Done!
pause
exit /b 0

REM 显示帮助信息
:show_help
echo.Usage: %0 [web^|help]
echo.
echo.Available options:
echo.  web  - Build for Web platform
echo.  help - Show this help
echo.
echo.Examples:
    echo.  %0 web    - Build Web version
goto :eof