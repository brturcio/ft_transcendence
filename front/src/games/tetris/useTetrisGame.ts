import React, { useMemo } from "react";
import type { GameState } from "./types";
import {
	initializeGame,
	getRandomPieceType,
	createNewPiece,
	placePieceOnGrid,
	clearCompleteLines,
	canPlacePiece,
	movePieceLeft,
	movePieceRight,
	rotatePiece,
	switchStash,
	getHardDropY,
	addGarbageLines,
} from "./index";

import { getDisplayGrid, updateLevel, getDropSpeed } from "./gameEngine";

import { reportSoloGameResult } from "../../components/Achievements";

type Action =
	| { type: "TICK" }
	| { type: "MOVE_LEFT" }
	| { type: "MOVE_RIGHT" }
	| { type: "ROTATE" }
	| { type: "SOFT_DROP" }
	| { type: "HARD_DROP" }
	| { type: "SWAP" }
	| { type: "PAUSE" }
	| { type: "RESET" }
	| { type: "REPORT_SOLO_GAME" }
	| { type: "RECEIVE_GARBAGE"; lines: number };

function reducer(state: GameState, action: Action): GameState {
	switch (action.type) {
		case "TICK":
			return dropSync(state);

		case "MOVE_LEFT":
			return moveLeftSync(state);

		case "MOVE_RIGHT":
			return moveRightSync(state);

		case "ROTATE":
			return rotateSync(state);

		case "SOFT_DROP":
			return dropSync(state);

		case "HARD_DROP":
			return hardDropSync(state);

		case "SWAP":
			return switchStash(state);

		case "PAUSE":
			return { ...state, isPaused: !state.isPaused };

		case "RESET":
			return initializeGame(true);

		case "RECEIVE_GARBAGE":
			return addGarbageLines(state, action.lines);

		case "REPORT_SOLO_GAME":
			return { ...state, hasReportedSoloGame: true };

		default:
			return state;
	}
}

import { movePieceDown } from "./pieces";

function dropSync(state: GameState): GameState {
	if (state.isPaused || state.isGameOver || !state.currentPiece) return state;

	const movedPiece = movePieceDown(state.grid, state.currentPiece);

	if (movedPiece) {
		return {
			...state,
			currentPiece: movedPiece,
		};
	}

	const newGrid = placePieceOnGrid(state.grid, state.currentPiece);
	const { grid, clearedLines } = clearCompleteLines(newGrid);

	const lines = state.lines + clearedLines;
	const level = updateLevel(lines);
	const dropSpeed = getDropSpeed(level);

	const nextPiece = createNewPiece(state.nextPiece);
	const isGameOver = !canPlacePiece(grid, nextPiece);

	return {
		...state,
		grid,
		currentPiece: isGameOver ? null : nextPiece,
		nextPiece: getRandomPieceType(),
		score: state.score + clearedLines * 100,
		lines,
		level,
		dropSpeed,
		clearedLines,
		linesCompletedThisGame: state.linesCompletedThisGame + clearedLines,
		tetrisesThisGame: state.tetrisesThisGame + (clearedLines === 4 ? 1 : 0),
		isGameOver,
	};
}

function moveLeftSync(state: GameState): GameState {
	if (state.isPaused || state.isGameOver || !state.currentPiece) return state;
	return {
		...state,
		currentPiece: movePieceLeft(state.grid, state.currentPiece),
	};
}

function moveRightSync(state: GameState): GameState {
	if (state.isPaused || state.isGameOver || !state.currentPiece) return state;
	return {
		...state,
		currentPiece: movePieceRight(state.grid, state.currentPiece),
	};
}

function rotateSync(state: GameState): GameState {
	if (state.isPaused || state.isGameOver || !state.currentPiece) return state;

	const rotated = rotatePiece(state.currentPiece);

	return canPlacePiece(state.grid, rotated) ? { ...state, currentPiece: rotated } : state;
}

