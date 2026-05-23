export const RestockEmailTemplate = ({
  name,
  url,
  price,
  variant,
}: {
  name: string;
  url: string;
  price: string;
  variant: string;
}) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: 'DM Sans', sans-serif; background-color: #fcfcfc; color: #1a1a1a; padding: 40px 20px; }
      .container { max-width: 500px; margin: 0 auto; border: 2px solid #1a1a1a; padding: 30px; background: #fff; box-shadow: 4px 4px 0 0 #1a1a1a; }
      h1 { font-family: 'Bricolage Grotesque', sans-serif; font-size: 24px; color: #f47b20; margin-top: 0; }
      p { line-height: 1.6; }
      .pill { display: inline-block; background: #e0f865; padding: 4px 12px; border: 2px solid #1a1a1a; border-radius: 20px; font-weight: bold; font-size: 14px; }
      .cta { display: block; text-align: center; background: #1a1a1a; color: #fcfcfc; padding: 15px; text-decoration: none; font-weight: bold; margin-top: 20px; border-radius: 8px; }
      .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>C'est revenu !</h1>
      <p>Ton vêtement est de retour en stock.</p>
      
      <div style="margin: 20px 0; border: 1px solid #eee; padding: 10px;">
        <p><strong>${name}</strong></p>
        <p><span class="pill">${variant}</span></p>
        <p>Prix : <strong>${price}</strong></p>
      </div>

      <a href="${url}" class="cta">Voir le produit</a>
      
      <div class="footer">
        <p>Tu reçois cet email car tu surveilles ce produit sur <a href="https://restocking.app">restocking.app</a>.</p>
      </div>
    </div>
  </body>
</html>
`;
