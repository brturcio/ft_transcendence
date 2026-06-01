import type { WebSocket } from "ws";

export type RoomStatus = "waiting" | "playing" | "finished";

export type RealtimeUser = {
	id: string;
	email: string;
	username: string;
};

export type RoomPlayer = {
	id: string;
	email: string;
	username: string;
	socketId: string;
	isHost: boolean;
	isAlive: boolean;
};

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

export type Room = {
	id: string;
	hostId: string;
	status: RoomStatus;
	maxPlayers: number;
	players: RoomPlayer[];
	playerStates: Record<string, PlayerGameState>;
	createdAt: number;
};

export type PublicRoom = {
	id: string;
	hostId: string;
	status: RoomStatus;
	maxPlayers: number;
	players: PublicRoomPlayer[];
};

export type ClientMessage =
	| {
			type: "create_room";
			maxPlayers?: number;
	  }
	| {
			type: "join_room";
			roomId: string;
	  }
	| {
			type: "leave_room";
	  }
	| {
			type: "start_game";
	  }
	| {
			type: "player_state";
			state: PlayerGameState;
	  }
	| {
			type: "game_over";
			state: PlayerGameState;
	  }
	| {
			type: "ping";
	  };

export type ServerMessage =
	| {
			type: "room_created";
			room: PublicRoom;
	  }
	| {
			type: "room_joined";
			room: PublicRoom;
	  }
	| {
			type: "room_updated";
			room: PublicRoom;
	  }
	| {
			type: "game_started";
			room: PublicRoom;
	  }
	| {
			type: "player_state";
			playerId: string;
			username: string;
			state: PlayerGameState;
	  }
	| {
			type: "player_game_over";
			playerId: string;
			username: string;
			room: PublicRoom;
	  }
	| {
			type: "match_finished";
			winnerId: string | null;
			winnerUsername: string | null;
			room: PublicRoom;
	  }
	| {
			type: "pong";
	  }
	| {
			type: "error";
			code: string;
			message: string;
	  };

export type RealtimeClient = {
	socketId: string;
	user: RealtimeUser;
	ws: WebSocket;
	roomId: string | null;
};
