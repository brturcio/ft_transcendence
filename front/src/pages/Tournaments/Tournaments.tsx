import Navbar from "../../components/Navbar";

const tournaments = [
	{
		title: "Neon Clash Cup",
		type: "1v1",
		players: "64 players",
		status: "Open",
		starts: "Today 21:00",
	},
	{
		title: "Grid Masters",
		type: "Squad",
		players: "32 teams",
		status: "Open",
		starts: "Tomorrow 20:30",
	},
	{
		title: "Midnight Sprint",
		type: "Blitz",
		players: "128 players",
		status: "Soon",
		starts: "Friday 23:00",
	},
];

export default function Tournaments() {
	return (
		<div className="landing-page app-screen">
			<Navbar />
			<main className="page page--tournaments">
				<section className="page__hero">
					<p className="page__eyebrow">Weekly Events</p>
					<h1>Tournaments</h1>
					<p>
						Compite por recompensas, medallas y puntos de temporada. Elige tu
						formato y regístrate antes de que cierre el bracket.
					</p>
				</section>

				<section className="tournament-grid">
					{tournaments.map((tournament) => (
						<article className="tournament-card" key={tournament.title}>
							<p className="tournament-card__type">{tournament.type}</p>
							<h3>{tournament.title}</h3>
							<p>{tournament.players}</p>
							<p>{tournament.starts}</p>
							<div className="tournament-card__footer">
								<span>{tournament.status}</span>
								<button type="button">Join</button>
							</div>
						</article>
					))}
				</section>
			</main>
		</div>
	);
}
