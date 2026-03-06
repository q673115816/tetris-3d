import { BlockPiece3D, BlockShape3D } from '../../assets/scripts/BlockPiece3D';
import { Vec3 } from 'cc';

describe('BlockPiece3D', () => {
    let blockPiece: BlockPiece3D;

    beforeEach(() => {
        // 创建一个模拟的节点对象
        const mockNode = {
            name: 'MockNode',
            parent: null,
            children: [],
            active: true,
            worldPosition: new Vec3(0, 0, 0),
            setPosition: jest.fn(),
            setWorldPosition: jest.fn(),
            destroy: jest.fn(),
            addChild: jest.fn()
        };

        blockPiece = new BlockPiece3D();
        blockPiece.node = mockNode as any;
    });

    describe('init', () => {
        test('should initialize with specified shape and position', () => {
            const startPos = new Vec3(5, 10, 5);
            blockPiece.init(BlockShape3D.Shape_3x3_L, startPos);

            expect(blockPiece.shape).toBe(BlockShape3D.Shape_3x3_L);
            expect(blockPiece.position.equals(startPos)).toBe(true);
        });
    });

    describe('Shape creation', () => {
        test('should create correct structure for L shape', () => {
            const startPos = new Vec3(0, 0, 0);
            blockPiece.init(BlockShape3D.Shape_3x3_L, startPos);

            const occupiedCells = blockPiece.getOccupiedCells();

            // L形状应占据以下相对坐标：
            // (0,0,0), (0,0,1), (0,0,2), (1,0,0), (0,1,2)
            expect(occupiedCells.length).toBe(5);

            // 检查是否包含了所有预期的坐标
            const positionsSet = new Set(occupiedCells.map(cell => `${cell.x},${cell.y},${cell.z}`));

            expect(positionsSet.has('0,0,0')).toBe(true);
            expect(positionsSet.has('0,0,1')).toBe(true);
            expect(positionsSet.has('0,0,2')).toBe(true);
            expect(positionsSet.has('1,0,0')).toBe(true);
            expect(positionsSet.has('0,1,2')).toBe(true);
        });

        test('should create correct structure for square shape', () => {
            const startPos = new Vec3(0, 0, 0);
            blockPiece.init(BlockShape3D.Shape_3x3_Square, startPos);

            const occupiedCells = blockPiece.getOccupiedCells();

            // Square形状应有7个方块
            expect(occupiedCells.length).toBe(7);
        });

        test('should create correct structure for I shape', () => {
            const startPos = new Vec3(0, 0, 0);
            blockPiece.init(BlockShape3D.Shape_3x3_I, startPos);

            const occupiedCells = blockPiece.getOccupiedCells();

            // I形状应有5个方块
            expect(occupiedCells.length).toBe(5);
        });

        test('should handle default shape when invalid shape provided', () => {
            const startPos = new Vec3(0, 0, 0);
            // 使用默认值，应该是L形
            blockPiece.init('invalid_shape' as BlockShape3D, startPos);

            const occupiedCells = blockPiece.getOccupiedCells();
            // 验证使用的是默认L形（至少有5个方块）
            expect(occupiedCells.length).toBeGreaterThan(0);
        });
    });

    describe('Movement', () => {
        test('should move to specified position', () => {
            const startPos = new Vec3(5, 10, 5);
            const newPos = new Vec3(6, 11, 6);

            blockPiece.init(BlockShape3D.Shape_3x3_L, startPos);
            blockPiece.moveTo(newPos);

            expect(blockPiece.position.equals(newPos)).toBe(true);
        });

        test('should translate by specified offset', () => {
            const startPos = new Vec3(5, 10, 5);
            const offset = new Vec3(1, -1, 2);
            const expectedPos = new Vec3(6, 9, 7);

            blockPiece.init(BlockShape3D.Shape_3x3_L, startPos);
            blockPiece.translate(offset);

            expect(blockPiece.position.equals(expectedPos)).toBe(true);
        });

        test('should update all block positions when moving', () => {
            const startPos = new Vec3(0, 0, 0);
            const offset = new Vec3(1, 0, 0);

            blockPiece.init(BlockShape3D.Shape_3x3_L, startPos);
            const originalCells = blockPiece.getOccupiedCells();

            blockPiece.translate(offset);
            const translatedCells = blockPiece.getOccupiedCells();

            // 验证所有方块都按偏移量移动
            expect(originalCells.length).toBe(translatedCells.length);

            for (let i = 0; i < originalCells.length; i++) {
                const orig = originalCells[i];
                const trans = translatedCells[i];

                expect(trans.x).toBe(orig.x + offset.x);
                expect(trans.y).toBe(orig.y + offset.y);
                expect(trans.z).toBe(orig.z + offset.z);
            }
        });
    });

    describe('Rotation', () => {
        test('should rotate around X axis', () => {
            const startPos = new Vec3(0, 0, 0);
            blockPiece.init(BlockShape3D.Shape_3x3_L, startPos);

            const originalCells = blockPiece.getOccupiedCells();

            // 绕X轴旋转90度
            blockPiece.rotate(new Vec3(1, 0, 0), 90);

            // 旋转后的坐标应该不同
            const rotatedCells = blockPiece.getOccupiedCells();
            expect(originalCells).not.toEqual(rotatedCells);
        });

        test('should rotate around Y axis', () => {
            const startPos = new Vec3(0, 0, 0);
            blockPiece.init(BlockShape3D.Shape_3x3_L, startPos);

            const originalCells = blockPiece.getOccupiedCells();

            // 绕Y轴旋转90度
            blockPiece.rotate(new Vec3(0, 1, 0), 90);

            // 旋转后的坐标应该不同
            const rotatedCells = blockPiece.getOccupiedCells();
            expect(originalCells).not.toEqual(rotatedCells);
        });

        test('should rotate around Z axis', () => {
            const startPos = new Vec3(0, 0, 0);
            blockPiece.init(BlockShape3D.Shape_3x3_L, startPos);

            const originalCells = blockPiece.getOccupiedCells();

            // 绕Z轴旋转90度
            blockPiece.rotate(new Vec3(0, 0, 1), 90);

            // 旋转后的坐标应该不同
            const rotatedCells = blockPiece.getOccupiedCells();
            expect(originalCells).not.toEqual(rotatedCells);
        });
    });

    describe('getOccupiedCells', () => {
        test('should return absolute coordinates', () => {
            const startPos = new Vec3(5, 10, 5);
            blockPiece.init(BlockShape3D.Shape_3x3_L, startPos);

            const occupiedCells = blockPiece.getOccupiedCells();

            // 验证返回的是绝对坐标（相对于网格），而不是相对坐标
            for (const cell of occupiedCells) {
                expect(cell.x).toBeGreaterThanOrEqual(startPos.x);
                expect(cell.y).toBeGreaterThanOrEqual(startPos.y);
                expect(cell.z).toBeGreaterThanOrEqual(startPos.z);
            }
        });

        test('should return different coordinates after movement', () => {
            const startPos = new Vec3(0, 0, 0);
            const movedPos = new Vec3(1, 1, 1);

            blockPiece.init(BlockShape3D.Shape_3x3_L, startPos);
            const originalCells = blockPiece.getOccupiedCells();

            blockPiece.moveTo(movedPos);
            const movedCells = blockPiece.getOccupiedCells();

            // 移动后坐标应该整体偏移
            for (let i = 0; i < originalCells.length; i++) {
                const orig = originalCells[i];
                const moved = movedCells[i];

                expect(moved.x).toBe(orig.x + 1);
                expect(moved.y).toBe(orig.y + 1);
                expect(moved.z).toBe(orig.z + 1);
            }
        });
    });

    describe('checkCollision', () => {
        test('should detect collision when overlapping with other blocks', () => {
            const startPos = new Vec3(0, 0, 0);
            blockPiece.init(BlockShape3D.Shape_3x3_L, startPos);

            // 假设在(0,0,0)位置已经有方块
            const otherBlocks = [new Vec3(0, 0, 0)];

            const hasCollision = blockPiece.checkCollision(otherBlocks);
            expect(hasCollision).toBe(true);
        });

        test('should not detect collision when not overlapping', () => {
            const startPos = new Vec3(0, 0, 0);
            blockPiece.init(BlockShape3D.Shape_3x3_L, startPos);

            // 假设在远处有方块，不会碰撞
            const otherBlocks = [new Vec3(10, 10, 10)];

            const hasCollision = blockPiece.checkCollision(otherBlocks);
            expect(hasCollision).toBe(false);
        });

        test('should detect collision with multiple other blocks', () => {
            const startPos = new Vec3(0, 0, 0);
            blockPiece.init(BlockShape3D.Shape_3x3_L, startPos);

            // 创建一个与方块的一部分重叠的其他方块数组
            const otherBlocks = [
                new Vec3(100, 100, 100), // 远处，不重叠
                new Vec3(0, 0, 0)        // 重叠
            ];

            const hasCollision = blockPiece.checkCollision(otherBlocks);
            expect(hasCollision).toBe(true);
        });
    });

    describe('destroyPiece', () => {
        test('should clear all blocks and occupied cells', () => {
            const startPos = new Vec3(0, 0, 0);
            blockPiece.init(BlockShape3D.Shape_3x3_L, startPos);

            // 确保方块已被创建
            const initialCount = blockPiece.getOccupiedCells().length;
            expect(initialCount).toBeGreaterThan(0);

            // 销毁方块
            blockPiece.destroyPiece();

            // 验证方块已被清空
            expect(blockPiece.getOccupiedCells().length).toBe(0);
        });
    });
});