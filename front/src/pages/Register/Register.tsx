import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../../components/Navbar/Navbar";
import hideIcon from "../../assets/register/hide.png";
import showIcon from "../../assets/register/show.png";
import "./Register.css";

const AUTH_TOKEN_KEY = "ft_auth_token";
const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const REGISTER_ENDPOINT = `${API_BASE_URL}/auth/register`;

export default function Register() {
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
			test: (value: string) => value.length >= 8
		},
		{
			label: t("register.passwordRules.uppercase"),
			test: (value: string) => /[A-Z]/.test(value)
		},
		{
			label: t("register.passwordRules.number"),
			test: (value: string) => /[0-9]/.test(value)
		},
		{
			label: t("register.passwordRules.special"),
			test: (value: string) => /[!@#$%^&*(){}:";<>,.?]/.test(value)
		}
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
			localStorage.setItem(AUTH_TOKEN_KEY, data.token);
			setEmail("");
			setUsername("");
			setPassword("");
			setConfirmPassword("");
			setAcceptTerms(false);
			navigate("/profile");
		} catch (error) {
			setError(t("register.errors.server"));
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="landing-page app-screen">
			<Navbar />

			<main className="register-page">
				<div className="register-container">
					<div className="register-box">
						<h1 className="register-title">{t("register.title")}</h1>
						<p className="join-transcendence">{t("register.subtitle")}</p>

						<form className="register-form" onSubmit={handleSubmit}>
							<div className="form-group">
								<label htmlFor="email">{t("register.fields.email.label")}</label>
								<input
									id="email"
									type="email"
									placeholder={t("register.fields.email.placeholder")}
									value={email}
									onChange={(event) => setEmail(event.target.value)}
									required
								/>
							</div>

							<div className="form-group">
								<label htmlFor="username">{t("register.fields.username.label")}</label>
								<input
									id="username"
									type="text"
									placeholder={t("register.fields.username.placeholder")}
									value={username}
									onChange={(event) => setUsername(event.target.value)}
									required
								/>
							</div>

							<div className="form-group">
								<label htmlFor="password">{t("register.fields.password.label")}</label>

								<div className="password-input">
									<input
										id="password"
										type={showPassword ? "text" : "password"}
										placeholder={t("register.fields.password.placeholder")}
										value={password}
										onChange={(event) => setPassword(event.target.value)}
										required
									/>

									<button
										type="button"
										className="password-toggle"
										onClick={() => setShowPassword(!showPassword)}
										aria-label={showPassword ? t("register.fields.password.hide") : t("register.fields.password.show")}>
										<img
											src={showPassword ? showIcon : hideIcon}
											alt=""
											className="password-toggle__icon" />
									</button>
								</div>
							</div>

							<ul className="password-rules">
								{rules.map((rule) => (
									<li
										key={rule.label}
										className={rule.test(password) ? "rule-valid" : "rule-invalid"}
									>
										{rule.test(password) ? "✓" : "✗"} {rule.label}
									</li>
								))}
							</ul>

							<div className="form-group">
								<label htmlFor="confirm-password">{t("register.fields.confirmPassword.label")}</label>

								<div className="password-input">
									<input
										id="confirm-password"
										type={showConfirmPassword ? "text" : "password"}
										placeholder={t("register.fields.confirmPassword.placeholder")}
										value={confirmPassword}
										onChange={(event) => setConfirmPassword(event.target.value)}
										required
									/>

									<button
										type="button"
										className="password-toggle"
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
										aria-label={showConfirmPassword ? t("register.fields.confirmPassword.hide") : t("register.fields.confirmPassword.show")}>
										<img
											src={showConfirmPassword ? showIcon : hideIcon}
											alt=""
											className="password-toggle__icon" />
									</button>
								</div>
							</div>

							<div className="accept-terms">
								<input
									id="accept-terms"
									type="checkbox"
									checked={acceptTerms}
									onChange={(event) => setAcceptTerms(event.target.checked)}
								/>
								<label htmlFor="accept-terms">
									{t("register.terms.agree")} {" "}
									<Link to="/terms" className="link-login">
										{t("register.terms.tos")}
									</Link>
									{" "}{t("register.terms.and")} {" "}
									<Link to="/privacy" className="link-login">
										{t("register.terms.privacy")}
									</Link>
								</label>
							</div>

							{error && <p className="form-error">{error}</p>}

							<button
								type="submit"
								className="btn-register"
								disabled={isLoading}>
								{isLoading ? t("register.actions.creating") : t("register.actions.create")}
							</button>
						</form>

						<div className="oauth-divider">
							<span>{t("register.oauth.divider")}</span>
						</div>
						<div className="oauth-buttons">
							<button type="button" className="btn-oauth btn-google">
								{t("register.oauth.google")}
							</button>
						</div>
						<p className="register-footer">
							{t("register.footer.question")} {" "}
							<Link to="/login" className="link-login">
								{t("register.footer.login")}
							</Link>
						</p>
					</div>
				</div>
			</main>
		</div>
	);
}
