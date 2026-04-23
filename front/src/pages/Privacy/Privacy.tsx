import Navbar from "../../components/Navbar";
import "./Privacy.css";

export default function Privacy() {
	return (
		<div className="landing-page app-screen">
			<Navbar />

			<main className="landing__content">
				<h1>Politique de Confidentialité – Transcendence</h1>

				<h2>1. Données collectées</h2>
				<p>Nous collectons uniquement les données nécessaires au fonctionnement du service :</p>
				<ul>
					<li>Informations de compte (pseudo, email, mot de passe chiffré)</li>
					<li>Données d’utilisation (scores, achievements, historique de jeu)</li>
					<li>Messages envoyés via le chat</li>
				</ul>

				<h2>2. Utilisation des données</h2>
				<p>Les données sont utilisées pour :</p>
				<ul>
					<li>Permettre l’accès au compte utilisateur</li>
					<li>Gérer les compétitions et les scores</li>
					<li>Afficher les achievements</li>
					<li>Assurer le bon fonctionnement du chat</li>
					<li>Améliorer le service</li>
				</ul>

				<h2>3. Partage des données</h2>
				<p>
					Aucune donnée personnelle n’est vendue ou partagée à des tiers.
					Les données peuvent être accessibles uniquement en cas d’obligation légale.
				</p>

				<h2>4. Stockage et sécurité</h2>
				<p>
					Les données sont stockées de manière sécurisée. Les mots de passe sont chiffrés et ne sont jamais stockés en clair.
				</p>
				<p>
					Malgré les mesures mises en place, aucune méthode de transmission ou de stockage n’est totalement sécurisée.
				</p>

				<h2>5. Durée de conservation</h2>
				<p>
					Les données sont conservées tant que le compte est actif. Elles peuvent être supprimées à la demande de l’utilisateur.
				</p>

				<h2>6. Droits des utilisateurs</h2>
				<p>Conformément au RGPD, vous disposez des droits suivants :</p>
				<ul>
					<li>Droit d’accès à vos données</li>
					<li>Droit de rectification</li>
					<li>Droit à la suppression</li>
					<li>Droit à la limitation du traitement</li>
				</ul>

				<h2>7. Cookies</h2>
				<p>
					Le site peut utiliser des cookies techniques nécessaires au fonctionnement (connexion, session).
					Aucun cookie publicitaire n’est utilisé.
				</p>

				<h2>8. Modifications</h2>
				<p>
					Cette politique de confidentialité peut être modifiée à tout moment.
					Les utilisateurs seront informés en cas de changement important.
				</p>

				<h2>9. Contact</h2>
				<p>
					Pour toute question ou demande concernant vos données :
					<br />
					[À compléter : adresse email de contact]
				</p>
			</main>
		</div>
	);
}