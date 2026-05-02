import { Navigate, Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

const AUTH_TOKEN_KEY = "ft_auth_token";

function App() {
	const isAuthenticated = Boolean(localStorage.getItem(AUTH_TOKEN_KEY));

	return (
		<div className="app-shell">
			<Routes>
				<Route path="/" element={<Landing />} />
				<Route path="/login" element={isAuthenticated ? <Navigate to="/profile" replace /> : <Login />} />
				<Route path="/register" element={isAuthenticated ? <Navigate to="/profile" replace /> : <Register />} />
				<Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" replace />} />
				<Route path="/terms" element={<Terms />} />
				<Route path="/privacy" element={<Privacy />} />
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</div>
	);
}

export default App;
