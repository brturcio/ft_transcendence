import { randomUUID } from "node:crypto";
import { WebSocket, WebSocketServer } from "ws";
import { eq } from "drizzle-orm";
import { db } from "../config/db";
import { users } from "../db/schema";

import { authenticateRequest } from "./auth";
import {
	createRoom,
	getRoomSocketIds,
	joinRoom,
	markPlayerGameOver,
	removePlayerFromCurrentRoom,
	startRoomGame,
	updatePlayerState,
} from "./rooms";

import type { ClientMessage, RealtimeClient, ServerMessage, UserStatus } from "./types";

const REALTIME_PORT = Number(process.env.REALTIME_PORT ?? 8001);

const clients = new Map<string, RealtimeClient>();

const activeUsers = new Map<string, Set<string>>();

function broadcastGlobal(message: ServerMessage)
{
	for (const client of clients.values())
		send(client.ws, message);
}

async function updateUserStatus(userId: string, status: UserStatus)
{
	try
	{
		await db.update(users).set({ status }).where(eq(users.id, userId));
		broadcastGlobal({ type: "friend_status_update", userId, status });
	}
	catch (error)
	{
		console.error(` fail updte the user -> ${userId} to ${status}`, error);
	}
}


function send(ws: WebSocket, message: ServerMessage) {
	if (ws.readyState !== WebSocket.OPEN) {
		return;
	}
	ws.send(JSON.stringify(message));
}

function sendError(ws: WebSocket, code: string, message: string) {
	send(ws, { type: "error", code, message });
}

function getRealtimeErrorCode(error: unknown) {
	if (!(error instanceof Error)) {
		return "REALTIME_ERROR";
	}

	switch (error.message) {
		case "Room not found":
			return "ROOM_NOT_FOUND";
		case "Room is not accepting players":
			return "ROOM_NOT_ACCEPTING_PLAYERS";
		case "Room is full":
			return "ROOM_FULL";
		case "Only the host can start the game":
			return "ONLY_HOST_CAN_START";
		case "At least two players are required":
			return "ROOM_MIN_PLAYERS";
		case "Player is not in this room":
			return "PLAYER_NOT_IN_ROOM";
		default:
			return "REALTIME_ERROR";
	}
}

function parseClientMessage(rawMessage: WebSocket.RawData): ClientMessage | null {
	try {
		const parsed = JSON.parse(rawMessage.toString()) as Partial<ClientMessage>;
		if (!parsed || typeof parsed.type !== "string") {
			return null;
		}
		return parsed as ClientMessage;
	} catch {
		return null;
	}
}

function broadcastRoom(roomId: string, message: ServerMessage) {
	for (const socketId of getRoomSocketIds(roomId)) {
		const client = clients.get(socketId);
		if (client) {
			send(client.ws, message);
		}
	}
}

function broadcastRoomExcept(roomId: string, exceptSocketId: string, message: ServerMessage) {
	for (const socketId of getRoomSocketIds(roomId)) {
		if (socketId === exceptSocketId) continue;
		const client = clients.get(socketId);
		if (client) {
			send(client.ws, message);
		}
	}
}

function handleLeaveRoom(client: RealtimeClient) {
	const previousRoomId = client.roomId;
	if (!previousRoomId) {
		return;
	}

	const updatedRoom = removePlayerFromCurrentRoom(client.user.id, previousRoomId);
	client.roomId = null;

	if (updatedRoom) {
		broadcastRoom(previousRoomId, { type: "room_updated", room: updatedRoom });
	}
}

