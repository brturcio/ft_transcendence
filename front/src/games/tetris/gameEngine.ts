import { type GameState, type PieceType, GRID_ROWS, GRID_COLS, INITIAL_DROP_SPEED } from './types';
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
} from './pieces';
import { unlockAchievement, unlockTetrisAchievement } from "../../components/Achievements";

export function createEmptyGrid(): (PieceType | null)[][] {
	return Array(GRID_ROWS)
		.fill(null)
		.map(() => Array(GRID_COLS).fill(null));
}

export function initializeGame(startPaused: boolean = false): GameState {
	const nextPieceType = getRandomPieceType();
	return {
		grid: createEmptyGrid(),
		currentPiece: createNewPiece(getRandomPieceType()),
		stashPiece: null,
		nextPiece: nextPieceType,
		score: 0,
		lines: 0,
		level: 1,
		dropSpeed: INITIAL_DROP_SPEED,
		isGameOver: false,
		isPaused: startPaused,
	};
}

export function clearCompleteLines(grid: (PieceType | null)[][]): { grid: (PieceType | null)[][]; clearedLines: number } {
	const newGrid = grid.filter(row => row.some(cell => cell === null));
	const clearedLines = grid.length - newGrid.length;
	
	while (newGrid.length < GRID_ROWS) {
		newGrid.unshift(Array(GRID_COLS).fill(null));
	}

	return { grid: newGrid, clearedLines };
}

// Calculate score based on cleared lines
export function calculateScore(clearedLines: number, currentScore: number): number {
	const lineScores = [0, 100, 300, 500, 800]; // 1-4 lines cleared
	return currentScore + (lineScores[clearedLines] || 800);
}

// Update level based on lines cleared
export function updateLevel(totalLines: number): number {
	return Math.floor(totalLines / 10) + 1;
}

// Get drop speed based on level
export function getDropSpeed(level: number): number {
	return Math.max(60, INITIAL_DROP_SPEED * Math.pow(0.65, level - 1));
}

// Drop piece one row
export function dropPiece(gameState: GameState): GameState {
	if (gameState.isPaused || gameState.isGameOver || !gameState.currentPiece) {
		return gameState;
	}

	const movedPiece = movePieceDown(gameState.grid, gameState.currentPiece);

	if (movedPiece) {
		// Piece can move down
		return {
			...gameState,
			currentPiece: movedPiece
		};
	} else {
		// Piece is locked, place it on grid
		const newGrid = placePieceOnGrid(gameState.grid, gameState.currentPiece);
		const { grid: clearedGrid, clearedLines } = clearCompleteLines(newGrid);

		if (clearedLines == 4) {
			unlockTetrisAchievement();
		}

		const newScore = calculateScore(clearedLines, gameState.score);
		const newLines = gameState.lines + clearedLines;
		const newLevel = updateLevel(newLines);
		const newDropSpeed = getDropSpeed(newLevel);

		// Create next piece
		const nextPiece = createNewPiece(gameState.nextPiece);
		const nextNextPieceType = getRandomPieceType();
		const newStash = gameState.stashPiece;

		// Check if game over (new piece can't be placed)
		const isGameOver = !canPlacePiece(clearedGrid, nextPiece);

		return {
			grid: clearedGrid,
			currentPiece: isGameOver ? null : nextPiece,
			nextPiece: nextNextPieceType,
			stashPiece: newStash,
			score: newScore,
			lines: newLines,
			level: newLevel,
			dropSpeed: newDropSpeed,
			isGameOver,
			isPaused: gameState.isPaused
		};
	}
}

// Rotate current piece
export function rotateCurrent(gameState: GameState): GameState {
	if (gameState.isPaused || gameState.isGameOver || !gameState.currentPiece) {
		return gameState;
	}

	const rotatedPiece = rotatePiece(gameState.currentPiece);
	if (canPlacePiece(gameState.grid, rotatedPiece)) {
		return {
			...gameState,
			currentPiece: rotatedPiece
		};
	}
	return gameState;
}

// Move current piece left
export function moveLeft(gameState: GameState): GameState {
	if (gameState.isPaused || gameState.isGameOver || !gameState.currentPiece) {
		return gameState;
	}

	const movedPiece = movePieceLeft(gameState.grid, gameState.currentPiece);
	return {
		...gameState,
		currentPiece: movedPiece
	};
}

// Move current piece right
export function moveRight(gameState: GameState): GameState {
	if (gameState.isPaused || gameState.isGameOver || !gameState.currentPiece) {
		return gameState;
	}

	const movedPiece = movePieceRight(gameState.grid, gameState.currentPiece);
	return {
		...gameState,
		currentPiece: movedPiece
	};
}

// Toggle pause
export function togglePause(gameState: GameState): GameState {
	return {
		...gameState,
		isPaused: !gameState.isPaused
	};
}

// Get current grid with active piece rendered
export function getDisplayGrid(gameState: GameState): (PieceType | null)[][] {
	const displayGrid = gameState.grid.map(row => [...row]);
	
	if (!gameState.currentPiece) return displayGrid;

	const { currentPiece } = gameState;
	const shape = getPieceShape(currentPiece.type, currentPiece.rotation);

	for (let row = 0; row < shape.length; row++) {
		for (let col = 0; col < shape[row].length; col++) {
			if (shape[row][col] === 0) continue;

			const gridX = currentPiece.x + col;
			const gridY = currentPiece.y + row;

			if (gridY >= 0 && gridY < GRID_ROWS && gridX >= 0 && gridX < GRID_COLS) {
				displayGrid[gridY][gridX] = currentPiece.type;
			}
		}
	}

	return displayGrid;
}

