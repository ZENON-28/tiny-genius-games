// Core shared types for Tiny Genius Games

export type GameId = "color-memory" | "odd-one-out";

export type RoomStatus =
  | "lobby"       // waiting for player(s) to join
  | "countdown"   // "get ready" screen
  | "playing"     // active question/round
  | "reveal"      // showing correct/incorrect
  | "paused"
  | "finished";

export interface Player {
  id: string;
  name: string;
  emoji: string;
  score: number;
  joinedAt: number;
  connected: boolean;
}

export interface ColorMemoryState {
  sequence: string[];      // e.g. ["red","green","blue"]
  playerInput: string[];   // what the player has tapped so far this round
  phase: "show" | "input" | "result";
  level: number;           // number of colors in sequence
  lastResult?: "correct" | "wrong";
}

export interface OddOneOutState {
  questionIndex: number;
  options: string[];       // 4 emoji options
  oddIndex: number;        // index of the correct (odd) answer
  category: string;
  phase: "show" | "input" | "result"; // show = host displaying, input = player can answer
  selectedIndex?: number;
  lastResult?: "correct" | "wrong";
}

export interface RoomState {
  code: string;
  hostId: string;
  createdAt: number;
  status: RoomStatus;
  currentGame: GameId | null;
  soundOn: boolean;
  timerSeconds: number;
  questionNumber: number;
  players: Record<string, Player>;
  colorMemory?: ColorMemoryState;
  oddOneOut?: OddOneOutState;
}

export interface OddOneOutQuestion {
  category: string;
  options: string[];
  oddIndex: number;
}
