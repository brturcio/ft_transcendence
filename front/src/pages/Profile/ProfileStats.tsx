import { useTranslation } from "react-i18next";
import type { ProfileStats as ProfileStatsData } from "./Profile.types";

type StatItem = {
	label: string;
	value: number | string;
};

const statCard = "bg-[rgba(9,18,40,0.72)] border border-[rgba(110,210,255,0.14)] rounded-[14px] p-4 text-center grid gap-1.5";

type ProfileStatsProps = {
	stats: ProfileStatsData;
};

export function ProfileStats({ stats }: ProfileStatsProps) {
	const { t } = useTranslation();
	const items: StatItem[] = [
		{ label: t("profile.stats.games"), value: stats.solo.gamesPlayed },
		{ label: t("profile.stats.bestScore"), value: stats.solo.bestScore },
		{ label: t("profile.stats.lastScore"), value: stats.solo.lastScore },
		{ label: t("profile.stats.linesCompleted"), value: stats.solo.linesCompleted },
		{ label: t("profile.stats.tetrises"), value: stats.solo.tetrises },
	];

	return (
		<section className="grid grid-cols-5 gap-3 max-[980px]:grid-cols-2 max-[720px]:grid-cols-1">
			{items.map((item) => (
				<div className={statCard} key={item.label}>
					<strong className="font-['Orbitron',sans-serif] text-2xl text-(--txt-main)">{item.value}</strong>
					<span className="text-(--txt-soft) text-[0.95rem]">{item.label}</span>
				</div>
			))}
		</section>
	);
}
