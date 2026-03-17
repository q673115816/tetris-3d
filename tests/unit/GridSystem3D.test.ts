import { GridSystem3D } from '../../assets/scripts/GridSystem3D';

describe('GridSystem3D', () => {
    let gridSystem: GridSystem3D;

    beforeEach(() => {
        // 创建一个模拟的节点对象，因为GridSystem3D继承自Component
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

        gridSystem = new GridSystem3D();
        gridSystem.node = mockNode as any;

        // 手动初始化网格
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

        test('should initialize all cells as empty', () => {
            for (let x = 0; x < gridSystem.width; x++) {
                for (let z = 0; z < gridSystem.depth; z++) {
                    for (let y = 0; y < gridSystem.height; y++) {
                        expect(gridSystem.isCellEmpty(x, y, z)).toBe(true);
                    }
                }
            }
        });
    });

    describe('isValidPosition', () => {
        test('should return true for valid positions within bounds', () => {
            expect(gridSystem.isValidPosition(0, 0, 0)).toBe(true);
            expect(gridSystem.isValidPosition(9, 19, 9)).toBe(true);
            expect(gridSystem.isValidPosition(5, 10, 5)).toBe(true);
        });

        test('should return false for positions outside bounds', () => {
            expect(gridSystem.isValidPosition(-1, 0, 0)).toBe(false);
            expect(gridSystem.isValidPosition(0, -1, 0)).toBe(false);
            expect(gridSystem.isValidPosition(0, 0, -1)).toBe(false);
            expect(gridSystem.isValidPosition(10, 0, 0)).toBe(false);
            expect(gridSystem.isValidPosition(0, 20, 0)).toBe(false);
            expect(gridSystem.isValidPosition(0, 0, 10)).toBe(false);
        });
    });

    describe('setCell and getCell', () => {
        test('should correctly set and get cell values', () => {
            const mockBlock = { destroy: jest.fn() } as any;

            gridSystem.setCell(5, 10, 5, mockBlock);
            expect(gridSystem.getCell(5, 10, 5)).toBe(mockBlock);
        });

        test('should return null for unset cells', () => {
            expect(gridSystem.getCell(0, 0, 0)).toBeNull();
        });

        test('should return null for invalid positions', () => {
            expect(gridSystem.getCell(-1, 0, 0)).toBeNull();
            expect(gridSystem.getCell(10, 0, 0)).toBeNull();
        });
    });

    describe('isCellEmpty', () => {
        test('should return true for empty cells', () => {
            expect(gridSystem.isCellEmpty(0, 0, 0)).toBe(true);
        });

        test('should return false for filled cells', () => {
            const mockBlock = { destroy: jest.fn() } as any;
            gridSystem.setCell(0, 0, 0, mockBlock);
            expect(gridSystem.isCellEmpty(0, 0, 0)).toBe(false);
        });

        test('should return false for invalid positions', () => {
            expect(gridSystem.isCellEmpty(-1, 0, 0)).toBe(false);
            expect(gridSystem.isCellEmpty(10, 0, 0)).toBe(false);
        });
    });

    describe('Layer operations', () => {
        test('should detect incomplete layers correctly', () => {
            expect(gridSystem.isLayerComplete(0)).toBe(false);
        });

        test('should detect complete layers when filled', () => {
            // Fill an entire layer
            for (let x = 0; x < gridSystem.width; x++) {
                for (let z = 0; z < gridSystem.depth; z++) {
                    const mockBlock = { destroy: jest.fn() } as any;
                    gridSystem.setCell(x, 5, z, mockBlock);
                }
            }

            expect(gridSystem.isLayerComplete(5)).toBe(true);
        });

        test('should return correct complete layers', () => {
            // Fill layer 0 partially - should not be complete
            for (let x = 0; x < gridSystem.width - 1; x++) {
                for (let z = 0; z < gridSystem.depth; z++) {
                    const mockBlock = { destroy: jest.fn() } as any;
                    gridSystem.setCell(x, 0, z, mockBlock);
                }
            }
            expect(gridSystem.getCompleteLayers()).toEqual([]);

            // Complete the remaining column in layer 0
            for (let z = 0; z < gridSystem.depth; z++) {
                const mockBlock = { destroy: jest.fn() } as any;
                gridSystem.setCell(gridSystem.width - 1, 0, z, mockBlock);
            }

            expect(gridSystem.getCompleteLayers()).toEqual([0]);
        });

        test('should clear layer correctly', () => {
            // Place some blocks in layer 5
            const mockBlock1 = { destroy: jest.fn() } as any;
            const mockBlock2 = { destroy: jest.fn() } as any;

            gridSystem.setCell(0, 5, 0, mockBlock1);
            gridSystem.setCell(1, 5, 1, mockBlock2);

            expect(gridSystem.getCell(0, 5, 0)).toBe(mockBlock1);
            expect(gridSystem.getCell(1, 5, 1)).toBe(mockBlock2);

            // Clear the layer
            gridSystem.clearLayer(5);

            expect(gridSystem.getCell(0, 5, 0)).toBeNull();
            expect(gridSystem.getCell(1, 5, 1)).toBeNull();
            expect(mockBlock1.destroy).toHaveBeenCalled();
            expect(mockBlock2.destroy).toHaveBeenCalled();
        });
    });

    describe('getGridSize', () => {
        test('should return correct grid dimensions', () => {
            const size = gridSystem.getGridSize();
            expect(size.x).toBe(gridSystem.width);
            expect(size.y).toBe(gridSystem.height);
            expect(size.z).toBe(gridSystem.depth);
        });
    });
});
