import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import flagsEs from "../../assets/Language/squareEspaña.png"
import flagsFr from "../../assets/Language/squareFrance.png"
import flagsEn from "../../assets/Language/squareUnitedKingdom.png"
import "./Navbar.css"

const AUTH_TOKEN_KEY = "ft_auth_token";

type LanguageOption = {
	code: "en" | "es" | "fr";
	label: string;
	flag: string;
};

const LANGUAGE_OPTIONS: LanguageOption[] = [
	{ code: "en", label: "English", flag: flagsEn },
	{ code: "es", label: "Español", flag: flagsEs },
	{ code: "fr", label: "Français", flag: flagsFr },
];

export default function Navbar() {
	const navigate = useNavigate();
	const location = useLocation();
	const isAuthenticated = Boolean(localStorage.getItem(AUTH_TOKEN_KEY));
	const [isOpen, setIsOpen] = useState(false);
	const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>(LANGUAGE_OPTIONS[0]);

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
				<NavLink  to="/" className="logo-main">FT.</NavLink>
				<NavLink to="/" className="logo-accent">TRANSCENDENCE</NavLink>
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

			<div className="navbar__trans">

			</div>

			<div className="language">
				<button
					type="button"
					className="language-button"
					onClick={() => setIsOpen(!isOpen)}
				>
					<img
						className="language-flag"
						src={selectedLanguage.flag}
						alt={`${selectedLanguage.label} flag`}
					/>
					{selectedLanguage.label}
				</button>

				{isOpen && (
					<div className="language-menu">
						{LANGUAGE_OPTIONS.map((language) => {
							const isSelected = language.code === selectedLanguage.code;

							return (
								<button
									key={language.code}
									type="button"
									className={isSelected ? "language-menu__option language-menu__option--active" : "language-menu__option"}
									onClick={() => {
										setSelectedLanguage(language);
										setIsOpen(false);
									}}
								>
									<img
										className="language-flag"
										src={language.flag}
										alt={`${language.label} flag`}
									/>
									{language.label}
								</button>
							);
						})}
					</div>
				)}
			</div>

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
