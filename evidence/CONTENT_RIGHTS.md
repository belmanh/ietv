# Preuve et description des droits de contenu — myIETV

But: remplissez les sections ci-dessous et joignez les documents (contrats, emails signés, factures) lorsque vous soumettez l'appel ou la nouvelle version.

1) Description générale
- Source des vidéos: (ex: Firebase Storage bucket, URL, fournisseur)
- Type de contenu: (ex: chaînes TV locales, vidéos publiques, contenu créé par l'équipe)

2) Pour chaque source, indiquez:
- Nom du détenteur des droits:
- Type de droit détenu (ex: licence de diffusion, contenu que nous possédons, contenu sous licence gratuite):
- Période de validité de la licence:
- Fichier(s) joint(s) prouvant la licence (contrat.pdf, email-signed.pdf, invoice.pdf):
- URL(s) des vidéos concernées dans l'app (ex: Firebase path ou videoId):

3) Exemple rempli
- Nom du détenteur: Société Exemple S.A.
- Type de droit: Licence non-exclusive de diffusion en streaming (contrat signé)
- Période: 01/01/2025 - 31/12/2026
- Pièces jointes: `evidence/contracts/societe-exemple-licence.pdf`
- URLs: `https://firebasestorage.googleapis.com/v0/b/.../videos/12345.mp4`

4) Si vous ne détenez pas les droits
- Retirer immédiatement le ou les éléments litigieux de la bibliothèque vidéo avant soumission.
- Remplacer par du contenu dont vous avez les droits (contenu original ou licences valides).

5) Contact pour vérification
- Nom: Belmanh Dubien
- Email: belmanh.dubien@gmail.com
- Rôle: Responsable du contenu / Développeur

---

Information spécifique pour IE TV
- Nom du détenteur: IE TV
- Type de droit: Titulaire exclusif des vidéos publiées sur l'application (contenu créé par l'équipe IE TV)
- Période: droits détenus en continu (content created and owned by IE TV)
- Pièces jointes: ajouter ici tout document interne attestant la création (ex: liste des vidéos, certificats de production) dans `evidence/contracts/`
- URLs: les vidéos sont hébergées sur Firebase Storage via la collection `videos` de Firestore; chaque document contient un champ `videoUrl` pointant vers le fichier.

---

Instructions d'usage:
- Placez ici les copies des contrats dans `evidence/contracts/`
- Placez les emails signés dans `evidence/emails/`
- Lors de l'appel via Play Console, joignez les fichiers essentiels et référencez ce document.
