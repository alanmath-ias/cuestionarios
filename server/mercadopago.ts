import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { User } from '../shared/schema.js';

// Initialize Mercado Pago client
// NOTE: Replace process.env.MP_ACCESS_TOKEN with your actual access token in .env
const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-7614393666060356-012519-c097560d244855447426615555555555-165306367'
});

export const createSubscriptionPreference = async (user: User, planName: string, price: number) => {
    const preference = new Preference(client);

    try {
        const backUrls = {
            success: `${process.env.APP_URL || 'https://app.alanmath.com'}/payment-success`,
            failure: `${process.env.APP_URL || 'https://app.alanmath.com'}/payment-failure`,
            pending: `${process.env.APP_URL || 'https://app.alanmath.com'}/payment-failure`,
        };

        const result = await preference.create({
            body: {
                items: [
                    {
                        id: 'subscription-monthly',
                        title: `Suscripción Mensual - ${planName}`,
                        quantity: 1,
                        unit_price: price,
                        currency_id: 'COP', // Adjust currency as needed (e.g., COP, USD, MXN)
                    },
                ],
                payer: {
                    email: user.email || 'test_user@test.com',
                    name: user.name,
                    surname: user.username,
                },
                back_urls: backUrls,
                auto_return: 'approved',
                external_reference: user.id.toString(),
                statement_descriptor: 'ALANMATH',
                metadata: {
                    user_id: user.id,
                    plan: planName,
                },
            },
        });

        return result;
    } catch (error) {
        console.error('Error creating Mercado Pago preference:', error);
        throw error;
    }
};

export const getPayment = async (paymentId: string) => {
    const payment = new Payment(client);
    try {
        return await payment.get({ id: paymentId });
    } catch (error) {
        console.error('Error getting payment:', error);
        throw error;
    }
};
