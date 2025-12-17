
import postgres from 'postgres';

async function testConnection(url) {
    console.log(`Testing: ${url.replace(/:[^:@]+@/, ':****@')}`);
    const sql = postgres(url, { max: 1, connect_timeout: 5 });
    try {
        await sql`SELECT 1`;
        console.log('✅ Success!');
        return true;
    } catch (err) {
        console.log(`❌ Failed: ${err.message}`);
        return false;
    } finally {
        await sql.end();
    }
}

async function run() {
    const passwords = [
        'LbG7KjvVYb2WcCERh9lTWq4dSx1HKjKJZkiyehLcJ8Iu3MaRjLVEnzlCAzs5QFMq',
        'mxqBWDs5Lx2Qgact9IBIJAyoZ78GR65KxAa9pYOAN9PTLAhvx0FK1iboJ2u4KWnN',
        'postgres',
        'admin',
        'root'
    ];

    const hosts = ['localhost', '178.156.147.25'];

    for (const host of hosts) {
        for (const pass of passwords) {
            const url = `postgres://postgres:${pass}@${host}:5432/postgres`;
            if (await testConnection(url)) {
                console.log(`\n🎉 FOUND WORKING URL: ${url}`);
                process.exit(0);
            }
        }
    }

    console.log('\n❌ No working connection found.');
    process.exit(1);
}

run();
