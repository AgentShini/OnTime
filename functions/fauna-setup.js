const faunadb = require('faunadb');
const q = faunadb.query;
const client = new faunadb.Client({ secret: process.env.FAUNA_SECRET });

async function setup() {
  try {
    // Create users collection
    await client.query(q.CreateCollection({ name: 'users' }));
    
    // Create reminders collection (if not already exists)
    await client.query(q.CreateCollection({ name: 'reminders' }));
    
    // Create index on users by email
    await client.query(
      q.CreateIndex({
        name: 'users_by_email',
        source: q.Collection('users'),
        terms: [{ field: ['data', 'email'] }],
        unique: true,
      })
    );

    // Create index on reminders by user
    await client.query(
      q.CreateIndex({
        name: 'reminders_by_user',
        source: q.Collection('reminders'),
        terms: [{ field: ['data', 'userId'] }],
      })
    );

    console.log('FaunaDB setup completed successfully');
  } catch (error) {
    console.error('Error setting up FaunaDB:', error);
  }
}

setup();
