function getBrowserHost() {
	if (typeof window === "undefined") {
		return "localhost";
	}

	return window.location.hostname || "localhost";
}

function getHttpProtocol() {
	if (typeof window === "undefined") {
		return "http:";
	}

	return window.location.protocol === "https:" ? "https:" : "http:";
}

function getWebSocketProtocol() {
	return getHttpProtocol() === "https:" ? "wss:" : "ws:";
}

export const API_BASE_URL =
	import.meta.env.VITE_API_URL ?? `${getHttpProtocol()}//${getBrowserHost()}:8000`;

export const REALTIME_BASE_URL =
	import.meta.env.VITE_REALTIME_URL ?? `${getWebSocketProtocol()}//${getBrowserHost()}:8001`;

export function resolveMediaUrl(url: string | null) {
	if (!url) {
		return null;
	}

	if (url.startsWith("/")) {
		return `${API_BASE_URL}${url}`;
	}

	return url;
}
