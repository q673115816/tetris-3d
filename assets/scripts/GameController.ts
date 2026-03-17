import { _decorator, Component, Node, Vec3, Prefab } from 'cc';
import { GridSystem3D } from './GridSystem3D';
import { BlockPiece3D, BlockShape3D } from './BlockPiece3D';
const { ccclass, property } = _decorator;

/**
 * 游戏控制器，管理整个游戏流程
 */
@ccclass('GameController')
export class GameController extends Component {

    @property({ type: GridSystem3D })
    gridSystem: GridSystem3D | null = null;

    @property({ type: Prefab })
    blockPrefab: Prefab | null = null;

    @property({ type: Number })
    gravityDelay: number = 1.0;  // 重力下落间隔（秒）

    @property({ type: Node })
    gameScene: Node | null = null;

    private currentPiece: BlockPiece3D | null = null;  // 当前方块
    private nextPiece: BlockPiece3D | null = null;     // 下一个方块
    private isGameOver: boolean = false;
    private score: number = 0;
    private level: number = 1;
    private linesCleared: number = 0;
    private gravityTimer: number = 0;

    // 添加暂停状态
    private isPaused: boolean = false;

    onLoad() {
        this.initializeGame();
    }

    start() {
        this.spawnNewPiece();
    }

    update(deltaTime: number) {
        // 添加暂停检查
        if (this.isGameOver || this.isPaused) return;

        // 处理重力下落
        this.gravityTimer += deltaTime;
        if (this.gravityTimer >= this.gravityDelay / this.level) {
            this.gravityTimer = 0;
            this.movePieceDown();
        }

        // 处理用户输入
        this.handleInput();
    }

    /**
     * 暂停游戏
     */
    public pauseGame() {
        this.isPaused = true;
        console.log('Game paused');
    }

    /**
     * 恢复游戏
     */
    public resumeGame() {
        this.isPaused = false;
        console.log('Game resumed');
    }

    /**
     * 检查游戏是否暂停
     */
    public getIsPaused(): boolean {
        return this.isPaused;
    }

    public setPaused(paused: boolean) {
        this.isPaused = paused;
    }

    /**
     * 初始化游戏
     */
    private initializeGame() {
        // 如果没有手动连接gridSystem，则尝试获取
        if (!this.gridSystem) {
            this.gridSystem = this.getComponent(GridSystem3D);
            if (!this.gridSystem) {
                this.gridSystem = this.node.getComponentInChildren(GridSystem3D);
            }
        }

        // 如果需要可以加载默认的方块预制件
        // this.loadDefaultBlockPrefab();
    }

    /**
     * 加载默认方块预制件
     */
    private loadDefaultBlockPrefab() {
        // 这里可以根据需要加载默认的方块模型
        // 例如一个简单的立方体模型
    }

    /**
     * 生成新方块
     */
    private spawnNewPiece() {
        if (!this.gridSystem) return;

        // 随机选择方块形状
        const shapes: BlockShape3D[] = [
            BlockShape3D.Shape_3x3_L,
            BlockShape3D.Shape_3x3_I,
            BlockShape3D.Shape_3x3_Square,
            BlockShape3D.Shape_3x3_T,
            BlockShape3D.Shape_2x2_Column,
            BlockShape3D.Shape_Corner,
            BlockShape3D.Shape_Stairs
        ];
        const randomShape = shapes[Math.floor(Math.random() * shapes.length)] as BlockShape3D;

        // 创建新方块
        const newPieceNode = new Node('BlockPiece');
        if (this.gameScene) {
            this.gameScene.addChild(newPieceNode);
        } else {
            this.node.addChild(newPieceNode);
        }

        const newPiece = newPieceNode.addComponent(BlockPiece3D);
        newPiece.init(randomShape, new Vec3(0, 0, 0));

        const relativeCells = newPiece.getRelativeCells();
        const maxX = Math.max(...relativeCells.map((cell) => cell.x));
        const maxY = Math.max(...relativeCells.map((cell) => cell.y));
        const maxZ = Math.max(...relativeCells.map((cell) => cell.z));

        const startX = Math.max(0, Math.floor((this.gridSystem.width - (maxX + 1)) / 2));
        const startY = Math.max(0, this.gridSystem.height - 1 - maxY);
        const startZ = Math.max(0, Math.floor((this.gridSystem.depth - (maxZ + 1)) / 2));

        newPiece.moveTo(new Vec3(startX, startY, startZ));

        this.currentPiece = newPiece;

        // 检查游戏是否结束（新方块生成时就发生碰撞）
        if (this.checkCollisionAtPosition()) {
            this.gameOver();
        }
    }

