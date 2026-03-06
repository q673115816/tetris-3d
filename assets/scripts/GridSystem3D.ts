import { _decorator, Component, Node, Vec3, instantiate, Prefab } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 3D网格系统，用于管理游戏空间的状态
 */
@ccclass('GridSystem3D')
export class GridSystem3D extends Component {

    @property({ type: Number })
    width: number = 10;  // X轴大小

    @property({ type: Number })
    depth: number = 10;  // Z轴大小

    @property({ type: Number })
    height: number = 20; // Y轴大小

    private grid: Array<Array<Array<Node | null>>> = []; // 3D网格，存储方块引用

    onLoad() {
        this.initializeGrid();
    }

    /**
     * 初始化3D网格
     */
    initializeGrid() {
        this.grid = new Array(this.width);
        for (let x = 0; x < this.width; x++) {
            this.grid[x] = new Array(this.depth);
            for (let z = 0; z < this.depth; z++) {
                this.grid[x][z] = new Array(this.height).fill(null);
            }
        }
    }

    /**
     * 检查坐标是否在网格范围内
     */
    isValidPosition(x: number, y: number, z: number): boolean {
        return (
            x >= 0 && x < this.width &&
            y >= 0 && y < this.height &&
            z >= 0 && z < this.depth
        );
    }

    /**
     * 检查指定位置是否为空
     */
    isCellEmpty(x: number, y: number, z: number): boolean {
        if (!this.isValidPosition(x, y, z)) {
            return false;
        }
        return this.grid[x][z][y] === null;
    }

    /**
     * 在指定位置放置方块
     */
    setCell(x: number, y: number, z: number, block: Node | null) {
        if (this.isValidPosition(x, y, z)) {
            this.grid[x][z][y] = block;
        }
    }

    /**
     * 获取指定位置的方块
     */
    getCell(x: number, y: number, z: number): Node | null {
        if (!this.isValidPosition(x, y, z)) {
            return null;
        }
        return this.grid[x][z][y];
    }

    /**
     * 检查某一层(Y轴)是否完全填满
     */
    isLayerComplete(y: number): boolean {
        if (y < 0 || y >= this.height) {
            return false;
        }

        for (let x = 0; x < this.width; x++) {
            for (let z = 0; z < this.depth; z++) {
                if (this.isCellEmpty(x, y, z)) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * 获取完整层的列表
     */
    getCompleteLayers(): number[] {
        const completeLayers: number[] = [];
        for (let y = 0; y < this.height; y++) {
            if (this.isLayerComplete(y)) {
                completeLayers.push(y);
            }
        }
        return completeLayers;
    }

    /**
     * 清除指定层
     */
    clearLayer(y: number) {
        if (y < 0 || y >= this.height) {
            return;
        }

        // 清除该层的所有方块
        for (let x = 0; x < this.width; x++) {
            for (let z = 0; z < this.depth; z++) {
                const block = this.getCell(x, y, z);
                if (block !== null) {
                    block.destroy();
                    this.setCell(x, y, z, null);
                }
            }
        }
    }

    /**
     * 使上方的层下落
     */
    dropBlocksAbove(y: number) {
        for (let level = y; level < this.height - 1; level++) {
            for (let x = 0; x < this.width; x++) {
                for (let z = 0; z < this.depth; z++) {
                    const block = this.getCell(x, level + 1, z);
                    if (block !== null) {
                        // 移动方块到下一层
                        this.setCell(x, level, z, block);
                        this.setCell(x, level + 1, z, null);

                        // 更新方块的世界位置
                        const worldPos = block.worldPosition;
                        block.setWorldPosition(
                            worldPos.x,
                            worldPos.y - 1,
                            worldPos.z
                        );
                    }
                }
            }
        }
    }

    /**
     * 获取网格尺寸
     */
    getGridSize(): Vec3 {
        return new Vec3(this.width, this.height, this.depth);
    }
}