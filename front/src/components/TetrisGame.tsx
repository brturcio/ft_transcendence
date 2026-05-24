import { useState } from "react";
import { useTetrisGame, getPieceShape } from "../games/tetris";
import { useTranslation } from "react-i18next";

const PIECE_COLORS: Record<string, string> = {
	I: "#00e5ff",
	O: "#ffff00",
	T: "#6f00b9",
	S: "#00ff00",
	Z: "#ff0000",
	J: "#0000ff",
	L: "#ff8800",
	preview: "#666666",
	null: "transparent",
};

export default function TetrisGame() {
	const game = useTetrisGame();
	const { t } = useTranslation();
	const [isStarted, setIsStarted] = useState(false);
	const displayGrid = game.displayGrid;

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
			<div className="grid grid-cols-4 grid-rows-4 gap-0.5 w-20 h-20 max-[760px]:w-15 max-[760px]:h-15">
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
				<div className="grid grid-cols-4 grid-rows-4 gap-0.5 w-20 h-20 max-[760px]:w-15 max-[760px]:h-15">
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
			<div className="grid grid-cols-4 grid-rows-4 gap-0.5 w-20 h-20 max-[760px]:w-15 max-[760px]:h-15">
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
		<div className="flex-1 flex items-center justify-center gap-6 bg-[rgba(0,20,30,0.5)] border-2 border-(--glow-cyan) rounded-lg min-h-100 p-5 shadow-[0_0_20px_rgba(0,229,255,0.1)] w-full max-[760px]:flex-col max-[760px]:gap-4 max-[760px]:p-4 max-[760px]:min-h-auto">
			{/* Left: Tetris Grid */}
			<div className="flex-1 flex justify-center items-center relative max-[760px]:w-full">
				<div className="grid grid-cols-10 grid-rows-20 gap-px bg-[rgba(0,0,0,0.6)] p-1 border-2 border-(--glow-cyan) rounded-sm aspect-10/20 max-w-[320px] w-full max-[760px]:max-w-full max-[760px]:min-h-50">
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

									boxShadow: cell && cell !== "preview" ? `0 0 8px ${PIECE_COLORS[cell]}` : "none",
								}}
							/>
						)),
					)}
				</div>

				{/* Play/Restart Button Overlay */}
				{(!isStarted || game.gameState.isGameOver) && (
					<div className="absolute inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.75)] rounded-sm backdrop-blur-[2px] z-10">
						<button
							className="bg-[linear-gradient(95deg,var(--glow-cyan),#42f5d7)] text-[#021318] border-0 py-4 px-8 text-2xl font-bold font-['Orbitron',sans-serif] uppercase tracking-[0.06rem] rounded-lg cursor-pointer shadow-[0_0_24px_rgba(0,229,255,0.4)] transition-all duration-200 hover:shadow-[0_0_32px_rgba(0,229,255,0.6)] hover:scale-[1.05] active:scale-[0.98] max-[760px]:py-3 max-[760px]:px-6 max-[760px]:text-[1.2rem]"
							onClick={isStarted ? handleRestart : handleStart}
						>
							[ {isStarted ? t("game.tetris.actions.restart") : t("game.tetris.actions.play")} ]
						</button>
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

			{/* Right: Score and Next Block */}
			<div className="flex flex-col gap-5 min-w-35 max-[760px]:grid max-[760px]:grid-cols-2 max-[760px]:gap-3 max-[760px]:w-full max-[760px]:min-w-0">
				{!game.gameState.isGameOver && (
					<div className="bg-[rgba(0,0,0,0.4)] border border-(--glow-pink) rounded-md p-4 text-center max-[760px]:p-3">
						<h3 className="text-(--glow-pink) text-[0.9rem] font-['Orbitron',sans-serif] uppercase tracking-[0.04rem] mb-2 mt-0">
							{t("game.tetris.labels.score")}
						</h3>
						<p className="text-[2rem] max-[760px]:text-[1.5rem] font-bold text-(--glow-cyan) font-['Courier New',monospace] m-0 mb-2 [text-shadow:0_0_8px_rgba(0,229,255,0.3)]">
							{game.gameState.score}
						</p>
						<p className="text-[0.75rem] text-(--txt-soft) m-0 font-['Courier New',monospace]">
							{t("game.tetris.labels.level")} {game.gameState.level}
						</p>
					</div>
				)}
				{!game.gameState.isGameOver && (
					<div className="bg-[rgba(0,0,0,0.4)] border border-(--glow-pink) rounded-md p-4 text-center max-[760px]:p-3">
						<h3 className="text-(--glow-pink) text-[0.9rem] font-['Orbitron',sans-serif] uppercase tracking-[0.04rem] mb-2 mt-0">
							{t("game.tetris.labels.next")}
						</h3>
						<div className="flex justify-center items-center bg-[rgba(0,20,30,0.5)] border border-[rgba(0,229,255,0.3)] rounded-sm p-2 min-h-22.5 max-[760px]:min-h-17.5">
							{renderNextPiece()}
						</div>
					</div>
				)}
				{!game.gameState.isGameOver && (
					<div className="bg-[rgba(0,0,0,0.4)] border border-(--glow-pink)] rounded-md p-4 text-center max-[760px]:p-3">
						<h3 className="text-(--glow-pink)] text-[0.9rem] font-['Orbitron',sans-serif] uppercase tracking-[0.04rem] mb-2 mt-0">
							{t("game.tetris.labels.stash")}
						</h3>
						<div className="flex justify-center items-center bg-[rgba(0,20,30,0.5)] border border-[rgba(0,229,255,0.3)] rounded-sm p-2 min-h-22.5 max-[760px]:min-h-17.5">
							{renderStashPiece()}
						</div>
					</div>
				)}
				{!game.gameState.isGameOver && (
					<div className="bg-[rgba(0,0,0,0.4)] border border-(--glow-pink) rounded-md p-4 text-center">
						<h3 className="text-(--glow-pink) text-[0.9rem] font-['Orbitron',sans-serif] uppercase tracking-[0.04rem] mb-2.5 mt-0">
							{t("game.tetris.labels.controls")}
						</h3>
						<ul className="list-none p-0 m-0 flex flex-col gap-1.5">
							<li className="font-['Courier New',monospace] text-[0.75rem] text-(--txt-soft) px-2 py-1.5 rounded-sm bg-[rgba(0,20,30,0.4)] border border-[rgba(0,229,255,0.1)] text-left tracking-[0.02rem] transition-all duration-120 hover:bg-[rgba(0,229,255,0.08)] hover:border-[rgba(0,229,255,0.3)] hover:shadow-[0_0_8px_rgba(0,229,255,0.15)]">
								{t("game.tetris.controls.move")}
							</li>
							<li className="font-['Courier New',monospace] text-[0.75rem] text-(--txt-soft) px-2 py-1.5 rounded-sm bg-[rgba(0,20,30,0.4)] border border-[rgba(0,229,255,0.1)] text-left tracking-[0.02rem] transition-all duration-120 hover:bg-[rgba(0,229,255,0.08)] hover:border-[rgba(0,229,255,0.3)] hover:shadow-[0_0_8px_rgba(0,229,255,0.15)]">
								{t("game.tetris.controls.rotate")}
							</li>
							<li className="font-['Courier New',monospace] text-[0.75rem] text-(--txt-soft) px-2 py-1.5 rounded-sm bg-[rgba(0,20,30,0.4)] border border-[rgba(0,229,255,0.1)] text-left tracking-[0.02rem] transition-all duration-120 hover:bg-[rgba(0,229,255,0.08)] hover:border-[rgba(0,229,255,0.3)] hover:shadow-[0_0_8px_rgba(0,229,255,0.15)]">
								{t("game.tetris.controls.softDrop")}
							</li>
							<li className="font-['Courier New',monospace] text-[0.75rem] text-(--txt-soft) px-2 py-1.5 rounded-sm bg-[rgba(0,20,30,0.4)] border border-[rgba(0,229,255,0.1)] text-left tracking-[0.02rem] transition-all duration-120 hover:bg-[rgba(0,229,255,0.08)] hover:border-[rgba(0,229,255,0.3)] hover:shadow-[0_0_8px_rgba(0,229,255,0.15)]">
								{t("game.tetris.controls.hardDrop")}
							</li>
							<li className="font-['Courier New',monospace] text-[0.75rem] text-(--txt-soft) px-2 py-1.5 rounded-sm bg-[rgba(0,20,30,0.4)] border border-[rgba(0,229,255,0.1)] text-left tracking-[0.02rem] transition-all duration-120 hover:bg-[rgba(0,229,255,0.08)] hover:border-[rgba(0,229,255,0.3)] hover:shadow-[0_0_8px_rgba(0,229,255,0.15)]">
								{t("game.tetris.controls.stash")}
							</li>
							<li className="font-['Courier New',monospace] text-[0.75rem] text-(--txt-soft) px-2 py-1.5 rounded-sm bg-[rgba(0,20,30,0.4)] border border-[rgba(0,229,255,0.1)] text-left tracking-[0.02rem] transition-all duration-120 hover:bg-[rgba(0,229,255,0.08)] hover:border-[rgba(0,229,255,0.3)] hover:shadow-[0_0_8px_rgba(0,229,255,0.15)]">
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
	);
}