    /**
     * 检查当前方块是否与已有方块或边界碰撞
     */
    private checkCollisionAtPosition(): boolean {
        if (!this.currentPiece || !this.gridSystem) return true;

        const occupiedCells = this.currentPiece.getOccupiedCells();

        for (const cell of occupiedCells) {
            // 检查边界
            if (!this.gridSystem.isValidPosition(cell.x, cell.y, cell.z)) {
                return true;
            }

            // 检查是否有其他方块
            if (!this.gridSystem.isCellEmpty(cell.x, cell.y, cell.z)) {
                return true;
            }
        }

        return false;
    }

    /**
     * 检查当前方块在指定偏移下的碰撞
     */
    private checkCollisionWithOffset(offset: Vec3): boolean {
        if (!this.currentPiece || !this.gridSystem) return true;

        // 临时移动方块以检查碰撞
        const originalPos = this.currentPiece.position.clone();
        this.currentPiece.moveTo(originalPos.clone().add(offset));

        const isColliding = this.checkCollisionAtPosition();

        // 恢复原位置
        this.currentPiece.moveTo(originalPos);

        return isColliding;
    }

    /**
     * 移动方块
     */
    private movePiece(offset: Vec3) {
        if (!this.currentPiece || this.isGameOver) return;

        // 检查移动是否会引发碰撞
        if (!this.checkCollisionWithOffset(offset)) {
            this.currentPiece.translate(offset);
        }
    }

    /**
     * 向左移动
     */
    public moveLeft() {
        this.movePiece(new Vec3(-1, 0, 0));
    }

    /**
     * 向右移动
     */
    public moveRight() {
        this.movePiece(new Vec3(1, 0, 0));
    }

    /**
     * 向前移动
     */
    public moveForward() {
        this.movePiece(new Vec3(0, 0, 1));
    }

    /**
     * 向后移动
     */
    public moveBackward() {
        this.movePiece(new Vec3(0, 0, -1));
    }

    /**
     * 向下移动（重力作用）
     */
    public movePieceDown() {
        if (!this.currentPiece || this.isGameOver) return;

        // 检查下方是否有阻挡
        if (!this.checkCollisionWithOffset(new Vec3(0, -1, 0))) {
            this.movePiece(new Vec3(0, -1, 0));
        } else {
            // 如果下方有阻挡，锁定方块
            this.lockPiece();
        }
    }

    /**
     * 快速下落
     */
    public hardDrop() {
        if (!this.currentPiece || this.isGameOver) return;

        // 持续向下直到碰到阻挡
        while (!this.checkCollisionWithOffset(new Vec3(0, -1, 0))) {
            this.movePiece(new Vec3(0, -1, 0));
        }

        this.lockPiece();
    }

    /**
     * 旋转方块
     */
    public rotatePiece(axis: Vec3, angle: number = 90) {
        if (!this.currentPiece || this.isGameOver) return;

        // 临时旋转方块以检查碰撞
        const originalCells = [...this.currentPiece.getOccupiedCells()];
        this.currentPiece.rotate(axis, angle);

        if (this.checkCollisionAtPosition()) {
            // 如果旋转导致碰撞，恢复到原来的位置
            // 注意：这里简化处理，实际上可能需要更复杂的旋转调整逻辑
            // 如踢墙旋转等高级特性
            console.log("Rotation blocked by collision");
            // 恢复原始位置（通过反向旋转）
            this.currentPiece.rotate(axis, -angle);
        }
    }

    /**
     * 锁定当前方块到网格中
     */
    private lockPiece() {
        if (!this.currentPiece || !this.gridSystem) return;

        // 将当前方块的所有单元格添加到网格系统
        const occupiedCells = this.currentPiece.getOccupiedCells();
        const blockNodes = typeof this.currentPiece.getBlockNodes === 'function'
            ? this.currentPiece.getBlockNodes()
            : [];
        const pieceNode = this.currentPiece.node || null;

        for (let i = 0; i < occupiedCells.length; i++) {
            const cell = occupiedCells[i];
            this.gridSystem.setCell(
                Math.floor(cell.x),
                Math.floor(cell.y),
                Math.floor(cell.z),
                blockNodes[i] || pieceNode
            );
        }

        const lockedPieceNode = pieceNode;
        this.currentPiece = null;

        // 检查是否有完整层需要清除
        this.clearCompletedLayers();

        if (lockedPieceNode && typeof lockedPieceNode.destroy === 'function') {
            lockedPieceNode.destroy();
        }

        // 生成新的方块
        this.spawnNewPiece();
    }

