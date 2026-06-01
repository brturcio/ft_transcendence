import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AchievementsGrid } from "../../components/AchievementCard.tsx";
import { unlockAchievement } from "../../components/Achievements.tsx";
import { ProfileForm } from "./ProfileForm.tsx";
import { ProfileHeader } from "./ProfileHeader.tsx";
import { ProfileStats } from "./ProfileStats.tsx";
import type { ProfileData } from "./Profile.types.ts";
import { API_BASE_URL } from "../../config/network.ts";

const card = "bg-[rgba(9,18,40,0.72)] border border-[rgba(110,210,255,0.18)] rounded-[14px] p-5 shadow-none";

const AUTH_TOKEN_KEY = "ft_auth_token";
const PROFILE_ENDPOINT = `${API_BASE_URL}/users/me`;
const AVATAR_ENDPOINT = `${API_BASE_URL}/users/me/avatar`;
const ACHIEVEMENTS_ENDPOINT = `${API_BASE_URL}/achievements/me`;

type BackendProfile = {
	username?: string;
	userName?: string;
	login?: string;
	email?: string;
	avatarUrl?: string | null;
	bio?: string;
	rank?: number | string;
	stats?: {
		solo?: {
			gamesPlayed?: number;
			lastScore?: number;
			bestScore?: number;
			linesCompleted?: number;
			tetrises?: number;
		};
		multi?: {
			gamesPlayed?: number;
			wins?: number;
			losses?: number;
			winRate?: number | string;
			linesSent?: number;
			linesReceived?: number;
		};
		tournaments?: {
			played?: number;
			won?: number;
		};
		gamification?: {
			xp?: number;
			level?: number;
		};
	};
	unlockedAchievements?: string[];
};

type BackendAchievements = {
	achievements?: string[];
};

type AvatarUploadResponse = {
	avatarUrl?: string | null;
};

