import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";

import "./Landing.css"

const AUTH_TOKEN_KEY = "ft_auth_token";

export default function Landing() {
	const isAuthenticated = Boolean(localStorage.getItem(AUTH_TOKEN_KEY));

	return (
		<div className="landing-page app-screen">
			<Navbar />

			<main className="landing__content">
				{!isAuthenticated ? (
					// Hero section for not authenticated
					<section className="hero">
						<p className="hero__intro">// READY TO TRANSCEND?</p>

						<div className="hero__title">
							<h1 className="title-white">Play.</h1>
							<h1 className="title-cyan">Compete.</h1>
							<h1 className="title-pink">Dominate.</h1>
						</div>

						<div className="hero__features">
							<p>&gt; real-time competitive Tetris</p>
							<p>&gt; live global leaderboard</p>
							<p>&gt; weekly tournaments with rewards</p>
						</div>

						<div className="hero__buttons">
							<Link className="primary-button" to="/login">
								[ PLAY NOW ]
							</Link>
						</div>
					</section>
				) : (
					<div className="dashboard-container">
						<aside className="dashboard-leaderboard">
							<h2>Global Leaderboard</h2>
							<div className="leaderboard-content">
								<div className="leaderboard-placeholder">Loading...</div>
							</div>
						</aside>

						{/* Center: Tetris Game */}
						<section className="dashboard-game">
							<div className="tetris-container">
							{/* Left: Tetris Grid */}
								<div className="tetris-grid-wrapper">
									<div className="tetris-grid">
										{Array(20).fill(null).map((_, row) => (
											Array(10).fill(null).map((_, col) => (
												<div key={`${row}-${col}`} className="tetris-cell"></div>
											))
										))}
									</div>
								</div>

								{/* Right: Score and Next Block */}
								<div className="tetris-info">
									<div className="tetris-score">
										<h3>SCORE</h3>
										<p className="score-value">0</p>
									</div>
									<div className="tetris-next">
										<h3>NEXT</h3>
										<div className="next-block-preview">
											<div className="mini-grid">
												{Array(16).fill(null).map((_, i) => (
													<div key={i} className="mini-cell"></div>
												))}
											</div>
										</div>
									</div>
								</div>
							</div>
						</section>
						{/* Right: Buttons */}
						<aside className="dashboard-actions">
							<button className="action-button btn-primary">
								[ JOIN ]
							</button>
							<button className="action-button btn-secondary">
								[ HOST ]
							</button>
						</aside>
					</div>
				)}

			</main>

		</div>
	);
}
