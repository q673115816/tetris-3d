import { _decorator, Component, Node, Vec3, Enum } from 'cc';
import { createVisibleBlockNode } from './BlockVisualFactory';
const { ccclass, property } = _decorator;

// 定义3D方块的形状类型
export enum BlockShape3D {
    // 3x3基底的各种3D形状
    Shape_3x3_L = "3x3_L",
    Shape_3x3_I = "3x3_I",
    Shape_3x3_Square = "3x3_Square",
    Shape_3x3_T = "3x3_T",

    // 2x2基底的柱状形状
    Shape_2x2_Column = "2x2_Column",

    // 其他3D形状
    Shape_Corner = "Corner",
    Shape_Stairs = "Stairs"
}

/**
 * 3D方块组件，包含多个立方体单元
 */
@ccclass('BlockPiece3D')
export class BlockPiece3D extends Component {

    @property({ type: String, readonly: true })
    shape: BlockShape3D = BlockShape3D.Shape_3x3_L;

    @property({ type: Vec3, readonly: true })
    position: Vec3 = new Vec3();  // 方块在网格中的位置

    @property({ type: Node, readonly: true })
    blocks: Node[] = [];          // 组成方块的各个立方体

    private occupiedCells: Vec3[] = [];  // 占据的网格坐标

    /**
     * 初始化方块
     */
    init(shapeType: BlockShape3D, startPos: Vec3, relativeCells?: Vec3[]) {
        this.shape = shapeType;
        this.position = startPos.clone();

        if (relativeCells && relativeCells.length > 0) {
            this.rebuildFromRelativeCells(relativeCells);
            return;
        }

        this.createBlocks();
    }

    /**
     * 根据形状类型创建方块单元
     */
    private createBlocks() {
        this.resetBlocks();

        // 根据形状创建对应的方块结构
        switch (this.shape) {
            case BlockShape3D.Shape_3x3_L:
                this.createShape_3x3_L();
                break;
            case BlockShape3D.Shape_3x3_I:
                this.createShape_3x3_I();
                break;
            case BlockShape3D.Shape_3x3_Square:
                this.createShape_3x3_Square();
                break;
            case BlockShape3D.Shape_3x3_T:
                this.createShape_3x3_T();
                break;
            case BlockShape3D.Shape_2x2_Column:
                this.createShape_2x2_Column();
                break;
            case BlockShape3D.Shape_Corner:
                this.createShape_Corner();
                break;
            case BlockShape3D.Shape_Stairs:
                this.createShape_Stairs();
                break;
            default:
                this.createShape_3x3_L(); // 默认形状
        }
    }

    private resetBlocks() {
        this.blocks.forEach((block) => {
            if (block) {
                block.destroy();
            }
        });

        this.blocks = [];
        this.occupiedCells = [];
    }

    private rebuildFromRelativeCells(relativeCells: Vec3[]) {
        this.resetBlocks();

        for (const cell of relativeCells) {
            this.addCellRelative(cell.x, cell.y, cell.z);
        }
    }

    /**
     * 创建 L 形状 (3x3基底)
     */
    private createShape_3x3_L() {
        // 底层 L 形状
        this.addCellRelative(0, 0, 0);  // 左下角
        this.addCellRelative(0, 0, 1);  // 上方
        this.addCellRelative(0, 0, 2);  // 再上方
        this.addCellRelative(1, 0, 0);  // 右方

        // 上层添加一个方块
        this.addCellRelative(0, 1, 2);  // 最高层角落
    }

    /**
     * 创建 I 形状 (3x3基底)
     */
    private createShape_3x3_I() {
        // 直线形
        this.addCellRelative(0, 0, 0);
        this.addCellRelative(0, 0, 1);
        this.addCellRelative(0, 0, 2);

        // 高度方向延伸
        this.addCellRelative(0, 1, 1);
        this.addCellRelative(0, 2, 1);
    }

    /**
     * 创建方形形状 (3x3基底)
     */
    private createShape_3x3_Square() {
        // 2x2底层
        this.addCellRelative(0, 0, 0);
        this.addCellRelative(0, 0, 1);
        this.addCellRelative(1, 0, 0);
        this.addCellRelative(1, 0, 1);

        // 中层中心
        this.addCellRelative(0, 1, 0);

        // 顶层
        this.addCellRelative(0, 2, 0);
        this.addCellRelative(0, 2, 1);
    }

    /**
     * 创建 T 形状 (3x3基底)
     */
    private createShape_3x3_T() {
        // 底部横向
        this.addCellRelative(0, 0, 1);
        this.addCellRelative(1, 0, 1);
        this.addCellRelative(2, 0, 1);

        // 中央竖直部分
        this.addCellRelative(1, 1, 1);
        this.addCellRelative(1, 2, 1);
    }

    /**
     * 创建 2x2 柱状形状
     */
    private createShape_2x2_Column() {
        // 创建高度为4的柱子
        for (let i = 0; i < 4; i++) {
            this.addCellRelative(0, i, 0);
            this.addCellRelative(1, i, 0);
            this.addCellRelative(0, i, 1);
            this.addCellRelative(1, i, 1);
        }
    }

    /**
     * 创建角落形状
     */
    private createShape_Corner() {
        // 3x3底部L形
        this.addCellRelative(0, 0, 0);
        this.addCellRelative(1, 0, 0);
        this.addCellRelative(2, 0, 0);
        this.addCellRelative(2, 0, 1);
        this.addCellRelative(2, 0, 2);

        // 中间层角落延伸
        this.addCellRelative(2, 1, 2);

        // 顶层
        this.addCellRelative(2, 2, 2);
        this.addCellRelative(1, 2, 2);
    }

    /**
     * 创建楼梯形状
     */
    private createShape_Stairs() {
        this.addCellRelative(0, 0, 0);  // 第一级
        this.addCellRelative(1, 1, 0);  // 第二级
        this.addCellRelative(2, 2, 0);  // 第三级
        this.addCellRelative(2, 2, 1);  // 扩展平台
        this.addCellRelative(2, 2, 2);  // 扩展平台
        this.addCellRelative(1, 3, 2);  // 第四级
        this.addCellRelative(0, 4, 2);  // 第五级
    }

    /**
     * 添加一个相对坐标的方块
     */
    private addCellRelative(xOffset: number, yOffset: number, zOffset: number) {
        const cellPos = new Vec3(
            this.position.x + xOffset,
            this.position.y + yOffset,
            this.position.z + zOffset
        );

        // 创建可视方块（稍后由游戏控制器添加实际的网格和材质）
        const parentNode = this.node?.parent || this.node;
        const blockNode = createVisibleBlockNode(
            `Block_${this.blocks.length}`,
            cellPos,
            parentNode,
        );

        this.blocks.push(blockNode);
        this.occupiedCells.push(new Vec3(xOffset, yOffset, zOffset));
    }

    /**
     * 移动方块到新位置
     */
    moveTo(pos: Vec3) {
        const delta = pos.clone().subtract(this.position);
        this.translate(delta);
    }

    /**
     * 相对移动方块
     */
    translate(delta: Vec3) {
        this.position = this.position.clone().add(delta);

        // 更新所有组成方块的位置
        for (let i = 0; i < this.blocks.length; i++) {
            const relPos = this.occupiedCells[i];
            const newPos = new Vec3(
                this.position.x + relPos.x,
                this.position.y + relPos.y,
                this.position.z + relPos.z
            );

            this.blocks[i].setPosition(newPos);
        }
    }

    /**
     * 绕指定轴旋转方块
     */
    rotate(axis: Vec3, angle: number) {
        // 计算旋转后的相对位置
        const radian = angle * Math.PI / 180;
        const cos = Math.cos(radian);
        const sin = Math.sin(radian);

        // 根据旋转轴应用旋转变换
        for (let i = 0; i < this.occupiedCells.length; i++) {
            const originalRelPos = this.occupiedCells[i];
            let newRelPos = new Vec3(originalRelPos.x, originalRelPos.y, originalRelPos.z);

            // 根据旋转轴进行变换
            if (axis.equals(new Vec3(1, 0, 0))) { // 绕X轴旋转
                newRelPos.y = originalRelPos.y * cos - originalRelPos.z * sin;
                newRelPos.z = originalRelPos.y * sin + originalRelPos.z * cos;
            } else if (axis.equals(new Vec3(0, 1, 0))) { // 绕Y轴旋转
                newRelPos.x = originalRelPos.x * cos - originalRelPos.z * sin;
                newRelPos.z = originalRelPos.x * sin + originalRelPos.z * cos;
            } else if (axis.equals(new Vec3(0, 0, 1))) { // 绕Z轴旋转
                newRelPos.x = originalRelPos.x * cos - originalRelPos.y * sin;
                newRelPos.y = originalRelPos.x * sin + originalRelPos.y * cos;
            }

            // 四舍五入到整数坐标
            newRelPos = new Vec3(Math.round(newRelPos.x), Math.round(newRelPos.y), Math.round(newRelPos.z));

            this.occupiedCells[i] = newRelPos;

            // 更新对应块的位置
            const newPos = new Vec3(
                this.position.x + newRelPos.x,
                this.position.y + newRelPos.y,
                this.position.z + newRelPos.z
            );

            this.blocks[i].setPosition(newPos);
        }
    }

    /**
     * 获取方块占据的所有网格坐标
     */
    getOccupiedCells(): Vec3[] {
        const absolutePositions: Vec3[] = [];

        for (const relPos of this.occupiedCells) {
            absolutePositions.push(new Vec3(
                this.position.x + relPos.x,
                this.position.y + relPos.y,
                this.position.z + relPos.z
            ));
        }

        return absolutePositions;
    }

    /**
     * 获取方块相对坐标，便于保存旋转后的状态
     */
    getRelativeCells(): Vec3[] {
        return this.occupiedCells.map((cell) => cell.clone());
    }

    /**
     * 获取组成方块的节点列表
     */
    getBlockNodes(): Node[] {
        return [...this.blocks];
    }

    /**
     * 检查与其他方块的碰撞
     */
    checkCollision(otherBlocks: Vec3[]): boolean {
        const thisCells = this.getOccupiedCells();

        for (const thisCell of thisCells) {
            for (const otherCell of otherBlocks) {
                if (thisCell.equals(otherCell)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * 销毁方块组件
     */
    destroyPiece() {
        for (const block of this.blocks) {
            if (block) {
                block.destroy();
            }
        }
        this.blocks = [];
        this.occupiedCells = [];
    }
}
