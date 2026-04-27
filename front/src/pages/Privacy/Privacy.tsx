import Navbar from "../../components/Navbar/Navbar";
import { useTranslation } from "react-i18next";
import "./Privacy.css";

export default function Privacy() {
	const { t } = useTranslation();

	return (
		<div className="privacy-page app-screen">
			<Navbar />

			<main className="privacy">
				<section className="privacy__card">
					<header className="privacy__header">
						<span className="privacy__eyebrow">Transcendence</span>
						<h1>{t("privacy.title")}</h1>
						<h2>
							{t("privacy.intro")}
						</h2>
					</header>

					<section className="privacy__section">
						<h2>{t("privacy.sections.dataCollected.title")}</h2>
						<p>{t("privacy.sections.dataCollected.intro")}</p>
						<ul>
							<li>{t("privacy.sections.dataCollected.items.0")}</li>
							<li>{t("privacy.sections.dataCollected.items.1")}</li>
							<li>{t("privacy.sections.dataCollected.items.2")}</li>
						</ul>
					</section>

					<section className="privacy__section">
						<h2>{t("privacy.sections.dataUsage.title")}</h2>
						<p>{t("privacy.sections.dataUsage.intro")}</p>
						<ul>
							<li>{t("privacy.sections.dataUsage.items.0")}</li>
							<li>{t("privacy.sections.dataUsage.items.1")}</li>
							<li>{t("privacy.sections.dataUsage.items.2")}</li>
							<li>{t("privacy.sections.dataUsage.items.3")}</li>
							<li>{t("privacy.sections.dataUsage.items.4")}</li>
						</ul>
					</section>

					<section className="privacy__section">
						<h2>{t("privacy.sections.sharing.title")}</h2>
						<p>
							{t("privacy.sections.sharing.content")}
						</p>
					</section>

					<section className="privacy__section">
						<h2>{t("privacy.sections.storage.title")}</h2>
						<p>
							{t("privacy.sections.storage.paragraphs.0")}
						</p>
						<p>
							{t("privacy.sections.storage.paragraphs.1")}
						</p>
					</section>

					<section className="privacy__section">
						<h2>{t("privacy.sections.retention.title")}</h2>
						<p>
							{t("privacy.sections.retention.content")}
						</p>
					</section>

					<section className="privacy__section">
						<h2>{t("privacy.sections.rights.title")}</h2>
						<p>{t("privacy.sections.rights.intro")}</p>
						<ul>
							<li>{t("privacy.sections.rights.items.0")}</li>
							<li>{t("privacy.sections.rights.items.1")}</li>
							<li>{t("privacy.sections.rights.items.2")}</li>
							<li>{t("privacy.sections.rights.items.3")}</li>
						</ul>
					</section>

					<section className="privacy__section">
						<h2>{t("privacy.sections.cookies.title")}</h2>
						<p>
							{t("privacy.sections.cookies.content")}
						</p>
					</section>

					<section className="privacy__section">
						<h2>{t("privacy.sections.changes.title")}</h2>
						<p>
							{t("privacy.sections.changes.content")}
						</p>
					</section>

					<section className="privacy__section privacy__section--contact">
						<h2>{t("privacy.sections.contact.title")}</h2>
						<p>
							{t("privacy.sections.contact.content")}
						</p>
					</section>
				</section>
			</main>
		</div>
	);
}
