import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import flagsEs from "../assets/Language/squareEspaña.png";
import flagsFr from "../assets/Language/squareFrance.png";
import flagsEn from "../assets/Language/squareUnitedKingdom.png";

const navLink =
	"text-[var(--txt-soft)] text-[0.95rem] uppercase tracking-[0.06rem] font-['Orbitron',sans-serif] relative transition-colors duration-200 after:content-[''] after:absolute after:left-0 after:-bottom-2 after:w-full after:h-0.5 after:bg-[linear-gradient(90deg,var(--glow-cyan),var(--glow-pink))] after:scale-x-0 after:origin-left after:transition-transform after:duration-200 hover:text-[var(--txt-main)]";
const activeNavLink = `${navLink} text-[var(--txt-main)] after:scale-x-100`;
const navButton =
	"min-w-[190px] h-[42px] px-[18px] gap-2.5 border border-[rgba(255,62,136,0.65)] rounded-[10px] bg-transparent text-[var(--txt-main)] uppercase cursor-pointer font-['Orbitron',sans-serif] tracking-[0.05rem] flex items-center justify-center no-underline";
const languageOption =
	"flex items-center gap-3 bg-transparent border-0 text-[var(--txt-main)] py-2.5 px-3.5 text-left cursor-pointer font-['Orbitron',sans-serif] uppercase tracking-[0.05rem] rounded-lg whitespace-nowrap hover:bg-[rgba(255,62,136,0.15)] hover:text-[var(--glow-cyan)]";
const activeLanguageOption = `${languageOption} bg-[rgba(0,229,255,0.14)] text-[var(--glow-cyan)] shadow-[inset_0_0_0_1px_rgba(0,229,255,0.28)]`;
const flag =
	"w-7 h-[22px] rounded-md object-cover border border-[rgba(255,62,136,0.45)] shadow-[0_0_10px_rgba(255,62,136,0.25)]";

type LanguageOption = {
	code: "en" | "es" | "fr";
	label: string;
	flag: string;
};

type NavbarProps = {
	isAuthenticated: boolean;
	onLogout: () => Promise<void>;
};

const LANGUAGE_OPTIONS: LanguageOption[] = [
	{ code: "en", label: "navbar.language.english", flag: flagsEn },
	{ code: "es", label: "navbar.language.spanish", flag: flagsEs },
	{ code: "fr", label: "navbar.language.french", flag: flagsFr },
];

export default function Navbar({ isAuthenticated, onLogout }: NavbarProps) {
	const { t, i18n } = useTranslation();
	const navigate = useNavigate();
	const location = useLocation();
	const [isOpen, setIsOpen] = useState(false);
	const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>(LANGUAGE_OPTIONS[0]);

	const getNavClass = ({ isActive }: { isActive: boolean }) => (isActive ? activeNavLink : navLink);

	const handleLogout = async () => {
		await onLogout();
		navigate("/login");
	};

	void location.pathname;

	return (
		<header className="h-18 flex items-center justify-between border border-(--line-soft) rounded-2xl bg-[rgba(8,14,32,0.7)] backdrop-blur-[6px] px-6 relative z-11 max-[1100px]:h-auto max-[1100px]:p-3.5 max-[1100px]:gap-3 max-[1100px]:flex-wrap">
			<div className="flex items-center gap-2.5 text-[1.2rem] font-bold font-['Orbitron',sans-serif] tracking-[0.05rem]">
				<NavLink to="/" className="text-(--txt-main)">
					{t("navbar.brand.main")}
				</NavLink>
				<NavLink to="/" className="text-(--glow-pink) [text-shadow:0_0_10px_rgba(255,62,136,0.6)]">
					{t("navbar.brand.accent")}
				</NavLink>
			</div>

			<nav className="flex items-center gap-8 max-[1100px]:gap-3.5 max-[1100px]:flex-wrap">
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

			<div></div>

			<div className="relative inline-block">
				<button type="button" className={navButton} onClick={() => setIsOpen(!isOpen)}>
					<img className={flag} src={selectedLanguage.flag} alt={`${t(selectedLanguage.label)} flag`} />
					{t(selectedLanguage.label)}
				</button>

				{isOpen && (
					<div className="absolute top-[calc(100%+8px)] right-0 min-w-47.5 flex flex-col gap-1 bg-[rgba(10,14,30,0.95)] border border-[rgba(255,62,136,0.65)] rounded-[10px] p-1.5 z-10 font-['Orbitron',sans-serif] tracking-[0.05rem] shadow-[0_0_18px_rgba(255,62,136,0.25)]">
						{LANGUAGE_OPTIONS.map((language) => {
							const isSelected = language.code === selectedLanguage.code;

							return (
								<button
									key={language.code}
									type="button"
									className={isSelected ? activeLanguageOption : languageOption}
									onClick={() => {
										setSelectedLanguage(language);
										setIsOpen(false);
										i18n.changeLanguage(language.code);
									}}
								>
									<img className={flag} src={language.flag} alt={`${t(language.label)} flag`} />
									{t(language.label)}
								</button>
							);
						})}
					</div>
				)}
			</div>

			<div className="flex items-center gap-3.5 max-[620px]:w-full max-[620px]:justify-end">
				{isAuthenticated ? (
					<button type="button" className={navButton} onClick={handleLogout}>
						{t("navbar.actions.logout")}
					</button>
				) : (
					<Link to="/register" className={navButton}>
						{t("navbar.actions.register")}
					</Link>
				)}
			</div>
		</header>
	);
}
