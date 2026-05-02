import Navbar from "../components/Navbar";
import { useTranslation } from "react-i18next";

const sectionClass = "py-[28px] max-[768px]:py-[22px] border-b border-white/[0.1]";
const h2Class = "m- mb-[14px] text-[2rem]";
const pClass = "m-0 ml-8 leading-[1.75] opacity-[0.82] text-[1rem]";
const pTopClass = "m-0 mt-1 ml-8 leading-[1.75] opacity-[0.82] text-[1rem]";
const ulClass = "ml-8 m-0 mt-1 pl-[22px] leading-[1.75] opacity-[0.82] list-disc";
const liClass = "lm-8 mt-1";

export default function Terms() {
	const { t } = useTranslation();

	return (
		<div className="terms-page app-screen">
			<Navbar />

			<main className="min-h-screen py-16 px-6 max-[768px]:py-8 max-[768px]:px-4 flex justify-center">
				<section className="w-full max-w-225 p-12 max-[768px]:py-7 max-[768px]:px-5 rounded-3xl max-[768px]:rounded-[18px] bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.14)] shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur-lg">
					<header className="mb-10 pb-8 border-b border-[rgba(255,255,255,0.14)] text-center">
						<span className="inline-block mb-3 text-[0.8rem] font-bold tracking-[0.16em] uppercase opacity-70">
							Transcendence
						</span>

						<h1 className="m-0 mb-4 text-[clamp(2rem,5vw,3.5rem)] leading-[1.05]">{t("terms.title")}</h1>
					</header>

					<section className={sectionClass}>
						<h2 className={h2Class}>{t("terms.sections.service.title")}</h2>
						<p className={pClass}>{t("terms.sections.service.paragraphs.0")}</p>
						<p className={pTopClass}>{t("terms.sections.service.paragraphs.1")}</p>
					</section>

					<section className={sectionClass}>
						<h2 className={h2Class}>{t("terms.sections.acceptance.title")}</h2>
						<p className={pClass}>{t("terms.sections.acceptance.paragraphs.0")}</p>
						<p className={pTopClass}>{t("terms.sections.acceptance.paragraphs.1")}</p>
					</section>

					<section className={sectionClass}>
						<h2 className={h2Class}>{t("terms.sections.account.title")}</h2>
						<p className={pClass}>{t("terms.sections.account.intro")}</p>
						<ul className={ulClass}>
							<li>{t("terms.sections.account.items.0")}</li>
							<li className={liClass}>{t("terms.sections.account.items.1")}</li>
							<li className={liClass}>{t("terms.sections.account.items.2")}</li>
						</ul>
						<p className={pTopClass}>{t("terms.sections.account.outro")}</p>
					</section>

					<section className={sectionClass}>
						<h2 className={h2Class}>{t("terms.sections.usageRules.title")}</h2>
						<p className={pClass}>{t("terms.sections.usageRules.intro")}</p>
						<ul className={ulClass}>
							<li>{t("terms.sections.usageRules.items.0")}</li>
							<li className={liClass}>{t("terms.sections.usageRules.items.1")}</li>
							<li className={liClass}>{t("terms.sections.usageRules.items.2")}</li>
							<li className={liClass}>{t("terms.sections.usageRules.items.3")}</li>
							<li className={liClass}>{t("terms.sections.usageRules.items.4")}</li>
						</ul>
					</section>

					<section className={sectionClass}>
						<h2 className={h2Class}>{t("terms.sections.chat.title")}</h2>
						<p className={pClass}>{t("terms.sections.chat.paragraphs.0")}</p>
						<p className={pTopClass}>{t("terms.sections.chat.paragraphs.1")}</p>
					</section>

					<section className={sectionClass}>
						<h2 className={h2Class}>{t("terms.sections.competitions.title")}</h2>
						<p className={pClass}>{t("terms.sections.competitions.intro")}</p>
						<ul className={ulClass}>
							<li>{t("terms.sections.competitions.items.0")}</li>
							<li className={liClass}>{t("terms.sections.competitions.items.1")}</li>
						</ul>
						<p className={pTopClass}>{t("terms.sections.competitions.outro")}</p>
					</section>

					<section className={sectionClass}>
						<h2 className={h2Class}>{t("terms.sections.ip.title")}</h2>
						<p className={pClass}>{t("terms.sections.ip.paragraphs.0")}</p>
						<p className={pTopClass}>{t("terms.sections.ip.paragraphs.1")}</p>
					</section>

					<section className={sectionClass}>
						<h2 className={h2Class}>{t("terms.sections.personalData.title")}</h2>
						<p className={pClass}>{t("terms.sections.personalData.paragraphs.0")}</p>
						<p className={pTopClass}>{t("terms.sections.personalData.paragraphs.1")}</p>
					</section>

					<section className={sectionClass}>
						<h2 className={h2Class}>{t("terms.sections.liability.title")}</h2>
						<p className={pClass}>{t("terms.sections.liability.intro")}</p>
						<ul className={ulClass}>
							<li>{t("terms.sections.liability.items.0")}</li>
							<li className={liClass}>{t("terms.sections.liability.items.1")}</li>
							<li className={liClass}>{t("terms.sections.liability.items.2")}</li>
							<li className={liClass}>{t("terms.sections.liability.items.3")}</li>
						</ul>
					</section>

					<section className={sectionClass}>
						<h2 className={h2Class}>{t("terms.sections.security.title")}</h2>
						<p className={pClass}>{t("terms.sections.security.paragraphs.0")}</p>
						<p className={pTopClass}>{t("terms.sections.security.paragraphs.1")}</p>
					</section>

					<section className={sectionClass}>
						<h2 className={h2Class}>{t("terms.sections.updates.title")}</h2>
						<p className={pClass}>{t("terms.sections.updates.paragraphs.0")}</p>
						<p className={pTopClass}>{t("terms.sections.updates.paragraphs.1")}</p>
					</section>

					<section className={sectionClass}>
						<h2 className={h2Class}>{t("terms.sections.termination.title")}</h2>
						<p className={pClass}>{t("terms.sections.termination.intro")}</p>
						<ul className={ulClass}>
							<li>{t("terms.sections.termination.items.0")}</li>
							<li className={liClass}>{t("terms.sections.termination.items.1")}</li>
						</ul>
						<p className={pTopClass}>{t("terms.sections.termination.outro")}</p>
					</section>

					<section className={sectionClass}>
						<h2 className={h2Class}>{t("terms.sections.law.title")}</h2>
						<p className={pClass}>{t("terms.sections.law.paragraphs.0")}</p>
						<p className={pTopClass}>{t("terms.sections.law.paragraphs.1")}</p>
					</section>

					<section className="mt-3 p-6 rounded-[18px] bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.12)]">
						<h2 className={h2Class}>{t("terms.sections.contact.title")}</h2>
						<p className={pClass}>{t("terms.sections.contact.content")}</p>
					</section>
				</section>
			</main>
		</div>
	);
}
