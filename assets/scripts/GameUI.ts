import { _decorator, Component, Label } from 'cc';
import { GameController } from './GameController';
const { ccclass, property } = _decorator;

/**
 * 游戏UI，显示分数、等级等信息
 */
@ccclass('GameUI')
export class GameUI extends Component {

    @property({ type: Label })
    scoreLabel: Label | null = null;

    @property({ type: Label })
    levelLabel: Label | null = null;

    @property({ type: Label })
    linesLabel: Label | null = null;

    @property({ type: Label })
    gameOverLabel: Label | null = null;

    @property({ type: GameController })
    gameController: GameController | null = null;

    private lastScore: number = -1;
    private lastLevel: number = -1;
    private lastLines: number = -1;
    private lastIsGameOver: boolean = false;

    start() {
        this.updateUI();
    }

    update() {
        this.updateUI();
    }

    updateUI() {
        if (!this.gameController) return;

        const gameState = this.gameController.getGameState();

        // 更新分数
        if (this.scoreLabel && this.lastScore !== gameState.score) {
            this.scoreLabel.string = `Score: ${gameState.score}`;
            this.lastScore = gameState.score;
        }

        // 更新等级
        if (this.levelLabel && this.lastLevel !== gameState.level) {
            this.levelLabel.string = `Level: ${gameState.level}`;
            this.lastLevel = gameState.level;
        }

        // 更新消除行数
        if (this.linesLabel && this.lastLines !== gameState.linesCleared) {
            this.linesLabel.string = `Lines: ${gameState.linesCleared}`;
            this.lastLines = gameState.linesCleared;
        }

        // 更新游戏结束状态
        if (this.gameOverLabel) {
            if (this.lastIsGameOver !== gameState.isGameOver) {
                this.gameOverLabel.string = gameState.isGameOver ? "GAME OVER! Press R to restart" : "";
                this.lastIsGameOver = gameState.isGameOver;
            }
        }
    }
}