export const WelcomeEmailTemplate = ({ email }: { email: string }) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: 'DM Sans', sans-serif; background-color: #fcfcfc; color: #1a1a1a; padding: 40px 20px; }
      .container { max-width: 500px; margin: 0 auto; border: 2px solid #1a1a1a; padding: 30px; background: #fff; box-shadow: 4px 4px 0 0 #1a1a1a; }
      h1 { font-family: 'Bricolage Grotesque', sans-serif; font-size: 24px; color: #f47b20; margin-top: 0; }
      p { line-height: 1.6; }
      .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Bienvenue chez Restocking ! 🎉</h1>
      <p>C'est noté. On t'a bien ajouté à la liste d'attente pour <strong>${email}</strong>.</p>
      <p>On bosse dur pour ouvrir les portes très bientôt. Tu recevras un email dès que ton accès sera prêt.</p>
      <p>D'ici là, prépare ta liste de produits à surveiller.</p>
      <div class="footer">
        <p>L'équipe Restocking — <a href="https://restocking.app">restocking.app</a></p>
      </div>
    </div>
  </body>
</html>
`;
