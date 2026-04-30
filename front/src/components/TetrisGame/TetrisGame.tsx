import React, { useState } from 'react';
import { useTetrisGame, getPieceShape, getDisplayGridWithPreview, togglePause } from '../../games/tetris';
import { useTranslation } from 'react-i18next';
import './TetrisGame.css';

const PIECE_COLORS: Record<string, string> = {
	I: '#00e5ff',
	O: '#ffff00',
	T: '#6f00b9',
	S: '#00ff00',
	Z: '#ff0000',
	J: '#0000ff',
	L: '#ff8800',
	preview: '#666666',
	null: 'transparent'
};

export default function TetrisGame() {
	const game = useTetrisGame();
	const { t } = useTranslation();
	const [isStarted, setIsStarted] = useState(false);
	const displayGrid = getDisplayGridWithPreview(game.gameState);

	const handleStart = () => {
		setIsStarted(true);
		game.togglePause();
	};

	const handleRestart = () => {
		game.resetGame();
		setIsStarted(false);
	};

	const renderNextPiece = () => {
		if (!game.gameState.nextPiece) return null;

		const shape = getPieceShape(game.gameState.nextPiece, 0);
		const miniGrid = Array(4).fill(null).map(() => Array(4).fill(null));

		const offsetX = Math.floor((4 - shape[0].length) / 2);
		const offsetY = Math.floor((4 - shape.length) / 2);

		for (let row = 0; row < shape.length; row++) {
			for (let col = 0; col < shape[row].length; col++) {
				if (shape[row][col] === 1) {
					miniGrid[offsetY + row][offsetX + col] = game.gameState.nextPiece;
				}
			}
		}

		return (
			<div className="next-piece-grid">
				{miniGrid.map((row, rowIdx) =>
					row.map((cell, colIdx) => (
						<div
							key={`next-${rowIdx}-${colIdx}`}
							className="next-piece-cell"
							style={{
								backgroundColor: cell ? PIECE_COLORS[cell] : 'rgba(255, 62, 136, 0.05)',
								boxShadow: cell ? `0 0 8px ${PIECE_COLORS[cell]}` : 'none'
							}}
						/>
					))
				)}
			</div>
		);
	};

	const renderStashPiece = () => {
		const shape = game.gameState.stashPiece ? getPieceShape(game.gameState.stashPiece, 0) : null;
		const miniGrid = Array(4).fill(null).map(() => Array(4).fill(null));

		if (!shape) {
			return (
				<div className="stash-piece-grid">
					{miniGrid.map((row, rowIdx) =>
						row.map((cell, colIdx) => (
							<div
								key={`stash-${rowIdx}-${colIdx}`}
								className="stash-piece-cell"
								style={{
									backgroundColor: 'rgba(255, 62, 136, 0.05)',
									boxShadow: 'none'
								}}
							/>
						))
					)}
				</div>
			);
		}

		const offsetX = Math.floor((4 - shape[0].length) / 2);
		const offsetY = Math.floor((4 - shape.length) / 2);

		for (let row = 0; row < shape.length; row++) {
			for (let col = 0; col < shape[row].length; col++) {
				if (shape[row][col] === 1) {
					miniGrid[offsetY + row][offsetX + col] = game.gameState.stashPiece;
				}
			}
		}

		return (
			<div className="stash-piece-grid">
				{miniGrid.map((row, rowIdx) =>
					row.map((cell, colIdx) => (
						<div
							key={`stash-${rowIdx}-${colIdx}`}
							className="stash-piece-cell"
							style={{
								backgroundColor: cell ? PIECE_COLORS[cell] : 'rgba(255, 62, 136, 0.05)',
								boxShadow: cell ? `0 0 8px ${PIECE_COLORS[cell]}` : 'none'
							}}
						/>
					))
				)}
			</div>
		);
	};

	return (
		<div className="tetris-game-wrapper">
			{/* Left: Tetris Grid */}
			<div className="tetris-grid-wrapper">
				<div className="tetris-grid">
					{displayGrid.map((row, rowIdx) =>
						row.map((cell, colIdx) => (
							<div
								key={`${rowIdx}-${colIdx}`}
								className="tetris-cell"
								style={{
									backgroundColor:
										cell === 'preview'
											? 'rgba(255,255,255,0.15)'
											: cell
												? PIECE_COLORS[cell]
												: 'rgba(0, 229, 255, 0.05)',

									boxShadow:
										cell && cell !== 'preview'
											? `0 0 8px ${PIECE_COLORS[cell]}`
											: 'none'
								}}
							/>
						))
					)}
				</div>

				{/* Play/Restart Button Overlay */}
				{(!isStarted || game.gameState.isGameOver) && (
					<div className="tetris-overlay">
						<button
							className="tetris-play-btn"
							onClick={isStarted ? handleRestart : handleStart}
						>
							[ {isStarted ? t('game.tetris.actions.restart') : t('game.tetris.actions.play')} ]
						</button>
					</div>
				)}
				{/* Break Button Overlay */}
				{(isStarted && game.gameState.isPaused) && (
					<div className="tetris-overlay">
						<button
							className="tetris-pause-btn"
							onClick={game.togglePause}
						>
							{t('game.tetris.actions.continue')}
						</button>
					</div>
				)}
			</div>

			{/* Right: Score and Next Block */}
			<div className="tetris-info">
				{!game.gameState.isGameOver && (
					<div className="tetris-score">
						<h3>{t('game.tetris.labels.score')}</h3>
						<p className="score-value">{game.gameState.score}</p>
						<p className="score-label">{t('game.tetris.labels.level')} {game.gameState.level}</p>
					</div>
				)}
				{!game.gameState.isGameOver && (
					<div className="tetris-next">
						<h3>{t('game.tetris.labels.next')}</h3>
						<div className="next-block-preview">
							{renderNextPiece()}
						</div>
					</div>
				)}
				{!game.gameState.isGameOver && (
					<div className="tetris-stash">
						<h3>{t('game.tetris.labels.stash')}</h3>
						<div className="stash-block-preview">
							{renderStashPiece()}
						</div>
					</div>
				)}
				{!game.gameState.isGameOver && (
					<div className="tetris-controls">
						<h3>{t('game.tetris.labels.controls')}</h3>
						<ul>
							<li>{t('game.tetris.controls.move')}</li>
							<li>{t('game.tetris.controls.rotate')}</li>
							<li>{t('game.tetris.controls.softDrop')}</li>
							<li>{t('game.tetris.controls.hardDrop')}</li>
							<li>{t('game.tetris.controls.stash')}</li>
							<li>{t('game.tetris.controls.pause')}</li>
						</ul>
					</div>
				)}
				{game.gameState.isGameOver && (
					<div className="game-over-message">
						<p>{t('game.tetris.gameOver.title')}</p>
						<p className="final-score">{game.gameState.score}</p>
					</div>
				)}
			</div>
		</div>
	);
}