// Calculate where a piece will land (hard drop position)
export function getHardDropY(grid: (PieceType | null)[][], piece: { x: number; y: number; type: PieceType; rotation: number }): number {
	let y = piece.y;
	while (canPlacePiece(grid, { ...piece, y: y + 1 })) {
		y++;
	}
	return y;
}

// Get preview grid showing where piece will land
export function getPreviewGrid(gameState: GameState): (PieceType | null | 'preview')[][] {
	const previewGrid = gameState.grid.map(row => [...row]) as (PieceType | null | 'preview')[][];
	
	if (!gameState.currentPiece) return previewGrid;

	const { currentPiece } = gameState;
	const landY = getHardDropY(gameState.grid, currentPiece);
	const shape = getPieceShape(currentPiece.type, currentPiece.rotation);

	// Draw preview ghost piece
	for (let row = 0; row < shape.length; row++) {
		for (let col = 0; col < shape[row].length; col++) {
			if (shape[row][col] === 0) continue;

			const gridX = currentPiece.x + col;
			const gridY = landY + row;

			if (gridY >= 0 && gridY < GRID_ROWS && gridX >= 0 && gridX < GRID_COLS) {
				if (previewGrid[gridY][gridX] === null) {
					previewGrid[gridY][gridX] = 'preview';
				}
			}
		}
	}

	return previewGrid;
}

// Get display grid with both current piece and preview shown
export function getDisplayGridWithPreview(gameState: GameState): (PieceType | null | 'preview')[][] {
	const displayGrid = getDisplayGrid(gameState);
	const previewGrid = displayGrid.map(row => [...row]) as (PieceType | null | 'preview')[][];
	
	if (!gameState.currentPiece) return previewGrid;

	const { currentPiece } = gameState;
	const landY = getHardDropY(gameState.grid, currentPiece);
	
	// Only draw preview if piece hasn't reached its landing position yet
	if (currentPiece.y < landY) {
		const shape = getPieceShape(currentPiece.type, currentPiece.rotation);

		// Draw preview ghost piece at landing position
		for (let row = 0; row < shape.length; row++) {
			for (let col = 0; col < shape[row].length; col++) {
				if (shape[row][col] === 0) continue;

				const gridX = currentPiece.x + col;
				const gridY = landY + row;

				if (gridY >= 0 && gridY < GRID_ROWS && gridX >= 0 && gridX < GRID_COLS) {
					if (previewGrid[gridY][gridX] === null) {
						previewGrid[gridY][gridX] = 'preview';
					}
				}
			}
		}
	}

	return previewGrid;
}

// Quick drop - instantly place piece at bottom
export function quickDrop(gameState: GameState): GameState {
	if (gameState.isPaused || gameState.isGameOver || !gameState.currentPiece) {
		return gameState;
	}

	const landY = getHardDropY(gameState.grid, gameState.currentPiece);
	const droppedPiece = { ...gameState.currentPiece, y: landY };

	// Place piece on grid
	const newGrid = placePieceOnGrid(gameState.grid, droppedPiece);
	const { grid: clearedGrid, clearedLines } = clearCompleteLines(newGrid);

	if (clearedLines == 4) {
		unlockTetrisAchievement();
	}

	const newScore = calculateScore(clearedLines, gameState.score);
	const newLines = gameState.lines + clearedLines;
	const newLevel = updateLevel(newLines);
	const newDropSpeed = getDropSpeed(newLevel);

	// Create next piece
	const nextPiece = createNewPiece(gameState.nextPiece);
	const nextNextPieceType = getRandomPieceType();

	// Check if game over
	const isGameOver = !canPlacePiece(clearedGrid, nextPiece);

	return {
		grid: clearedGrid,
		currentPiece: isGameOver ? null : nextPiece,
		nextPiece: nextNextPieceType,
		stashPiece: gameState.stashPiece,
		score: newScore,
		lines: newLines,
		level: newLevel,
		dropSpeed: newDropSpeed,
		isGameOver,
		isPaused: gameState.isPaused
	};
}


export function switchStash(gameState: GameState): GameState {
	if (gameState.isPaused || gameState.isGameOver || !gameState.currentPiece) {
		return gameState;
	}

	const { currentPiece, stashPiece, grid, nextPiece } = gameState;

	if (!stashPiece) {
		const newCurrent = createNewPiece(nextPiece);
		const newNext = getRandomPieceType();

		const isGameOver = !canPlacePiece(grid, newCurrent);

		return {
			...gameState,
			stashPiece: currentPiece.type,
			currentPiece: isGameOver ? null : newCurrent,
			nextPiece: newNext,
			isGameOver
		};
	}

	const swappedPiece = createNewPiece(stashPiece);

	if (!canPlacePiece(grid, swappedPiece)) {
		return {
			...gameState,
			isGameOver: true,
			currentPiece: null
		};
	}

	return {
		...gameState,
		stashPiece: currentPiece.type,
		currentPiece: swappedPiece
	};
}