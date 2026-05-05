import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Navbar from "./components/Navbar";

const AUTH_TOKEN_KEY = "ft_auth_token";
const REFRESH_TOKEN_KEY = "ft_refresh_token";
const USER_STORAGE_KEY = "ft_user";
const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
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
	return (
		<div className="app-shell app-screen">
			<Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />

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
				<Route path="/terms" element={<Terms />} />
				<Route path="/privacy" element={<Privacy />} />
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</div>
	);
}
export default App;
