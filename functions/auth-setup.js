const { NetlifyAdapter } = require("@auth/netlify-adapter");
const GoogleProvider = require("@auth/core/providers/google").default;

const authConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  adapter: NetlifyAdapter({
    faunaClient: new faunadb.Client({ secret: process.env.FAUNA_SECRET }),
  }),
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
};

exports.handler = async (event, context) => {
  const { auth } = event.clientContext;
  if (!auth) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Unauthorized" }),
    };
  }
  // The rest of your function logic here
};
