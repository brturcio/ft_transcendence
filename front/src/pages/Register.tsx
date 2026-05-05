import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import hideIcon from "../assets/register/hide.png";
import showIcon from "../assets/register/show.png";

const AUTH_TOKEN_KEY = "ft_auth_token";
const REFRESH_TOKEN_KEY = "ft_refresh_token";
const USER_STORAGE_KEY = "ft_user";
const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const REGISTER_ENDPOINT = `${API_BASE_URL}/auth/register`;

type RegisterProps = {
	onLogin: () => void;
};

const input =
	"bg-[rgba(14,22,48,0.8)] border border-[rgba(110,210,255,0.3)] rounded-xl px-[18px] py-[14px] text-[var(--txt-main)] font-['Rajdhani',sans-serif] text-base max-[620px]:text-base transition-all duration-300 placeholder:text-[rgba(142,170,199,0.6)] focus:outline-none focus:border-[var(--glow-cyan)] focus:bg-[rgba(14,22,48,0.95)] focus:shadow-[0_0_20px_rgba(0,229,255,0.25)] focus:placeholder:text-[rgba(142,170,199,0.3)]";
const buttonCreate =
	"bg-[linear-gradient(95deg,var(--glow-cyan),#42f5d7)] rounded-xl px-6 py-4 text-[#021318] font-['Orbitron',sans-serif] text-[0.95rem] font-bold uppercase tracking-[0.04rem] cursor-pointer transition-all duration-300 shadow-[0_0_5px_rgba(0,229,255,0.4)] hover:-translate-y-0.5 hover:shadow-[0_0_10px_rgba(0,229,255,0.6)] active:translate-y-0";
const googleButton =
	"flex items-center justify-center gap-2 w-full max-w-[220px] px-4 py-[14px] rounded-xl border border-[rgba(255,154,0,0.3)] bg-[rgba(14,22,48,0.6)] text-[var(--txt-soft)] font-['Rajdhani',sans-serif] text-[0.9rem] font-semibold uppercase tracking-[0.03rem] cursor-pointer transition-all duration-300 hover:border-[#ff9a00] hover:bg-[rgba(255,154,0,0.1)] hover:text-[#ff9a00] hover:shadow-[0_0_16px_rgba(255,154,0,0.2)] hover:-translate-y-0.5";
const formLink =
	"text-(--glow-cyan) font-bold no-underline transition-all duration-200 [text-shadow:0_0_10px_rgba(0,229,255,0.3)] hover:text-(--glow-pink) hover:[text-shadow:0_0_15px_rgba(255,62,136,0.4)]";

