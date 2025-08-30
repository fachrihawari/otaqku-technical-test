import 'dotenv/config';

import { reset, seed } from 'drizzle-seed';
import { hashPassword } from '../helpers/hash';
import { db } from './db';
import { tasks, users } from './schema';

async function main() {
  console.log('🕐 Re-seeding database...');
  await reset(db, { tasks, users });

  const password = await hashPassword('secret');
  const [defaultUser] = await db
    .insert(users)
    .values({
      email: 'user@mail.com',
      password,
    })
    .returning({ id: users.id });

  await seed(db, { tasks }).refine((f) => ({
    tasks: {
      count: 35,
      columns: {
        title: f.jobTitle(),
        description: f.loremIpsum({ sentencesCount: 1 }),
        authorId: f.default({ defaultValue: defaultUser.id }),
      },
    },
  }));
  console.log('✅ Database seeded successfully');

  process.exit(0);
}

main().catch(console.error);
