// import { Link, useNavigate } from "react-router-dom";
// import { useState, type FormEvent } from "react";
// import Navbar from "../components/Navbar";
// import { useTranslation } from "react-i18next";

// const AUTH_TOKEN_KEY = "ft_auth_token";
// const REFRESH_TOKEN_KEY = "ft_refresh_token";
// const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
// const LOGIN_ENDPOINT = `${API_BASE_URL}/auth/login`;

// const input = `bg-[rgba(14,22,48,0.8)] border border-[rgba(110,210,255,0.3)] rounded-[12px] px-[18px] py-[14px] text-[var(--txt-main)] font-['Rajdhani',sans-serif] text-base max-[620px]:text-base transition-all duration-300 ease-in-out
// 	placeholder:text-[rgba(142,170,199,0.6)] focus:outline-none focus:border-[var(--glow-cyan)] focus:bg-[rgba(14,22,48,0.95)] focus:shadow-[0_0_20px_rgba(0,229,255,0.25)] focus:placeholder:text-[rgba(142,170,199,0.3)]`;

// const Button = `bg-[linear-gradient(95deg,var(--glow-cyan),#42f5d7)] border-0 rounded-[12px] px-[24px] py-[16px] text-[#021318] font-['Orbitron',sans-serif] text-[0.95rem] font-bold uppercase tracking-[0.04rem]
// 	cursor-pointer mt-[12px] transition-all duration-300 ease-in-out shadow-[0_0_5px_rgba(0,229,255,0.4)] hover:-translate-y-[2px] hover:shadow-[0_0_10px_rgba(0,229,255,0.6)] active:translate-y-0`;

// export default function Login() {
// 	const navigate = useNavigate();
// 	const { t } = useTranslation();
// 	const [email, setEmail] = useState("");
// 	const [password, setPassword] = useState("");
// 	const [error, setError] = useState("");
// 	const [isLoading, setIsLoading] = useState(false);

// 	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
// 		event.preventDefault();

// 		setError("");
// 		setIsLoading(true);

// 		try {
// 			const response = await fetch(LOGIN_ENDPOINT, {
// 				method: "POST",
// 				headers: {
// 					"Content-Type": "application/json",
// 				},
// 				body: JSON.stringify({
// 					email,
// 					password,
// 				}),
// 			});

// 			const data = await response.json();

// 			if (!response.ok) {
// 				if (response.status === 401 || data?.error === "INVALID_CREDENTIALS") {
// 					setError(t("login.errors.invalidCredentials"));
// 					return;
// 				}

// 				if (response.status === 400 || data?.error === "VALIDATION_ERROR") {
// 					setError(t("login.errors.validation"));
// 					return;
// 				}

// 				setError(t("login.errors.server"));
// 				return;
// 			}

// 			localStorage.setItem(AUTH_TOKEN_KEY, data.token);
// 			localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);

// 			navigate("/landing");
// 		} catch (error) {
// 			if (error instanceof TypeError) {
// 				setError(t("login.errors.network"));
// 				return;
// 			}

// 			setError(t("login.errors.server"));
// 		} finally {
// 			setIsLoading(false);
// 		}
// 	};

// 	return (
// 		<div className="landing-page app-screen">
// 			<Navbar />

