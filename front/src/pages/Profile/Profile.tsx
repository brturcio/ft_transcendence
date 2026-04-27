import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar.tsx";
import { AchievementsGrid } from "../../components/AchievementCard.tsx";
import { useTranslation } from 'react-i18next';
import "./Profile.css"

const AUTH_TOKEN_KEY = "ft_auth_token";
const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
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
	unlockedAchievements?: string[];
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
	unlockedAchievements?: string[];
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
	unlockedAchievements: [],
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
		unlockedAchievements: data.unlockedAchievements ?? [],
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
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
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
					throw new Error(`${t("profile.messages.loadError")} (${response.status})`);
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
						: t("profile.messages.unexpectedLoadError"),
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
				throw new Error(`${t("profile.messages.saveError")} (${response.status})`);
			}

			const data: BackendProfile = await response.json();
			setProfile(mapBackendProfile(data));
			setSaveMessage(t("profile.messages.updated"));
		} catch (error) {
			setErrorMessage(
				error instanceof Error ? error.message : t("profile.messages.saveError"),
			);
		} finally {
			setIsSaving(false);
		}
	};

	const handleDeleteAccount = async () => {
		const token = localStorage.getItem(AUTH_TOKEN_KEY);

		if (!window.confirm(t("profile.messages.deleteConfirm"))) {
			return;
		}

		setIsDeleting(true);
		setSaveMessage("");
		setErrorMessage("");

		try {
			const response = await fetch(PROFILE_ENDPOINT, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				},
			});

			if (!response.ok) {
				throw new Error(`${t("profile.messages.deleteError")} (${response.status})`);
			}

			localStorage.removeItem(AUTH_TOKEN_KEY);
			navigate("/login", { replace: true });
		} catch (error) {
			setErrorMessage(
				error instanceof Error ? error.message : t("profile.messages.deleteError"),
			);
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<div className="landing-page app-screen">
			<Navbar />

			<main className="page page--profile page--profile-simple">
				<section className="page__hero page__hero--simple">
					<h1>{t("profile.title")}</h1>
				</section>

				<section className="profile-summary-card">
					<div className="profile-avatar">
						{getAvatarInitial(profile.username, profile.email)}
					</div>
					<div className="profile-summary-text">
						<h2>{profile.username || t("profile.fallback.username")}</h2>
						<p>{profile.email || t("profile.fallback.email")}</p>
						<span>{t("profile.summary.rankPrefix")}{profile.rank}</span>
					</div>
				</section>

				<form className="profile-form-card" onSubmit={handleSave}>
					<div className="profile-form-group">
						<label htmlFor="profile-username">{t("profile.fields.username")}</label>
						<input
							id="profile-username"
							type="text"
							placeholder={t("profile.fields.username")}
							value={profile.username}
							onChange={(event) =>
								setProfile((current) => ({
									...current,
									username: event.target.value,
								}))
							}
						/>
					</div>

					<div className="profile-form-group">
						<label htmlFor="profile-bio">{t("profile.fields.bio")}</label>
						<textarea
							id="profile-bio"
							rows={4}
							placeholder={t("profile.fields.bioPlaceholder")}
							value={profile.bio}
							onChange={(event) =>
								setProfile((current) => ({
									...current,
									bio: event.target.value,
								}))
							}
						/>
					</div>

					<div className="profile-buttons">
						<button type="submit" className="profile-save-btn" disabled={isSaving || isDeleting}>
							{isSaving ? t("profile.actions.saving") : t("profile.actions.save")}
						</button>

						<button
							type="button"
							className="profile-delete-btn"
							onClick={handleDeleteAccount}
							disabled={isSaving || isDeleting}
						>
							{isDeleting ? t("profile.actions.deleting") : t("profile.actions.delete")}
						</button>
					</div>

					{saveMessage && <p>{saveMessage}</p>}
					{errorMessage && <p>{errorMessage}</p>}
				</form>

				{isLoading && <p>{t("profile.messages.loading")}</p>}

				<section className="profile-stats-simple">
					<div className="profile-stat-item">
						<strong>{profile.stats.games}</strong>
						<span>{t("profile.stats.games")}</span>
					</div>
					<div className="profile-stat-item">
						<strong>{profile.stats.wins}</strong>
						<span>{t("profile.stats.wins")}</span>
					</div>
					<div className="profile-stat-item">
						<strong>{profile.stats.winRate}</strong>
						<span>{t("profile.stats.winRate")}</span>
					</div>
				</section>

				<section className="profile-achievements-section">
					<h2>{t("profile.achievements.title")}</h2>
					<AchievementsGrid unlockedIds={profile.unlockedAchievements ?? []} />
				</section>
			</main>
		</div>
	);
}
