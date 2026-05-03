import {
	type GameState,
	type PieceType,
	GRID_ROWS,
	GRID_COLS,
	INITIAL_DROP_SPEED
} from "./types";

import {
	createNewPiece,
	getRandomPieceType,
	movePieceDown,
	rotatePiece,
	movePieceLeft,
	movePieceRight,
	placePieceOnGrid,
	canPlacePiece,
	getPieceShape
} from "./pieces";

export function createEmptyGrid(): (PieceType | null)[][] {
	return Array.from({ length: GRID_ROWS }, () =>
		Array(GRID_COLS).fill(null)
	);
}

export function initializeGame(startPaused = false): GameState {
	const nextPiece = getRandomPieceType();

	return {
		grid: createEmptyGrid(),
		currentPiece: createNewPiece(getRandomPieceType()),
		stashPiece: null,
		nextPiece,
		score: 0,
		lines: 0,
		level: 1,
		dropSpeed: INITIAL_DROP_SPEED,
		isGameOver: false,
		isPaused: startPaused,
		clearedLines: 0
	};
}

export function clearCompleteLines(grid: (PieceType | null)[][]): {
	grid: (PieceType | null)[][];
	clearedLines: number;
} {
	const newGrid = grid.filter(row => row.some(cell => cell === null));
	const clearedLines = GRID_ROWS - newGrid.length;

	while (newGrid.length < GRID_ROWS) {
		newGrid.unshift(Array(GRID_COLS).fill(null));
	}

	return { grid: newGrid, clearedLines };
}

export function calculateScore(cleared: number, score: number): number {
	const table = [0, 100, 300, 500, 800];
	return score + (table[cleared] ?? 800);
}

export function updateLevel(lines: number): number {
	return Math.floor(lines / 10) + 1;
}

export function getDropSpeed(level: number): number {
	return Math.max(60, INITIAL_DROP_SPEED * Math.pow(0.65, level - 1));
}

export function getHardDropY(
	grid: (PieceType | null)[][],
	piece: { x: number; y: number; type: PieceType; rotation: number }
): number {
	let y = piece.y;

	while (canPlacePiece(grid, { ...piece, y: y + 1 })) {
		y++;
	}

	return y;
}

export function dropPiece(state: GameState): GameState {
	if (state.isPaused || state.isGameOver || !state.currentPiece) {
		return state;
	}

	const moved = movePieceDown(state.grid, state.currentPiece);

	if (moved) {
		return { ...state, currentPiece: moved };
	}

	const newGrid = placePieceOnGrid(state.grid, state.currentPiece);
	const { grid, clearedLines } = clearCompleteLines(newGrid);

	const score = calculateScore(clearedLines, state.score);
	const lines = state.lines + clearedLines;
	const level = updateLevel(lines);
	const dropSpeed = getDropSpeed(level);

	const next = createNewPiece(state.nextPiece);
	const nextNext = getRandomPieceType();

	const isGameOver = !canPlacePiece(grid, next);

	return {
		...state,
		grid,
		currentPiece: isGameOver ? null : next,
		nextPiece: nextNext,
		score,
		lines,
		level,
		dropSpeed,
		isGameOver,
		clearedLines: clearedLines
	};
}

export function moveLeft(state: GameState): GameState {
	if (state.isPaused || state.isGameOver || !state.currentPiece) return state;

	return {
		...state,
		currentPiece: movePieceLeft(state.grid, state.currentPiece)
	};
}

export function moveRight(state: GameState): GameState {
	if (state.isPaused || state.isGameOver || !state.currentPiece) return state;

	return {
		...state,
		currentPiece: movePieceRight(state.grid, state.currentPiece)
	};
}

export function rotateCurrent(state: GameState): GameState {
	if (state.isPaused || state.isGameOver || !state.currentPiece) return state;

	const rotated = rotatePiece(state.currentPiece);

	if (canPlacePiece(state.grid, rotated)) {
		return { ...state, currentPiece: rotated };
	}

	return state;
}

export function quickDrop(state: GameState): GameState {
	if (state.isPaused || state.isGameOver || !state.currentPiece) {
		return state;
	}

	const landY = getHardDropY(state.grid, state.currentPiece);
	const dropped = { ...state.currentPiece, y: landY };

	const newGrid = placePieceOnGrid(state.grid, dropped);
	const { grid, clearedLines } = clearCompleteLines(newGrid);

	const score = calculateScore(clearedLines, state.score);
	const lines = state.lines + clearedLines;
	const level = updateLevel(lines);
	const dropSpeed = getDropSpeed(level);

	const next = createNewPiece(state.nextPiece);
	const nextNext = getRandomPieceType();

	const isGameOver = !canPlacePiece(grid, next);

	return {
		...state,
		grid,
		currentPiece: isGameOver ? null : next,
		nextPiece: nextNext,
		score,
		lines,
		level,
		dropSpeed,
		isGameOver,
		clearedLines: clearedLines
	};
}

export function togglePause(state: GameState): GameState {
	return {
		...state,
		isPaused: !state.isPaused
	};
}

export function switchStash(state: GameState): GameState {
	if (state.isPaused || state.isGameOver || !state.currentPiece) {
		return state;
	}

	if (!state.stashPiece) {
		const newCurrent = createNewPiece(state.nextPiece);
		const newNext = getRandomPieceType();

		const isGameOver = !canPlacePiece(state.grid, newCurrent);

		return {
			...state,
			stashPiece: state.currentPiece.type,
			currentPiece: isGameOver ? null : newCurrent,
			nextPiece: newNext,
			isGameOver
		};
	}

	const swapped = createNewPiece(state.stashPiece);

	if (!canPlacePiece(state.grid, swapped)) {
		return {
			...state,
			isGameOver: true,
			currentPiece: null
		};
	}

	return {
		...state,
		stashPiece: state.currentPiece.type,
		currentPiece: swapped
	};
}

export function getDisplayGrid(gameState: GameState): (PieceType | null | "preview")[][] {
	const displayGrid = gameState.grid.map(row => [...row]) as (PieceType | null | "preview")[][];

	if (!gameState.currentPiece) return displayGrid;

	const { currentPiece } = gameState;

	const landY = getHardDropY(gameState.grid, currentPiece);
	const previewShape = getPieceShape(currentPiece.type, currentPiece.rotation);

	for (let row = 0; row < previewShape.length; row++) {
		for (let col = 0; col < previewShape[row].length; col++) {
			if (!previewShape[row][col]) continue;

			const x = currentPiece.x + col;
			const y = landY + row;

			if (y >= 0 && y < GRID_ROWS && x >= 0 && x < GRID_COLS) {
				if (displayGrid[y][x] === null) {
					displayGrid[y][x] = "preview";
				}
			}
		}
	}

	const shape = getPieceShape(currentPiece.type, currentPiece.rotation);

	for (let row = 0; row < shape.length; row++) {
		for (let col = 0; col < shape[row].length; col++) {
			if (!shape[row][col]) continue;

			const x = currentPiece.x + col;
			const y = currentPiece.y + row;

			if (y >= 0 && y < GRID_ROWS && x >= 0 && x < GRID_COLS) {
				displayGrid[y][x] = currentPiece.type;
			}
		}
	}

	return displayGrid;
}