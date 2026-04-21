import { Link } from "react-router-dom";

export default function Hero() {
	return (
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
				<Link className="primary-button" to="/tournaments">
					[ PLAY NOW ]
				</Link>
			</div>
		</section>
	);
}
