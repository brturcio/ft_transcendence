import { useTranslation } from "react-i18next";

export default function Privacy() {
	const { t } = useTranslation();

	const sectionClass = "py-[28px] max-[768px]:py-[22px] border-b border-white/[0.1]";
	const h2Class = "m-0 mb-[14px] text-[1.25rem]";
	const pClass = "ml-8 m-0 leading-[1.75] opacity-[0.82]";
	const pTopClass = "ml-8 m-0 mt-3 leading-[1.75] opacity-[0.82]";
	const ulClass = "ml-8 m-0 mt-3 pl-[22px] leading-[1.75] opacity-[0.82] list-disc";
	const liClass = "ml-8 mt-2";

	return (
		<div className="privacy-page">

			<main className="min-h-screen py-16 px-6 max-[768px]:py-8 max-[768px]:px-4 flex justify-center">
				<section className="w-full max-w-225 p-12 max-[768px]:py-7 max-[768px]:px-5 rounded-3xl max-[768px]:rounded-[18px] bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.14)] shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur-lg">
					<header className="mb-10 pb-8 border-b border-[rgba(255,255,255,0.14)] text-center">
						<span className="inline-block mb-3 text-[0.8rem] font-bold tracking-[0.16em] uppercase opacity-70">
							Transcendence
						</span>
						<h1 className="m-0 mb-4 text-[clamp(2rem,5vw,3.5rem)] leading-[1.05]">{t("privacy.title")}</h1>
						<h2 className="max-w-170 mx-auto m-0 opacity-75 leading-[1.7]">{t("privacy.intro")}</h2>
					</header>

					<section className={sectionClass}>
						<h2 className={h2Class}>{t("privacy.sections.dataCollected.title")}</h2>
						<p className={pClass}>{t("privacy.sections.dataCollected.intro")}</p>
						<ul className={ulClass}>
							<li className={liClass}>{t("privacy.sections.dataCollected.items.0")}</li>
							<li className={liClass}>{t("privacy.sections.dataCollected.items.1")}</li>
							<li className={liClass}>{t("privacy.sections.dataCollected.items.2")}</li>
						</ul>
					</section>

					<section className={sectionClass}>
						<h2 className={h2Class}>{t("privacy.sections.dataUsage.title")}</h2>
						<p className={pClass}>{t("privacy.sections.dataUsage.intro")}</p>
						<ul className={ulClass}>
							<li className={liClass}>{t("privacy.sections.dataUsage.items.0")}</li>
							<li className={liClass}>{t("privacy.sections.dataUsage.items.1")}</li>
							<li className={liClass}>{t("privacy.sections.dataUsage.items.2")}</li>
							<li className={liClass}>{t("privacy.sections.dataUsage.items.3")}</li>
							<li className={liClass}>{t("privacy.sections.dataUsage.items.4")}</li>
						</ul>
					</section>

					<section className={sectionClass}>
						<h2 className={h2Class}>{t("privacy.sections.sharing.title")}</h2>
						<p className={pClass}>{t("privacy.sections.sharing.content")}</p>
					</section>

					<section className={sectionClass}>
						<h2 className={h2Class}>{t("privacy.sections.storage.title")}</h2>
						<p className={pClass}>{t("privacy.sections.storage.paragraphs.0")}</p>
						<p className={pTopClass}>{t("privacy.sections.storage.paragraphs.1")}</p>
					</section>

					<section className={sectionClass}>
						<h2 className={h2Class}>{t("privacy.sections.retention.title")}</h2>
						<p className={pClass}>{t("privacy.sections.retention.content")}</p>
					</section>

					<section className={sectionClass}>
						<h2 className={h2Class}>{t("privacy.sections.rights.title")}</h2>
						<p className={pClass}>{t("privacy.sections.rights.intro")}</p>
						<ul className={ulClass}>
							<li className={liClass}>{t("privacy.sections.rights.items.0")}</li>
							<li className={liClass}>{t("privacy.sections.rights.items.1")}</li>
							<li className={liClass}>{t("privacy.sections.rights.items.2")}</li>
							<li className={liClass}>{t("privacy.sections.rights.items.3")}</li>
						</ul>
					</section>

					<section className={sectionClass}>
						<h2 className={h2Class}>{t("privacy.sections.cookies.title")}</h2>
						<p className={pClass}>{t("privacy.sections.cookies.content")}</p>
					</section>

					<section className={sectionClass}>
						<h2 className={h2Class}>{t("privacy.sections.changes.title")}</h2>
						<p className={pClass}>{t("privacy.sections.changes.content")}</p>
					</section>

					<section className="mt-3 p-6 rounded-[18px] bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.12)]">
						<h2 className={h2Class}>{t("privacy.sections.contact.title")}</h2>
						<p className={pClass}>{t("privacy.sections.contact.content")}</p>
					</section>
				</section>
			</main>
		</div>
	);
}
