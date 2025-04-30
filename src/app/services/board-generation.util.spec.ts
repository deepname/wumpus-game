import { generateUniquePositions, generateWumpusPositions, generatePits, getRandomPosition } from './board-generation.util';
import { GameConfig, Position } from '../models/game.models';
import { isPositionOccupied } from './game-logic.util';

describe('board-generation.util', () => {
  describe('getRandomPosition', () => {
    it('should return a position within board size', () => {
      const boardSize = { width: 5, height: 5 };
      const pos = getRandomPosition(boardSize);
      expect(pos.x).toBeGreaterThanOrEqual(0);
      expect(pos.x).toBeLessThan(5);
      expect(pos.y).toBeGreaterThanOrEqual(0);
      expect(pos.y).toBeLessThan(5);
    });
  });

  describe('generateUniquePositions', () => {
    it('should generate the requested number of unique positions', () => {
      const boardSize = { width: 5, height: 5 };
      const positions = generateUniquePositions(5, () => true, boardSize);
      expect(positions.length).toBe(5);
      // All positions should be unique
      const unique = new Set(positions.map(p => `${p.x},${p.y}`));
      expect(unique.size).toBe(5);
    });
    it('should respect the isValid filter', () => {
      const boardSize = { width: 5, height: 5 };
      const positions = generateUniquePositions(3, (pos) => pos.x !== 0, boardSize);
      expect(positions.every(p => p.x !== 0)).toBeTrue();
    });
  });

  describe('generateWumpusPositions', () => {
    it('should not place Wumpus at (0,0)', () => {
      const config: GameConfig = {
        boardSize: { width: 5, height: 5 },
        controls: { up: 'w', down: 's', left: 'a', right: 'd', shoot: ' ' }
      };
      const wumpus = generateWumpusPositions(config);
      expect(wumpus.every(p => p.x !== 0 || p.y !== 0)).toBeTrue();
    });
  });

  describe('generatePits', () => {
    it('should not place pits on Wumpus positions', () => {
      const config: GameConfig = {
        boardSize: { width: 5, height: 5 },
        controls: { up: 'w', down: 's', left: 'a', right: 'd', shoot: ' ' }
      };
      const wumpus = [ { x: 1, y: 1 }, { x: 2, y: 2 } ];
      const pits = generatePits(config, wumpus);
      expect(pits.every(pit => !isPositionOccupied(pit, wumpus))).toBeTrue();
    });
  });
});
