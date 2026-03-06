# 3D俄罗斯方块游戏场景设置指南

如果您在运行游戏时只看到主灯光和主相机，说明游戏对象尚未正确设置。请按照以下步骤设置游戏场景：

## 在Cocos Creator中设置场景

### 方法一：使用现有脚本快速设置

1. 打开Cocos Creator 3.8+
2. 打开项目
3. 创建一个新的场景（菜单：Assets -> New -> Scene）或打开现有的场景
4. 在层级管理器(Hierarchy)中右键 -> Create Empty，创建一个空节点，命名为"GameRoot"
5. 选中GameRoot节点，在属性检查器(Inspector)中点击"Add Component" -> "New Script Component"
6. 创建一个名为"GameInitializer"的新脚本，或使用已有的GameInitializer.ts
7. 将GameInitializer.ts脚本拖拽到GameRoot节点上

### 方法二：手动创建游戏对象

1. 在层级管理器中创建以下节点结构：

```
GameRoot (空节点)
├── GridSystem3D (空节点，添加GridSystem3D组件)
├── GameController (空节点，添加GameController组件)
├── GameScene (空节点，作为方块的父节点)
└── GameUI (空节点，添加GameUI组件，如果存在的话)
```

2. 在GameController节点上设置属性：
   - Grid System 3D: 拖拽GridSystem3D节点到这里
   - Block Prefab: 如果有方块预制件则拖拽到这里
   - Game Scene: 拖拽GameScene节点到这里

3. 保存场景，并在项目设置中将其设置为主场景

### 方法三：使用Main脚本

1. 创建一个名为"Main"的节点
2. 将assets/scripts/Main.ts脚本附加到该节点
3. 这个脚本会在运行时自动初始化游戏场景

## 场景设置验证

当场景正确设置后，您应该能看到：

- 3D网格系统（虚拟的网格线，根据GridSystem3D的设置）
- 自动生成的3D方块
- 随着时间推移，方块会按照俄罗斯方块规则下落

## 常见问题排查

1. **脚本未找到错误**：确认所有.ts文件都在assets/scripts/目录下
2. **组件未绑定**：确保在Inspector面板中正确绑定了各个组件
3. **预制件缺失**：GameController期望一个方块预制件，如果没有可以暂时忽略
4. **运行时错误**：检查控制台输出，通常是组件引用未正确设置

## 重要提示

- Cocos Creator项目必须在编辑器中进行场景设置
- 组件之间的引用地必须在编辑器中通过拖拽方式设置
- 运行前请确保场景已保存
- 所有脚本必须正确导入和导出