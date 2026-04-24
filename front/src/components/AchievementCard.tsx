import { type Achievement, getAllAchievements, ACHIEVEMENTS } from "../constants/achievements.ts";
import lockedBadgeImage from "../assets/achievements/hiden.gif";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

const LOCKED_BADGE = lockedBadgeImage;

// Conteneur pour les notifications
let notificationContainer: HTMLDivElement | null = null;

// Styles pour les animations
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

// Ajouter les styles au document
if (typeof document !== "undefined") {
	const styleSheet = document.createElement("style");
	styleSheet.textContent = notificationStyles;
	document.head.appendChild(styleSheet);
}

// Composant pour afficher une notification d'achievement
const AchievementNotificationItem = ({
	achievement,
	onExit,
}: {
	achievement: Achievement;
	onExit: () => void;
}) => {
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
			className={`achievement-notification ${isExiting ? "exit" : ""}`}
			style={{
				display: "flex",
				alignItems: "center",
				gap: "1rem",
				padding: "1rem",
				background: "linear-gradient(135deg, #522cff 0%, #6b3fff 100%)",
				borderRadius: "8px",
				minWidth: "320px",
				boxShadow: "0 8px 32px rgba(82, 44, 255, 0.3)",
				border: "1px solid rgba(255, 255, 255, 0.2)",
				marginBottom: "1rem",
			}}
		>
			<img
				src={achievement.image}
				alt={achievement.title}
				style={{
					width: "64px",
					height: "64px",
					borderRadius: "6px",
					flexShrink: 0,
				}}
			/>
			<div>
				<h4 style={{ margin: "0 0 0.25rem 0", color: "#ffffff" }}>
					🎉 Achievement Unlocked!
				</h4>
				<p style={{ margin: "0.25rem 0 0 0", color: "#e8e4ff" }}>
					<strong>{achievement.title}</strong>
				</p>
				<p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "#d0c9ff" }}>
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

	// Créer le conteneur s'il n'existe pas
	if (!notificationContainer) {
		notificationContainer = document.createElement("div");
		notificationContainer.id = "achievement-notifications";
		notificationContainer.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      z-index: 999999;
      pointer-events: auto;
    `;
		document.body.appendChild(notificationContainer);
	}

	// Créer un wrapper pour cette notification
	const notificationWrapper = document.createElement("div");
	notificationContainer.appendChild(notificationWrapper);

	// Rendu React
	const root = ReactDOM.createRoot(notificationWrapper);
	root.render(
		<AchievementNotificationItem
			achievement={achievement}
			onExit={() => {
				root.unmount();
				notificationContainer?.removeChild(notificationWrapper);
			}}
		/>
	);
};

// Import ReactDOM pour createRoot
import ReactDOM from "react-dom/client";

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
	const isLocked = !unlocked;
	const displayImage = isLocked ? LOCKED_BADGE : achievement.image;
	const title = isLocked ? "???" : achievement.title;
	const description = isLocked ? "???" : achievement.description;

	const handleClick = () => {
		if (achievement.id === "curious" && isLocked) {
			showAchievementNotification("curious");
		}
	};

	return (
		<div
			onClick={handleClick}
			style={{
				padding: "1rem",
				border: `2px solid ${isLocked ? "#999" : "#ccc"}`,
				borderRadius: "8px",
				textAlign: "center",
				opacity: unlocked ? 0 : 1,
				cursor: "pointer",
				transition: "all 0.3s",
				backgroundColor: isLocked ? "#522cffdc" : "transparent",
			}}
		>
			{<h3>{title}</h3>}
			{displayImage && (
				<img
					src={displayImage}
					alt={isLocked ? "Locked achievement" : achievement.title}
					style={{ width: "100%", marginTop: "0.5rem", borderRadius: "4px" }}
				/>
			)}
			{(
				<p style={{ fontSize: "0.9rem", color: "#ffffff" }}>
					{description}
				</p>
			)}
		</div>
	);
};

// Composant pour afficher tous les achievements
export const AchievementsGrid = ({
	unlockedIds = [],
}: {
	unlockedIds?: string[];
}) => {
	const achievements = getAllAchievements();

	return (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
				gap: "1rem",
				padding: "1rem",
			}}
		>
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

export default AchievementCard;
