import Navbar from "../../components/Navbar";

const recentActivity = [
	"Played 3 matches today",
	"Joined Neon Clash Cup",
	"Unlocked badge: Cold Start",
];

export default function Profile() {
	return (
		<div className="landing-page app-screen">
			<Navbar />

			<main className="page page--profile page--profile-simple">
				<section className="page__hero page__hero--simple">
					<h1>My Profile</h1>
					<p>
						A simple place to review your account, edit your details, and check
						a few basic stats.
					</p>
				</section>

				<section className="profile-summary-card">
					<div className="profile-avatar">B</div>
					<div className="profile-summary-text">
						<h2>btrurcio</h2>
						<p>bjosueturcios@gmail.com</p>
						<span>Rank #27</span>
					</div>
				</section>

				<section className="profile-form-card">
					<div className="form-group">
						<label htmlFor="profile-username">Username</label>
						<input id="profile-username" type="text" defaultValue="btrurcio" />
					</div>

					<div className="form-group">
						<label htmlFor="profile-bio">Bio</label>
						<textarea
							id="profile-bio"
							rows={4}
							placeholder="Write a short bio..."
							defaultValue="I like playing Tetris and building clean UIs."
						/>
					</div>

					<button type="button" className="btn-register">
						[ SAVE CHANGES ]
					</button>
				</section>

				<section className="profile-stats-simple">
					<div className="profile-stat-item">
						<strong>0</strong>
						<span>Games</span>
					</div>
					<div className="profile-stat-item">
						<strong>0</strong>
						<span>Wins</span>
					</div>
					<div className="profile-stat-item">
						<strong>0%</strong>
						<span>Win rate</span>
					</div>
				</section>

				<section className="profile-activity-simple">
					<h3>Recent activity</h3>
					<ul>
						{recentActivity.map((item) => (
							<li key={item}>{item}</li>
						))}
					</ul>
				</section>
			</main>
		</div>
	);
}
