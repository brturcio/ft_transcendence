// Tetris piece types
export type PieceType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

// Tetris piece definition
export interface Piece {
	type: PieceType;
	rotation: number; // 0-3 for rotation states
	x: number; // column position
	y: number; // row position
	hasSwapped?: boolean; // whether this piece has already been swapped
}

// Cell state in the grid (allows a garbage marker "G")
export type CellState = null | PieceType | "G";

// Game state
export interface GameState {
	grid: CellState[][];
	currentPiece: Piece | null;
	stashPiece: PieceType | null;
	nextPiece: PieceType;
	score: number;
	lines: number;
	level: number;
	dropSpeed: number;
	isGameOver: boolean;
	isPaused: boolean;
	clearedLines: number;
	linesCompletedThisGame: number;
	tetrisesThisGame: number;
	hasReportedSoloGame: boolean;
}

// Game constants
export const GRID_ROWS = 20;
export const GRID_COLS = 10;
export const INITIAL_DROP_SPEED = 1000; // ms