export default function Register({ onLogin }: RegisterProps) {
	const navigate = useNavigate();
	const { t } = useTranslation();
	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [acceptTerms, setAcceptTerms] = useState(false);
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const rules = [
		{
			label: t("register.passwordRules.minLength"),
			test: (value: string) => value.length >= 8,
		},
		{
			label: t("register.passwordRules.uppercase"),
			test: (value: string) => /[A-Z]/.test(value),
		},
		{
			label: t("register.passwordRules.number"),
			test: (value: string) => /[0-9]/.test(value),
		},
		{
			label: t("register.passwordRules.special"),
			test: (value: string) => /[!@#$%^&*(){}:";<>,.?]/.test(value),
		},
	];

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError("");
		if (password !== confirmPassword) {
			setError(t("register.errors.passwordMismatch"));
			return;
		}
		if (!acceptTerms) {
			setError(t("register.errors.mustAcceptTerms"));
			return;
		}
		setIsLoading(true);
		try {
			const response = await fetch(REGISTER_ENDPOINT, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email,
					username,
					password,
				}),
			});
			const data = await response.json();
			if (!response.ok) {
				setError(data.message ?? t("register.errors.couldNotCreate"));
				return;
			}
			if (!data.token || !data.refreshToken || !data.user) {
				setError(t("register.errors.server"));
				return;
			}
			localStorage.setItem(AUTH_TOKEN_KEY, data.token);
			localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
			localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
			onLogin();
			setEmail("");
			setUsername("");
			setPassword("");
			setConfirmPassword("");
			setAcceptTerms(false);
			navigate("/");
		} catch (error) {
			setError(t("register.errors.server"));
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="landing-page">

			<main className="min-h-screen flex items-center justify-center pt-14 px-6 pb-0 max-[620px]:pt-8 max-[620px]:px-2">
				<div className="w-full max-w-150 relative z-10">
					<div className="backdrop-blur border border-(--line-soft) rounded-[20px] py-12 px-10 shadow-[0_0_20px_rgba(0,229,255,0.1)] max-[620px]:py-8 max-[620px]:px-6">
						<h1 className="font-['Orbitron',sans-serif] text-[2.8rem] font-extrabold text-(--txt-main) text-center mb-10 uppercase tracking-[0.30rem] [text-shadow:0_0_10px_rgba(0,229,255,0.3)] max-[620px]:text-[2rem] max-[620px]:mb-7">
							{t("register.title")}
						</h1>
						<p className="text-[18px] text-white block mb-10 text-center -mt-5">{t("register.subtitle")}</p>

						<form className="flex flex-col gap-4 max-[620px]:gap-4.5" onSubmit={handleSubmit}>
							<div className="flex flex-col gap-2">
								<label
									className="font-['Rajdhani',sans-serif] text-[0.95rem] text-white font-semibold uppercase tracking-[0.05rem]"
									htmlFor="email"
								>
									{t("register.fields.email.label")}
								</label>
								<input
									className={input}
									id="email"
									type="email"
									placeholder={t("register.fields.email.placeholder")}
									value={email}
									onChange={(event) => setEmail(event.target.value)}
									required
								/>
							</div>

							<div className="flex flex-col gap-2">
								<label
									className="font-['Rajdhani',sans-serif] text-[0.95rem] text-white font-semibold uppercase tracking-[0.05rem]"
									htmlFor="username"
								>
									{t("register.fields.username.label")}
								</label>
								<input
									className={input}
									id="username"
									type="text"
									placeholder={t("register.fields.username.placeholder")}
									value={username}
									onChange={(event) => setUsername(event.target.value)}
									required
								/>
							</div>

							<div className="flex flex-col gap-2">
								<label
									className="font-['Rajdhani',sans-serif] text-[0.95rem] text-white font-semibold uppercase tracking-[0.05rem]"
									htmlFor="password"
								>
									{t("register.fields.password.label")}
								</label>

								<div className="relative flex items-center">
									<input
										className={`${input} w-full pr-12`}
										id="password"
										type={showPassword ? "text" : "password"}
										placeholder={t("register.fields.password.placeholder")}
										value={password}
										onChange={(event) => setPassword(event.target.value)}
										required
									/>

									<button
										type="button"
										className="absolute right-3 top-1/2 -translate-y-1/2 border-0 cursor-pointer p-0"
										onClick={() => setShowPassword(!showPassword)}
										aria-label={
											showPassword
												? t("register.fields.password.hide")
												: t("register.fields.password.show")
										}
									>
										<img
											src={showPassword ? showIcon : hideIcon}
											alt=""
											className="w-5.5 h-5.5 block"
										/>
									</button>
								</div>
							</div>

							<ul className="text-(--txt-soft) mt-3.5 mb-0 px-3.5 py-3 list-none border border-[rgba(0,255,255,0.15)] rounded-xl bg-[rgba(0,255,255,0.04)] text-[1rem]">
								{rules.map((rule) => (
									<li
										key={rule.label}
										className={`mb-0.75 ${rule.test(password) ? "text-[rgba(126,248,126,0.63)]" : "text-[rgba(142,170,199,0.6)]"}`}
									>
										{rule.test(password) ? "✓" : "✗"} {rule.label}
									</li>
								))}
							</ul>

							<div className="flex flex-col gap-2">
								<label
									className="font-['Rajdhani',sans-serif] text-[0.95rem] text-white font-semibold uppercase tracking-[0.05rem]"
									htmlFor="confirm-password"
								>
									{t("register.fields.confirmPassword.label")}
								</label>

								<div className="relative flex items-center">
									<input
										className={`${input} w-full pr-12`}
										id="confirm-password"
										type={showConfirmPassword ? "text" : "password"}
										placeholder={t("register.fields.confirmPassword.placeholder")}
										value={confirmPassword}
										onChange={(event) => setConfirmPassword(event.target.value)}
										required
									/>

									<button
										type="button"
										className="absolute right-3 top-1/2 -translate-y-1/2 border-0 cursor-pointer p-0"
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
										aria-label={
											showConfirmPassword
												? t("register.fields.confirmPassword.hide")
												: t("register.fields.confirmPassword.show")
										}
									>
										<img
											src={showConfirmPassword ? showIcon : hideIcon}
											alt=""
											className="w-5.5 h-5.5 block"
										/>
									</button>
								</div>
							</div>

							<div className="flex items-center justify-center gap-2">
								<input
									className="accent-(--glow-cyan)"
									id="accept-terms"
									type="checkbox"
									checked={acceptTerms}
									onChange={(event) => setAcceptTerms(event.target.checked)}
								/>
								<label
									className="font-['Rajdhani',sans-serif] text-[0.95rem] text-center"
									htmlFor="accept-terms"
								>
									{t("register.terms.agree")}{" "}
									<Link to="/terms" className={formLink}>
										{t("register.terms.tos")}
									</Link>{" "}
									{t("register.terms.and")}{" "}
									<Link to="/privacy" className={formLink}>
										{t("register.terms.privacy")}
									</Link>
								</label>
							</div>

							{error && (
								<p className="text-[#ff6b6b] font-['Rajdhani',sans-serif] text-[0.95rem] text-center -mt-2">
									{error}
								</p>
							)}

							<button className={buttonCreate} type="submit" disabled={isLoading}>
								{isLoading ? t("register.actions.creating") : t("register.actions.create")}
							</button>
						</form>

						<div className="flex items-center gap-3 my-7 font-['Rajdhani',sans-serif] text-[0.95rem] text-(--txt-soft) uppercase tracking-[0.04rem]">
							<span className="h-px flex-1 bg-[linear-gradient(90deg,transparent,var(--line-soft),transparent)]" />
							{t("register.oauth.divider")}
							<span className="h-px flex-1 bg-[linear-gradient(90deg,transparent,var(--line-soft),transparent)]" />
						</div>
						<div className="grid place-items-center gap-3 mb-6">
							<button type="button" className={googleButton}>
								{t("register.oauth.google")}
							</button>
						</div>
						<p className="text-center text-(--txt-soft) text-[0.95rem] mt-6 font-['Rajdhani',sans-serif]">
							{t("register.footer.question")}{" "}
							<Link to="/login" className={formLink}>
								{t("register.footer.login")}
							</Link>
						</p>
					</div>
				</div>
			</main>
		</div>
	);
}
