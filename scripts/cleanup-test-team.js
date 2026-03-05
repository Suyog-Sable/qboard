require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

(async () => {
    const db = new PrismaClient();
    try {
        const key = 'TT_TEST_AUTOMATION';
        const team = await db.team.findFirst({ where: { key } });
        if (team) {
            await db.team.delete({ where: { id: team.id } });
            console.log('Deleted test team', team.id);
        } else {
            console.log('No test team found');
        }
    } catch (e) {
        console.error('cleanup error', e);
    } finally {
        await db.$disconnect();
    }
})();
