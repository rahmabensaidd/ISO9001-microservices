import { KeycloakService } from 'keycloak-angular';


export function initializeKeycloak(keycloak: KeycloakService) {
  return () =>
    keycloak.init({
      config: {
        url: 'http://localhost:8080',
        realm: 'test',
        clientId: 'angularid',
      },
      initOptions: {
        onLoad: 'check-sso', // 🔥 Vérifie que l'utilisateur est connecté
        checkLoginIframe: false,
      },
    }).then(async () => {
      // Vérifie si l'utilisateur est bien connecté avant de charger son profil
      const isLoggedIn = await keycloak.isLoggedIn();
      if (isLoggedIn) {
        keycloak.loadUserProfile().then(profile => {
          console.log("Profil utilisateur :", profile);
        }).catch(error => {
          console.error("Erreur lors du chargement du profil :", error);
        });
      } else {
        console.warn("Utilisateur non connecté, pas de chargement du profil.");
      }
    }).catch(error => {
      console.error("Erreur lors de l'initialisation de Keycloak :", error);
    });

}
