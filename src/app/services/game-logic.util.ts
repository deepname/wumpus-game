import { GameState, Position } from '../models/game.models';

export function isPositionOccupied(pos: Position, positions: Position[]): boolean {
  return positions.some(p => p.x === pos.x && p.y === pos.y);
}

export function getNearbyWarnings(position: Position, state: GameState): string {
  const warnings: string[] = [];
  const adjacentPositions = [
    { x: position.x - 1, y: position.y },
    { x: position.x + 1, y: position.y },
    { x: position.x, y: position.y - 1 },
    { x: position.x, y: position.y + 1 }
  ];

  if (adjacentPositions.some(pos => isPositionOccupied(pos, state.wumpus))) {
    warnings.push('You smell something terrible nearby!');
  }
  if (adjacentPositions.some(pos => isPositionOccupied(pos, state.pits))) {
    warnings.push('You feel a draft!');
  }

  return warnings.join(' ');
}

export function checkCollisionsWithGold(state: GameState): GameState {
  let newState = { ...state };
  if (isPositionOccupied(state.hunter, state.wumpus)) {
    newState = {
      ...newState,
      isGameOver: true,
      message: 'Game Over Hunter! A Wumpus got you!'
    };
  } else if (isPositionOccupied(state.hunter, state.pits)) {
    newState = {
      ...newState,
      isGameOver: true,
      message: 'Game Over Hunter! You fell into a pit!'
    };
  } else {
    newState.message = getNearbyWarnings(state.hunter, state);
  }
  return newState;
}
