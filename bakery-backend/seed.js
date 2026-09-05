require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcrypt');

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/arzoo_bakery?schema=public',
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Create categories
  const categories = [
    'Dairy Products',
    'Chips',
    'Biscuits',
    'Chocolates',
    'Others',
  ];

  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`✓ ${categories.length} categories seeded: ${categories.join(', ')}`);

  // Create default owner account
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const owner = await prisma.user.upsert({
    where: { email: 'admin@arzoo.com' },
    update: {},
    create: {
      name: 'Store Owner',
      email: 'admin@arzoo.com',
      password: hashedPassword,
      role: 'OWNER',
      settings: {
        create: {
          storeName: 'My Store',
          storeAddress: '',
          phone: '',
          whatsappNumber: '',
          receiptFooter: 'Thank you for visiting!',
        },
      },
    },
  });
  console.log(`✓ Owner account: ${owner.email} / admin123`);

  console.log('\n✅ Seed complete! No sample products added — add your own items from the dashboard.');
  console.log('   Login: admin@arzoo.com / admin123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
