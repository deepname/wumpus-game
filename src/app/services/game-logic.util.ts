import { GameState, Position } from '../models/game.models';

export function isPositionOccupied(pos: Position, positions: Position[]): boolean {
  return positions.some(p => p.x === pos.x && p.y === pos.y);
}

export function getNearbyWarnings(position: Position, state: GameState, translationService?: TranslationService): string {
  const warnings: string[] = [];
  const adjacentPositions = [
    { x: position.x - 1, y: position.y },
    { x: position.x + 1, y: position.y },
    { x: position.x, y: position.y - 1 },
    { x: position.x, y: position.y + 1 }
  ];

  if (adjacentPositions.some(pos => isPositionOccupied(pos, state.wumpus))) {
    warnings.push(translationService ? translationService.instant('game.warningWumpus') : 'You smell something terrible nearby!');
  }
  if (adjacentPositions.some(pos => isPositionOccupied(pos, state.pits))) {
    warnings.push(translationService ? translationService.instant('game.warningPit') : 'You feel a draft!');
  }

  return warnings.join(' ');
}

import { TranslationService } from './translation.service';

export function checkCollisionsWithGold(state: GameState, translationService?: TranslationService): GameState {
  let newState = { ...state };
  if (isPositionOccupied(state.hunter, state.wumpus)) {
    newState = {
      ...newState,
      isGameOver: true,
      message: translationService ? translationService.instant('game.overWumpus') : 'Game Over Hunter! A Wumpus got you!'
    };
  } else if (isPositionOccupied(state.hunter, state.pits)) {
    newState = {
      ...newState,
      isGameOver: true,
      message: translationService ? translationService.instant('game.overPit') : 'Game Over Hunter! You fell into a pit!'
    };
  } else {
    newState.message = translationService ? getNearbyWarnings(state.hunter, state, translationService) : getNearbyWarnings(state.hunter, state);
  }
  return newState;
}
