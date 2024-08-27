const faunadb = require('faunadb');
const mailgun = require('mailgun-js');

const q = faunadb.query;
const client = new faunadb.Client({ secret: process.env.FAUNA_SECRET });
const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN });

exports.handler = async (event, context) => {
  // Parse the incoming email (this depends on how you're receiving emails)
  const { from, subject, text } = JSON.parse(event.body);

  // Extract reminder time from subject (e.g., "Reminder in 2 hours")
  const match = subject.match(/Reminder in (\d+) (minutes?|hours?|days?)/i);
  if (match) {
    const amount = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    let reminderTime = new Date();
    if (unit.includes('minute')) {
      reminderTime.setMinutes(reminderTime.getMinutes() + amount);
    } else if (unit.includes('hour')) {
      reminderTime.setHours(reminderTime.getHours() + amount);
    } else if (unit.includes('day')) {
      reminderTime.setDate(reminderTime.getDate() + amount);
    }

    try {
      // Save reminder to FaunaDB
      await client.query(
        q.Create(
          q.Collection('reminders'),
          {
            data: {
              email: from,
              subject,
              reminderTime: reminderTime.toISOString(),
              content: text
            }
          }
        )
      );

      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Reminder set successfully!' })
      };
    } catch (error) {
      console.error('Error saving reminder:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to set reminder' })
      };
    }
  } else {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid reminder format' })
    };
  }
};

// Function to send reminders (to be called by a scheduled function)
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
  }
}