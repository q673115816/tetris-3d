import { _decorator, Component, EventKeyboard, Input, input, KeyCode, Node, Vec3 } from 'cc';
import { GameController } from './GameController';
import { GridSystem3D } from './GridSystem3D';
import { createVisibleBlockNode } from './BlockVisualFactory';

const { ccclass, property } = _decorator;

@ccclass('ManualBlockController')
export class ManualBlockController extends Component {

    @property({ type: GameController })
    gameController: GameController | null = null;

    @property({ type: GridSystem3D })
    gridSystem: GridSystem3D | null = null;

    @property({ type: Node })
    blockParent: Node | null = null;

    private nextCellIndex = 0;

    onLoad() {
        this.resolveReferences();
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    onDestroy() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    public addManualBlock(): boolean {
        this.resolveReferences();

        if (!this.gridSystem) {
            console.warn('ManualBlockController: GridSystem not found.');
            return false;
        }

        const nextCell = this.findNextEmptyCell();
        if (!nextCell) {
            console.warn('ManualBlockController: No empty cell available.');
            return false;
        }

        const blockNode = createVisibleBlockNode(
            `ManualBlock_${nextCell.x}_${nextCell.y}_${nextCell.z}`,
            nextCell,
            this.blockParent || this.gameController?.gameScene || this.node,
        );

        this.gridSystem.setCell(nextCell.x, nextCell.y, nextCell.z, blockNode);
        console.log(`Manual block added at (${nextCell.x}, ${nextCell.y}, ${nextCell.z})`);
        return true;
    }

    private onKeyDown(event: EventKeyboard) {
        if (event.keyCode === KeyCode.KEY_T) {
            this.addManualBlock();
        }
    }

    private resolveReferences() {
        if (!this.gameController) {
            this.gameController = this.node.scene?.getComponentInChildren(GameController) || null;
        }

        if (!this.gridSystem && this.gameController?.gridSystem) {
            this.gridSystem = this.gameController.gridSystem;
        }

        if (!this.blockParent && this.gameController?.gameScene) {
            this.blockParent = this.gameController.gameScene;
        }
    }

    private findNextEmptyCell(): Vec3 | null {
        if (!this.gridSystem) {
            return null;
        }

        const totalCells = this.gridSystem.width * this.gridSystem.depth * this.gridSystem.height;

        for (let offset = 0; offset < totalCells; offset++) {
            const index = (this.nextCellIndex + offset) % totalCells;
            const x = index % this.gridSystem.width;
            const z = Math.floor(index / this.gridSystem.width) % this.gridSystem.depth;
            const y = Math.floor(index / (this.gridSystem.width * this.gridSystem.depth));

            if (this.gridSystem.isCellEmpty(x, y, z)) {
                this.nextCellIndex = index + 1;
                return new Vec3(x, y, z);
            }
        }

        return null;
    }
}
