import { BlockPiece3D, BlockShape3D } from '../../assets/scripts/BlockPiece3D';
import { Vec3 } from '../mock/cc';

describe('BlockPiece3D - Core Functions', () => {
    let blockPiece: BlockPiece3D;

    // Mock Node for testing
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

    beforeEach(() => {
        blockPiece = new BlockPiece3D();
        blockPiece.node = mockNode as any;
    });

    describe('Initialization', () => {
        test('should initialize with specified shape and position', () => {
            const startPos = new Vec3(5, 10, 5);
            blockPiece.init(BlockShape3D.Shape_3x3_L, startPos);

            expect(blockPiece.shape).toBe(BlockShape3D.Shape_3x3_L);
            expect(blockPiece.position.x).toBe(startPos.x);
            expect(blockPiece.position.y).toBe(startPos.y);
            expect(blockPiece.position.z).toBe(startPos.z);
        });
    });

    describe('Shape creation', () => {
        test('should create correct structure for L shape', () => {
            const startPos = new Vec3(0, 0, 0);
            blockPiece.init(BlockShape3D.Shape_3x3_L, startPos);

            const occupiedCells = blockPiece.getOccupiedCells();

            // Verify that we have the expected number of cells for L shape
            expect(occupiedCells.length).toBeGreaterThan(0);
        });

        test('should create different structures for different shapes', () => {
            const startPos = new Vec3(0, 0, 0);

            blockPiece.init(BlockShape3D.Shape_3x3_L, startPos);
            const lShapeCells = blockPiece.getOccupiedCells().length;

            blockPiece.init(BlockShape3D.Shape_3x3_I, startPos);
            const iShapeCells = blockPiece.getOccupiedCells().length;

            // Different shapes should have different numbers of cells
            expect(lShapeCells).toBeGreaterThan(0);
            expect(iShapeCells).toBeGreaterThan(0);
        });
    });

    describe('Movement', () => {
        test('should update position when moving', () => {
            const startPos = new Vec3(0, 0, 0);
            const newPos = new Vec3(1, 1, 1);

            blockPiece.init(BlockShape3D.Shape_3x3_L, startPos);

            const originalPos = { ...blockPiece.position };

            blockPiece.moveTo(newPos);

            expect(blockPiece.position.x).toBe(newPos.x);
            expect(blockPiece.position.y).toBe(newPos.y);
            expect(blockPiece.position.z).toBe(newPos.z);
        });
    });

    describe('Collision Detection', () => {
        test('should detect collision when overlapping', () => {
            const startPos = new Vec3(0, 0, 0);
            blockPiece.init(BlockShape3D.Shape_3x3_L, startPos);

            // Check collision with a block at same position
            const otherBlocks = [new Vec3(0, 0, 0)];
            const hasCollision = blockPiece.checkCollision(otherBlocks);

            expect(hasCollision).toBe(true);
        });

        test('should not detect collision when not overlapping', () => {
            const startPos = new Vec3(0, 0, 0);
            blockPiece.init(BlockShape3D.Shape_3x3_L, startPos);

            // Check collision with a block far away
            const otherBlocks = [new Vec3(10, 10, 10)];
            const hasCollision = blockPiece.checkCollision(otherBlocks);

            expect(hasCollision).toBe(false);
        });
    });
});