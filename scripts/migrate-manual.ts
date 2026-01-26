import 'dotenv/config';
import postgres from 'postgres';

if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is missing in .env');
    process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL);

async function main() {
    console.log('Starting manual migration...');

    // 1. Rename stripe_customer_id to mercadopago_payer_id
    try {
        console.log('Attempting to rename stripe_customer_id to mercadopago_payer_id...');
        await sql`ALTER TABLE users RENAME COLUMN stripe_customer_id TO mercadopago_payer_id`;
        console.log('✅ Renamed stripe_customer_id to mercadopago_payer_id');
    } catch (e: any) {
        if (e.code === '42703') { // Undefined column
            console.log('⚠️ Column stripe_customer_id does not exist. Checking if mercadopago_payer_id exists...');
            // Check if mercadopago_payer_id already exists
            try {
                await sql`SELECT mercadopago_payer_id FROM users LIMIT 1`;
                console.log('✅ mercadopago_payer_id already exists.');
            } catch (e2) {
                console.log('⚠️ mercadopago_payer_id also does not exist. Will create it.');
                await sql`ALTER TABLE users ADD COLUMN mercadopago_payer_id text`;
                console.log('✅ Created mercadopago_payer_id column.');
            }
        } else if (e.code === '42701') { // Duplicate column
            console.log('✅ Column mercadopago_payer_id already exists.');
        } else {
            console.error('❌ Error renaming column:', e.message);
        }
    }

    // 2. Add subscription columns
    try {
        console.log('Adding subscription columns...');
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'free'`;
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_plan text`;
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_end_date timestamp`;
        console.log('✅ Subscription columns added/verified.');
    } catch (e: any) {
        console.error('❌ Error adding columns:', e);
    }

    console.log('Migration completed.');
    await sql.end();
    process.exit(0);
}

main();
