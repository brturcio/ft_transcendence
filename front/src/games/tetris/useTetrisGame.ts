import React from 'react';
import type { GameState } from './types';
import {
	initializeGame,
	dropPiece,
	rotateCurrent,
	moveLeft,
	moveRight,
	togglePause,
	quickDrop
} from './gameEngine';

// Hook to manage Tetris game state and logic
export function useTetrisGame() {
	const [gameState, setGameState] = React.useState<GameState>(() => initializeGame(true));

	// Auto-drop piece every tick
	React.useEffect(() => {
		if (gameState.isPaused || gameState.isGameOver) return;

		const interval = setInterval(() => {
			setGameState(state => dropPiece(state));
		}, 800); // Adjust speed as needed

		return () => clearInterval(interval);
	}, [gameState.isPaused, gameState.isGameOver]);

	// Handle keyboard input
	React.useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			switch (e.key) {
				case 'ArrowLeft':
					e.preventDefault();
					setGameState(state => moveLeft(state));
					break;
				case 'ArrowRight':
					e.preventDefault();
					setGameState(state => moveRight(state));
					break;
				case 'ArrowUp':
					e.preventDefault();
					setGameState(state => rotateCurrent(state));
					break;
				case 'ArrowDown':
					e.preventDefault();
					setGameState(state => dropPiece(state));
					break;
				case ' ':
					e.preventDefault();
					setGameState(state => quickDrop(state));
					break;
				case 'Escape':
					e.preventDefault();
					setGameState(state => togglePause(state));
					break;
				default:
					break;
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, []);

	const resetGame = () => {
		setGameState(initializeGame(true)); // Reset with isPaused = true
	};

	return {
		gameState,
		resetGame,
		moveLeft: () => setGameState(state => moveLeft(state)),
		moveRight: () => setGameState(state => moveRight(state)),
		rotate: () => setGameState(state => rotateCurrent(state)),
		drop: () => setGameState(state => dropPiece(state)),
		quickDrop: () => setGameState(state => quickDrop(state)),
		togglePause: () => setGameState(state => togglePause(state))
	};
}
