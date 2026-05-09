import { useTranslation } from "react-i18next";
import type { ProfileData } from "./Profile.types";
import defaultImgAvatar from "../../assets/placeholdeUser/person.png";

const card = "bg-[rgba(9,18,40,0.72)] border border-[rgba(110,210,255,0.18)] rounded-[14px] p-5 shadow-none";
const actionButton =
	"border rounded-xl py-2 px-2 text-[#021318] text-[0.72rem] font-['Orbitron',sans-serif]  uppercase  tracking-[0.04rem] cursor-pointer transition-all duration-300 active:translate-y-0 disabled:opacity-90 disabled:cursor-not-allowed";

type ProfileHeaderProps = {
	profile: ProfileData;
	isAvatarUploading: boolean;
	onAvatarChange: (file: File) => void;
	onAvatarDelete: () => void;
};

export function ProfileHeader({ profile, isAvatarUploading, onAvatarChange, onAvatarDelete }: ProfileHeaderProps) {
	const { t } = useTranslation();

	return (
		<section className={`${card} flex flex-col items-center gap-4.5 max-w-full max-[720px]:items-start`}>
			<div className="grid gap-4 justify-items-center justify-center">
				<img
					className="w-50 h-50 rounded-full  object-cover bg-[rgba(255,255,255,0.12)]"
					src={profile.avatarUrl ?? defaultImgAvatar}
					alt={profile.username || t("profile.fallback.username")}
				/>
				<div className="flex items-center justify-center gap-4">
				<label className={`${actionButton} bg-[linear-gradient(95deg,var(--glow-cyan),#42f5d7)] shadow-[0_0_5px_rgba(0,229,255,0.4)] hover:-translate-y-0.5 hover:shadow-[0_0_10px_rgba(0,229,255,0.6)]`}>
					{isAvatarUploading ? t("profile.actions.uploadingAvatar") : t("profile.actions.changeAvatar")}
					<input
						className="hidden"
						type="file"
						accept="image/png,image/jpeg,image/webp"
						disabled={isAvatarUploading}
						onChange={(event) => {
							const file = event.target.files?.[0];
							if (file) {
								onAvatarChange(file);
							}
							event.target.value = "";
						}}
					/>
				</label>
				{profile.avatarUrl && (
					<button
						className={`${actionButton} bg-[linear-gradient(95deg,var(--glow-cyan),#42f5d7)] shadow-[0_0_5px_rgba(0,229,255,0.4)] hover:-translate-y-0.5 hover:shadow-[0_0_10px_rgba(0,229,255,0.6)]`}
						type="button"
						disabled={isAvatarUploading}
						onClick={onAvatarDelete}
					>
						{t("profile.actions.removeAvatar")}
					</button>
				)}
				</div>
			</div>
			<div className="grid gap-1 place-items-center text-center">
				<h2 className="uppercase font-['Orbitron',sans-serif] text-[2rem] text-(--txt-main) m-0">
					{profile.username || t("profile.fallback.username")}
				</h2>
				<p className="text-(--txt-soft) text-[1.5rem]">
					{profile.email || t("profile.fallback.email")}
				</p>
				<span className="text-(--txt-soft) text-[1.5rem]">
					{t("profile.summary.rankPrefix")}
					{profile.rank}
				</span>
			</div>
		</section>
	);
}