const DEFAULT_PROFILE: ProfileData = {
	username: "",
	email: "",
	avatarUrl: null,
	bio: "",
	rank: "-",
	stats: {
		solo: {
			gamesPlayed: 0,
			lastScore: 0,
			bestScore: 0,
			linesCompleted: 0,
			tetrises: 0,
		},
		multi: {
			gamesPlayed: 0,
			wins: 0,
			losses: 0,
			winRate: "0%",
			linesSent: 0,
			linesReceived: 0,
		},
		tournaments: {
			played: 0,
			won: 0,
		},
		gamification: {
			xp: 0,
			level: 1,
		},
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
	return {
		username: data.username ?? data.userName ?? data.login ?? "",
		email: data.email ?? "",
		avatarUrl: data.avatarUrl ?? null,
		bio: data.bio ?? "",
		rank: data.rank !== undefined ? String(data.rank) : "-",
		stats: {
			solo: {
				gamesPlayed: data.stats?.solo?.gamesPlayed ?? 0,
				lastScore: data.stats?.solo?.lastScore ?? 0,
				bestScore: data.stats?.solo?.bestScore ?? 0,
				linesCompleted: data.stats?.solo?.linesCompleted ?? 0,
				tetrises: data.stats?.solo?.tetrises ?? 0,
			},
			multi: {
				gamesPlayed: data.stats?.multi?.gamesPlayed ?? 0,
				wins: data.stats?.multi?.wins ?? 0,
				losses: data.stats?.multi?.losses ?? 0,
				winRate: formatWinRate(data.stats?.multi?.winRate),
				linesSent: data.stats?.multi?.linesSent ?? 0,
				linesReceived: data.stats?.multi?.linesReceived ?? 0,
			},
			tournaments: {
				played: data.stats?.tournaments?.played ?? 0,
				won: data.stats?.tournaments?.won ?? 0,
			},
			gamification: {
				xp: data.stats?.gamification?.xp ?? 0,
				level: data.stats?.gamification?.level ?? 1,
			},
		},
		unlockedAchievements: data.unlockedAchievements ?? [],
	};
}

type ProfileProps = {
	onLogout: () => void;
};

export default function Profile({ onLogout }: ProfileProps) {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
	const [savedUsername, setSavedUsername] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isAvatarUploading, setIsAvatarUploading] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [saveMessage, setSaveMessage] = useState("");

	const getBackendError = async (response: Response) => {
		try {
			const data = await response.json();
			return typeof data?.error === "string" ? data.error : undefined;
		} catch {
			return undefined;
		}
	};

	const handleInvalidSession = () => {
		onLogout();
		navigate("/login", { replace: true });
	};

	const refreshAchievements = async () => {
		const token = localStorage.getItem(AUTH_TOKEN_KEY);
		if (!token) {
			return;
		}
		const achievementsResponse = await fetch(ACHIEVEMENTS_ENDPOINT, {
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
		});
		if (!achievementsResponse.ok) {
			return;
		}
		const achievementsData: BackendAchievements = await achievementsResponse.json();
		setProfile((current) => ({
			...current,
			unlockedAchievements: achievementsData.achievements ?? [],
		}));
	};

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
					const backendError = await getBackendError(response);
					if (
						backendError === "MISSING_TOKEN" ||
						backendError === "INVALID_TOKEN" ||
						backendError === "USER_NOT_FOUND"
					) {
						handleInvalidSession();
						return;
					}
					setErrorMessage(t("profile.messages.loadError"));
					return;
				}

				const data: BackendProfile = await response.json();
				const mappedProfile = mapBackendProfile(data);
				setSavedUsername(mappedProfile.username);
				const achievementsResponse = await fetch(ACHIEVEMENTS_ENDPOINT, {
					headers: {
						"Content-Type": "application/json",
						...(token ? { Authorization: `Bearer ${token}` } : {}),
					},
					signal: controller.signal,
				});
				if (achievementsResponse.ok) {
					const achievementsData: BackendAchievements = await achievementsResponse.json();
					setProfile({
						...mappedProfile,
						unlockedAchievements: achievementsData.achievements ?? [],
					});
					return;
				}
				setProfile(mappedProfile);
			} catch (error) {
				if (error instanceof DOMException && error.name === "AbortError") {
					return;
				}
				if (error instanceof TypeError) {
					setErrorMessage(t("profile.messages.networkError"));
					return;
				}
				setErrorMessage(t("profile.messages.loadError"));
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
				const backendError = await getBackendError(response);
				if (
					backendError === "MISSING_TOKEN" ||
					backendError === "INVALID_TOKEN" ||
					backendError === "USER_NOT_FOUND"
				) {
					handleInvalidSession();
					return;
				}
				if (backendError === "VALIDATION_ERROR") {
					setErrorMessage(t("profile.messages.validationError"));
					return;
				}
				if (backendError === "USERNAME_TAKEN") {
					setErrorMessage(t("profile.messages.usernameTaken"));
					return;
				}
				setErrorMessage(t("profile.messages.saveError"));
				return;
			}
			const data: BackendProfile = await response.json();
			const updatedProfile = mapBackendProfile(data);
			setProfile((current) => ({
				...updatedProfile,
				unlockedAchievements: current.unlockedAchievements ?? [],
			}));
			setSaveMessage(t("profile.messages.updated"));
			if (savedUsername !== "" && savedUsername !== updatedProfile.username) {
				const unlocked = await unlockAchievement("change_nickname");
				if (unlocked) {
					await refreshAchievements();
				}
			}
			setSavedUsername(updatedProfile.username);
		} catch (error) {
			if (error instanceof TypeError) {
				setErrorMessage(t("profile.messages.networkError"));
				return;
			}
			setErrorMessage(t("profile.messages.saveError"));
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
				const backendError = await getBackendError(response);
				if (
					backendError === "MISSING_TOKEN" ||
					backendError === "INVALID_TOKEN" ||
					backendError === "USER_NOT_FOUND"
				) {
					handleInvalidSession();
					return;
				}
				setErrorMessage(t("profile.messages.deleteError"));
				return;
			}
			onLogout();
			navigate("/login", { replace: true });
		} catch (error) {
			if (error instanceof TypeError) {
				setErrorMessage(t("profile.messages.networkError"));
				return;
			}
			setErrorMessage(t("profile.messages.deleteError"));
		} finally {
			setIsDeleting(false);
		}
	};

	const handleAvatarChange = async (file: File) => {
		const token = localStorage.getItem(AUTH_TOKEN_KEY);
		if (!token) {
			handleInvalidSession();
			return;
		}

		setIsAvatarUploading(true);
		setSaveMessage("");
		setErrorMessage("");

		try {
			const formData = new FormData();
			formData.append("avatar", file);

			const response = await fetch(AVATAR_ENDPOINT, {
				method: "PATCH",
				headers: {
					Authorization: `Bearer ${token}`,
				},
				body: formData,
			});

			if (!response.ok) {
				const backendError = await getBackendError(response);
				if (
					backendError === "MISSING_TOKEN" ||
					backendError === "INVALID_TOKEN" ||
					backendError === "USER_NOT_FOUND"
				) {
					handleInvalidSession();
					return;
				}
				if (backendError === "AVATAR_TOO_LARGE") {
					setErrorMessage(t("profile.messages.avatarTooLarge"));
					return;
				}
				if (backendError === "INVALID_AVATAR_TYPE") {
					setErrorMessage(t("profile.messages.invalidAvatarType"));
					return;
				}
				setErrorMessage(t("profile.messages.avatarUploadError"));
				return;
			}

			const data: AvatarUploadResponse = await response.json();
			if (data.avatarUrl) {
				setProfile((current) => ({
					...current,
					avatarUrl: data.avatarUrl ?? null,
				}));
				setSaveMessage(t("profile.messages.avatarUpdated"));
			}
		} catch (error) {
			if (error instanceof TypeError) {
				setErrorMessage(t("profile.messages.networkError"));
				return;
			}
			setErrorMessage(t("profile.messages.avatarUploadError"));
		} finally {
			setIsAvatarUploading(false);
		}
	};

	const handleAvatarDelete = async () => {
		const token = localStorage.getItem(AUTH_TOKEN_KEY);
		if (!token) {
			handleInvalidSession();
			return;
		}

		setIsAvatarUploading(true);
		setSaveMessage("");
		setErrorMessage("");

		try {
			const response = await fetch(AVATAR_ENDPOINT, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				const backendError = await getBackendError(response);
				if (
					backendError === "MISSING_TOKEN" ||
					backendError === "INVALID_TOKEN" ||
					backendError === "USER_NOT_FOUND"
				) {
					handleInvalidSession();
					return;
				}
				setErrorMessage(t("profile.messages.avatarDeleteError"));
				return;
			}

			setProfile((current) => ({
				...current,
				avatarUrl: null,
			}));
			setSaveMessage(t("profile.messages.avatarRemoved"));
		} catch (error) {
			if (error instanceof TypeError) {
				setErrorMessage(t("profile.messages.networkError"));
				return;
			}
			setErrorMessage(t("profile.messages.avatarDeleteError"));
		} finally {
			setIsAvatarUploading(false);
		}
	};

	return (
		<div className="profile-page ">
			<main className="pt-14 px-6 pb-0 flex flex-col max-w-215 mx-auto gap-5 max-[980px]:pt-8 max-[980px]:px-2">
				<section className="max-w-160 grid gap-2.5">
					<h1 className="font-['Orbitron',sans-serif] text-[clamp(1.9rem,4vw,3rem)] uppercase text-shadow:none">
						{t("profile.title")}
					</h1>
				</section>

				<ProfileHeader
					profile={profile}
					isAvatarUploading={isAvatarUploading}
					onAvatarChange={handleAvatarChange}
					onAvatarDelete={handleAvatarDelete}
				/>

				<ProfileForm
					profile={profile}
					isSaving={isSaving}
					isDeleting={isDeleting}
					saveMessage={saveMessage}
					errorMessage={errorMessage}
					onSubmit={handleSave}
					onDelete={handleDeleteAccount}
					onChange={setProfile}
				/>

				{isLoading && <p>{t("profile.messages.loading")}</p>}

				<ProfileStats stats={profile.stats} />

				<section className={card}>
					<h2 className="font-['Orbitron',sans-serif] text-(--txt-main) mb-4">
						{t("profile.achievements.title")}
					</h2>
					<AchievementsGrid
						backendUnlockedIds={profile.unlockedAchievements ?? []}
						onAchievementUnlocked={refreshAchievements}
					/>
				</section>
			</main>
		</div>
	);
}
