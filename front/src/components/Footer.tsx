import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

const navLink =
    "text-[var(--txt-soft)] text-[0.95rem] uppercase tracking-[0.06rem] font-['Orbitron',sans-serif] relative transition-colors duration-200";

type FooterProps = { isAuthenticated: boolean; onLogout: () => Promise<void> };

export default function Footer(_props: FooterProps) {
    const { t } = useTranslation();

    return (
        <footer className="h-18 flex items-center justify-center border border-(--line-soft) rounded-2xl bg-[rgba(8,14,32,0.7)] backdrop-blur-[6px] px-6 relative z-10 max-[1100px]:h-auto max-[1100px]:p-3.5 max-[1100px]:gap-3 max-[1100px]:flex-wrap">
            <nav className="flex items-center justify-center gap-4 text-sm">
                <NavLink to="/terms" className={navLink}>
                    {t("navbar.menu.terms", "Terms")}
                </NavLink>
                <NavLink to="/privacy" className={navLink}>
                    {t("navbar.menu.privacy", "Privacy")}
                </NavLink>
                <NavLink to="/credits" className={navLink}>
                    {t("navbar.menu.credits", "Credits")}
                </NavLink>
            </nav>
        </footer>
    );
}
