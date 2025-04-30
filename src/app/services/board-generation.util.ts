import { Position, GameConfig } from '../models/game.models';
import { isPositionOccupied } from './game-logic.util';

export function getRandomPosition(boardSize: { width: number; height: number }): Position {
  return {
    x: Math.floor(Math.random() * boardSize.width),
    y: Math.floor(Math.random() * boardSize.height)
  };
}

export function generateUniquePositions(
  count: number,
  isValid: (pos: Position) => boolean,
  boardSize: { width: number; height: number }
): Position[] {
  const positions: Position[] = [];
  while (positions.length < count) {
    const pos = getRandomPosition(boardSize);
    if (isValid(pos) && !isPositionOccupied(pos, positions)) {
      positions.push(pos);
    }
  }
  return positions;
}

export function generateWumpusPositions(config: GameConfig): Position[] {
  const numWumpus = Math.max(1, Math.floor((config.boardSize.width * config.boardSize.height) / 20));
  return generateUniquePositions(numWumpus, (pos) => pos.x !== 0 || pos.y !== 0, config.boardSize);
}

export function generatePits(config: GameConfig, wumpusPositions: Position[]): Position[] {
  const numPits = Math.max(2, Math.floor((config.boardSize.width * config.boardSize.height) / 10));
  return generateUniquePositions(numPits, (pos) => !isPositionOccupied(pos, wumpusPositions), config.boardSize);
}
