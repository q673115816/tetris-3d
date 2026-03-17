import { _decorator, Camera, Canvas, Component, DirectionalLight, Label, Node, UITransform, Vec3, director } from 'cc';
import { GridSystem3D } from './GridSystem3D';
import { GameController } from './GameController';
import { GameStateManager } from './GameStateManager';
import { InputHandler } from './InputHandler';
import { ManualBlockController } from './ManualBlockController';
import { createVisibleBoxNode } from './BlockVisualFactory';

const { ccclass, property } = _decorator;

@ccclass('GameInitializer')
export class GameInitializer extends Component {
    private initialized = false;

    start() {
        this.initializeGameScene();
    }

    public initializeGameScene() {
        if (this.initialized) {
            return;
        }

        // 创建游戏场景的主要节点
        const scene = director.getScene();
        if (!scene) {
            console.warn('GameInitializer: Scene not ready.');
            return;
        }

        const existingWorld = scene.getChildByName('GameWorld');
        if (existingWorld) {
            this.initialized = true;
            return;
        }

        // 创建游戏世界根节点
        const gameWorld = new Node('GameWorld');
        scene.addChild(gameWorld);

        // 创建网格系统节点
        const gridNode = new Node('GridSystem3D');
        gameWorld.addChild(gridNode);
        const gridSystem = gridNode.addComponent(GridSystem3D);

        // 创建游戏控制器节点
        const controllerNode = new Node('GameController');
        gameWorld.addChild(controllerNode);
        const gameController = controllerNode.addComponent(GameController);

        // 创建状态管理器和输入处理器
        const stateNode = new Node('GameStateManager');
        gameWorld.addChild(stateNode);
        const gameStateManager = stateNode.addComponent(GameStateManager);

        const inputNode = new Node('InputHandler');
        gameWorld.addChild(inputNode);
        const inputHandler = inputNode.addComponent(InputHandler);

        const manualNode = new Node('ManualBlockController');
        gameWorld.addChild(manualNode);
        const manualBlockController = manualNode.addComponent(ManualBlockController);

        // 设置引用关系
        gameController.gridSystem = gridSystem;
        gameController.gameScene = gameWorld;
        inputHandler.gameController = gameController;
        inputHandler.gameStateManager = gameStateManager;
        manualBlockController.gameController = gameController;
        manualBlockController.gridSystem = gridSystem;
        manualBlockController.blockParent = gameWorld;

        this.setupEnvironment(gameWorld, gridSystem);
        this.setupCamera(scene);
        this.setupLighting(scene);
        this.setupHud(scene);

        this.initialized = true;

        console.log('Game scene initialized successfully');
    }

    private setupCamera(scene: Node) {
        if (scene.getChildByName('MainCamera')) {
            return;
        }

        const cameraNode = new Node('MainCamera');
        scene.addChild(cameraNode);
        cameraNode.setPosition(14, 18, 24);
        cameraNode.lookAt(new Vec3(5, 5, 5));
        cameraNode.addComponent(Camera);
    }

    private setupLighting(scene: Node) {
        if (scene.getChildByName('MainLight')) {
            return;
        }

        const lightNode = new Node('MainLight');
        scene.addChild(lightNode);
        lightNode.setPosition(12, 18, 10);
        lightNode.lookAt(new Vec3(0, 0, 0));
        lightNode.addComponent(DirectionalLight);
    }

