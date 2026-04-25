import { Link, useNavigate } from "react-router-dom";
import type { FormEvent } from "react";
import Navbar from "../../components/Navbar/Navbar";
import "./Login.css";

const AUTH_TOKEN_KEY = "ft_auth_token";

export default function Login() {
	const navigate = useNavigate();

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
						<h1 className="register-title">Login</h1>

						<form className="register-form" onSubmit={handleSubmit}>
							<div className="form-group">
								<label htmlFor="email">Email</label>
								<input
									id="email"
									type="email"
									placeholder="your@email.com"
									required
								/>
							</div>

							<div className="form-group">
								<label htmlFor="password">Password</label>
								<input
									id="password"
									type="password"
									placeholder="Password"
									required
								/>
							</div>

							<button type="submit" className="btn-register">
								[ LOGIN ]
							</button>
						</form>

						<p className="register-footer">
							Need an account?{" "}
							<Link to="/register" className="link-login">
								Register
							</Link>
						</p>
					</div>
				</div>
			</main>
		</div>
	);
}
