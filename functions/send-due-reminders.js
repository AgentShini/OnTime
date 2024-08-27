const faunadb = require('faunadb');
const mailgun = require('mailgun-js');

const q = faunadb.query;
const client = new faunadb.Client({ secret: process.env.FAUNA_SECRET });
const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN });

exports.handler = async (event, context) => {
  try {
    const now = new Date().toISOString();
    const result = await client.query(
      q.Map(
        q.Paginate(
          q.Filter(
            q.Documents(q.Collection('reminders')),
            q.Lambda(x => q.LTE(q.Select(['data', 'reminderTime'], q.Get(x)), now))
          )
        ),
        q.Lambda(x => q.Get(x))
      )
    );

    for (const item of result.data) {
      const reminder = item.data;
      await sendReminder(reminder.email, reminder.subject, reminder.content);
      await client.query(q.Delete(item.ref));
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Sent ${result.data.length} reminders` })
    };
  } catch (error) {
    console.error('Error sending reminders:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to send reminders' })
    };
  }
};

async function sendReminder(to, subject, content) {
  const data = {
    from: 'Reminder <reminders@yourdomain.com>',
    to: to,
    subject: `Reminder: ${subject}`,
    text: `This is your requested reminder:\n\n${content}`
  };

  try {
    await mg.messages().send(data);
    console.log('Reminder sent successfully');
  } catch (error) {
    console.error('Error sending reminder:', error);
    throw error;
  }
}