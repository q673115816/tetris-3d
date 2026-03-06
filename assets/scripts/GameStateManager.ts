import { _decorator, Component, Node, Vec3, sys, JsonAsset } from 'cc';
import { GameController } from './GameController';
import { GridSystem3D } from './GridSystem3D';
import { BlockPiece3D } from './BlockPiece3D';
import { BlockShape3D } from './BlockPiece3D';

const { ccclass, property } = _decorator;

// 游戏状态数据接口
export interface GameStateData {
    score: number;
    level: number;
    linesCleared: number;
    isGameOver: boolean;
    gridData: GridData;
    currentPieceData?: PieceData;
    position: Vec3;
    timestamp: number;
}

export interface GridData {
    width: number;
    depth: number;
    height: number;
    occupiedCells: OccupiedCell[];
}

export interface OccupiedCell {
    x: number;
    y: number;
    z: number;
    // 可以添加方块的颜色、类型等信息
}

export interface PieceData {
    shape: BlockShape3D;
    position: Vec3;
    relativeCells: Vec3[];
}

@ccclass('GameStateManager')
export class GameStateManager extends Component {

    private static readonly SAVE_KEY = 'tetris3d_save_data';

    private gameController: GameController | null = null;

    onLoad() {
        // 查找游戏控制器
        this.findGameController();
    }

    private findGameController() {
        // 尝试从当前节点或子节点获取GameController
        this.gameController = this.getComponent(GameController);
        if (!this.gameController) {
            this.gameController = this.getComponentInChildren(GameController);
        }

        // 如果还是找不到，尝试从场景中搜索
        if (!this.gameController && this.node.scene) {
            this.gameController = this.node.scene.getComponentInChildren(GameController);
        }
    }

    /**
     * 保存当前游戏状态
     */
    public saveGame(): boolean {
        try {
            if (!this.gameController) {
                this.findGameController();
                if (!this.gameController) {
                    console.error('Cannot find GameController to save game state');
                    return false;
                }
            }

            const gameState: GameStateData = this.captureCurrentGameState();
            const gameStateJson = JSON.stringify(gameState);

            // 使用 Cocos Creator 的 sys.localStorage 保存
            sys.localStorage.setItem(GameStateManager.SAVE_KEY, gameStateJson);

            console.log('Game state saved successfully');
            return true;
        } catch (error) {
            console.error('Failed to save game state:', error);
            return false;
        }
    }

    /**
     * 加载保存的游戏状态
     */
    public loadGame(): boolean {
        try {
            if (!this.gameController) {
                this.findGameController();
                if (!this.gameController) {
                    console.error('Cannot find GameController to load game state');
                    return false;
                }
            }

            const savedStateJson = sys.localStorage.getItem(GameStateManager.SAVE_KEY);
            if (!savedStateJson) {
                console.warn('No saved game state found');
                return false;
            }

            const savedState: GameStateData = JSON.parse(savedStateJson);
            this.restoreGameState(savedState);

            console.log('Game state loaded successfully');
            return true;
        } catch (error) {
            console.error('Failed to load game state:', error);
            return false;
        }
    }

    /**
     * 删除保存的游戏状态
     */
    public deleteSave(): void {
        sys.localStorage.removeItem(GameStateManager.SAVE_KEY);
        console.log('Saved game state deleted');
    }

    /**
     * 检查是否存在保存的游戏状态
     */
    public hasSavedGame(): boolean {
        const savedState = sys.localStorage.getItem(GameStateManager.SAVE_KEY);
        return !!savedState;
    }

    /**
     * 捕获当前游戏状态
     */
    private captureCurrentGameState(): GameStateData {
        if (!this.gameController) {
            throw new Error('GameController not found');
        }

        // 获取游戏状态
        const gameState = this.gameController.getGameState();

        // 获取网格数据
        const gridData = this.captureGridData();

        // 获取当前方块数据（如果有）
        let currentPieceData: PieceData | undefined;
        if (this.gameController['_currentPiece']) {
            currentPieceData = this.capturePieceData(this.gameController['_currentPiece']);
        }

        return {
            score: gameState.score,
            level: gameState.level,
            linesCleared: gameState.linesCleared,
            isGameOver: gameState.isGameOver,
            gridData: gridData,
            currentPieceData: currentPieceData,
            position: this.node.worldPosition,
            timestamp: Date.now()
        };
    }

    /**
     * 捕获网格数据
     */
    private captureGridData(): GridData {
        if (!this.gameController?.gridSystem) {
            throw new Error('GridSystem not found');
        }

        const gridSystem = this.gameController.gridSystem;
        const occupiedCells: OccupiedCell[] = [];

        // 遍历网格，找出所有被占用的单元格
        for (let x = 0; x < gridSystem.width; x++) {
            for (let z = 0; z < gridSystem.depth; z++) {
                for (let y = 0; y < gridSystem.height; y++) {
                    const cell = gridSystem.getCell(x, y, z);
                    if (cell !== null) {
                        occupiedCells.push({
                            x: x,
                            y: y,
                            z: z
                        });
                    }
                }
            }
        }

        return {
            width: gridSystem.width,
            depth: gridSystem.depth,
            height: gridSystem.height,
            occupiedCells: occupiedCells
        };
    }

    /**
     * 捕获方块数据
     */
    private capturePieceData(piece: BlockPiece3D): PieceData {
        return {
            shape: piece.shape,
            position: piece.position,
            relativeCells: piece.getOccupiedCells()
        };
    }

    /**
     * 恢复游戏状态
     */
    private restoreGameState(state: GameStateData): void {
        if (!this.gameController) {
            throw new Error('GameController not found');
        }

        // 暂停游戏更新
        this.gameController.enabled = false;

        // 重置游戏状态
        this.gameController['_score'] = state.score;
        this.gameController['_level'] = state.level;
        this.gameController['_linesCleared'] = state.linesCleared;
        this.gameController['_isGameOver'] = state.isGameOver;

        // 恢复网格数据
        this.restoreGridData(state.gridData);

        // 如果有当前方块数据，则恢复方块
        if (state.currentPieceData) {
            this.restoreCurrentPiece(state.currentPieceData);
        }

        // 恢复游戏控制器启用状态
        this.gameController.enabled = true;

        console.log(`Game restored to state from ${new Date(state.timestamp).toLocaleString()}`);
    }

    /**
     * 恢复网格数据
     */
    private restoreGridData(gridData: GridData): void {
        if (!this.gameController?.gridSystem) {
            throw new Error('GridSystem not found');
        }

        const gridSystem = this.gameController.gridSystem;

        // 验证网格尺寸是否匹配
        if (gridSystem.width !== gridData.width ||
            gridSystem.depth !== gridData.depth ||
            gridSystem.height !== gridData.height) {
            console.warn('Grid dimensions mismatch, resizing grid system...');
            gridSystem.width = gridData.width;
            gridSystem.depth = gridData.depth;
            gridSystem.height = gridData.height;
            gridSystem.initializeGrid();
        }

        // 清除现有网格内容
        this.clearGrid(gridSystem);

        // 重新设置被占用的单元格
        for (const cell of gridData.occupiedCells) {
            // 创建一个占位节点
            const placeholderNode = new Node('SavedBlock');
            // 实际游戏中可能需要创建真实的方块节点
            gridSystem.setCell(cell.x, cell.y, cell.z, placeholderNode);
        }
    }

    /**
     * 清除网格
     */
    private clearGrid(gridSystem: GridSystem3D): void {
        for (let x = 0; x < gridSystem.width; x++) {
            for (let z = 0; z < gridSystem.depth; z++) {
                for (let y = 0; y < gridSystem.height; y++) {
                    const block = gridSystem.getCell(x, y, z);
                    if (block) {
                        block.destroy();
                    }
                    gridSystem.setCell(x, y, z, null);
                }
            }
        }
    }

    /**
     * 恢复当前方块
     */
    private restoreCurrentPiece(pieceData: PieceData): void {
        if (!this.gameController || !this.gameController.gridSystem) {
            return;
        }

        // 创建新方块
        const newPieceNode = new Node('RestoredBlockPiece');
        if (this.gameController.gameScene) {
            this.gameController.gameScene.addChild(newPieceNode);
        } else {
            this.gameController.node.addChild(newPieceNode);
        }

        const newPiece = newPieceNode.addComponent(BlockPiece3D);
        newPiece.init(pieceData.shape, pieceData.position);

        // 设置为当前方块
        this.gameController['_currentPiece'] = newPiece;
    }

    /**
     * 获取保存状态的时间戳
     */
    public getSaveTimestamp(): number | null {
        const savedStateJson = sys.localStorage.getItem(GameStateManager.SAVE_KEY);
        if (!savedStateJson) {
            return null;
        }

        try {
            const savedState: GameStateData = JSON.parse(savedStateJson);
            return savedState.timestamp;
        } catch (error) {
            console.error('Failed to parse saved state for timestamp:', error);
            return null;
        }
    }
}