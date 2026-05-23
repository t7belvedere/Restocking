export const WelcomeEmailTemplate = ({ email }: { email: string }) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;800&family=DM+Sans:wght@400;500;700&display=swap');
      
      body { 
        font-family: 'DM Sans', sans-serif; 
        background-color: #fafafa; 
        color: #1a1a1a; 
        margin: 0; 
        padding: 40px 20px; 
      }
      .wrapper { max-width: 500px; margin: 0 auto; }
      .container { 
        background: #fff; 
        border: 2px solid #1a1a1a; 
        padding: 40px; 
        box-shadow: 6px 6px 0 0 #1a1a1a; 
      }
      h1 { 
        font-family: 'Bricolage Grotesque', sans-serif; 
        font-size: 28px; 
        font-weight: 800; 
        color: #1a1a1a; 
        margin: 0 0 24px 0; 
        letter-spacing: -0.02em;
      }
      p { font-size: 16px; line-height: 1.7; margin: 0 0 20px 0; }
      .highlight { color: #f47b20; font-weight: 700; }
      .email-badge { 
        display: inline-block; 
        background: #fcfcfc; 
        border: 1px solid #1a1a1a; 
        padding: 4px 12px; 
        border-radius: 6px; 
        font-family: monospace; 
        font-size: 14px; 
      }
      .divider { height: 2px; background: #1a1a1a; margin: 30px 0; }
      .footer { margin-top: 40px; font-size: 12px; color: #666; text-align: center; }
      .footer a { color: #1a1a1a; text-decoration: underline; }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="container">
        <h1>Bienvenue chez Restocking.</h1>
        <p>C'est noté. Ton adresse <span class="email-badge">${email}</span> est officiellement inscrite sur la liste d'attente.</p>
        
        <p>On bosse actuellement pour rendre la chasse aux stocks <span class="highlight">plus rapide et moins frustrante</span>. Tu recevras une invitation dès que ton accès sera prêt.</p>
        
        <div class="divider"></div>
        
        <p style="font-weight: 500;">On t'enverra uniquement l'essentiel : ton accès et les actus majeures du lancement. Promis.</p>
        
        <div class="footer">
          <p>L'équipe Restocking<br>
          <a href="https://restocking.app">restocking.app</a></p>
        </div>
      </div>
    </div>
  </body>
</html>
`;
