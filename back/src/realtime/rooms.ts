import { randomUUID } from "node:crypto";
import type { PlayerGameState, PublicRoom, RealtimeUser, Room } from "./types";

const DEFAULT_MAX_PLAYERS = 4;
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 8;

const rooms = new Map<string, Room>();

function normalizeRoomId(roomId: string) {
	return roomId.trim().toUpperCase();
}

function createRoomId() {
	return randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
}

function clampMaxPlayers(maxPlayers?: number) {
	if (!maxPlayers || !Number.isInteger(maxPlayers)) {
		return DEFAULT_MAX_PLAYERS;
	}
	return Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, maxPlayers));
}

function toPublicRoom(room: Room): PublicRoom {
	return {
		id: room.id,
		hostId: room.hostId,
		status: room.status,
		maxPlayers: room.maxPlayers,
		players: room.players.map((player) => ({
			id: player.id,
			username: player.username,
			isHost: player.isHost,
			isAlive: player.isAlive,
			state: room.playerStates[player.id] ?? null,
		})),
	};
}

export function getRoom(roomId: string) {
	return rooms.get(normalizeRoomId(roomId)) ?? null;
}

export function getPublicRoom(roomId: string) {
	const room = getRoom(roomId);
	return room ? toPublicRoom(room) : null;
}

export function createRoom(user: RealtimeUser, socketId: string, maxPlayers?: number) {
	let roomId = createRoomId();
	while (rooms.has(roomId)) {
		roomId = createRoomId();
	}

	const room: Room = {
		id: roomId,
		hostId: user.id,
		status: "waiting",
		maxPlayers: clampMaxPlayers(maxPlayers),
		players: [
			{
				id: user.id,
				email: user.email,
				username: user.username,
				socketId,
				isHost: true,
				isAlive: true,
			},
		],
		playerStates: {},
		createdAt: Date.now(),
	};

	rooms.set(room.id, room);
	return toPublicRoom(room);
}

export function joinRoom(roomId: string, user: RealtimeUser, socketId: string) {
	const room = getRoom(roomId);
	if (!room) {
		throw new Error("Room not found");
	}
	if (room.status !== "waiting") {
		throw new Error("Room is not accepting players");
	}

	const existingPlayer = room.players.find((player) => player.id === user.id);
	if (existingPlayer) {
		existingPlayer.socketId = socketId;
		existingPlayer.isAlive = true;
		return toPublicRoom(room);
	}

	if (room.players.length >= room.maxPlayers) {
		throw new Error("Room is full");
	}

	room.players.push({
		id: user.id,
		email: user.email,
		username: user.username,
		socketId,
		isHost: false,
		isAlive: true,
	});

	return toPublicRoom(room);
}

export function leaveRoom(roomId: string, userId: string) {
	const room = getRoom(roomId);
	if (!room) {
		return null;
	}

	room.players = room.players.filter((player) => player.id !== userId);
	if (room.players.length === 0) {
		rooms.delete(room.id);
		return null;
	}
	delete room.playerStates[userId];

	if (room.hostId === userId) {
		const nextHost = room.players[0];
		nextHost.isHost = true;
		room.hostId = nextHost.id;
	}

	return toPublicRoom(room);
}

export function removePlayerFromCurrentRoom(userId: string, roomId: string | null) {
	if (!roomId) {
		return null;
	}
	return leaveRoom(roomId, userId);
}

export function getRoomSocketIds(roomId: string) {
	const room = getRoom(roomId);
	return room ? room.players.map((player) => player.socketId) : [];
}

export function startRoomGame(roomId: string, hostId: string) {
	const room = getRoom(roomId);
	if (!room) {
		throw new Error("Room not found");
	}
	if (room.hostId !== hostId) {
		throw new Error("Only the host can start the game");
	}
	if (room.players.length < MIN_PLAYERS) {
		throw new Error("At least two players are required");
	}

	room.status = "playing";
	room.playerStates = {};
	for (const player of room.players) {
		player.isAlive = true;
	}

	return toPublicRoom(room);
}

export function updatePlayerState(roomId: string, userId: string, state: PlayerGameState) {
	const room = getRoom(roomId);
	if (!room) {
		throw new Error("Room not found");
	}
	if (!room.players.some((player) => player.id === userId)) {
		throw new Error("Player is not in this room");
	}

	room.playerStates[userId] = state;
	return toPublicRoom(room);
}

export function markPlayerGameOver(roomId: string, userId: string, state: PlayerGameState) {
	const room = getRoom(roomId);
	if (!room) {
		throw new Error("Room not found");
	}

	const player = room.players.find((candidate) => candidate.id === userId);
	if (!player) {
		throw new Error("Player is not in this room");
	}

	player.isAlive = false;
	room.playerStates[userId] = { ...state, isGameOver: true };

	const alivePlayers = room.players.filter((candidate) => candidate.isAlive);
	if (room.status === "playing" && alivePlayers.length <= 1) {
		room.status = "finished";
	}

	return {
		room: toPublicRoom(room),
		winner: alivePlayers.length === 1 ? alivePlayers[0] : null,
		isFinished: room.status === "finished",
	};
}
