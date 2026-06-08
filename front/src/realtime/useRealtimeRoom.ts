import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { REALTIME_BASE_URL } from "../config/network";

const AUTH_TOKEN_KEY = "ft_auth_token";


export type PlayerGameState = {
	displayGrid: (string | null)[][];
	score: number;
	lines: number;
	level: number;
	isGameOver: boolean;
};

export type PublicRoomPlayer = {
	id: string;
	username: string;
	isHost: boolean;
	isAlive: boolean;
	state: PlayerGameState | null;
};

export type PublicRoom = {
	id: string;
	hostId: string;
	status: "waiting" | "playing" | "finished";
	maxPlayers: number;
	players: PublicRoomPlayer[];
};

type ServerMessage =
	| { type: "room_created"; room: PublicRoom }
	| { type: "room_joined"; room: PublicRoom }
	| { type: "room_updated"; room: PublicRoom }
	| { type: "game_started"; room: PublicRoom }
	| { type: "player_state"; playerId: string; username: string; state: PlayerGameState }
	| { type: "player_game_over"; playerId: string; username: string; room: PublicRoom }
	| { type: "match_finished"; winnerId: string | null; winnerUsername: string | null; room: PublicRoom }
	| { type: "error"; code: string; message: string }
	| { type: "pong" };

type ClientMessage =
	| { type: "create_room"; maxPlayers?: number }
	| { type: "join_room"; roomId: string }
	| { type: "leave_room" }
	| { type: "start_game" }
	| { type: "player_state"; state: PlayerGameState }
	| { type: "game_over"; state: PlayerGameState }
	| { type: "ping" };

function send(ws: WebSocket | null, message: ClientMessage) {
	if (ws?.readyState === WebSocket.OPEN) {
		ws.send(JSON.stringify(message));
	}
}

export function useRealtimeRoom() {
	const { t } = useTranslation();
	const wsRef = useRef<WebSocket | null>(null);
	const pendingMessageRef = useRef<ClientMessage | null>(null);
	const [room, setRoom] = useState<PublicRoom | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	const [isGameStarted, setIsGameStarted] = useState(false);
	const [winner, setWinner] = useState<string | null>(null);
	const [winnerId, setWinnerId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const translateRealtimeError = useCallback(
		(code: string, fallback: string) => t(`landing.multiplayer.errors.${code}`, fallback),
		[t],
	);

	const connect = useCallback((message: ClientMessage) => {
		const token = localStorage.getItem(AUTH_TOKEN_KEY);
		if (!token) {
			setError(t("landing.multiplayer.errors.AUTH_REQUIRED"));
			return;
		}

		pendingMessageRef.current = message;
		setError(null);
		setWinner(null);
		setWinnerId(null);

		if (wsRef.current?.readyState === WebSocket.OPEN) {
			send(wsRef.current, message);
			pendingMessageRef.current = null;
			return;
		}

		wsRef.current?.close();
		const ws = new WebSocket(`${REALTIME_BASE_URL}?token=${encodeURIComponent(token)}`);
		wsRef.current = ws;

		ws.onopen = () => {
			setIsConnected(true);
			if (pendingMessageRef.current) {
				send(ws, pendingMessageRef.current);
				pendingMessageRef.current = null;
			}
		};

		ws.onmessage = (event) => {
			const message = JSON.parse(event.data) as ServerMessage;
			switch (message.type) {
				case "room_created":
				case "room_joined":
				case "room_updated":
					setRoom(message.room);
					setIsGameStarted(message.room.status === "playing");
					return;
				case "game_started":
					setRoom(message.room);
					setIsGameStarted(true);
					setWinner(null);
					setWinnerId(null);
					return;
				case "player_state":
					setRoom((currentRoom) => {
						if (!currentRoom) return currentRoom;
						return {
							...currentRoom,
							players: currentRoom.players.map((player) =>
								player.id === message.playerId ? { ...player, state: message.state } : player,
							),
						};
					});
					return;
				case "player_game_over":
					setRoom(message.room);
					return;
				case "match_finished":
					setRoom(message.room);
					setWinnerId(message.winnerId);
					setWinner(message.winnerUsername ?? t("landing.multiplayer.noWinner"));
					setIsGameStarted(false);
					return;
				case "error":
					setError(translateRealtimeError(message.code, message.message));
					return;
				case "pong":
					return;
			}
		};

		ws.onerror = () => {
			setError(t("landing.multiplayer.errors.CONNECTION_FAILED"));
		};

		ws.onclose = () => {
			setIsConnected(false);
		};
	}, [t, translateRealtimeError]);

	useEffect(() => {
		return () => wsRef.current?.close();
	}, []);

	return {
		room,
		isConnected,
		isGameStarted,
		winner,
		winnerId,
		error,
		createRoom: () => connect({ type: "create_room", maxPlayers: 4 }),
		joinRoom: (roomId: string) => connect({ type: "join_room", roomId }),
		leaveRoom: () => {
			send(wsRef.current, { type: "leave_room" });
			setRoom(null);
			setIsGameStarted(false);
			setWinner(null);
			setWinnerId(null);
		},
		startGame: () => send(wsRef.current, { type: "start_game" }),
		sendPlayerState: (state: PlayerGameState) => send(wsRef.current, { type: "player_state", state }),
		sendGameOver: (state: PlayerGameState) => send(wsRef.current, { type: "game_over", state }),
	};
}
