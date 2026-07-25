import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const handler = NextAuth({
  debug: true,
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    {
      id: "anilist",
      name: "AniList",
      type: "oauth",
      token: "https://anilist.co/api/v2/oauth/token",
      authorization: {
        url: "https://anilist.co/api/v2/oauth/authorize",
        params: { scope: "", response_type: "code" },
      },
      client: {
        token_endpoint_auth_method: "client_secret_post",
      },
      userinfo: {
        url: "https://graphql.anilist.co",
        async request({ tokens }) {
          const response = await fetch("https://graphql.anilist.co", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${tokens.access_token}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              query: "query { Viewer { id name avatar { large } bannerImage } }",
            }),
          });
          const data = await response.json();
          return data.data.Viewer;
        },
      },
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name,
          image: profile.avatar.large,
          banner: profile.bannerImage,
        };
      },
      clientId: process.env.NEXT_PUBLIC_ANILIST_CLIENT_ID,
      clientSecret: process.env.ANILIST_CLIENT_SECRET,
    },
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.sub;
        session.accessToken = token.accessToken;
        session.provider = token.provider;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST }
