import { Link } from "react-router-dom";

const TEAM = [
	{
		login: "brturcio",
		github: "https://github.com/brturcio",
		color: "var(--glow-cyan)",
		shadow: "rgba(0,229,255,0.35)",
		initials: "BR",
	},
	{
		login: "gajanvie",
		github: "https://github.com/CHAT-DISPARU",
		color: "var(--glow-pink)",
		shadow: "rgba(255,62,136,0.35)",
		initials: "GA",
	},
	{
		login: "ntome",
		github: "https://github.com/nico-tome",
		color: "var(--glow-lime)",
		shadow: "rgba(157,255,0,0.35)",
		initials: "NT",
	},
	{
		login: "grouger",
		github: "https://github.com/Guilhem-Rouger",
		color: "var(--glow-cyan)",
		shadow: "rgba(0,229,255,0.35)",
		initials: "GG",
	},
];

export default function Credits() {
	return (
		<div className="min-h-screen py-16 px-6 flex justify-center items-center max-[768px]:py-8 max-[768px]:px-4">
			<section className="w-full max-w-3xl p-12 max-[768px]:py-8 max-[768px]:px-5 rounded-3xl bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.14)] shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur-lg">
 
				<header className="mb-12 text-center">
					<span className="inline-block mb-3 text-[0.75rem] font-bold tracking-[0.2em] uppercase opacity-60 font-['Orbitron',sans-serif]">
						ft_transcendence — 42
					</span>
					<h1 className="m-0 mb-3 text-[clamp(2.2rem,6vw,3.8rem)] leading-[1.05] font-['Orbitron',sans-serif] font-extrabold uppercase text-[var(--txt-main)]">
						Credits
					</h1>
					<p className="m-0 opacity-60 text-[1rem] font-['Rajdhani',sans-serif] tracking-[0.05em]">
						Tetris Multiplayer — Full-stack project
					</p>

					<div className="mt-8 mx-auto w-24 h-px bg-[linear-gradient(90deg,transparent,var(--glow-cyan),transparent)]" />
				</header>
 
				<div className="grid grid-cols-2 gap-5 max-[540px]:grid-cols-1">
					{TEAM.map((member) => (
						<a
							key={member.login}
							href={member.github}
							target="_blank"
							rel="noopener noreferrer"
							className="group flex items-center gap-4 p-5 rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.25)] transition-all duration-200 no-underline hover:border-[rgba(255,255,255,0.25)] hover:bg-[rgba(255,255,255,0.06)]"
							style={{
								boxShadow: "0 0 0 transparent",
							}}
							onMouseEnter={(e) => {
								(e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${member.shadow}`;
							}}
							onMouseLeave={(e) => {
								(e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 transparent";
							}}
						>
							<div
								className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center font-['Orbitron',sans-serif] font-bold text-[1rem] border"
								style={{
									color: member.color,
									borderColor: member.color,
									background: `radial-gradient(circle at 30% 30%, ${member.shadow}, transparent 70%)`,
								}}
							>
								{member.initials}
							</div>
 
							<div className="min-w-0">
								<p
									className="m-0 text-[1.05rem] font-['Orbitron',sans-serif] font-bold uppercase tracking-[0.06em] truncate"
									style={{ color: member.color }}
								>
									{member.login}
								</p>
								<p className="m-0 mt-1 text-[0.8rem] text-[var(--txt-soft)] font-['Rajdhani',sans-serif] tracking-[0.04em] flex items-center gap-1.5">
									<svg
										width="13"
										height="13"
										viewBox="0 0 24 24"
										fill="currentColor"
										aria-hidden="true"
									>
										<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
									</svg>
									github.com/{member.login}
								</p>
							</div>
 
							<div
								className="ml-auto flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[1.1rem]"
								style={{ color: member.color }}
								aria-hidden="true"
							>
								↗
							</div>
						</a>
					))}
				</div>
 
				{/* Footer avec Bouton Retour */}
				<footer className="mt-12 pt-8 border-t border-[rgba(255,255,255,0.1)] text-center flex flex-col items-center gap-6">
					<Link 
						to="/" 
						className="bg-[linear-gradient(95deg,var(--glow-cyan),#42f5d7)] rounded-xl px-6 py-3 text-[#021318] font-['Orbitron',sans-serif] text-[0.95rem] font-bold uppercase tracking-[0.04rem] cursor-pointer transition-all duration-300 shadow-[0_0_5px_rgba(0,229,255,0.4)] hover:-translate-y-0.5 hover:shadow-[0_0_10px_rgba(0,229,255,0.6)] active:translate-y-0 no-underline"
					>
						Back To Home
					</Link>
					
					<p className="m-0 text-[0.8rem] text-[var(--txt-soft)] font-['Rajdhani',sans-serif] tracking-[0.05em] uppercase opacity-60">
						42
					</p>
				</footer>
			</section>
		</div>
	);
}