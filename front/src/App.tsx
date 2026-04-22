import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Landing from "./pages/Landing/Landing";
import Login from "./pages/Login/Login";
import Profile from "./pages/Profile/Profile";
import Register from "./pages/Register/Register";
import Privacy from "./pages/Privacy/Privacy";
import Terms from "./pages/Terms/Terms";

const AUTH_TOKEN_KEY = "ft_auth_token";

function App() {
	const isAuthenticated = Boolean(localStorage.getItem(AUTH_TOKEN_KEY));

	return (
		<div className="app-shell">
			<Routes>
				<Route path="/" element={<Landing />} />
				<Route
					path="/login"
					element={isAuthenticated ? <Navigate to="/profile" replace /> : <Login />}
				/>
				<Route
					path="/register"
					element={isAuthenticated ? <Navigate to="/profile" replace /> : <Register />}
				/>
				<Route
					path="/profile"
					element={isAuthenticated ? <Profile /> : <Navigate to="/login" replace />}
				/>
				<Route path="/terms" element={<Terms />} />
				<Route path="/privacy" element={<Privacy />} />
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</div>
	);
}

export default App;
