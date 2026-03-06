# 3D俄罗斯方块游戏 - 开发与构建说明

本文档介绍如何开发、测试和将3D俄罗斯方块游戏打包到不同平台。

## 开发环境设置

### 1. 安装依赖

确保已安装以下工具：

- **Cocos Creator 3.8+**
- **Node.js**
- **Jest (用于单元测试)**

### 2. 安装项目依赖

```bash
npm install
```

## 单元测试

本项目包含全面的单元测试，用于验证游戏核心逻辑。

### 运行测试

```bash
# 运行所有测试
npm test

# 运行测试并监听更改
npm run test:watch

# 运行测试并生成覆盖率报告
npm run test:coverage
```

### 测试覆盖范围

单元测试覆盖了以下主要功能：

#### GridSystem3D
- 网格初始化和维度设置
- 位置有效性检查
- 单元格设置和获取
- 层完成检测
- 层清除操作
- 重力掉落功能

#### BlockPiece3D
- 方块形状创建（L形、I形、方形等）
- 移动功能（平移、定位）
- 旋转功能（绕各轴旋转）
- 碰撞检测
- 方块销毁

#### GameController
- 游戏状态管理
- 方块生成和锁定
- 移动和旋转控制
- 得分和等级系统
- 游戏结束和重启

## 打包脚本使用

项目提供了跨平台的构建脚本：

### Linux/macOS

```bash
# 查看帮助
./build_script.sh help

# 打包到 Web 平台
./build_script.sh web

# 打包到 Android 平台
./build_script.sh android

# 打包到 iOS 平台 (仅 macOS)
./build_script.sh ios

# 打包到所有支持的平台
./build_script.sh all
```

使脚本可执行：
```bash
chmod +x build_script.sh
```

### Windows

```cmd
REM 打包到 Web 平台
build_script.bat web

REM 查看帮助
build_script.bat help
```

## 平台特定说明

### Web 平台

- 输出路径: `build/web-mobile/`
- 包含可直接部署到 Web 服务器的 HTML/JS 文件
- 脚本会自动创建本地服务器启动脚本以方便测试

### Android 平台

- 输出路径: `build/android/`
- 生成 APK 文件用于安装
- 需要正确配置 Android SDK/NDK

### iOS 平台

- 输出路径: `build/ios/`
- 生成 Xcode 项目文件
- 需要在 Xcode 中进一步构建 IPA 文件

## 配置文件

### build_config.json

此文件包含各平台的构建配置：

```json
{
  "builder": {
    "android": {
      "packageName": "com.tetris3d.game",
      "appName": "3D Tetris",
      "orientation": {
        "landscapeLeft": true,
        "landscapeRight": true,
        "portrait": false,
        "upsideDown": false
      }
    },
    "ios": {
      "packageName": "com.tetris3d.game",
      "appName": "3D-Tetris",
      "orientation": {
        "landscapeLeft": true,
        "landscapeRight": true,
        "portrait": false,
        "upsideDown": false
      }
    },
    "web": {
      "embedWebDebugger": false,
      "platform": "web"
    }
  }
}
```

## 自定义构建

如需自定义构建过程，可以修改以下内容：

1. 修改 `build_config.json` 中的配置
2. 调整构建脚本中的参数
3. 在 Cocos Creator 编辑器中调整构建设置

## 部署

### Web 部署

将 `build/web-mobile/` 目录中的文件上传到 Web 服务器。

### 移动端部署

- **Android**: 直接安装 APK 文件到设备
- **iOS**: 通过 TestFlight 或企业证书分发

## 故障排除

### 构建失败

- 确认 Cocos Creator 版本兼容性
- 检查环境变量设置
- 确认项目文件完整性

### 测试失败

- 运行 `npm test` 查看具体错误
- 确保所有依赖已正确安装
- 检查 TypeScript 编译错误

### 平台特定问题

- **iOS**: 确保代码签名配置正确
- **Android**: 检查证书和权限设置
- **Web**: 确保服务器 MIME 类型配置正确

## 更新日志

- v1.0.0: 初始打包脚本发布
- 支持 Web、Android、iOS 平台构建
- 添加单元测试框架和基础测试用例
- 包含自动化配置验证