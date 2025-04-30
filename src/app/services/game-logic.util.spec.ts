import { GameState, Position } from '../models/game.models';
import { isPositionOccupied, getNearbyWarnings, checkCollisionsWithGold } from './game-logic.util';

describe('game-logic.util', () => {
  describe('isPositionOccupied', () => {
    it('should return true if position is occupied', () => {
      const pos: Position = { x: 1, y: 2 };
      const positions: Position[] = [
        { x: 0, y: 0 },
        { x: 1, y: 2 },
        { x: 3, y: 4 }
      ];
      expect(isPositionOccupied(pos, positions)).toBeTrue();
    });
    it('should return false if position is not occupied', () => {
      const pos: Position = { x: 2, y: 2 };
      const positions: Position[] = [
        { x: 0, y: 0 },
        { x: 1, y: 2 },
        { x: 3, y: 4 }
      ];
      expect(isPositionOccupied(pos, positions)).toBeFalse();
    });
  });

  describe('getNearbyWarnings', () => {
    const state: GameState = {
      hunter: { x: 1, y: 1 },
      wumpus: [{ x: 2, y: 1 }],
      pits: [{ x: 1, y: 2 }],
      gold: { x: 3, y: 3 },
      hasGold: false,
      arrows: 3,
      isGameOver: false,
      message: '',
      boardSize: { width: 4, height: 4 }
    };
    it('should warn about Wumpus and pits nearby', () => {
      const warnings = getNearbyWarnings({ x: 1, y: 1 }, state);
      expect(warnings).toContain('smell');
      expect(warnings).toContain('draft');
    });
    it('should warn only about Wumpus if only Wumpus is nearby', () => {
      const warnings = getNearbyWarnings({ x: 2, y: 2 }, { ...state, pits: [] });
      expect(warnings).toContain('smell');
      expect(warnings).not.toContain('draft');
    });
    it('should warn only about pits if only pits are nearby', () => {
      const warnings = getNearbyWarnings({ x: 2, y: 2 }, { ...state, wumpus: [] });
      expect(warnings).not.toContain('smell');
      expect(warnings).toContain('draft');
    });
    it('should return empty string if nothing is nearby', () => {
      const warnings = getNearbyWarnings({ x: 0, y: 0 }, { ...state, wumpus: [], pits: [] });
      expect(warnings).toBe('');
    });
  });

  describe('checkCollisionsWithGold', () => {
    const baseState: GameState = {
      hunter: { x: 1, y: 1 },
      wumpus: [{ x: 2, y: 1 }],
      pits: [{ x: 1, y: 2 }],
      gold: { x: 3, y: 3 },
      hasGold: false,
      arrows: 3,
      isGameOver: false,
      message: '',
      boardSize: { width: 4, height: 4 }
    };
    it('should set game over and message if hunter is on Wumpus', () => {
      const state = { ...baseState, hunter: { x: 2, y: 1 } };
      const newState = checkCollisionsWithGold(state);
      expect(newState.isGameOver).toBeTrue();
      expect(newState.message).toContain('Wumpus');
    });
    it('should set game over and message if hunter is on pit', () => {
      const state = { ...baseState, hunter: { x: 1, y: 2 } };
      const newState = checkCollisionsWithGold(state);
      expect(newState.isGameOver).toBeTrue();
      expect(newState.message).toContain('pit');
    });
    it('should update message with warnings if nothing is hit', () => {
      const state = { ...baseState, hunter: { x: 1, y: 1 } };
      const newState = checkCollisionsWithGold(state);
      expect(newState.isGameOver).toBeFalse();
      expect(newState.message).toContain('smell');
      expect(newState.message).toContain('draft');
    });
  });
});
