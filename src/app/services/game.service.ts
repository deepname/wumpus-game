import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GameConfig, GameState, Position } from '../models/game.models';
import { isPositionOccupied, getNearbyWarnings, checkCollisionsWithGold } from './game-logic.util';
import { generateUniquePositions, generateWumpusPositions, generatePits, getRandomPosition } from './board-generation.util';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  public readonly MIN_SIZE = 4;
  private readonly MAX_SIZE = 40;
  private readonly DEFAULT_ARROWS = 3;
  
  private gameState = new BehaviorSubject<GameState>({
    hunter: { x: 0, y: 0 },
    wumpus: [],
    pits: [],
    gold: { x: 0, y: 0 },
    hasGold: false,
    arrows: this.DEFAULT_ARROWS,
    isGameOver: false,
    message: '',
    boardSize: { width: this.MIN_SIZE, height: this.MIN_SIZE }
  });

  private config: GameConfig & { showFog?: boolean } = {
    boardSize: { width: this.MIN_SIZE, height: this.MIN_SIZE },
    controls: {
      up: 'ArrowUp',
      down: 'ArrowDown',
      left: 'ArrowLeft',
      right: 'ArrowRight',
      shoot: 'Space'
    }
  };


  getGameState(): Observable<GameState> {
    return this.gameState.asObservable();
  }

  initializeGame(width: number, height: number, showFog: boolean = true): void {
    // Ajusta el tamaño del tablero al rango permitido
    width = Math.max(this.MIN_SIZE, Math.min(width, this.MAX_SIZE));
    height = Math.max(this.MIN_SIZE, Math.min(height, this.MAX_SIZE));
    
    // Genera el tablero
    this.config.boardSize = { width, height };
    (this.config as { showFog?: boolean }).showFog = showFog;

    // Generar posiciones de wumpus y pits 
    const wumpus = generateWumpusPositions(this.config);
    const pits = generatePits(this.config, wumpus);

    // Generar posición del oro en una casilla libre
    let gold: Position;
    do {
      gold = getRandomPosition(this.config.boardSize);
    } while (
      (gold.x === 0 && gold.y === 0) ||
      wumpus.some(w => w.x === gold.x && w.y === gold.y) ||
      pits.some(p => p.x === gold.x && p.y === gold.y)
    );

    // Generar el estado inicial
    const newState: GameState = {
      hunter: { x: 0, y: 0 },
      wumpus,
      pits,
      gold,
      hasGold: false,
      arrows: this.DEFAULT_ARROWS,
      isGameOver: false,
      message: 'Game started! Hunt the Wumpus and find the gold!',
      boardSize: { width, height }
    };
    
    this.gameState.next(newState);
  }

  updateControls(controls: Partial<GameConfig['controls']>): void {
    this.config.controls = { ...this.config.controls, ...controls };
  }

  moveHunter(direction: 'up' | 'down' | 'left' | 'right'): void {
    if (this.gameState.value.isGameOver) return;

    const currentState = this.gameState.value;
    const newPosition = { ...currentState.hunter };
    const { width, height } = this.config.boardSize;

    switch (direction) {
      case 'up':
        if (newPosition.y > 0) newPosition.y--;
        break;
      case 'down':
        if (newPosition.y < height - 1) newPosition.y++;
        break;
      case 'left':
        if (newPosition.x > 0) newPosition.x--;
        break;
      case 'right':
        if (newPosition.x < width - 1) newPosition.x++;
        break;
    }

    let newState = { ...currentState, hunter: newPosition };

    const isAtGold = !currentState.hasGold && newPosition.x === currentState.gold.x && newPosition.y === currentState.gold.y;
    const isAtEntranceWithGold = newState.hasGold && newPosition.x === 0 && newPosition.y === 0;
    const isAtEntranceWithoutGold = !newState.hasGold && newPosition.x === 0 && newPosition.y === 0 && currentState.hasGold;

    // Si el cazador recoge el oro
    if (isAtGold) {
      newState = { 
        ...newState, 
        hasGold: true, 
        message: 'You picked up the gold! Return to the entrance to win!' 
      };
    }
    // Si el cazador tiene el oro y vuelve a la entrada
    if (isAtEntranceWithGold) {
      newState = { 
        ...newState, 
        isGameOver: true, 
        message: 'Congratulations! You escaped with the gold!' 
      };
    } else if (isAtEntranceWithoutGold) {
      // Si vuelve a la salida sin el oro, no gana
      newState = { 
        ...newState, 
        message: 'You must collect the gold and return to the entrance!' 
      };
    }

    const resolvedState = checkCollisionsWithGold(newState);
    this.gameState.next(resolvedState);
  }

  shootArrow(direction: 'up' | 'down' | 'left' | 'right'): void {
    const state = this.gameState.value;
    if (state.isGameOver || state.arrows <= 0) return;

    const arrowPosition = { ...state.hunter };
    let hitWumpus = false;
    const { width, height } = this.config.boardSize;

    while (
      arrowPosition.x >= 0 && 
      arrowPosition.x < width &&
      arrowPosition.y >= 0 && 
      arrowPosition.y < height
    ) {
      switch (direction) {
        case 'up': arrowPosition.y--; break;
        case 'down': arrowPosition.y++; break;
        case 'left': arrowPosition.x--; break;
        case 'right': arrowPosition.x++; break;
      }

      if (isPositionOccupied(arrowPosition, state.wumpus)) {
        hitWumpus = true;
        break;
      }
    }

    const updatedWumpus = hitWumpus ? state.wumpus.filter(w => !(w.x === arrowPosition.x && w.y === arrowPosition.y)) : state.wumpus;

    const newState: GameState = {
      ...state,
      arrows: state.arrows - 1,
      wumpus: updatedWumpus,
      message: hitWumpus ? 'You hit a Wumpus!' : 'Arrow missed!'
    };

    if (newState.wumpus.length === 0) {
      newState.isGameOver = true;
      newState.message = 'Congratulations! You won!';
    } else if (newState.arrows === 0 && newState.wumpus.length > 0) {
      newState.isGameOver = true;
      newState.message = 'Game Over! Out of arrows!';
    }

    this.gameState.next(newState);
  }

  getShowFog(): boolean {
    return (this.config as { showFog?: boolean }).showFog !== false;
  }
}
