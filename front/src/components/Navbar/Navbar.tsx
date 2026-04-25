import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from 'react-i18next';
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
	{ code: "en", label: "navbar.language.english", flag: flagsEn },
	{ code: "es", label: "navbar.language.spanish", flag: flagsEs },
	{ code: "fr", label: "navbar.language.french", flag: flagsFr },
];

export default function Navbar() {
	const { t, i18n } = useTranslation();
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
				<NavLink  to="/" className="logo-main">{t("navbar.brand.main")}</NavLink>
				<NavLink to="/" className="logo-accent">{t("navbar.brand.accent")}</NavLink>
			</div>

			<nav className="navbar__menu">
				<NavLink to="/" className={getNavClass} end>
					{t("navbar.menu.home")}
				</NavLink>
				{isAuthenticated ? (
					<NavLink to="/profile" className={getNavClass}>
						{t("navbar.menu.profile")}
					</NavLink>
				) : (
					<NavLink to="/login" className={getNavClass}>
						{t("navbar.menu.login")}
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
						alt={`${t(selectedLanguage.label)} flag`}
					/>
					{t(selectedLanguage.label)}
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
										i18n.changeLanguage(language.code);
									}}
								>
									<img
										className="language-flag"
										src={language.flag}
										alt={`${t(language.label)} flag`}
									/>
									{t(language.label)}
								</button>
							);
						})}
					</div>
				)}
			</div>

			<div className="navbar__actions">
				{isAuthenticated ? (
					<button type="button" className="sign-button" onClick={handleLogout}>
						{t("navbar.actions.logout")}
					</button>
				) : (
					<Link to="/register" className="sign-button">
						{t("navbar.actions.register")}
					</Link>
				)}
			</div>
		</header>
	);
}
