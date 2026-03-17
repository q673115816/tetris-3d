import { _decorator, Component } from 'cc';
import { GameInitializer } from './GameInitializer';

const { ccclass, property } = _decorator;

@ccclass('Main')
export class Main extends Component {
    start() {
        const initializer = this.getComponent(GameInitializer) || this.addComponent(GameInitializer);
        initializer.initializeGameScene();
    }
}
