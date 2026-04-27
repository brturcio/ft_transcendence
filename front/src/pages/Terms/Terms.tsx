import Navbar from "../../components/Navbar/Navbar";
import { useTranslation } from "react-i18next";
import "./Terms.css";

export default function Terms() {
	const { t } = useTranslation();

	return (
		<div className="terms-page app-screen">
			<Navbar />

			<main className="terms">
				<section className="terms__card">
					<header className="terms__header">
						<span className="terms__eyebrow">Transcendence</span>
						<h1>{t("terms.title")}</h1>
					</header>

					<section className="terms__section">
						<h2>{t("terms.sections.service.title")}</h2>
						<p>{t("terms.sections.service.paragraphs.0")}</p>
						<p>{t("terms.sections.service.paragraphs.1")}</p>
					</section>

					<section className="terms__section">
						<h2>{t("terms.sections.acceptance.title")}</h2>
						<p>{t("terms.sections.acceptance.paragraphs.0")}</p>
						<p>{t("terms.sections.acceptance.paragraphs.1")}</p>
					</section>

					<section className="terms__section">
						<h2>{t("terms.sections.account.title")}</h2>
						<p>{t("terms.sections.account.intro")}</p>
						<ul>
							<li>{t("terms.sections.account.items.0")}</li>
							<li>{t("terms.sections.account.items.1")}</li>
							<li>{t("terms.sections.account.items.2")}</li>
						</ul>
						<p>{t("terms.sections.account.outro")}</p>
					</section>

					<section className="terms__section">
						<h2>{t("terms.sections.usageRules.title")}</h2>
						<p>{t("terms.sections.usageRules.intro")}</p>
						<ul>
							<li>{t("terms.sections.usageRules.items.0")}</li>
							<li>{t("terms.sections.usageRules.items.1")}</li>
							<li>{t("terms.sections.usageRules.items.2")}</li>
							<li>{t("terms.sections.usageRules.items.3")}</li>
							<li>{t("terms.sections.usageRules.items.4")}</li>
						</ul>
					</section>

					<section className="terms__section">
						<h2>{t("terms.sections.chat.title")}</h2>
						<p>{t("terms.sections.chat.paragraphs.0")}</p>
						<p>{t("terms.sections.chat.paragraphs.1")}</p>
					</section>

					<section className="terms__section">
						<h2>{t("terms.sections.competitions.title")}</h2>
						<p>{t("terms.sections.competitions.intro")}</p>
						<ul>
							<li>{t("terms.sections.competitions.items.0")}</li>
							<li>{t("terms.sections.competitions.items.1")}</li>
						</ul>
						<p>{t("terms.sections.competitions.outro")}</p>
					</section>

					<section className="terms__section">
						<h2>{t("terms.sections.ip.title")}</h2>
						<p>{t("terms.sections.ip.paragraphs.0")}</p>
						<p>{t("terms.sections.ip.paragraphs.1")}</p>
					</section>

					<section className="terms__section">
						<h2>{t("terms.sections.personalData.title")}</h2>
						<p>{t("terms.sections.personalData.paragraphs.0")}</p>
						<p>{t("terms.sections.personalData.paragraphs.1")}</p>
					</section>

					<section className="terms__section">
						<h2>{t("terms.sections.liability.title")}</h2>
						<p>{t("terms.sections.liability.intro")}</p>
						<ul>
							<li>{t("terms.sections.liability.items.0")}</li>
							<li>{t("terms.sections.liability.items.1")}</li>
							<li>{t("terms.sections.liability.items.2")}</li>
							<li>{t("terms.sections.liability.items.3")}</li>
						</ul>
					</section>

					<section className="terms__section">
						<h2>{t("terms.sections.security.title")}</h2>
						<p>{t("terms.sections.security.paragraphs.0")}</p>
						<p>{t("terms.sections.security.paragraphs.1")}</p>
					</section>

					<section className="terms__section">
						<h2>{t("terms.sections.updates.title")}</h2>
						<p>{t("terms.sections.updates.paragraphs.0")}</p>
						<p>{t("terms.sections.updates.paragraphs.1")}</p>
					</section>

					<section className="terms__section">
						<h2>{t("terms.sections.termination.title")}</h2>
						<p>{t("terms.sections.termination.intro")}</p>
						<ul>
							<li>{t("terms.sections.termination.items.0")}</li>
							<li>{t("terms.sections.termination.items.1")}</li>
						</ul>
						<p>{t("terms.sections.termination.outro")}</p>
					</section>

					<section className="terms__section">
						<h2>{t("terms.sections.law.title")}</h2>
						<p>{t("terms.sections.law.paragraphs.0")}</p>
						<p>{t("terms.sections.law.paragraphs.1")}</p>
					</section>

					<section className="terms__section terms__section--contact">
						<h2>{t("terms.sections.contact.title")}</h2>
						<p>{t("terms.sections.contact.content")}</p>
					</section>
				</section>
			</main>
		</div>
	);
}

