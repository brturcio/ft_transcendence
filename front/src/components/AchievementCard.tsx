import { type Achievement, getAllAchievements, ACHIEVEMENTS } from "../constants/achievements.ts";
import lockedBadgeImage from "../assets/achievements/hiden.gif";
import { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { useTranslation } from "react-i18next";
import { unlockAchievement } from "./Achievements.tsx";

const LOCKED_BADGE = lockedBadgeImage;
const activeNotifications = new Set<string>();
const STORAGE_KEY = "unlocked_achievements";

const getStoredAchievements = (): string[] => {
	try {
		const data = localStorage.getItem(STORAGE_KEY);
		return data ? JSON.parse(data) : [];
	} catch {
		return [];
	}
};

let notificationContainer: HTMLDivElement | null = null;

const notificationStyles = `
  @keyframes slideInLeft {
    from {
      transform: translateX(-400px) translateY(50px);
      opacity: 0;
    }
    to {
      transform: translateX(0) translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideOutLeft {
    from {
      transform: translateX(0) translateY(0);
      opacity: 1;
    }
    to {
      transform: translateX(-400px) translateY(50px);
      opacity: 0;
    }
  }

  .achievement-notification {
    animation: slideInLeft 0.5s ease-out;
  }

  .achievement-notification.exit {
    animation: slideOutLeft 0.5s ease-in forwards;
  }
`;

if (typeof document !== "undefined") {
	const styleSheet = document.createElement("style");
	styleSheet.textContent = notificationStyles;
	document.head.appendChild(styleSheet);
}

const AchievementNotificationItem = ({
	achievement,
	onExit,
}: {
	achievement: Achievement;
	onExit: () => void;
}) => {
	const { t } = useTranslation();
	const [isExiting, setIsExiting] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsExiting(true);
		}, 3000);

		const exitTimer = setTimeout(() => {
			onExit();
		}, 3500);

		return () => {
			clearTimeout(timer);
			clearTimeout(exitTimer);
		};
	}, [onExit]);

	return (
		<div
			className={`achievement-notification mb-4 flex min-w-80 items-center gap-4 rounded-lg border border-white/20 bg-[linear-gradient(135deg,#522cff_0%,#6b3fff_100%)] p-4 shadow-[0_8px_32px_rgba(82,44,255,0.3)] ${isExiting ? "exit" : ""}`}
		>
			<img
				src={achievement.image}
				alt={achievement.title}
				className="h-16 w-16 shrink-0 rounded-md"
			/>
			<div>
				<h4 className="mb-1 mt-0 text-white">
					🎉 {t("achievements.notification.unlocked")}
				</h4>
				<p className="mb-0 mt-1 text-[#e8e4ff]">
					<strong>{achievement.title}</strong>
				</p>
				<p className="mb-0 mt-1 text-[0.85rem] text-[#d0c9ff]">
					{achievement.description}
				</p>
			</div>
		</div>
	);
};

// Fonction pour afficher une notification d'achievement
export const showAchievementNotification = (achievementId: string) => {
	const achievement = ACHIEVEMENTS[achievementId];
	if (!achievement) {
		console.warn(`Achievement with id "${achievementId}" not found`);
		return;
	}

	if (activeNotifications.has(achievementId)) {
		return;
	}

	activeNotifications.add(achievementId);

	if (!notificationContainer) {
		notificationContainer = document.createElement("div");
		notificationContainer.id = "achievement-notifications";
		notificationContainer.className = "pointer-events-auto fixed bottom-5 left-5 z-[999999]";
		document.body.appendChild(notificationContainer);
	}

	const notificationWrapper = document.createElement("div");
	notificationContainer.appendChild(notificationWrapper);

	const root = ReactDOM.createRoot(notificationWrapper);
	root.render(
		<AchievementNotificationItem
			achievement={achievement}
			onExit={() => {
				root.unmount();
				notificationContainer?.removeChild(notificationWrapper);

				activeNotifications.delete(achievementId);
			}}
		/>
	);
};
// Exposer la fonction sur window pour accès via console
if (typeof window !== "undefined") {
	(window as any).showAchievementNotification = showAchievementNotification;
}

type AchievementCardProps = {
	achievement: Achievement;
	unlocked?: boolean;
};

// Composant pour afficher un achievement
const AchievementCard = ({ achievement, unlocked }: AchievementCardProps) => {
	const { t } = useTranslation();
	const isLocked = !unlocked;
	const displayImage = isLocked ? LOCKED_BADGE : achievement.image;
	const title = isLocked ? t("achievements.locked.title") : achievement.title;
	const description = isLocked ? t("achievements.locked.description") : achievement.description;

	const handleClick = () => {
		if (achievement.id === "curious" && isLocked) {
			unlockAchievement("curious");

			window.dispatchEvent(new Event("storage"));
		}
	};

	return (
		<div
			onClick={handleClick}
			className={`cursor-pointer rounded-lg border-2 p-4 text-center transition-all duration-300 ${isLocked ? "border-[#999] bg-[#522cffdc]" : "border-[#ccc] bg-transparent"}`}
		>
			<h3>{title}</h3>
			{displayImage && (
				<img
					src={displayImage}
					alt={isLocked ? t("achievements.locked.imageAlt") : achievement.title}
					className="mt-2 w-full rounded"
				/>
			)}
			<p className="text-[0.9rem] text-white">{description}</p>
		</div>
	);
};

export const AchievementsGrid = ({
	backendUnlockedIds = [],
}: {
	backendUnlockedIds?: string[];
}) => {
	const achievements = getAllAchievements();
	const [unlockedIds, setUnlockedIds] = useState<string[]>([]);

	useEffect(() => {
		const local = getStoredAchievements();
		const merged = Array.from(new Set([...local, ...backendUnlockedIds]));

		setUnlockedIds(merged);
	}, [backendUnlockedIds]);

	useEffect(() => {
		const update = () => {
			const local = getStoredAchievements();
			const merged = Array.from(new Set([...local, ...backendUnlockedIds]));
			setUnlockedIds(merged);
		};

		window.addEventListener("achievements_updated", update);
		return () => window.removeEventListener("achievements_updated", update);
	}, [backendUnlockedIds]);

	return (
		<div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4 p-4">
			{achievements.map((achievement) => (
				<AchievementCard
					key={achievement.id}
					achievement={achievement}
					unlocked={unlockedIds.includes(achievement.id)}
				/>
			))}
		</div>
	);
};
