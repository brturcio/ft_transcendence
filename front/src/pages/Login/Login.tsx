// import { Link, useNavigate } from "react-router-dom";
// import { useState, type FormEvent } from "react";
// import Navbar from "../../components/Navbar/Navbar";
// import { useTranslation } from "react-i18next";
// import "./Login.css";

// const AUTH_TOKEN_KEY = "ft_auth_token";
// const REFRESH_TOKEN_KEY = "ft_refresh_token";
// const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
// const LOGIN_ENDPOINT = `${API_BASE_URL}/auth/login`;

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

// 			<main className="login-page">
// 				<div className="login-container">
// 					<div className="login-box">
// 						<h1 className="login-title">{t("login.title")}</h1>

// 						<form className="login-form" onSubmit={handleSubmit}>
// 							<div className="login-form-group">
// 								<label htmlFor="email">{t("login.fields.email.label")}</label>
// 								<input
// 									id="email"
// 									type="email"
// 									value={email}
// 									onChange={(event) => setEmail(event.target.value)}
// 									placeholder={t("login.fields.email.placeholder")}
// 									required
// 								/>
// 							</div>

// 							<div className="login-form-group">
// 								<label htmlFor="password">{t("login.fields.password.label")}</label>
// 								<input
// 									id="password"
// 									type="password"
// 									value={password}
// 									onChange={(event) => setPassword(event.target.value)}
// 									placeholder={t("login.fields.password.placeholder")}
// 									required
// 								/>
// 							</div>

// 							{error && <p className="login-error">{error}</p>}

// 							<button type="submit"
// 								className="login-submit-btn"
// 								disabled={isLoading}>
// 								{isLoading ? t("login.actions.loading") : t("login.actions.submit")}
// 							</button>
// 						</form>

// 						<p className="login-footer">
// 							{t("login.footer.question")}{" "}
// 							<Link to="/register" className="login-link">
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
import Navbar from "../../components/Navbar/Navbar";
import { useTranslation } from "react-i18next";
import "./Login.css";

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
