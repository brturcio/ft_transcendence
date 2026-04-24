import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import "./Register.css";

const AUTH_TOKEN_KEY = "ft_auth_token";
const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const REGISTER_ENDPOINT = `${API_BASE_URL}/auth/register`;

export default function Register() {
	const navigate = useNavigate();
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
			label : "At least 8 characters",
			test: (value: string) => value.length >= 8
		},
		{
			label : "At least one Uppercase letter",
			test: (value: string) => /[A-Z]/.test(value)
		},
		{
			label : "At least one number",
			test: (value: string) => /[0-9]/.test(value)
		},
		{
			label : "At least one special characters",
			test: (value: string) => /[!@#$%^&*(){}:";<>,.?]/.test(value)
		}
	];

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError("");
		if (password !== confirmPassword) {
			setError("Passwords do not match.");
			return;
		}
		if (!acceptTerms) {
			setError("You must accept the Terms of Service and Privacy Policy.");
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
				setError(data.message ?? "Could not create account.");
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
			setError("Server error. Please try again later.");
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
						<h1 className="register-title">Register</h1>
						<p className="join-transcendence">
							Join the ft_transcendence community
						</p>

						<form className="register-form" onSubmit={handleSubmit}>
							<div className="form-group">
								<label htmlFor="email">Email</label>
								<input
									id="email"
									type="email"
									placeholder="your@email.com"
									value={email}
									onChange={(event) => setEmail(event.target.value)}
									required
								/>
							</div>

							<div className="form-group">
								<label htmlFor="username">Username</label>
								<input
									id="username"
									type="text"
									placeholder="your_username"
									value={username}
									onChange={(event) => setUsername(event.target.value)}
									required
								/>
							</div>

							<div className="form-group">
								<label htmlFor="password">Password</label>

								<div className="password-input">
									<input
										id="password"
										type={showPassword ? "text" : "password"}
										placeholder="Password"
										value={password}
										onChange={(event) => setPassword(event.target.value)}
										required
									/>

									<button
										type="button"
										className="password-toggle"
										onClick={() => setShowPassword(!showPassword)}
										aria-label={showPassword ? "Hide password" : "Show password"}>
											<img
												src={showPassword ? "/show.png" : "/hide.png"}
												alt=""
												className="password-toggle__icon"/>
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
								<label htmlFor="confirm-password">Confirm Password</label>

								<div className="password-input">
									<input
										id="confirm-password"
										type={showConfirmPassword ? "text" : "password"}
										placeholder="Password"
										value={confirmPassword}
										onChange={(event) => setConfirmPassword(event.target.value)}
										required
									/>

									<button
										type="button"
										className="password-toggle"
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
										aria-label={showConfirmPassword ? "Hide password" : "Show password"}>
											<img
												src={showConfirmPassword ? "/show.png" : "/hide.png"}
												alt=""
												className="password-toggle__icon"/>
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
									I agree to the{" "}
									<Link to="/terms" className="link-login">
										Terms of Service
									</Link>
									{" "}and{" "}
									<Link to="/privacy" className="link-login">
										Privacy Policy
									</Link>
								</label>
							</div>

							{error && <p className="form-error">{error}</p>}

							<button
								type="submit"
								className="btn-register"
								disabled={isLoading}>
								{isLoading ? "[ CREATING ACCOUNT... ]" : "[ CREATE ACCOUNT ]"}
							</button>
						</form>

						<div className="oauth-divider">
							<span>OR CONTINUE WITH</span>
						</div>
						<div className="oauth-buttons">
							<button type="button" className="btn-oauth btn-google">
								Google
							</button>
						</div>
						<p className="register-footer">
							Already have an account?{" "}
							<Link to="/login" className="link-login">
								Login
							</Link>
						</p>
					</div>
				</div>
			</main>
		</div>
	);
}
