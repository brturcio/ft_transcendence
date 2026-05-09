import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import type { ProfileData } from "./Profile.types";

const card = "bg-[rgba(9,18,40,0.72)] border border-[rgba(110,210,255,0.18)] rounded-[14px] p-5 shadow-none";
const label =
	"font-['Rajdhani',sans-serif] text-[0.95rem] text-[var(--txt-soft)] font-semibold uppercase tracking-[0.05rem]";
const field =
	"bg-[rgba(14,22,48,0.78)] border border-[rgba(110,210,255,0.24)] rounded-xl py-[14px] px-4 text-[var(--txt-main)] font-['Rajdhani',sans-serif] text-base resize-y focus:outline-none focus:border-[var(--glow-cyan)] focus:shadow-[0_0_18px_rgba(0,229,255,0.18)]";
const actionButton =
	"border-0 rounded-xl py-4 px-6 text-[#021318] font-['Orbitron',sans-serif] text-[0.95rem] font-bold uppercase tracking-[0.04rem] cursor-pointer transition-all duration-300 flex-1 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed";

type ProfileFormProps = {
	profile: ProfileData;
	isSaving: boolean;
	isDeleting: boolean;
	saveMessage: string;
	errorMessage: string;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	onDelete: () => void;
	onChange: (profile: ProfileData) => void;
};

export function ProfileForm({
	profile,
	isSaving,
	isDeleting,
	saveMessage,
	errorMessage,
	onSubmit,
	onDelete,
	onChange,
}: ProfileFormProps) {
	const { t } = useTranslation();

	return (
		<form className={`${card} grid gap-4`} onSubmit={onSubmit}>
			<div className="flex flex-col gap-2">
				<label className={label} htmlFor="profile-username">
					{t("profile.fields.username")}
				</label>
				<input
					className={field}
					id="profile-username"
					type="text"
					placeholder={t("profile.fields.username")}
					value={profile.username}
					onChange={(event) => onChange({ ...profile, username: event.target.value })}
				/>
			</div>

			<div className="flex flex-col gap-2">
				<label className={label} htmlFor="profile-bio">
					{t("profile.fields.bio")}
				</label>
				<textarea
					className={field}
					id="profile-bio"
					rows={4}
					placeholder={t("profile.fields.bioPlaceholder")}
					value={profile.bio}
					onChange={(event) => onChange({ ...profile, bio: event.target.value })}
				/>
			</div>

			<div className="flex justify-center p-2.5">
				<button
					type="submit"
					className={`${actionButton} mr-2.5 bg-[linear-gradient(95deg,var(--glow-cyan),#42f5d7)] shadow-[0_0_5px_rgba(0,229,255,0.4)] hover:-translate-y-0.5 hover:shadow-[0_0_10px_rgba(0,229,255,0.6)]`}
					disabled={isSaving || isDeleting}
				>
					{isSaving ? t("profile.actions.saving") : t("profile.actions.save")}
				</button>

				<button
					type="button"
					className={`${actionButton} bg-[linear-gradient(95deg,#ff4d4f,#ff1744)] shadow-[0_0_15px_rgba(255,62,136,0.4)] hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(255,62,136,0.4)]`}
					onClick={onDelete}
					disabled={isSaving || isDeleting}
				>
					{isDeleting ? t("profile.actions.deleting") : t("profile.actions.delete")}
				</button>
			</div>

			{saveMessage && <p>{saveMessage}</p>}
			{errorMessage && <p>{errorMessage}</p>}
		</form>
	);
}
