import { GridSystem3D } from '../../assets/scripts/GridSystem3D';

describe('GridSystem3D - Core Functions', () => {
    let gridSystem: GridSystem3D;

    // Mock Node for testing
    const mockNode = {
        name: 'MockNode',
        parent: null,
        children: [],
        active: true,
        worldPosition: { x: 0, y: 0, z: 0 },
        setPosition: jest.fn(),
        setWorldPosition: jest.fn(),
        destroy: jest.fn()
    };

    beforeEach(() => {
        gridSystem = new GridSystem3D();
        gridSystem.node = mockNode as any;

        // Initialize grid manually
        gridSystem.width = 10;
        gridSystem.depth = 10;
        gridSystem.height = 20;
        gridSystem.initializeGrid();
    });

    describe('Grid initialization', () => {
        test('should initialize grid with correct dimensions', () => {
            expect(gridSystem.width).toBe(10);
            expect(gridSystem.depth).toBe(10);
            expect(gridSystem.height).toBe(20);
        });

        test('should have valid position checking', () => {
            expect(gridSystem.isValidPosition(0, 0, 0)).toBe(true);
            expect(gridSystem.isValidPosition(9, 19, 9)).toBe(true);
            expect(gridSystem.isValidPosition(-1, 0, 0)).toBe(false);
            expect(gridSystem.isValidPosition(10, 0, 0)).toBe(false);
        });
    });

    describe('Cell operations', () => {
        test('should correctly check if cell is empty', () => {
            expect(gridSystem.isCellEmpty(0, 0, 0)).toBe(true);

            const mockBlock = { destroy: jest.fn() } as any;
            gridSystem.setCell(0, 0, 0, mockBlock);

            expect(gridSystem.isCellEmpty(0, 0, 0)).toBe(false);
        });

        test('should set and get cell values', () => {
            const mockBlock = { destroy: jest.fn() } as any;

            gridSystem.setCell(5, 10, 5, mockBlock);
            expect(gridSystem.getCell(5, 10, 5)).toBe(mockBlock);
        });
    });
});