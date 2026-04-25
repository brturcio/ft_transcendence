import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import { useTranslation } from "react-i18next";

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
						<p className="hero__intro">{t("intro")}</p>

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
							<div className="tetris-container">
								<div className="tetris-grid-wrapper">
									<div className="tetris-grid">
										{Array(20)
											.fill(null)
											.map((_, row) =>
												Array(10)
													.fill(null)
													.map((_, col) => (
														<div
															key={`${row}-${col}`}
															className="tetris-cell"
														></div>
													))
											)}
									</div>
								</div>

								<div className="tetris-info">
									<div className="tetris-score">
										<h3>{t("landing.dashboard.game.score")}</h3>
										<p className="score-value">0</p>
									</div>

									<div className="tetris-next">
										<h3>{t("landing.dashboard.game.next")}</h3>
										<div className="next-block-preview">
											<div className="mini-grid">
												{Array(16)
													.fill(null)
													.map((_, i) => (
														<div key={i} className="mini-cell"></div>
													))}
											</div>
										</div>
									</div>
								</div>
							</div>
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
