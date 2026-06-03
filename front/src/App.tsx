import { useState } from "react";
import { Navigate, Route, Routes, Link } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Profile from "./pages/Profile/Profile";
import Register from "./pages/Register";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Credits from "./pages/Credits";
import Navbar from "./components/Navbar";
import PlayerModal from "./components/PlayerModal";
import { API_BASE_URL } from "./config/network";

const AUTH_TOKEN_KEY = "ft_auth_token";
const REFRESH_TOKEN_KEY = "ft_refresh_token";
const USER_STORAGE_KEY = "ft_user";
const LOGOUT_ENDPOINT = `${API_BASE_URL}/auth/logout`;

function App() {
	const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem(AUTH_TOKEN_KEY)));
	
	const handleLogin = () => {
		setIsAuthenticated(true);
	};
	
	const handleLogout = async () => {
		const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
		localStorage.removeItem(AUTH_TOKEN_KEY);
		localStorage.removeItem(REFRESH_TOKEN_KEY);
		localStorage.removeItem(USER_STORAGE_KEY);
		setIsAuthenticated(false);
		try {
			await fetch(LOGOUT_ENDPOINT, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(refreshToken ? { refreshToken } : {}),
			});
		} catch {
			// Logout local already happened. Backend revocation failure should not keep the user logged in.
		}
	};

	const [selectedPlayer, setSelectedPlayer] = useState<{
		id: string;
		username: string;
		avatarUrl: string | null;
		soloBestScore: number;
	} | null>(null);

	return (
		<div className="app-shell app-screen">
			<Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} onSelectUser={(u) => setSelectedPlayer(u)} />

			{selectedPlayer && (
				<PlayerModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
			)}

			<Routes>
				<Route path="/" element={<Landing isAuthenticated={isAuthenticated} />} />
				<Route
					path="/login"
					element={isAuthenticated ? <Navigate to="/profile" replace /> : <Login onLogin={handleLogin} />}
				/>
				<Route
					path="/register"
					element={isAuthenticated ? <Navigate to="/" replace /> : <Register onLogin={handleLogin} />}
				/>
				<Route
					path="/profile"
					element={isAuthenticated ? <Profile onLogout={handleLogout} /> : <Navigate to="/login" replace />}
				/>
				<Route path="/credits" element={<Credits />} />
				<Route path="/terms" element={<Terms />} />
				<Route path="/privacy" element={<Privacy />} />
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</div>
	);
}

export default App;