// 			<main className="min-h-[75vh] flex items-center justify-center pt-14 pb-0 px-6 max-[620px]:pt-8 max-[620px]:px-2">
// 				<div className="w-full max-w-150 relative z-10">
// 					<div className="backdrop-blur-sm border border-(--line-soft) shadow-[0_0_20px_rgba(0,229,255,0.1)] px-10 py-12 rounded-[20px] border-solid max-[620px]:px-6 max-[620px]:py-8">
// 						<h1 className="font-['Orbitron',sans-serif] text-[2.8rem] max-[620px]:text-[2rem] font-extrabold text-(--txt-main) text-center mb-10 max-[620px]:mb-7 uppercase tracking-[0.30rem] [text-shadow:0_0_10px_rgba(0,229,225,0.3)]">
// 							{t("login.title")}
// 						</h1>
// 						<form className="flex flex-col gap-4 max-[620px]:gap-4.5" onSubmit={handleSubmit}>
// 							<div className="flex flex-col gap-2">
// 								<label
// 									className="font-['Rajdhani',sans-serif] text-base text-white font-semibold uppercase tracking-[0.05rem]"
// 									htmlFor="email"
// 								>
// 									{t("login.fields.email.label")}
// 								</label>
// 								<input
// 									className={input}
// 									id="email"
// 									type="email"
// 									value={email}
// 									onChange={(event) => setEmail(event.target.value)}
// 									placeholder={t("login.fields.email.placeholder")}
// 									required
// 								/>
// 							</div>

// 							<div className="flex flex-col gap-2">
// 								<label
// 									className="font-['Rajdhani',sans-serif] text-base text-white font-semibold uppercase tracking-[0.05rem]"
// 									htmlFor="password"
// 								>
// 									{t("login.fields.password.label")}
// 								</label>
// 								<input
// 									className={input}
// 									id="password"
// 									type="password"
// 									value={password}
// 									onChange={(event) => setPassword(event.target.value)}
// 									placeholder={t("login.fields.password.placeholder")}
// 									required
// 								/>
// 							</div>

// 							{error && (
// 								<p className="text-[#ff6b6b] font-['Rajdhani',sans-serif] text-base text-center">
// 									{error}
// 								</p>
// 							)}

// 							<button type="submit" className={Button} disabled={isLoading}>
// 								{isLoading ? t("login.actions.loading") : t("login.actions.submit")}
// 							</button>
// 						</form>

// 						<p className="text-center text-(--txt-soft) text-base mt-6 font-['Rajdhani',sans-serif]">
// 							{t("login.footer.question")}{" "}
// 							<Link
// 								to="/register"
// 								className="text-(--glow-cyan) font-bold no-underline transition-all duration-200 ease-in-out [text-shadow:0_0_10px_rgba(0,229,255,0.3)] hover:text-(--glow-pink) hover:[text-shadow:0_0_15px_rgba(255,62,136,0.4)]"
// 							>
// 								{t("login.footer.register")}
// 							</Link>
// 						</p>
// 					</div>
// 				</div>
// 			</main>
// 		</div>
// 	);
// }

/*=========================================== FOR TESTING UP TO THE BACKENEND OK :) =================================================*/

import { Link, useNavigate } from "react-router-dom";
import type { FormEvent } from "react";
import Navbar from "../components/Navbar";
import { useTranslation } from "react-i18next";

const AUTH_TOKEN_KEY = "ft_auth_token";

export default function Login() {
	const navigate = useNavigate();
	const { t } = useTranslation();

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		localStorage.setItem(AUTH_TOKEN_KEY, "demo-session");
		navigate("/landing");
};

	return (
		<div className="landing-page app-screen">
			<Navbar />

			<main className="login-page">
				<div className="login-container">
					<div className="login-box">
						<h1 className="login-title">{t("login.title")}</h1>

						<form className="login-form" onSubmit={handleSubmit}>
							<div className="form-group">
								<label htmlFor="email">{t("login.fields.email.label")}</label>
								<input
									id="email"
									type="email"
									placeholder={t("login.fields.email.placeholder")}
									required
								/>
							</div>

							<div className="form-group">
								<label htmlFor="password">{t("login.fields.password.label")}</label>
								<input
									id="password"
									type="password"
									placeholder={t("login.fields.password.placeholder")}
									required
								/>
							</div>

							<button type="submit" className="btn-register">
								{t("login.actions.submit")}
							</button>
						</form>

						<p className="register-footer">
							{t("login.footer.question")}{" "}
							<Link to="/register" className="link-login">
								{t("login.footer.register")}
							</Link>
						</p>
					</div>
				</div>
			</main>
		</div>
	);
}