function handleMessage(client: RealtimeClient, message: ClientMessage) {
	switch (message.type) {
		case "ping":
			send(client.ws, { type: "pong" });
			return;

		case "create_room": {
			handleLeaveRoom(client);
			const room = createRoom(client.user, client.socketId, message.maxPlayers);
			client.roomId = room.id;
			send(client.ws, { type: "room_created", room });
			return;
		}

		case "join_room": {
			handleLeaveRoom(client);
			const room = joinRoom(message.roomId, client.user, client.socketId);
			client.roomId = room.id;
			send(client.ws, { type: "room_joined", room });
			broadcastRoom(room.id, { type: "room_updated", room });
			return;
		}

		case "leave_room":
			handleLeaveRoom(client);
			return;

		case "start_game": {
			if (!client.roomId) {
				sendError(client.ws, "NOT_IN_ROOM", "Join a room before starting a game");
				return;
			}
			const room = startRoomGame(client.roomId, client.user.id);
			broadcastRoom(room.id, { type: "game_started", room });
			return;
		}

		case "player_state": {
			if (!client.roomId) {
				sendError(client.ws, "NOT_IN_ROOM", "Join a room before sending game state");
				return;
			}
			updatePlayerState(client.roomId, client.user.id, message.state);
			broadcastRoom(client.roomId, {
				type: "player_state",
				playerId: client.user.id,
				username: client.user.username,
				state: message.state,
			});
			return;
		}

		case "attack": {
			if (!client.roomId) {
				sendError(client.ws, "NOT_IN_ROOM", "Join a room before sending attacks");
				return;
			}
			broadcastRoomExcept(client.roomId, client.socketId, {
				type: "player_attack",
				playerId: client.user.id,
				username: client.user.username,
				lines: message.lines,
			});
			return;
		}

		case "game_over": {
			if (!client.roomId) {
				sendError(client.ws, "NOT_IN_ROOM", "Join a room before finishing a game");
				return;
			}
			const result = markPlayerGameOver(client.roomId, client.user.id, message.state);
			broadcastRoom(client.roomId, {
				type: "player_game_over",
				playerId: client.user.id,
				username: client.user.username,
				room: result.room,
			});
			if (result.isFinished) {
				broadcastRoom(client.roomId, {
					type: "match_finished",
					winnerId: result.winner?.id ?? null,
					winnerUsername: result.winner?.username ?? null,
					room: result.room,
				});
			}
			return;
		}

		case "set_status":
		{
			if (message.status === "INGAME" || message.status === "ONLINE")
				void updateUserStatus(client.user.id, message.status);
			return ;
		}

		default:
			sendError(client.ws, "UNKNOWN_MESSAGE", "Unsupported realtime message");
	}
}

const wss = new WebSocketServer({ port: REALTIME_PORT });

wss.on("connection", async (ws, request) => {
	try {
		const user = await authenticateRequest(request);
		const socketId = randomUUID();
		const client: RealtimeClient = {
			socketId,
			user,
			ws,
			roomId: null,
		};

		clients.set(socketId, client);
		send(ws, { type: "pong" });

		// garde le compte onglet
		let userSockets = activeUsers.get(user.id);
		if (!userSockets)
		{
			userSockets = new Set();
			activeUsers.set(user.id, userSockets);
			updateUserStatus(user.id, "ONLINE");
		}
		userSockets.add(socketId);

		ws.on("message", (rawMessage) => {
			const message = parseClientMessage(rawMessage);
			if (!message) {
				sendError(ws, "INVALID_MESSAGE", "Message must be valid JSON with a type");
				return;
			}

			try {
				handleMessage(client, message);
			} catch (error) {
				sendError(ws, getRealtimeErrorCode(error), error instanceof Error ? error.message : "Realtime error");
			}
		});
		// close que si c est la derniere fenetre
		ws.on("close", () => {
			handleLeaveRoom(client);
			clients.delete(socketId);
			const userSockets = activeUsers.get(user.id);
			if (userSockets)
			{
				userSockets.delete(socketId);
				if (userSockets.size === 0)
				{
					activeUsers.delete(user.id);
					updateUserStatus(user.id, "OFFLINE");
				}
			}
		});
	} catch (error) {
		sendError(ws, "AUTH_FAILED", error instanceof Error ? error.message : "Authentication failed");
		ws.close(1008, "Authentication failed");
	}
});

wss.on("listening", () => {
	console.info(`Realtime server listening on ws://0.0.0.0:${REALTIME_PORT}`);
});

wss.on("error", (error) => {
	console.error("Realtime server error", error);
});