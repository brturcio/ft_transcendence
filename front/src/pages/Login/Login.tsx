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

			<main className="register-page">
				<div className="register-container">
					<div className="register-box">
						<h1 className="register-title">{t("login.title")}</h1>

						<form className="register-form" onSubmit={handleSubmit}>
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
