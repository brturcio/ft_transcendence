import { useEffect, useRef, useState } from "react";
import { useTetrisGame, getPieceShape } from "../games/tetris";
import { useTranslation } from "react-i18next";
import { useGlobalPresence } from "../realtime/useGlobalPresence";
import type { PlayerGameState, PublicRoomPlayer } from "../realtime/useRealtimeRoom";
import { API_BASE_URL, REALTIME_BASE_URL } from "../config/network";
const AUTH_TOKEN_KEY = "ft_auth_token";

const PIECE_COLORS: Record<string, string> = {
	I: "#00e5ff",
	O: "#ffff00",
	T: "#6f00b9",
	S: "#00ff00",
	Z: "#ff0000",
	J: "#0000ff",
	L: "#ff8800",
	G: "#8b8b8b",
	preview: "#666666",
	null: "transparent",
};

type TetrisGameProps = {
	mode?: "solo" | "multiplayer";
	multiplayerStarted?: boolean;
	remotePlayers?: PublicRoomPlayer[];
	winner?: string | null;
	onStateChange?: (state: PlayerGameState) => void;
	onGameOver?: (state: PlayerGameState) => void;
	incomingAttack?: { fromId: string; lines: number; username?: string; id: number } | null;
	onSendAttack?: (lines: number) => void;
};

