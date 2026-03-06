# 3D俄罗斯方块游戏 - 构建说明

## 概述

本文档说明如何将3D俄罗斯方块游戏项目构建到不同平台。项目目前已过完整验证，具备多平台构建能力。

## 构建环境要求

### Web平台
- Node.js (v14.0+)
- Python 3 (用于本地服务器)

### Android平台
- Android SDK
- Android NDK
- Java JDK 8+
- Gradle
- Cocos Creator 3.8+

### iOS平台 (macOS)
- Xcode
- iOS SDK
- Cocos Creator 3.8+

## 构建前准备

### 1. 安装依赖
```bash
npm install
```

### 2. 验证项目
运行以下命令验证项目完整性：
```bash
# 验证构建准备
./build-verification.sh

# 运行游戏逻辑测试
node test_logic.js  # (如有需要)
```

## 平台构建说明

### Web平台构建

#### 方法1: 使用构建验证脚本
```bash
./build-web-test.sh
```

构建产物位置：`./build/web-mobile/`

启动本地服务器：
```bash
cd build/web-mobile
./start-server.sh
```

#### 方法2: 使用Cocos Creator (推荐)
```bash
cocos build -p web-mobile
```

### Android平台构建

#### 验证构建配置
```bash
./build-android-test.sh
```

#### 完整构建 (需要Cocos Creator环境)
```bash
cocos build -p android
```

构建产物位置：`./build/jsb-default/`

### iOS平台构建 (macOS)

```bash
cocos build -p ios
```

构建产物位置：`./build/jsb-default/`

## 项目结构

```
tetris-3d/
├── assets/
│   ├── scripts/          # 游戏脚本
│   │   ├── GameController.ts    # 游戏主控制器
│   │   ├── GridSystem3D.ts      # 3D网格系统
│   │   ├── BlockPiece3D.ts      # 3D方块组件
│   │   ├── InputHandler.ts      # 输入处理
│   │   ├── GameStateManager.ts  # 游戏状态管理
│   │   ├── GameInitializer.ts   # 游戏初始化
│   │   └── Main.ts             # 项目入口
│   └── resources/        # 游戏资源
├── build/               # 构建输出目录
├── tests/               # 测试文件
├── build_config.json    # 构建配置
├── build_script.sh      # 原始构建脚本
├── build-web-test.sh    # Web构建验证
├── build-android-test.sh # Android构建验证
├── build-verification.sh # 通用验证脚本
└── ...
```

## 游戏功能验证

构建完成后，可通过以下方式验证游戏功能：

### 1. Web版本
- 打开构建产物目录中的`index.html`
- 或使用本地服务器启动游戏

### 2. 移动平台
- 安装APK/IPA文件到设备
- 按照游戏内说明进行测试

## 游戏控制

### 移动控制
- **A键 / ←键**: 向左移动
- **D键 / →键**: 向右移动
- **W键 / ↑键**: 向前移动
- **S键 / ↓键**: 向后移动

### 旋转控制
- **Q键**: 顺时针旋转
- **E键**: 逆时针旋转
- **Z键**: 绕X轴旋转
- **C键**: 绕Z轴旋转

### 游戏控制
- **空格键**: 快速下落
- **P键**: 暂停/继续
- **S键**: 保存游戏
- **L键**: 加载游戏
- **R键**: 重新开始

## 构建故障排除

### 常见问题

1. **Cocos命令不存在**
   ```
   请确认已安装Cocos Creator并配置了命令行工具
   ```

2. **缺少Android环境**
   ```
   请安装Android SDK、NDK和Java环境
   设置ANDROID_HOME和JAVA_HOME环境变量
   ```

3. **TypeScript编译错误**
   ```
   检查tsconfig.json配置
   确认所有TypeScript文件语法正确
   ```

4. **构建配置错误**
   ```
   验证build_config.json内容
   确认包名、应用名等配置项正确
   ```

### 调试构建
```bash
# 启用详细输出
cocos build -p web-mobile -v

# 查看构建日志
cocos compile -p web-mobile --build-log-file
```

## 部署说明

### Web部署
- 将`build/web-mobile`目录中的内容部署到Web服务器
- 确保服务器支持所需的MIME类型

### Android部署
- 将生成的APK文件安装到Android设备
- 或上传到应用商店

### iOS部署
- 使用Xcode打开生成的项目
- 配置证书并构建IPA文件

## 版本信息

- **项目版本**: 1.1.0
- **Cocos Creator版本**: 3.8.8
- **核心功能**: 3D俄罗斯方块游戏
- **新增功能**: 游戏状态保存/加载，暂停/恢复