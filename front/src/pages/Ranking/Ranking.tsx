import Navbar from "../../components/Navbar";

const topPlayers = [
	{ rank: 1, nick: "byte_ninja", score: 18940, wins: 241, streak: 18 },
	{ rank: 2, nick: "neo_pong", score: 17680, wins: 220, streak: 12 },
	{ rank: 3, nick: "stack_over", score: 17110, wins: 208, streak: 9 },
	{ rank: 4, nick: "grid_hunter", score: 16490, wins: 195, streak: 7 },
	{ rank: 5, nick: "ghostpiece", score: 15820, wins: 181, streak: 6 },
];

export default function Ranking() {
	return (
		<div className="landing-page app-screen">
			<Navbar />
			<main className="page page--ranking">
				<section className="page__hero">
					<p className="page__eyebrow">Season // 04</p>
					<h1>Global Ranking</h1>
					<p>
						Los mejores jugadores en tiempo real. Sube en la tabla ganando
						partidas clasificatorias y manteniendo rachas activas.
					</p>
				</section>

				<section className="leaderboard-card">
					<div className="leaderboard-head">
						<span>#</span>
						<span>Player</span>
						<span>Score</span>
						<span>Wins</span>
						<span>Streak</span>
					</div>

					{topPlayers.map((player) => (
						<article className="leaderboard-row" key={player.nick}>
							<span>{player.rank}</span>
							<span>{player.nick}</span>
							<span>{player.score}</span>
							<span>{player.wins}</span>
							<span>+{player.streak}</span>
						</article>
					))}
				</section>
			</main>
		</div>
	);
}
