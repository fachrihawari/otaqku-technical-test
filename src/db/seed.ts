import 'dotenv/config'

import { hashPassword } from '../helpers/hash';
import { db } from './db';
import { tasksTable, usersTable } from './schema';

async function seed() {
  console.log('🕐 Resetting database...');
  await db.delete(tasksTable).execute();
  await db.delete(usersTable).execute();
  console.log('✅ Database reset successfully');

  const password = await hashPassword('secret');

  console.log('🕐 Inserting users');
  const results = await db
    .insert(usersTable)
    .values([
      { email: 'jhon@mail.com', password },
      { email: 'jane@mail.com', password },
    ])
    .returning({ insertedId: usersTable.id });
  console.log('✅ Users successfully inserted');

  console.log('🕐 Inserting tasks');
  await db.insert(tasksTable).values([
    {
      title: 'Task 1',
      description: 'Description for Task 1',
      status: 'pending',
      authorId: results[0].insertedId,
    },
    {
      title: 'Task 2',
      description: 'Description for Task 2',
      status: 'in_progress',
      authorId: results[1].insertedId,
    },
  ]);
  console.log('✅ Tasks successfully inserted');

  process.exit(0);
}

seed().catch(console.error);