    /**
     * 清除完整的层
     */
    private clearCompletedLayers() {
        if (!this.gridSystem) return;

        const completeLayers = this.gridSystem.getCompleteLayers();

        if (completeLayers.length > 0) {
            // 为每个完整层添加分数
            this.linesCleared += completeLayers.length;
            this.score += this.calculateScore(completeLayers.length);

            // 更新等级（每清除10行提升一级）
            this.level = Math.floor(this.linesCleared / 10) + 1;

            // 清除这些层
            for (const layer of completeLayers) {
                this.gridSystem.clearLayer(layer);
                this.gridSystem.dropBlocksAbove(layer);
            }

            console.log(`Cleared ${completeLayers.length} layers! Score: ${this.score}, Level: ${this.level}`);
        }
    }

    /**
     * 计算得分
     */
    private calculateScore(clearedLayers: number): number {
        // 根据清除的层数和等级计算分数
        const baseScores = [0, 100, 300, 500, 800]; // 分别对应清除1,2,3,4层的分数
        return baseScores[clearedLayers] * this.level || 0;
    }

    /**
     * 处理用户输入
     */
    private handleInput() {
        // 在实际游戏中，这将连接到输入系统
        // 暂时通过代码调用来演示功能
    }

    /**
     * 游戏结束
     */
    private gameOver() {
        this.isGameOver = true;
        console.log(`Game Over! Final Score: ${this.score}, Lines: ${this.linesCleared}, Level: ${this.level}`);

        // 在实际游戏中，这里会显示游戏结束界面
    }

    /**
     * 重启游戏
     */
    public restartGame() {
        this.score = 0;
        this.level = 1;
        this.linesCleared = 0;
        this.isGameOver = false;
        this.isPaused = false; // 重置暂停状态
        this.gravityTimer = 0;

        // 清除网格中的所有方块
        if (this.gridSystem) {
            for (let x = 0; x < this.gridSystem.width; x++) {
                for (let z = 0; z < this.gridSystem.depth; z++) {
                    for (let y = 0; y < this.gridSystem.height; y++) {
                        const block = this.gridSystem.getCell(x, y, z);
                        if (block) {
                            block.destroy();
                        }
                        this.gridSystem.setCell(x, y, z, null);
                    }
                }
            }
        }

        // 销毁当前方块
        this.clearCurrentPiece();

        // 重新开始
        this.spawnNewPiece();
    }

    /**
     * 获取游戏状态信息
     */
    public getGameState() {
        return {
            score: this.score,
            level: this.level,
            linesCleared: this.linesCleared,
            isGameOver: this.isGameOver
        };
    }

    // 以下是一些公共getter方法，用于状态管理器访问私有属性
    public getCurrentPiece(): BlockPiece3D | null {
        return this.currentPiece;
    }

    public setCurrentPiece(piece: BlockPiece3D | null) {
        this.currentPiece = piece;
    }

    public clearCurrentPiece() {
        if (!this.currentPiece) {
            return;
        }

        this.currentPiece.destroyPiece();
        if (this.currentPiece.node && typeof this.currentPiece.node.destroy === 'function') {
            this.currentPiece.node.destroy();
        }
        this.currentPiece = null;
    }

    public getIsGameOver(): boolean {
        return this.isGameOver;
    }

    public setIsGameOver(value: boolean) {
        this.isGameOver = value;
    }

    public getScore(): number {
        return this.score;
    }

    public setScore(score: number) {
        this.score = score;
    }

    public getLevel(): number {
        return this.level;
    }

    public setLevel(level: number) {
        this.level = level;
    }

    public getLinesCleared(): number {
        return this.linesCleared;
    }

    public setLinesCleared(lines: number) {
        this.linesCleared = lines;
    }

    public setGravityTimer(timer: number) {
        this.gravityTimer = timer;
    }

    public getGravityTimer(): number {
        return this.gravityTimer;
    }
}
