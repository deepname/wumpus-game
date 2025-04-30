export interface GameConfig {
  boardSize: {
    width: number;
    height: number;
  };
  controls: {
    up: string;
    down: string;
    left: string;
    right: string;
    shoot: string;
  };
}

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  gold: Position;
  hasGold: boolean;
  hunter: Position;
  wumpus: Position[];
  pits: Position[];
  arrows: number;
  isGameOver: boolean;
  message: string;
  boardSize: {
    width: number;
    height: number;
  };
}