    private setupEnvironment(gameWorld: Node, gridSystem: GridSystem3D) {
        if (gameWorld.getChildByName('EnvironmentRoot')) {
            return;
        }

        const environmentRoot = new Node('EnvironmentRoot');
        gameWorld.addChild(environmentRoot);

        const boardCenterX = (gridSystem.width - 1) / 2;
        const boardCenterZ = (gridSystem.depth - 1) / 2;
        const boardHalfWidth = gridSystem.width / 2;
        const boardHalfDepth = gridSystem.depth / 2;

        createVisibleBoxNode(
            'Ground',
            new Vec3(boardCenterX, -0.75, boardCenterZ),
            new Vec3(gridSystem.width + 14, 1.2, gridSystem.depth + 20),
            environmentRoot,
        );

        createVisibleBoxNode(
            'PlayfieldBase',
            new Vec3(boardCenterX, -0.1, boardCenterZ),
            new Vec3(gridSystem.width + 1.5, 0.3, gridSystem.depth + 1.5),
            environmentRoot,
        );

        const railHeight = 1.2;
        const railThickness = 0.35;
        createVisibleBoxNode(
            'NorthRail',
            new Vec3(boardCenterX, railHeight / 2, gridSystem.depth),
            new Vec3(gridSystem.width + 1.6, railHeight, railThickness),
            environmentRoot,
        );
        createVisibleBoxNode(
            'SouthRail',
            new Vec3(boardCenterX, railHeight / 2, -1),
            new Vec3(gridSystem.width + 1.6, railHeight, railThickness),
            environmentRoot,
        );
        createVisibleBoxNode(
            'WestRail',
            new Vec3(-1, railHeight / 2, boardCenterZ),
            new Vec3(railThickness, railHeight, gridSystem.depth + 1.6),
            environmentRoot,
        );
        createVisibleBoxNode(
            'EastRail',
            new Vec3(gridSystem.width, railHeight / 2, boardCenterZ),
            new Vec3(railThickness, railHeight, gridSystem.depth + 1.6),
            environmentRoot,
        );

        const towerHeight = 6;
        const towerSize = new Vec3(1.2, towerHeight, 1.2);
        const towerY = towerHeight / 2;
        const towerOffsetX = boardHalfWidth + 3;
        const towerOffsetZ = boardHalfDepth + 3;
        createVisibleBoxNode(
            'CornerTowerNW',
            new Vec3(boardCenterX - towerOffsetX, towerY, boardCenterZ - towerOffsetZ),
            towerSize,
            environmentRoot,
        );
        createVisibleBoxNode(
            'CornerTowerNE',
            new Vec3(boardCenterX + towerOffsetX, towerY, boardCenterZ - towerOffsetZ),
            towerSize,
            environmentRoot,
        );
        createVisibleBoxNode(
            'CornerTowerSW',
            new Vec3(boardCenterX - towerOffsetX, towerY, boardCenterZ + towerOffsetZ),
            towerSize,
            environmentRoot,
        );
        createVisibleBoxNode(
            'CornerTowerSE',
            new Vec3(boardCenterX + towerOffsetX, towerY, boardCenterZ + towerOffsetZ),
            towerSize,
            environmentRoot,
        );

        createVisibleBoxNode(
            'BackdropLeft',
            new Vec3(boardCenterX - 11, 2.5, boardCenterZ + 12),
            new Vec3(4, 5, 3),
            environmentRoot,
        );
        createVisibleBoxNode(
            'BackdropCenter',
            new Vec3(boardCenterX, 3.5, boardCenterZ + 14),
            new Vec3(6, 7, 2.5),
            environmentRoot,
        );
        createVisibleBoxNode(
            'BackdropRight',
            new Vec3(boardCenterX + 10, 2, boardCenterZ + 11),
            new Vec3(3.5, 4, 3.5),
            environmentRoot,
        );

        createVisibleBoxNode(
            'ViewMarker',
            new Vec3(boardCenterX, 0.5, boardCenterZ),
            new Vec3(0.5, 1, 0.5),
            environmentRoot,
        );
    }

    private setupHud(scene: Node) {
        if (scene.getChildByName('HUDCanvas')) {
            return;
        }

        const canvasNode = new Node('HUDCanvas');
        scene.addChild(canvasNode);
        canvasNode.addComponent(Canvas);

        const hintNode = new Node('HintLabel');
        canvasNode.addChild(hintNode);
        hintNode.addComponent(UITransform);
        hintNode.setPosition(-320, 260, 0);

        const hintLabel = hintNode.addComponent(Label);
        hintLabel.fontSize = 20;
        hintLabel.lineHeight = 28;
        hintLabel.string = [
            '3D Tetris Debug HUD',
            'Arrow / WASD / Q E Z C / Space: move',
            'S: save  L: load  P: pause  R: restart',
            'T: add a manual visible block',
            'Check ground / rails / towers / backdrop for scene health',
        ].join('\n');
    }
}
