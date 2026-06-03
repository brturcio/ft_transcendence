import { useEffect, useRef, useState, useCallback } from "react";
import { REALTIME_BASE_URL } from "../config/network";

const AUTH_TOKEN_KEY = "ft_auth_token";

export type UserStatus = "ONLINE" | "OFFLINE" | "INGAME";

type PresenceMessage = 
	| { type: "friend_status_update"; userId: string; status: UserStatus }
	| { type: "pong" };

export function useGlobalPresence() {
	const [statuses, setStatuses] = useState<Record<string, UserStatus>>({});
	const wsRef = useRef<WebSocket | null>(null);
	const token = localStorage.getItem(AUTH_TOKEN_KEY);

	useEffect(() => {
		if (!token)
			return;

		let ws: WebSocket | null = null;
		const connectionTimer = setTimeout(() => {
			ws = new WebSocket(`${REALTIME_BASE_URL}?token=${encodeURIComponent(token)}`);
			wsRef.current = ws;

			ws.onopen = () => {
				if (ws.readyState === WebSocket.OPEN)
					ws.send(JSON.stringify({ type: "ping" }));
			};

			ws.onmessage = (event) => {
				try
				{
					const message = JSON.parse(event.data) as PresenceMessage;
					if (message.type === "friend_status_update")
					{
						setStatuses((prev) => ({
							...prev,
							[message.userId]: message.status
						}));
					}
				}
				catch (err)
				{
					console.error("Erreur de parsing WebSocket :", err);
				}
			};
			ws.onerror = (event) => {
				if (ws?.readyState !== WebSocket.CLOSED) {
					console.error("Erreur réseau sur le WebSocket de présence.");
				}
			};
		}, 50);
		return () => {
			clearTimeout(connectionTimer);
			if (ws) {
				ws.onclose = null; 
				ws.onerror = null;
				ws.onmessage = null;
				ws.close();
			}
		};
	}, [token]);

	const updateMyStatus = useCallback((status: UserStatus) => {
		if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN)
			wsRef.current.send(JSON.stringify({ type: "set_status", status }));
	}, []);
	return { statuses, updateMyStatus };
}
