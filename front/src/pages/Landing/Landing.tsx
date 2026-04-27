import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import { useTranslation } from "react-i18next";
import TetrisGame from "../../components/TetrisGame/TetrisGame";

import "./Landing.css";

const AUTH_TOKEN_KEY = "ft_auth_token";

export default function Landing() {
	const { t } = useTranslation();

	const isAuthenticated = Boolean(localStorage.getItem(AUTH_TOKEN_KEY));

	return (
		<div className="landing-page app-screen">
			<Navbar />

			<main className="landing__content">
				{!isAuthenticated ? (
					<section className="hero">
						<p className="hero__intro">{t("landing.intro")}</p>

						<div className="hero__title">
							<h1 className="title-white">{t("landing.title.play")}</h1>
							<h1 className="title-cyan">{t("landing.title.compete")}</h1>
							<h1 className="title-pink">{t("landing.title.dominate")}</h1>
						</div>

						<div className="hero__features">
							<p>{t("landing.features.realtime")}</p>
							<p>{t("landing.features.leaderboard")}</p>
							<p>{t("landing.features.tournaments")}</p>
						</div>

						<div className="hero__buttons">
							<Link className="primary-button" to="/login">
								{t("landing.cta.playNow")}
							</Link>
						</div>
					</section>
				) : (
					<div className="dashboard-container">
						<aside className="dashboard-leaderboard">
							<h2>{t("landing.dashboard.leaderboard.title")}</h2>
							<div className="leaderboard-content">
								<div className="leaderboard-placeholder">
									{t("landing.dashboard.leaderboard.loading")}
								</div>
							</div>
						</aside>

						<section className="dashboard-game">
							<TetrisGame />
						</section>

						<aside className="dashboard-actions">
							<button className="action-button btn-primary">
								{t("landing.dashboard.actions.join")}
							</button>

							<button className="action-button btn-secondary">
								{t("landing.dashboard.actions.host")}
							</button>
						</aside>
					</div>
				)}
			</main>
		</div>
	);
}
