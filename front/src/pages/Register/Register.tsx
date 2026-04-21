import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import "./Register.css";

const AUTH_TOKEN_KEY = "ft_auth_token";

export default function Register() {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		localStorage.setItem(AUTH_TOKEN_KEY, "demo-session");
		setEmail("");
		setUsername("");
		setPassword("");
		navigate("/profile");
	};

	return (
		<div className="landing-page app-screen">
			<Navbar />

			<main className="register-page">
				<div className="register-container">
					<div className="register-box">
						<h1 className="register-title">Register</h1>

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
								<input
									id="password"
									type="password"
									placeholder="************"
									value={password}
									onChange={(event) => setPassword(event.target.value)}
									required
								/>
							</div>

							<button type="submit" className="btn-register">
								[ CREATE ACCOUNT ]
							</button>
						</form>

						{/* <div className="oauth-divider">
							<span>OR CONTINUE WITH</span>
						</div>

						<div className="oauth-buttons">
							<button type="button" className="btn-oauth btn-google">
								Google
							</button>
						</div> */}

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