export default function TetrisGame({
	mode = "solo",
	multiplayerStarted = false,
	remotePlayers = [],
	winner = null,
	onStateChange,
	onGameOver,
	incomingAttack = null,
	onSendAttack,
}: TetrisGameProps) {
	const game = useTetrisGame({ reportSolo: mode === "solo", allowPause: true });
	const { t } = useTranslation();
	const [isStarted, setIsStarted] = useState(false);
	const hasSentGameOver = useRef(false);
	const previousMultiplayerStarted = useRef(false);
	const previousMode = useRef(mode);
	const onStateChangeRef = useRef(onStateChange);
	const onGameOverRef = useRef(onGameOver);
	const displayGrid = game.displayGrid;
	const { updateMyStatus } = useGlobalPresence();

	useEffect(() => {
		onStateChangeRef.current = onStateChange;
		onGameOverRef.current = onGameOver;
	}, [onStateChange, onGameOver]);

	useEffect(() => {
		if (previousMode.current === "multiplayer" && mode === "solo") {
			game.resetGame();
			setIsStarted(false);
			hasSentGameOver.current = false;
			previousMultiplayerStarted.current = false;
			previousLines.current = 0;
		}
		previousMode.current = mode;
	}, [mode]);

	useEffect(() => {
		if (mode !== "multiplayer") return;
		if (multiplayerStarted && !previousMultiplayerStarted.current) {
			game.resetGame();
			game.togglePause();
			setIsStarted(true);
			hasSentGameOver.current = false;
			previousLines.current = 0;
		}
		previousMultiplayerStarted.current = multiplayerStarted;
	}, [mode, multiplayerStarted]);

	useEffect(() => {
		if (mode !== "multiplayer" || !isStarted || winner) return;

		const state: PlayerGameState = {
			displayGrid,
			score: game.gameState.score,
			lines: game.gameState.lines,
			level: game.gameState.level,
			isGameOver: game.gameState.isGameOver,
		};

		onStateChangeRef.current?.(state);
		if (game.gameState.isGameOver && !hasSentGameOver.current) {
			hasSentGameOver.current = true;
			onGameOverRef.current?.(state);
		}
	}, [
		mode,
		isStarted,
		displayGrid,
		game.gameState.score,
		game.gameState.lines,
		game.gameState.level,
		game.gameState.isGameOver,
	]);

	const previousLines = useRef(0);
	useEffect(() => {
		const totalLines = game.gameState.lines;
		const clearedNow = totalLines - previousLines.current;
		if (mode === "multiplayer" && isStarted && clearedNow > 0 && onSendAttack) {
			onSendAttack(clearedNow);
		}
		previousLines.current = totalLines;
	}, [game.gameState.lines, mode, isStarted, onSendAttack]);

	useEffect(() => {
		if (isStarted && !game.gameState.isGameOver) {
			updateMyStatus("INGAME");
		} else if (game.gameState.isGameOver) {
			updateMyStatus("ONLINE");
		}
		return () => {
			updateMyStatus("ONLINE");
		};
	}, [isStarted, game.gameState.isGameOver, updateMyStatus]);

	const handleStart = () => {
		setIsStarted(true);
		game.togglePause();
	};

	const handleRestart = () => {
		game.resetGame();
		setIsStarted(false);
		// reset any incoming attacks
		setLocalIncomingAttack(null);
		lastAppliedAttackId.current = null;
		hasSentGameOver.current = false;
		previousLines.current = 0;
	};

	const [localIncomingAttack, setLocalIncomingAttack] = useState<null | {
		fromId: string;
		lines: number;
		username?: string;
		id: number;
	}>(null);

	const lastAppliedAttackId = useRef<number | null>(null);

	useEffect(() => {
		if (!incomingAttack) return;
		if (lastAppliedAttackId.current === incomingAttack.id) return;
		lastAppliedAttackId.current = incomingAttack.id;
		setLocalIncomingAttack(incomingAttack);
		if (mode !== "multiplayer") return;
		game.receiveGarbage?.(incomingAttack.lines);
	}, [incomingAttack, mode]);

	const renderMiniBoard = (player: PublicRoomPlayer) => {
		const state = player.state;
		return (
			<div key={player.id} className="bg-[rgba(0,0,0,0.35)] border border-[rgba(0,229,255,0.2)] rounded-md p-2">
				<div className="flex items-center justify-between gap-2 mb-2">
					<p className="text-white font-['Orbitron',sans-serif] text-xs truncate">{player.username}</p>
					<span
						className={`text-[0.65rem] uppercase ${player.isAlive ? "text-[var(--glow-cyan)]" : "text-[var(--glow-pink)]"}`}
					>
						{player.isAlive ? t("game.tetris.multiplayer.alive") : t("game.tetris.multiplayer.out")}
					</span>
				</div>
				<div className="grid grid-cols-10 grid-rows-20 gap-px bg-[rgba(0,0,0,0.55)] p-1 rounded-sm aspect-10/20 w-full max-w-20 md:max-w-24 mx-auto">
					{(state?.displayGrid ?? Array.from({ length: 20 }, () => Array(10).fill(null))).map((row, rowIdx) =>
						row.map((cell, colIdx) => (
							<div
								key={`${player.id}-${rowIdx}-${colIdx}`}
								className="rounded-[1px]"
								style={{
									backgroundColor: cell
										? (PIECE_COLORS[cell] ?? "rgba(255,255,255,0.2)")
										: "rgba(0, 229, 255, 0.05)",
								}}
							/>
						)),
					)}
				</div>
				<p className="text-[var(--txt-soft)] text-[0.7rem] mt-2 text-center">
					{state
						? t("game.tetris.multiplayer.remoteStats", { score: state.score, level: state.level })
						: t("game.tetris.multiplayer.waiting")}
				</p>
			</div>
		);
	};

	const renderNextPiece = () => {
		if (!game.gameState.nextPiece) return null;

		const shape = getPieceShape(game.gameState.nextPiece, 0);
		const miniGrid = Array(4)
			.fill(null)
			.map(() => Array(4).fill(null));

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
			<div className="grid grid-cols-4 grid-rows-4 gap-0.5 w-16 h-16 md:w-18 md:h-18">
				{miniGrid.map((row, rowIdx) =>
					row.map((cell, colIdx) => (
						<div
							key={`next-${rowIdx}-${colIdx}`}
							className="bg-[rgba(255,62,136,0.05)] border-[0.5px] border-[rgba(255,62,136,0.15)] rounded-xs transition-[background-color,box-shadow] duration-100 ease-in-out"
							style={{
								backgroundColor: cell ? PIECE_COLORS[cell] : "rgba(255, 62, 136, 0.05)",
								boxShadow: cell ? `0 0 8px ${PIECE_COLORS[cell]}` : "none",
							}}
						/>
					)),
				)}
			</div>
		);
	};

	const renderStashPiece = () => {
		const shape = game.gameState.stashPiece ? getPieceShape(game.gameState.stashPiece, 0) : null;
		const miniGrid = Array(4)
			.fill(null)
			.map(() => Array(4).fill(null));

		if (!shape) {
			return (
				<div className="grid grid-cols-4 grid-rows-4 gap-0.5 w-16 h-16 md:w-18 md:h-18">
					{miniGrid.map((row, rowIdx) =>
						row.map((_cell, colIdx) => (
							<div
								key={`stash-${rowIdx}-${colIdx}`}
								className="bg-[rgba(255,62,136,0.05)] border-[0.5px] border-[rgba(255,62,136,0.15)] rounded-xs transition-[background-color,box-shadow] duration-100 ease-in-out"
								style={{
									backgroundColor: "rgba(255, 62, 136, 0.05)",
									boxShadow: "none",
								}}
							/>
						)),
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
			<div className="grid grid-cols-4 grid-rows-4 gap-0.5 w-16 h-16 md:w-18 md:h-18">
				{miniGrid.map((row, rowIdx) =>
					row.map((cell, colIdx) => (
						<div
							key={`stash-${rowIdx}-${colIdx}`}
							className="bg-[rgba(255,62,136,0.05)] border-[0.5px] border-[rgba(255,62,136,0.15)] rounded-xs transition-[background-color,box-shadow] duration-100 ease-in-out"
							style={{
								backgroundColor: cell ? PIECE_COLORS[cell] : "rgba(255, 62, 136, 0.05)",
								boxShadow: cell ? `0 0 8px ${PIECE_COLORS[cell]}` : "none",
							}}
						/>
					)),
				)}
			</div>
		);
	};

	return (
		<div className="flex-1 flex flex-col items-center justify-center gap-4 bg-[rgba(0,20,30,0.5)] border-2 border-(--glow-cyan) rounded-lg p-4 shadow-[0_0_20px_rgba(0,229,255,0.1)] w-full 2xl:min-h-100 2xl:p-5">
			<div className="flex w-full flex-col items-center justify-center gap-4 xl:flex-row xl:items-start xl:gap-6">
				{/* Left: Tetris Grid */}
				<div className="flex justify-center items-center relative w-full xl:flex-1">
					<div className="grid grid-cols-10 grid-rows-20 gap-px bg-[rgba(0,0,0,0.6)] p-1 border-2 border-(--glow-cyan) rounded-sm aspect-10/20 w-full max-w-[240px] md:max-w-[280px] xl:max-w-[320px]">
						{displayGrid.map((row, rowIdx) =>
							row.map((cell, colIdx) => (
								<div
									key={`${rowIdx}-${colIdx}`}
									className="bg-[rgba(0,229,255,0.05)] border-[0.5px] border-[rgba(0,229,255,0.15)] rounded-xs"
									style={{
										backgroundColor:
											cell === "preview"
												? "rgba(255,255,255,0.15)"
												: cell
													? PIECE_COLORS[cell]
													: "rgba(0, 229, 255, 0.05)",

										boxShadow:
											cell && cell !== "preview" ? `0 0 8px ${PIECE_COLORS[cell]}` : "none",
									}}
								/>
							)),
						)}
					</div>

					{/* Play/Restart Button Overlay */}
					{(!isStarted || game.gameState.isGameOver) && (
						<div className="absolute inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.75)] rounded-sm backdrop-blur-[2px] z-10">
							{mode === "multiplayer" && !multiplayerStarted && !game.gameState.isGameOver ? (
								<p className="text-[var(--glow-cyan)] font-['Orbitron',sans-serif] uppercase tracking-[0.06rem] text-center px-4">
									{t("game.tetris.multiplayer.waitingForHost")}
								</p>
							) : mode === "multiplayer" && game.gameState.isGameOver ? (
								<p className="text-[var(--glow-pink)] font-['Orbitron',sans-serif] uppercase tracking-[0.06rem] text-center px-4">
									{winner
										? t("game.tetris.multiplayer.gameOverWithWinner", { winner })
										: t("game.tetris.gameOver.title")}
								</p>
							) : (
								<button
									className="bg-[linear-gradient(95deg,var(--glow-cyan),#42f5d7)] text-[#021318] border-0 py-4 px-8 text-2xl font-bold font-['Orbitron',sans-serif] uppercase tracking-[0.06rem] rounded-lg cursor-pointer shadow-[0_0_24px_rgba(0,229,255,0.4)] transition-all duration-200 hover:shadow-[0_0_32px_rgba(0,229,255,0.6)] hover:scale-[1.05] active:scale-[0.98] max-[760px]:py-3 max-[760px]:px-6 max-[760px]:text-[1.2rem]"
									onClick={isStarted ? handleRestart : handleStart}
								>
									[ {isStarted ? t("game.tetris.actions.restart") : t("game.tetris.actions.play")} ]
								</button>
							)}
						</div>
					)}
					{/* Break Button Overlay */}
					{isStarted && game.gameState.isPaused && (
						<div className="absolute inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.75)] rounded-sm backdrop-blur-[2px] z-10">
							<button
								className="bg-[linear-gradient(95deg,var(--glow-cyan),#42f5d7)] text-[#021318] border-0 py-4 px-8 text-2xl font-bold font-['Orbitron',sans-serif] uppercase tracking-[0.06rem] rounded-lg cursor-pointer shadow-[0_0_24px_rgba(0,229,255,0.4)] transition-all duration-200 hover:shadow-[0_0_32px_rgba(0,229,255,0.6)] hover:scale-[1.05] active:scale-[0.98] max-[760px]:py-3 max-[760px]:px-6 max-[760px]:text-[1.2rem]"
								onClick={game.togglePause}
							>
								{t("game.tetris.actions.continue")}
							</button>
						</div>
					)}
				</div>

				{mode === "multiplayer" && remotePlayers.length > 0 && (
					<div className="grid w-full max-w-[360px] grid-cols-1 gap-2 sm:grid-cols-2 xl:w-32 xl:grid-cols-1 xl:flex-none">
						{remotePlayers.map(renderMiniBoard)}
					</div>
				)}

				{/* Right: Score and Next Block */}
				<div className="grid w-full max-w-[460px] grid-cols-1 gap-2 sm:grid-cols-2 xl:w-44 xl:grid-cols-1 xl:flex-none">
					{!game.gameState.isGameOver && (
						<div className="bg-[rgba(0,0,0,0.4)] border border-(--glow-pink) rounded-md p-3 text-center">
							<h3 className="text-(--glow-pink) text-[0.78rem] font-['Orbitron',sans-serif] uppercase tracking-[0.04rem] mb-1.5 mt-0">
								{t("game.tetris.labels.score")}
							</h3>
							<p className="text-[1.55rem] font-bold text-(--glow-cyan) font-['Courier New',monospace] m-0 mb-1.5 [text-shadow:0_0_8px_rgba(0,229,255,0.3)]">
								{game.gameState.score}
							</p>
							<p className="text-[0.7rem] text-(--txt-soft) m-0 font-['Courier New',monospace]">
								{t("game.tetris.labels.level")} {game.gameState.level}
							</p>
						</div>
					)}
					{!game.gameState.isGameOver && (
						<div className="bg-[rgba(0,0,0,0.4)] border border-(--glow-pink) rounded-md p-3 text-center">
							<h3 className="text-(--glow-pink) text-[0.78rem] font-['Orbitron',sans-serif] uppercase tracking-[0.04rem] mb-1.5 mt-0">
								{t("game.tetris.labels.next")}
							</h3>
							<div className="flex justify-center items-center bg-[rgba(0,20,30,0.5)] border border-[rgba(0,229,255,0.3)] rounded-sm p-2 min-h-18">
								{renderNextPiece()}
							</div>
						</div>
					)}
					{!game.gameState.isGameOver && (
						<div className="bg-[rgba(0,0,0,0.4)] border border-(--glow-pink)] rounded-md p-3 text-center">
							<h3 className="text-(--glow-pink)] text-[0.78rem] font-['Orbitron',sans-serif] uppercase tracking-[0.04rem] mb-1.5 mt-0">
								{t("game.tetris.labels.stash")}
							</h3>
							<div className="flex justify-center items-center bg-[rgba(0,20,30,0.5)] border border-[rgba(0,229,255,0.3)] rounded-sm p-2 min-h-18">
								{renderStashPiece()}
							</div>
						</div>
					)}
					{!game.gameState.isGameOver && (
						<div className="bg-[rgba(0,0,0,0.4)] border border-(--glow-pink) rounded-md p-3 text-center sm:col-span-2 xl:col-span-1">
							<h3 className="text-(--glow-pink) text-[0.78rem] font-['Orbitron',sans-serif] uppercase tracking-[0.04rem] mb-2 mt-0">
								{t("game.tetris.labels.controls")}
							</h3>
							<ul className="list-none p-0 m-0 flex flex-col gap-1">
								<li className="font-['Courier New',monospace] text-[0.68rem] text-(--txt-soft) px-2 py-1 rounded-sm bg-[rgba(0,20,30,0.4)] border border-[rgba(0,229,255,0.1)] text-left tracking-[0.02rem] transition-all duration-120 hover:bg-[rgba(0,229,255,0.08)] hover:border-[rgba(0,229,255,0.3)] hover:shadow-[0_0_8px_rgba(0,229,255,0.15)]">
									{t("game.tetris.controls.move")}
								</li>
								<li className="font-['Courier New',monospace] text-[0.68rem] text-(--txt-soft) px-2 py-1 rounded-sm bg-[rgba(0,20,30,0.4)] border border-[rgba(0,229,255,0.1)] text-left tracking-[0.02rem] transition-all duration-120 hover:bg-[rgba(0,229,255,0.08)] hover:border-[rgba(0,229,255,0.3)] hover:shadow-[0_0_8px_rgba(0,229,255,0.15)]">
									{t("game.tetris.controls.rotate")}
								</li>
								<li className="font-['Courier New',monospace] text-[0.68rem] text-(--txt-soft) px-2 py-1 rounded-sm bg-[rgba(0,20,30,0.4)] border border-[rgba(0,229,255,0.1)] text-left tracking-[0.02rem] transition-all duration-120 hover:bg-[rgba(0,229,255,0.08)] hover:border-[rgba(0,229,255,0.3)] hover:shadow-[0_0_8px_rgba(0,229,255,0.15)]">
									{t("game.tetris.controls.softDrop")}
								</li>
								<li className="font-['Courier New',monospace] text-[0.68rem] text-(--txt-soft) px-2 py-1 rounded-sm bg-[rgba(0,20,30,0.4)] border border-[rgba(0,229,255,0.1)] text-left tracking-[0.02rem] transition-all duration-120 hover:bg-[rgba(0,229,255,0.08)] hover:border-[rgba(0,229,255,0.3)] hover:shadow-[0_0_8px_rgba(0,229,255,0.15)]">
									{t("game.tetris.controls.hardDrop")}
								</li>
								<li className="font-['Courier New',monospace] text-[0.68rem] text-(--txt-soft) px-2 py-1 rounded-sm bg-[rgba(0,20,30,0.4)] border border-[rgba(0,229,255,0.1)] text-left tracking-[0.02rem] transition-all duration-120 hover:bg-[rgba(0,229,255,0.08)] hover:border-[rgba(0,229,255,0.3)] hover:shadow-[0_0_8px_rgba(0,229,255,0.15)]">
									{t("game.tetris.controls.stash")}
								</li>
								<li className="font-['Courier New',monospace] text-[0.68rem] text-(--txt-soft) px-2 py-1 rounded-sm bg-[rgba(0,20,30,0.4)] border border-[rgba(0,229,255,0.1)] text-left tracking-[0.02rem] transition-all duration-120 hover:bg-[rgba(0,229,255,0.08)] hover:border-[rgba(0,229,255,0.3)] hover:shadow-[0_0_8px_rgba(0,229,255,0.15)]">
									{t("game.tetris.controls.pause")}
								</li>
							</ul>
						</div>
					)}
					{game.gameState.isGameOver && (
						<div className="bg-[rgba(255,62,136,0.1)] border border-(--glow-pink) rounded-md p-4 text-center">
							<p className="m-0 text-(--glow-pink) font-['Orbitron',sans-serif] uppercase tracking-[0.04rem] text-[0.9rem]">
								{t("game.tetris.gameOver.title")}
							</p>
							<p className="text-[1.5rem] text-(--glow-cyan) font-bold mt-2">{game.gameState.score}</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
