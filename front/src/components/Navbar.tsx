import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

const AUTH_TOKEN_KEY = "ft_auth_token";

export default function Navbar() {
	const navigate = useNavigate();
	const location = useLocation();
	const isAuthenticated = Boolean(localStorage.getItem(AUTH_TOKEN_KEY));

	const getNavClass = ({ isActive }: { isActive: boolean }) =>
		isActive ? "navbar__link navbar__link--active" : "navbar__link";

	const handleLogout = () => {
		localStorage.removeItem(AUTH_TOKEN_KEY);
		navigate("/login");
	};

	void location.pathname;

	return (
		<header className="navbar">
			<div className="navbar__logo">
				<span className="logo-main">FT.</span>
				<span className="logo-accent">TRANSCENDENCE</span>
			</div>

			<nav className="navbar__menu">
				<NavLink to="/" className={getNavClass} end>
					Home
				</NavLink>
				{isAuthenticated ? (
					<NavLink to="/profile" className={getNavClass}>
						Profile
					</NavLink>
				) : (
					<NavLink to="/login" className={getNavClass}>
						Login
					</NavLink>
				)}
			</nav>

			<div className="navbar__actions">
				{isAuthenticated ? (
					<button type="button" className="sign-button" onClick={handleLogout}>
						Logout
					</button>
				) : (
					<Link to="/register" className="sign-button">
						Register
					</Link>
				)}
			</div>
		</header>
	);
}
