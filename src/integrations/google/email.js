import { Buffer } from 'buffer';
import { googleGetAccessToken } from './GoogleAuth.js';

// Funzione per inviare email tramite l'API di Gmail
export async function sendEmail({ to, bcc, subject, message }: {
    to: string[];
    bcc?: string[];
    subject: string;
    message: string
}) {
    const accessToken = await googleGetAccessToken();

    const recipients = [
        `To: ${to.join(', ')}`,
    ];

    if (bcc && bcc.length) {
        recipients.push(`Bcc: ${bcc.join(', ')}`);
    }
    const email = [
        ...recipients,
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: ${subject}`,
        '',
        message,
    ].join('\n');

    const base64EncodedEmail = Buffer.from(email)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            raw: base64EncodedEmail
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to send email');
    }

    const data = await response.json();
    console.log('Email sent:', data);
    return data;
}










