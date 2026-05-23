import { Resend } from 'resend';

// Initialisation du client Resend
// Note : La clé est lue depuis l'environnement dans frontend/.env.local
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const data = await resend.emails.send({
      from: 'Restocking <alertes@restocking.app>',
      to,
      subject,
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email via Resend:', error);
    return { success: false, error };
  }
}
