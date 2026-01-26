import { MercadoPagoConfig } from 'mercadopago';
import 'dotenv/config';

// Use the current access token (even if it's APP_USR) to create a test user
const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || ''
});

async function createTestUser() {
    try {
        console.log('Creating test user...');
        // We need to use the fetch API directly because the SDK might not expose test_user creation easily
        // or we can try to use a generic request if available.
        // Let's use fetch for certainty.

        const response = await fetch('https://api.mercadopago.com/users/test_user', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${client.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                site_id: 'MCO', // Colombia
                description: 'Test User for AlanMath'
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`API Error: ${error}`);
        }

        const data = await response.json();
        console.log('✅ Test User Created!');
        console.log('------------------------------------------------');
        console.log('Email:', data.email);
        console.log('Password:', data.password);
        console.log('Nickname:', data.nickname);
        console.log('------------------------------------------------');
        console.log('👉 USA ESTE EMAIL EN EL CHECKOUT PARA PAGAR');

    } catch (error) {
        console.error('Error creating test user:', error);
    }
}

createTestUser();
