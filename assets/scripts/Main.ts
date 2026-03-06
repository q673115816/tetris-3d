import { _decorator, Component } from 'cc';
import { GameInitializer } from './GameInitializer';

const { ccclass, property } = _decorator;

@ccclass('Main')
export class Main extends Component {
    start() {
        // 启动游戏初始化器
        const initializer = new GameInitializer();
        initializer.start();
    }
}