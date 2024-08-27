const faunadb = require('faunadb');

const q = faunadb.query;
const client = new faunadb.Client({ secret: process.env.FAUNA_SECRET });

exports.handler = async (event, context) => {
  try {
    const result = await client.query(
      q.Map(
        q.Paginate(q.Documents(q.Collection('reminders'))),
        q.Lambda(x => q.Get(x))
      )
    );

    const reminders = result.data.map(item => item.data);

    return {
      statusCode: 200,
      body: JSON.stringify(reminders)
    };
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch reminders' })
    };
  }
};