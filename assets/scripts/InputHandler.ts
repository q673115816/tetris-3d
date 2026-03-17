import { _decorator, Component, EventKeyboard, Input, input, KeyCode, Vec3 } from 'cc';
import { GameController } from './GameController';
import { GameStateManager } from './GameStateManager';
const { ccclass, property } = _decorator;

/**
 * 输入处理器，负责处理键盘输入并将其传递给游戏控制器
 */
@ccclass('InputHandler')
export class InputHandler extends Component {

    @property({ type: GameController })
    gameController: GameController | null = null;

    @property({ type: GameStateManager })
    gameStateManager: GameStateManager | null = null;

    onLoad() {
        // 注册键盘事件
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    onDestroy() {
        // 移除键盘事件
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    onKeyDown(event: EventKeyboard) {
        if (!this.gameController) {
            console.warn("InputHandler: No GameController assigned!");
            return;
        }

        // 检查是否只处理特定的游戏控制，避免冲突
        if (this.shouldHandleGameControl(event.keyCode)) {
            this.handleGameControl(event);
        } else if (this.shouldHandleSaveLoad(event.keyCode)) {
            this.handleSaveLoad(event);
        } else if (this.shouldHandlePause(event.keyCode)) {
            this.handlePause();
        }
    }

    /**
     * 判断是否为游戏控制按键
     */
    private shouldHandleGameControl(keyCode: KeyCode): boolean {
        const gameControlKeys = [
            KeyCode.ARROW_LEFT, KeyCode.KEY_A,      // 左移
            KeyCode.ARROW_RIGHT, KeyCode.KEY_D,     // 右移
            KeyCode.ARROW_UP, KeyCode.KEY_W,        // 前移
            KeyCode.ARROW_DOWN, KeyCode.KEY_S,      // 后移
            KeyCode.KEY_Q,                          // 顺时针旋转
            KeyCode.KEY_E,                          // 逆时针旋转
            KeyCode.KEY_Z,                          // 绕X轴旋转
            KeyCode.KEY_C,                          // 绕Z轴旋转
            KeyCode.SPACE,                          // 快速下落
            KeyCode.KEY_R                           // 重启游戏
        ];

        // 如果是S键，我们将在另一个方法中处理保存功能
        if (keyCode === KeyCode.KEY_S) {
            return false;
        }

        return gameControlKeys.indexOf(keyCode) !== -1;
    }

    /**
     * 判断是否为保存/加载按键
     */
    private shouldHandleSaveLoad(keyCode: KeyCode): boolean {
        return keyCode === KeyCode.KEY_S || keyCode === KeyCode.KEY_L;
    }

    /**
     * 判断是否为暂停按键
     */
    private shouldHandlePause(keyCode: KeyCode): boolean {
        return keyCode === KeyCode.KEY_P;
    }

    /**
     * 处理游戏控制
     */
    private handleGameControl(event: EventKeyboard) {
        if (!this.gameController) return;

        switch (event.keyCode) {
            // 左移
            case KeyCode.ARROW_LEFT:
            case KeyCode.KEY_A:
                this.gameController.moveLeft();
                break;

            // 右移
            case KeyCode.ARROW_RIGHT:
            case KeyCode.KEY_D:
                this.gameController.moveRight();
                break;

            // 前移
            case KeyCode.ARROW_UP:
            case KeyCode.KEY_W:
                this.gameController.moveForward();
                break;

            // 后移 - 不再处理S键作为移动，而是作为保存
            case KeyCode.ARROW_DOWN:
                this.gameController.moveBackward();
                break;

            // 顺时针旋转（绕Y轴）
            case KeyCode.KEY_Q:
                this.gameController.rotatePiece(new Vec3(0, 1, 0), 90);
                break;

            // 逆时针旋转（绕Y轴）
            case KeyCode.KEY_E:
                this.gameController.rotatePiece(new Vec3(0, 1, 0), -90);
                break;

            // 绕X轴旋转
            case KeyCode.KEY_Z:
                this.gameController.rotatePiece(new Vec3(1, 0, 0), 90);
                break;

            // 绕Z轴旋转
            case KeyCode.KEY_C:
                this.gameController.rotatePiece(new Vec3(0, 0, 1), 90);
                break;

            // 快速下落
            case KeyCode.SPACE:
                this.gameController.hardDrop();
                break;

            // 重启游戏
            case KeyCode.KEY_R:
                this.gameController.restartGame();
                break;
        }
    }

    /**
     * 处理保存和加载
     */
    private handleSaveLoad(event: EventKeyboard) {
        if (!this.gameStateManager) {
            // 如果没有显式分配，尝试在场景中查找
            this.gameStateManager = this.node.scene?.getComponentInChildren(GameStateManager) || null;
            if (!this.gameStateManager) {
                console.warn("InputHandler: No GameStateManager assigned or found!");
                return;
            }
        }

        switch (event.keyCode) {
            // 保存游戏
            case KeyCode.KEY_S:
                const wasPausedBeforeSave = this.gameController?.getIsPaused() ?? false;

                // 暂停游戏后再保存
                if (this.gameController && !wasPausedBeforeSave) {
                    this.gameController.pauseGame();
                }

                const saveSuccess = this.gameStateManager.saveGame();
                if (saveSuccess) {
                    console.log('Game saved successfully!');

                    // 如果游戏之前不是暂停状态，则恢复
                    if (this.gameController && !wasPausedBeforeSave) {
                        setTimeout(() => {
                            this.gameController?.resumeGame();
                        }, 500); // 给用户一点视觉反馈时间
                    }
                } else {
                    console.error('Failed to save game.');

                    // 如果保存失败但游戏被暂停了，恢复游戏
                    if (this.gameController && !wasPausedBeforeSave && this.gameController.getIsPaused()) {
                        this.gameController.resumeGame();
                    }
                }
                break;

            // 加载游戏
            case KeyCode.KEY_L:
                const wasPausedBeforeLoad = this.gameController?.getIsPaused() ?? false;

                // 暂停当前游戏再加载
                if (this.gameController && !wasPausedBeforeLoad) {
                    this.gameController.pauseGame();
                }

                const loadSuccess = this.gameStateManager.loadGame();
                if (loadSuccess) {
                    console.log('Game loaded successfully!');
                } else {
                    console.error('Failed to load game. No saved game found or loading error.');

                    // 如果加载失败但游戏被暂停了，恢复游戏
                    if (this.gameController && !wasPausedBeforeLoad && this.gameController.getIsPaused()) {
                        this.gameController.resumeGame();
                    }
                }
                break;
        }
    }

    /**
     * 处理暂停/继续
     */
    private handlePause() {
        if (!this.gameController) return;

        if (this.gameController.getIsPaused()) {
            this.gameController.resumeGame();
            console.log('Game resumed');
        } else {
            this.gameController.pauseGame();
            console.log('Game paused');
        }
    }
}
