require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

(async () => {
    const db = new PrismaClient();
    try {
        // Ensure Prisma can create and read teams without modifying existing data.
        const TEST_KEY = 'TT_TEST_AUTOMATION';

        // Create a test team only if it doesn't already exist.
        const existing = await db.team.findFirst({ where: { key: TEST_KEY } });
        if (!existing) {
            const created = await db.team.create({
                data: { name: 'Automation Test Team', key: TEST_KEY, description: 'Temporary test team' },
            });
            console.log('Created test team:', created.id);
        } else {
            console.log('Test team already exists:', existing.id);
        }

        const teams = await db.team.findMany({ orderBy: { createdAt: 'desc' } });
        console.log('OK: found', teams.length, 'teams (showing first 5):');
        console.log(teams.slice(0, 5));
    } catch (err) {
        console.error('ERROR:', err);
    } finally {
        await db.$disconnect();
    }
})();
