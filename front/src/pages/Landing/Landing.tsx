import Navbar from "../../components/Navbar";
import Hero from "./components/Hero";

import "./Landing.css"

export default function Landing() {
	return (
		<div className="landing-page app-screen">
			<Navbar />

			<main className="landing__content">
				<Hero />
			</main>
			
		</div>
	);
}
