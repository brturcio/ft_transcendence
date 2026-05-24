import type { PieceType, Piece } from './types.ts';

// Tetris piece shapes (rotation states)
const PIECE_SHAPES: Record<PieceType, number[][][]> = {
	// I piece
	I: [
		[[1, 1, 1, 1]],
		[[1], [1], [1], [1]]
	],
	// O piece (2x2 square)
	O: [
		[[1, 1], [1, 1]]
	],
	// T piece
	T: [
		[[0, 1, 0], [1, 1, 1]],
		[[1, 0], [1, 1], [1, 0]],
		[[1, 1, 1], [0, 1, 0]],
		[[0, 1], [1, 1], [0, 1]]
	],
	// S piece
	S: [
		[[0, 1, 1], [1, 1, 0]],
		[[1, 0], [1, 1], [0, 1]]
	],
	// Z piece
	Z: [
		[[1, 1, 0], [0, 1, 1]],
		[[0, 1], [1, 1], [1, 0]]
	],
	// J piece
	J: [
		[[1, 0, 0], [1, 1, 1]],
		[[1, 1], [1, 0], [1, 0]],
		[[1, 1, 1], [0, 0, 1]],
		[[0, 1], [0, 1], [1, 1]]
	],
	// L piece
	L: [
		[[0, 0, 1], [1, 1, 1]],
		[[1, 0], [1, 0], [1, 1]],
		[[1, 1, 1], [1, 0, 0]],
		[[1, 1], [0, 1], [0, 1]]
	]
};

// Get random piece type
export function getRandomPieceType(): PieceType {
	const types: PieceType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
	return types[Math.floor(Math.random() * types.length)];
}

// Get piece shape for current rotation
export function getPieceShape(type: PieceType, rotation: number): number[][] {
	const shapes = PIECE_SHAPES[type];
	return shapes[rotation % shapes.length];
}

// Create a new piece at the top
export function createNewPiece(type: PieceType): Piece {
	return {
		type,
		rotation: 0,
		x: Math.floor((10 - 3) / 2), // Center horizontally (column 3-4)
		y: 0,
		hasSwapped: false
	};
}

// Check if a piece can be placed at given position
export function canPlacePiece(
	grid: (PieceType | null)[][],
	piece: Piece,
	offsetX: number = 0,
	offsetY: number = 0
): boolean {
	const shape = getPieceShape(piece.type, piece.rotation);
	const newX = piece.x + offsetX;
	const newY = piece.y + offsetY;

	for (let row = 0; row < shape.length; row++) {
		for (let col = 0; col < shape[row].length; col++) {
			if (shape[row][col] === 0) continue;

			const gridX = newX + col;
			const gridY = newY + row;

			// Check boundaries
			if (gridX < 0 || gridX >= 10 || gridY >= 20) return false;
			if (gridY < 0) continue; // Allow pieces above the grid during spawn

			// Check collision with existing blocks
			if (grid[gridY]?.[gridX]) return false;
		}
	}
	return true;
}

// Place piece on grid
export function placePieceOnGrid(
	grid: (PieceType | null)[][],
	piece: Piece
): (PieceType | null)[][] {
	const newGrid = grid.map(row => [...row]);
	const shape = getPieceShape(piece.type, piece.rotation);

	for (let row = 0; row < shape.length; row++) {
		for (let col = 0; col < shape[row].length; col++) {
			if (shape[row][col] === 0) continue;

			const gridX = piece.x + col;
			const gridY = piece.y + row;

			if (gridY >= 0 && gridY < 20 && gridX >= 0 && gridX < 10) {
				newGrid[gridY][gridX] = piece.type;
			}
		}
	}
	return newGrid;
}

// Get piece width and height
export function getPieceDimensions(type: PieceType, rotation: number): { width: number; height: number } {
	const shape = getPieceShape(type, rotation);
	const height = shape.length;
	const width = shape[0].length;
	return { width, height };
}

// Rotate piece clockwise
export function rotatePiece(piece: Piece): Piece {
	return {
		...piece,
		rotation: (piece.rotation + 1) % PIECE_SHAPES[piece.type].length
	};
}

// Move piece left
export function movePieceLeft(grid: (PieceType | null)[][], piece: Piece): Piece | null {
	if (canPlacePiece(grid, piece, -1, 0)) {
		return { ...piece, x: piece.x - 1 };
	}
	return piece;
}

// Move piece right
export function movePieceRight(grid: (PieceType | null)[][], piece: Piece): Piece | null {
	if (canPlacePiece(grid, piece, 1, 0)) {
		return { ...piece, x: piece.x + 1 };
	}
	return piece;
}

// Move piece down
export function movePieceDown(grid: (PieceType | null)[][], piece: Piece): Piece | null {
	if (canPlacePiece(grid, piece, 0, 1)) {
		return { ...piece, y: piece.y + 1 };
	}
	return null; // Can't move down - piece locked
}
