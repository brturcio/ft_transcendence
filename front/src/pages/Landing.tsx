import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import TetrisGame from "../components/TetrisGame";
import Leaderboard from "../components/Leaderboard";
import { useRealtimeRoom } from "../realtime/useRealtimeRoom";
import { reportMultiplayerGameResult } from "../components/Achievements";

type LandingProps = {
	isAuthenticated: boolean;
};

const introUpKeyframes = `
	@keyframes intro-up {
		from {
			opacity: 0;
			transform: translateY(12px);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
`;

const heroTitle =
	"font-['Orbitron',sans-serif] text-[6.2rem] leading-[1.08] mb-2 font-extrabold uppercase max-[1100px]:text-[clamp(2.6rem,10vw,4.6rem)] max-[760px]:text-[clamp(2.5rem,13vw,4.2rem)]";
const heroButton =
	"h-[58px] px-7 rounded-[10px] text-[0.95rem] uppercase cursor-pointer inline-flex items-center justify-center font-['Orbitron',sans-serif] tracking-[0.04rem] bg-[linear-gradient(95deg,var(--glow-cyan),#42f5d7)] border-0 text-[#021318] font-bold shadow-[0_0_16px_rgba(0,229,255,0.35)] max-[760px]:w-full";
const dashboardPanel =
	"flex flex-col gap-4 p-5 bg-[rgba(0,0,0,0.3)] border border-[var(--line-soft)] rounded-lg max-[760px]:p-4";
const dashboardTitle =
	"text-[var(--glow-cyan)] text-[1.2rem] font-['Orbitron',sans-serif] uppercase tracking-[0.06rem] mb-3";
const actionButton =
	"w-full h-[50px] border-0 rounded-lg font-['Orbitron',sans-serif] text-[0.9rem] uppercase cursor-pointer tracking-[0.04rem] transition-all duration-200 max-[760px]:h-[45px] max-[760px]:text-[0.85rem]";
const USER_STORAGE_KEY = "ft_user";

function getCurrentUserId() {
	try {
		const rawUser = localStorage.getItem(USER_STORAGE_KEY);
		if (!rawUser) return null;
		const user = JSON.parse(rawUser) as { id?: string };
		return user.id ?? null;
	} catch {
		return null;
	}
}

