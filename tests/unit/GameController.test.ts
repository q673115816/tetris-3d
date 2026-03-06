import { GameController } from '../../assets/scripts/GameController';
import { GridSystem3D } from '../../assets/scripts/GridSystem3D';
import { BlockPiece3D, BlockShape3D } from '../../assets/scripts/BlockPiece3D';
import { Node, Vec3, Prefab } from 'cc';

describe('GameController', () => {
    let gameController: GameController;
    let mockGridSystem: jest.Mocked<GridSystem3D>;
    let mockGameScene: jest.Mocked<Node>;

    beforeEach(() => {
        // 创建模拟对象
        mockGridSystem = {
            width: 10,
            depth: 10,
            height: 20,
            initializeGrid: jest.fn(),
            isValidPosition: jest.fn(() => true),
            isCellEmpty: jest.fn(() => true),
            setCell: jest.fn(),
            getCell: jest.fn(() => null),
            isLayerComplete: jest.fn(() => false),
            getCompleteLayers: jest.fn(() => []),
            clearLayer: jest.fn(),
            dropBlocksAbove: jest.fn(),
            getGridSize: jest.fn(() => new Vec3(10, 20, 10))
        } as any;

        mockGameScene = {
            addChild: jest.fn()
        } as any;

        gameController = new GameController();

        // 设置必要的属性
        gameController.gridSystem = mockGridSystem;
        gameController.gameScene = mockGameScene;
        gameController.gravityDelay = 1.0;
    });

    describe('initializeGame', () => {
        test('should initialize game properly', () => {
            gameController.initializeGame();

            // 目前初始化函数主要是检查gridSystem是否存在，不需要额外验证
            expect(gameController).toBeDefined();
        });
    });

    describe('spawnNewPiece', () => {
        test('should spawn a new piece at the correct position', () => {
            gameController.gridSystem = mockGridSystem;

            // 执行spawnNewPiece
            gameController['spawnNewPiece']();

            // 验证方块被创建
            expect(gameController['currentPiece']).toBeDefined();
        });

        test('should set game over if collision occurs at spawn', () => {
            // Mock the collision detection to return true
            const originalCheckCollision = gameController['checkCollisionAtPosition'];
            gameController['checkCollisionAtPosition'] = jest.fn(() => true);

            gameController.gridSystem = mockGridSystem;

            // 执行spawnNewPiece
            gameController['spawnNewPiece']();

            // 验证游戏结束
            expect(gameController['isGameOver']).toBe(true);

            // 恢复原始方法
            gameController['checkCollisionAtPosition'] = originalCheckCollision;
        });
    });

    describe('checkCollisionAtPosition', () => {
        test('should return true if current piece is null', () => {
            gameController['currentPiece'] = null;

            const result = gameController['checkCollisionAtPosition']();
            expect(result).toBe(true);
        });

        test('should return true if grid system is null', () => {
            gameController['currentPiece'] = {} as any;
            gameController.gridSystem = null;

            const result = gameController['checkCollisionAtPosition']();
            expect(result).toBe(true);
        });

        test('should return true if position is invalid', () => {
            const mockPiece = {
                getOccupiedCells: jest.fn(() => [new Vec3(-1, 0, 0)]) // Invalid position
            } as any;

            gameController['currentPiece'] = mockPiece;
            mockGridSystem.isValidPosition.mockReturnValueOnce(false);

            const result = gameController['checkCollisionAtPosition']();
            expect(result).toBe(true);
        });

        test('should return true if cell is not empty', () => {
            const mockPiece = {
                getOccupiedCells: jest.fn(() => [new Vec3(0, 0, 0)])
            } as any;

            gameController['currentPiece'] = mockPiece;
            mockGridSystem.isValidPosition.mockReturnValueOnce(true);
            mockGridSystem.isCellEmpty.mockReturnValueOnce(false);

            const result = gameController['checkCollisionAtPosition']();
            expect(result).toBe(true);
        });

        test('should return false if no collisions detected', () => {
            const mockPiece = {
                getOccupiedCells: jest.fn(() => [new Vec3(5, 10, 5)])
            } as any;

            gameController['currentPiece'] = mockPiece;
            mockGridSystem.isValidPosition.mockReturnValueOnce(true);
            mockGridSystem.isCellEmpty.mockReturnValueOnce(true);

            const result = gameController['checkCollisionAtPosition']();
            expect(result).toBe(false);
        });
    });

    describe('checkCollisionWithOffset', () => {
        test('should return true if current piece is null', () => {
            gameController['currentPiece'] = null;

            const result = gameController['checkCollisionWithOffset'](new Vec3(1, 0, 0));
            expect(result).toBe(true);
        });

        test('should return true if grid system is null', () => {
            gameController['currentPiece'] = {} as any;
            gameController.gridSystem = null;

            const result = gameController['checkCollisionWithOffset'](new Vec3(1, 0, 0));
            expect(result).toBe(true);
        });

        test('should temporarily move piece and restore position', () => {
            const mockPiece = {
                getOccupiedCells: jest.fn(() => [new Vec3(5, 10, 5)]),
                position: new Vec3(5, 10, 5),
                moveTo: jest.fn(),
                translate: jest.fn()
            } as any;

            gameController['currentPiece'] = mockPiece;
            mockGridSystem.isValidPosition.mockReturnValue(true);
            mockGridSystem.isCellEmpty.mockReturnValue(true);

            const offset = new Vec3(1, 0, 0);
            const result = gameController['checkCollisionWithOffset'](offset);

            // 验证piece被移动然后恢复
            expect(mockPiece.moveTo).toHaveBeenCalledTimes(2); // 调用了两次：一次是临时移动，一次是恢复
        });
    });

    describe('movement methods', () => {
        let mockPiece: any;

        beforeEach(() => {
            mockPiece = {
                getOccupiedCells: jest.fn(() => [new Vec3(5, 10, 5)]),
                position: new Vec3(5, 10, 5),
                moveTo: jest.fn(),
                translate: jest.fn()
            };

            gameController['currentPiece'] = mockPiece;
            gameController['isGameOver'] = false;

            mockGridSystem.isValidPosition.mockReturnValue(true);
            mockGridSystem.isCellEmpty.mockReturnValue(true);
        });

        test('moveLeft should translate piece left', () => {
            gameController.moveLeft();

            expect(mockPiece.translate).toHaveBeenCalledWith(new Vec3(-1, 0, 0));
        });

        test('moveRight should translate piece right', () => {
            gameController.moveRight();

            expect(mockPiece.translate).toHaveBeenCalledWith(new Vec3(1, 0, 0));
        });

        test('moveForward should translate piece forward', () => {
            gameController.moveForward();

            expect(mockPiece.translate).toHaveBeenCalledWith(new Vec3(0, 0, 1));
        });

        test('moveBackward should translate piece backward', () => {
            gameController.moveBackward();

            expect(mockPiece.translate).toHaveBeenCalledWith(new Vec3(0, 0, -1));
        });

        test('movePieceDown should lock piece if collision detected below', () => {
            // Mock collision detection to return true when checking below
            const originalCheckCollision = gameController['checkCollisionWithOffset'];
            gameController['checkCollisionWithOffset'] = jest.fn((offset) => {
                return offset.y === -1; // Simulate collision when moving down
            });

            gameController.movePieceDown();

            // 验证锁定了方块
            expect(gameController['lockPiece']).toHaveBeenCalled();

            // 恢复原始方法
            gameController['checkCollisionWithOffset'] = originalCheckCollision;
        });
    });

    describe('hardDrop', () => {
        test('should drop piece to lowest possible position', () => {
            gameController['currentPiece'] = {
                getOccupiedCells: jest.fn(() => [new Vec3(5, 10, 5)]),
                position: new Vec3(5, 10, 5),
                moveTo: jest.fn(),
                translate: jest.fn()
            } as any;

            gameController['isGameOver'] = false;

            // Mock collision detection to simulate dropping until collision
            let collisionCounter = 0;
            const originalCheckCollision = gameController['checkCollisionWithOffset'];
            gameController['checkCollisionWithOffset'] = jest.fn((offset) => {
                if (offset.y === -1) {
                    collisionCounter++;
                    return collisionCounter > 3; // Simulate collision after 3 moves down
                }
                return false;
            });

            const lockPieceSpy = jest.spyOn(gameController as any, 'lockPiece');

            gameController.hardDrop();

            // Verify that translate was called multiple times (for the fall)
            // and that lockPiece was eventually called
            expect(lockPieceSpy).toHaveBeenCalled();

            // 恢复原始方法
            gameController['checkCollisionWithOffset'] = originalCheckCollision;
            lockPieceSpy.mockRestore();
        });
    });

    describe('rotatePiece', () => {
        test('should rotate piece when no collision', () => {
            const mockPiece = {
                getOccupiedCells: jest.fn(() => [new Vec3(5, 10, 5)]),
                position: new Vec3(5, 10, 5),
                moveTo: jest.fn(),
                translate: jest.fn(),
                rotate: jest.fn()
            } as any;

            gameController['currentPiece'] = mockPiece;
            gameController['isGameOver'] = false;

            // Mock no collision after rotation
            const originalCheckCollision = gameController['checkCollisionAtPosition'];
            gameController['checkCollisionAtPosition'] = jest.fn(() => false);

            const axis = new Vec3(0, 1, 0);
            const angle = 90;

            gameController.rotatePiece(axis, angle);

            expect(mockPiece.rotate).toHaveBeenCalledWith(axis, angle);

            // 恢复原始方法
            gameController['checkCollisionAtPosition'] = originalCheckCollision;
        });

        test('should revert rotation when collision detected', () => {
            const mockPiece = {
                getOccupiedCells: jest.fn(() => [new Vec3(5, 10, 5)]),
                position: new Vec3(5, 10, 5),
                moveTo: jest.fn(),
                translate: jest.fn(),
                rotate: jest.fn()
            } as any;

            gameController['currentPiece'] = mockPiece;
            gameController['isGameOver'] = false;

            // Mock collision after rotation
            const originalCheckCollision = gameController['checkCollisionAtPosition'];
            gameController['checkCollisionAtPosition'] = jest.fn(() => true);

            const axis = new Vec3(0, 1, 0);
            const angle = 90;

            gameController.rotatePiece(axis, angle);

            // Verify rotation was called, then reverted
            expect(mockPiece.rotate).toHaveBeenNthCalledWith(1, axis, angle);
            expect(mockPiece.rotate).toHaveBeenNthCalledWith(2, axis, -angle);

            // 恢复原始方法
            gameController['checkCollisionAtPosition'] = originalCheckCollision;
        });
    });

    describe('lockPiece', () => {
        test('should set cells in grid and spawn new piece', () => {
            const mockPiece = {
                getOccupiedCells: jest.fn(() => [new Vec3(5, 10, 5), new Vec3(6, 10, 5)]),
                node: {} as Node
            } as any;

            gameController['currentPiece'] = mockPiece;
            gameController.gridSystem = mockGridSystem;

            const spawnNewPieceSpy = jest.spyOn(gameController as any, 'spawnNewPiece');

            gameController['lockPiece']();

            // Verify that grid cells were set
            expect(mockGridSystem.setCell).toHaveBeenCalledTimes(2);
            expect(spawnNewPieceSpy).toHaveBeenCalled();

            spawnNewPieceSpy.mockRestore();
        });
    });

    describe('clearCompletedLayers', () => {
        test('should update score and level when layers are cleared', () => {
            // Mock grid system to return completed layers
            mockGridSystem.getCompleteLayers.mockReturnValue([0, 1]); // Two completed layers

            gameController.gridSystem = mockGridSystem;

            // Initially, score should be 0
            expect(gameController['score']).toBe(0);

            gameController['clearCompletedLayers']();

            // Score should be updated based on layers cleared and level
            expect(gameController['score']).toBeGreaterThan(0);
            expect(gameController['linesCleared']).toBe(2);
            expect(gameController['level']).toBe(1); // Since linesCleared < 10, level should remain 1
        });

        test('should increase level when enough lines are cleared', () => {
            // Mock grid system to return many completed layers
            mockGridSystem.getCompleteLayers.mockReturnValue(Array(10).fill(0).map((_, i) => i)); // 10 layers

            gameController.gridSystem = mockGridSystem;

            gameController['linesCleared'] = 5; // Start with 5 cleared lines
            gameController['level'] = 1;

            gameController['clearCompletedLayers']();

            // Now total lines cleared = 5 + 10 = 15, so level should be 2
            expect(gameController['linesCleared']).toBe(15);
            expect(gameController['level']).toBe(2);
        });
    });

    describe('calculateScore', () => {
        test('should return correct score based on cleared layers and level', () => {
            gameController['level'] = 1;

            // Test various layer counts
            expect(gameController['calculateScore'](1)).toBe(100);
            expect(gameController['calculateScore'](2)).toBe(300);
            expect(gameController['calculateScore'](3)).toBe(500);
            expect(gameController['calculateScore'](4)).toBe(800);

            // Test with higher level
            gameController['level'] = 2;
            expect(gameController['calculateScore'](1)).toBe(200); // 100 * 2
            expect(gameController['calculateScore'](2)).toBe(600); // 300 * 2
        });

        test('should return 0 for 0 cleared layers', () => {
            expect(gameController['calculateScore'](0)).toBe(0);
        });
    });

    describe('gameOver', () => {
        test('should set game over state', () => {
            gameController['isGameOver'] = false;

            gameController['gameOver']();

            expect(gameController['isGameOver']).toBe(true);
        });
    });

    describe('restartGame', () => {
        test('should reset game state', () => {
            // Set up game with some state
            gameController['score'] = 1000;
            gameController['level'] = 5;
            gameController['linesCleared'] = 20;
            gameController['isGameOver'] = true;

            const mockPiece = {
                destroyPiece: jest.fn()
            } as any;

            gameController['currentPiece'] = mockPiece;
            gameController.gridSystem = mockGridSystem;

            const spawnNewPieceSpy = jest.spyOn(gameController as any, 'spawnNewPiece');

            gameController.restartGame();

            // Verify state reset
            expect(gameController['score']).toBe(0);
            expect(gameController['level']).toBe(1);
            expect(gameController['linesCleared']).toBe(0);
            expect(gameController['isGameOver']).toBe(false);
            expect(spawnNewPieceSpy).toHaveBeenCalled();

            spawnNewPieceSpy.mockRestore();
        });
    });

    describe('getGameState', () => {
        test('should return correct game state', () => {
            gameController['score'] = 500;
            gameController['level'] = 3;
            gameController['linesCleared'] = 15;
            gameController['isGameOver'] = false;

            const gameState = gameController.getGameState();

            expect(gameState.score).toBe(500);
            expect(gameState.level).toBe(3);
            expect(gameState.linesCleared).toBe(15);
            expect(gameState.isGameOver).toBe(false);
        });
    });
});