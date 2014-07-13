###DESCRIPTION
Ensemble de Userscripts améliorant le jeu [Blood Wars](http://www.fr.bloodwars.net) où vous incarnez un vampire dans un monde post-apocalyptique :
* [BloodWarsEnchanced](https://github.com/Ecilam/BloodWarsEnhanced)
* [BloodWarsAnalyseRC](https://github.com/Ecilam/BloodWarsAnalyseRC)
* [BloodWarsSpyData](https://github.com/Ecilam/BloodWarsSpyData)
* [BloodWarsToolBox](https://github.com/Ecilam/BloodWarsToolBox) (celui-ci)

Ce script est compatible avec les serveurs Français uniquement v1.5.5 et les navigateurs Firefox et Chrome. Testé principalement avec Firefox 30.0 sur serveur R3FR.

Pour tout contact passer par mon [topic](http://forum.fr.bloodwars.net/index.php?page=Thread&threadID=204323/) sur le forum BloodWars.
Pour les bugs, GitHub propose une section [Issues](https://github.com/Ecilam/BloodWarsToolBox/issues).

###INSTALLATION
* Pour Firefox installer préalablement le module [Greasemonkey](https://addons.mozilla.org/fr/firefox/addon/greasemonkey/) ou [Scriptish](https://addons.mozilla.org/en-US/firefox/addon/scriptish/).
* Pour Google Chrome installer l'extension [Tampermonkey](https://chrome.google.com/webstore/detail/dhdgffkkebhmkfjojejmpbldmpobfkfo).
* Ensuite afficher la version [RAW](https://raw.githubusercontent.com/Ecilam/BloodWarsToolBox/master/BloodWarsToolBox@bwtb.user.js) du script pour que le module (ou l'extension) vous propose de l'installer.

###FONCTIONS
Script permettant de transférer l'armurerie au site de [Toolbox](http://www.bloodwartoolbox.eu/accueil).

3 modes sont proposés :
* Manuel : envoi manuel. Le login n'est pas sauvegardé.
* Manuel-save : login crypté et sauvegardé + envoi manuel.
* Semi-auto : login crypté et sauvegardé + envoi semi-automatique (il faut afficher la page d'armurerie) toutes les 24h. 


###INFORMATIONS
* **1ère utilisation:** un message vous rappellera de consulter la Salle du Trône pour que le script puisse récupérer l'IUD du personnage afin de pouvoir fonctionner.
* **Données:** les préférences sont stockées avec LOCALSTORAGE.