export default function Landing({ isAuthenticated }: LandingProps) {
	const { t } = useTranslation();
	const realtime = useRealtimeRoom();
	const [incomingAttack, setIncomingAttack] = useState<null | { fromId: string; lines: number; username?: string; id: number }>(null);
	const [joinCode, setJoinCode] = useState("");
	const reportedMultiplayerRoom = useRef<string | null>(null);
	const currentUserId = useMemo(() => getCurrentUserId(), [isAuthenticated]);
	const currentPlayer = realtime.room?.players.find((player) => player.id === currentUserId) ?? null;
	const remotePlayers = realtime.room?.players.filter((player) => player.id !== currentUserId) ?? [];
	const isHost = Boolean(currentPlayer?.isHost);
	const isInRoom = Boolean(realtime.room);
	const roomStatus = realtime.room ? t(`landing.multiplayer.status.${realtime.room.status}`) : null;

	useEffect(() => {
		const unregister = realtime.registerAttackHandler?.((playerId, lines, username) => {
			setIncomingAttack({ fromId: playerId, lines, username, id: Date.now() });
		});

		return () => {
			if (unregister) unregister();
		};
	}, [realtime.registerAttackHandler]);

	useEffect(() => {
		if (!isAuthenticated || !currentUserId || !realtime.room || realtime.room.status !== "finished") {
			return;
		}
		if (reportedMultiplayerRoom.current === realtime.room.id) {
			return;
		}

		reportedMultiplayerRoom.current = realtime.room.id;
		reportMultiplayerGameResult({ won: realtime.winnerId === currentUserId });
	}, [isAuthenticated, currentUserId, realtime.room, realtime.winnerId]);

	const handleJoin = () => {
		const roomId = joinCode.trim();
		if (roomId) {
			realtime.joinRoom(roomId);
		}
	};

	return (
		<div className="text-(--txt-main) py-5 px-10 max-[1100px]:px-4 max-[760px]:py-3">
			<style>{introUpKeyframes}</style>

			<main className="w-full flex flex-col">
			{!isAuthenticated ? (
				<section className="flex flex-col justify-center items-center text-center flex-1 animate-[intro-up_500ms_ease] px-6">
				<p className="text-(--glow-pink) text-2xl mb-7 font-['Orbitron',sans-serif] tracking-[0.06rem] uppercase">
					{t("landing.intro")}
				</p>

				<div>
					<h1 className={`${heroTitle} text-(--txt-main)`}>
					{t("landing.title.play")}
					</h1>
					<h1 className={`${heroTitle} text-(--txt-main) [text-shadow:0_0_18px_rgba(0,229,255,0.45)]`}>
					{t("landing.title.compete")}
					</h1>
					<h1 className={`${heroTitle} text-(--txt-main) [text-shadow:0_0_18px_rgba(255,62,136,0.42)]`}>
					{t("landing.title.dominate")}
					</h1>
				</div>

				<div className="mt-7 flex flex-col gap-3">
					<p className="text-(--txt-soft) text-2xl">{t("landing.features.realtime")}</p>
					<p className="text-(--txt-soft) text-2xl">{t("landing.features.leaderboard")}</p>
					<p className="text-(--txt-soft) text-2xl">{t("landing.features.tournaments")}</p>
				</div>

				<div className="flex justify-center gap-4.5 mt-9 max-[760px]:flex-col max-[760px]:w-full">
					<Link className={heroButton} to="/login">
					{t("landing.cta.playNow")}
					</Link>
				</div>
				</section>
			) : (
				<div className="w-full grid grid-cols-1 2xl:grid-cols-[280px_minmax(0,1fr)_340px] gap-6 items-start px-4">
				
					{/* LEFT: Leaderboard */}
					<aside className={`${dashboardPanel} w-full`}>
						<h2 className={dashboardTitle}>
						{t("landing.dashboard.leaderboard.title")}
						</h2>
						<Leaderboard />
					</aside>

					{/* CENTER: Game */}
					<section className="min-w-0 p-4 bg-[rgba(0,0,0,0.3)] border border-(--line-soft) rounded-lg">
						<TetrisGame
						mode={isInRoom ? "multiplayer" : "solo"}
						multiplayerStarted={realtime.isGameStarted}
						remotePlayers={remotePlayers}
						winner={realtime.winner}
						onStateChange={realtime.sendPlayerState}
						onGameOver={realtime.sendGameOver}
						incomingAttack={incomingAttack}
						onSendAttack={realtime.sendAttack}
						/>
					</section>

					{/* RIGHT: Multiplayer / Room */}
					<aside className={`${dashboardPanel} w-full flex flex-col gap-3`}>
						
						{realtime.room ? (
						<div className="flex flex-col gap-3 p-3 bg-[rgba(0,0,0,0.25)] border border-[rgba(0,229,255,0.25)] rounded-lg">
							
							{/* Room info */}
							<div className="p-3 bg-[rgba(0,0,0,0.25)] border border-[rgba(0,229,255,0.25)] rounded-lg">
							<p className="text-[var(--txt-soft)] text-xs uppercase tracking-[0.06rem]">
								{t("landing.multiplayer.room")}
							</p>

							<p className="text-[var(--glow-cyan)] font-['Orbitron',sans-serif] text-2xl tracking-[0.12rem]">
								{realtime.room.id}
							</p>

							<p className="text-[var(--txt-soft)] text-xs uppercase mt-1">
								{roomStatus}
							</p>
							</div>

							{/* Players */}
							<div className="flex flex-col gap-2">
							{realtime.room.players.map((player) => (
								<div key={player.id} className="flex justify-between text-sm">
								<span className="truncate">{player.username}</span>
								<span className="text-[var(--txt-soft)] text-xs uppercase">
									{player.isHost
									? t("landing.multiplayer.playerStatus.host")
									: player.isAlive
									? t("landing.multiplayer.playerStatus.ready")
									: t("landing.multiplayer.playerStatus.out")}
								</span>
								</div>
							))}
							</div>

							{/* Actions */}
							{isHost && realtime.room.status === "waiting" && (
							<button
								type="button"
								className={`${actionButton} bg-[linear-gradient(95deg,var(--glow-cyan),#42f5d7)] text-[#021318] font-bold`}
								onClick={realtime.startGame}
							>
								{t("landing.multiplayer.actions.start")}
							</button>
							)}

							<button
							type="button"
							className={`${actionButton} border border-(--glow-pink) text-(--glow-pink)`}
							onClick={realtime.leaveRoom}
							>
							{t("landing.multiplayer.actions.leave")}
							</button>

							{realtime.winner && (
							<p className="text-[var(--glow-cyan)] text-sm font-['Orbitron',sans-serif]">
								{t("landing.multiplayer.winner", { winner: realtime.winner })}
							</p>
							)}
						</div>
						) : (
						<>
							{/* Join room */}
							<div className="flex flex-col gap-2">
							<input
								type="text"
								value={joinCode}
								onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
								placeholder={t("landing.multiplayer.roomCodePlaceholder")}
								className="h-[42px] rounded-lg bg-[rgba(0,0,0,0.3)] border border-[rgba(0,229,255,0.25)] px-3 text-white uppercase tracking-[0.08rem]"
							/>

							<button
								type="button"
								className={`${actionButton} bg-[linear-gradient(95deg,var(--glow-cyan),#42f5d7)] text-[#021318] font-bold`}
								onClick={handleJoin}
							>
								{t("landing.dashboard.actions.join")}
							</button>
							</div>

							{/* Host */}
							<button
							type="button"
							className={`${actionButton} border border-(--glow-pink) text-(--glow-pink)`}
							onClick={realtime.createRoom}
							>
							{t("landing.dashboard.actions.host")}
							</button>
						</>
						)}

						{realtime.error && (
						<p className="text-[var(--glow-pink)] text-sm">
							{realtime.error}
						</p>
						)}
					</aside>
				</div>
			)}
			</main>
		</div>
	);
}
