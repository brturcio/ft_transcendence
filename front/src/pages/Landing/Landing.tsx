import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";

import "./Landing.css"

export default function Landing() {
	return (
		<div className="landing-page app-screen">
			<Navbar />

			<main className="landing__content">

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

			</main>

		</div>
	);
}
