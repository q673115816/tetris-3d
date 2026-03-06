import { _decorator, Component, Node, director, Scene, game } from 'cc';
import { GridSystem3D } from './GridSystem3D';
import { GameController } from './GameController';

const { ccclass, property } = _decorator;

@ccclass('GameInitializer')
export class GameInitializer extends Component {

    start() {
        this.initializeGameScene();
    }

    private initializeGameScene() {
        // 创建游戏场景的主要节点
        const scene = director.getScene();

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

        // 设置引用关系
        gameController.gridSystem = gridSystem;
        gameController.gameScene = gameWorld;

        console.log('Game scene initialized successfully');
    }
}