function hardDropSync(state: GameState): GameState {
	if (state.isPaused || state.isGameOver || !state.currentPiece) return state;

	const y = getHardDropY(state.grid, state.currentPiece);
	const dropped = { ...state.currentPiece, y };

	const newGrid = placePieceOnGrid(state.grid, dropped);
	const { grid, clearedLines } = clearCompleteLines(newGrid);

	const lines = state.lines + clearedLines;
	const level = updateLevel(lines);
	const dropSpeed = getDropSpeed(level);

	const nextPiece = createNewPiece(state.nextPiece);
	const isGameOver = !canPlacePiece(grid, nextPiece);

	return {
		...state,
		grid,
		currentPiece: isGameOver ? null : nextPiece,
		nextPiece: getRandomPieceType(),
		score: state.score + clearedLines * 100,
		lines,
		level,
		dropSpeed,
		clearedLines,
		linesCompletedThisGame: state.linesCompletedThisGame + clearedLines,
		tetrisesThisGame: state.tetrisesThisGame + (clearedLines === 4 ? 1 : 0),
		isGameOver,
	};
}

export function useTetrisGame(options: { reportSolo?: boolean; allowPause?: boolean } = {}) {
	const { reportSolo = true, allowPause = true } = options;
	const [state, dispatch] = React.useReducer(reducer, undefined, () => initializeGame(true));

	const displayGrid = useMemo(() => {
		return getDisplayGrid(state);
	}, [state]);

	const inputQueue = React.useRef<Action[]>([]);
	const rafRef = React.useRef<number | null>(null);
	const lastTick = React.useRef(0);

	React.useEffect(() => {
		function loop(time: number) {
			if (!state.isPaused && !state.isGameOver) {
				if (time - lastTick.current > state.dropSpeed) {
					dispatch({ type: "TICK" });
					lastTick.current = time;
				}
			}

			if (inputQueue.current.length > 0) {
				dispatch(inputQueue.current.shift()!);
			}

			rafRef.current = requestAnimationFrame(loop);
		}

		rafRef.current = requestAnimationFrame(loop);

		return () => {
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
		};
	}, [state.isPaused, state.isGameOver, state.dropSpeed]);

	React.useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			switch (e.key) {
				case "ArrowLeft":
					e.preventDefault();
					inputQueue.current.push({ type: "MOVE_LEFT" });
					break;
				case "ArrowRight":
					e.preventDefault();
					inputQueue.current.push({ type: "MOVE_RIGHT" });
					break;
				case "ArrowUp":
					e.preventDefault();
					inputQueue.current.push({ type: "ROTATE" });
					break;
				case "ArrowDown":
					e.preventDefault();
					inputQueue.current.push({ type: "SOFT_DROP" });
					break;
				case " ":
					e.preventDefault();
					inputQueue.current.push({ type: "HARD_DROP" });
					break;
				case "Shift":
					e.preventDefault();
					inputQueue.current.push({ type: "SWAP" });
					break;
				case "Escape":
					e.preventDefault();
					if (allowPause) inputQueue.current.push({ type: "PAUSE" });
					break;
			}
		};

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, []);

	React.useEffect(() => {
		if (reportSolo && state.isGameOver && !state.hasReportedSoloGame) {
			reportSoloGameResult({
				score: state.score,
				linesCompleted: state.linesCompletedThisGame,
				tetrises: state.tetrisesThisGame,
			});
			dispatch({ type: "REPORT_SOLO_GAME" });
		}
	}, [
		reportSolo,
		state.isGameOver,
		state.hasReportedSoloGame,
		state.score,
		state.linesCompletedThisGame,
		state.tetrisesThisGame,
	]);

	return {
		gameState: state,
		displayGrid,
		resetGame: () => dispatch({ type: "RESET" }),
		togglePause: () => {
			if (allowPause) dispatch({ type: "PAUSE" });
		},
		receiveGarbage: (lines: number) => dispatch({ type: "RECEIVE_GARBAGE", lines }),
	};
}
