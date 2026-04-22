import { useEffect, useState, type FormEvent } from "react";
import Navbar from "../../components/Navbar";

const AUTH_TOKEN_KEY = "ft_auth_token";
const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const PROFILE_ENDPOINT = `${API_BASE_URL}/users/me`;

type ProfileStats = {
	games: number;
	wins: number;
	winRate: string;
};

type ProfileData = {
	username: string;
	email: string;
	bio: string;
	rank: string;
	stats: ProfileStats;
};

type BackendProfile = {
	username?: string;
	userName?: string;
	login?: string;
	email?: string;
	bio?: string;
	rank?: number | string;
	stats?: {
		games?: number;
		wins?: number;
		winRate?: number | string;
	};
};

const DEFAULT_PROFILE: ProfileData = {
	username: "",
	email: "",
	bio: "",
	rank: "-",
	stats: {
		games: 0,
		wins: 0,
		winRate: "0%",
	},
};

function formatWinRate(value: number | string | undefined): string {
	if (typeof value === "number") {
		return `${Math.round(value)}%`;
	}

	if (typeof value === "string" && value.trim() !== "") {
		return value.includes("%") ? value : `${value}%`;
	}

	return "0%";
}

function mapBackendProfile(data: BackendProfile): ProfileData {
	const username = data.username ?? data.userName ?? data.login ?? "";
	const email = data.email ?? "";

	return {
		username,
		email,
		bio: data.bio ?? "",
		rank: data.rank !== undefined ? String(data.rank) : "-",
		stats: {
			games: data.stats?.games ?? 0,
			wins: data.stats?.wins ?? 0,
			winRate: formatWinRate(data.stats?.winRate),
		},
	};
}

function getAvatarInitial(username: string, email: string): string {
	if (username.trim()) {
		return username[0].toUpperCase();
	}

	if (email.trim()) {
		return email[0].toUpperCase();
	}

	return "?";
}

export default function Profile() {
	const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [saveMessage, setSaveMessage] = useState("");

	useEffect(() => {
		const controller = new AbortController();
		const token = localStorage.getItem(AUTH_TOKEN_KEY);

		async function fetchProfile() {
			setIsLoading(true);
			setErrorMessage("");

			try {
				const response = await fetch(PROFILE_ENDPOINT, {
					headers: {
						"Content-Type": "application/json",
						...(token ? { Authorization: `Bearer ${token}` } : {}),
					},
					signal: controller.signal,
				});

				if (!response.ok) {
					throw new Error(`No se pudo cargar el perfil (${response.status})`);
				}

				const data: BackendProfile = await response.json();
				setProfile(mapBackendProfile(data));
			} catch (error) {
				if (error instanceof DOMException && error.name === "AbortError") {
					return;
				}

				setErrorMessage(
					error instanceof Error
						? error.message
						: "Error inesperado al obtener el perfil",
				);
			} finally {
				setIsLoading(false);
			}
		}

		void fetchProfile();

		return () => controller.abort();
	}, []);

	const handleSave = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const token = localStorage.getItem(AUTH_TOKEN_KEY);

		setIsSaving(true);
		setSaveMessage("");
		setErrorMessage("");

		try {
			const response = await fetch(PROFILE_ENDPOINT, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				},
				body: JSON.stringify({
					username: profile.username,
					bio: profile.bio,
				}),
			});

			if (!response.ok) {
				throw new Error(`No se pudo guardar (${response.status})`);
			}

			const data: BackendProfile = await response.json();
			setProfile(mapBackendProfile(data));
			setSaveMessage("Perfil actualizado correctamente.");
		} catch (error) {
			setErrorMessage(
				error instanceof Error ? error.message : "No se pudo actualizar el perfil",
			);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="landing-page app-screen">
			<Navbar />

			<main className="page page--profile page--profile-simple">
				<section className="page__hero page__hero--simple">
					<h1>My Profile</h1>
				</section>

				<section className="profile-summary-card">
					<div className="profile-avatar">
						{getAvatarInitial(profile.username, profile.email)}
					</div>
					<div className="profile-summary-text">
						<h2>{profile.username || "Sin username"}</h2>
						<p>{profile.email || "Sin email"}</p>
						<span>Rank #{profile.rank}</span>
					</div>
				</section>

				<form className="profile-form-card" onSubmit={handleSave}>
					<div className="form-group">
						<label htmlFor="profile-username">Username</label>
						<input
							id="profile-username"
							type="text"
							value={profile.username}
							onChange={(event) =>
								setProfile((current) => ({
									...current,
									username: event.target.value,
								}))
							}
						/>
					</div>

					<div className="form-group">
						<label htmlFor="profile-bio">Bio</label>
						<textarea
							id="profile-bio"
							rows={4}
							placeholder="Write a short bio..."
							value={profile.bio}
							onChange={(event) =>
								setProfile((current) => ({
									...current,
									bio: event.target.value,
								}))
							}
						/>
					</div>

					<button type="submit" className="btn-register" disabled={isSaving}>
						{isSaving ? "[ SAVING... ]" : "[ SAVE CHANGES ]"}
					</button>

					{saveMessage && <p>{saveMessage}</p>}
					{errorMessage && <p>{errorMessage}</p>}
				</form>

				{isLoading && <p>Loading profile...</p>}

				<section className="profile-stats-simple">
					<div className="profile-stat-item">
						<strong>{profile.stats.games}</strong>
						<span>Games</span>
					</div>
					<div className="profile-stat-item">
						<strong>{profile.stats.wins}</strong>
						<span>Wins</span>
					</div>
					<div className="profile-stat-item">
						<strong>{profile.stats.winRate}</strong>
						<span>Win rate</span>
					</div>
				</section>
			</main>
		</div>
	);
}
