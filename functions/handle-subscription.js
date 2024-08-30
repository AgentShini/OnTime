const faunadb = require('faunadb');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const q = faunadb.query;
const client = new faunadb.Client({ secret: process.env.FAUNA_SECRET });

exports.handler = async (event, context) => {
  const { user, plan } = JSON.parse(event.body);

  if (!user) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    // Create Stripe customer and subscription
    const customer = await stripe.customers.create({
      email: user.email,
    });

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: process.env[`STRIPE_${plan.toUpperCase()}_PRICE_ID`] }],
    });

    // Update user in FaunaDB
    await client.query(
      q.Update(
        q.Select(
          'ref',
          q.Get(q.Match(q.Index('users_by_email'), user.email))
        ),
        {
          data: {
            subscription: plan,
            stripeCustomerId: customer.id,
            stripeSubscriptionId: subscription.id,
          },
        }
      )
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Subscription updated successfully' }),
    };
  } catch (error) {
    console.error('Error updating subscription:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to update subscription' }),
    };
  }
};