import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import LinkedIn from "next-auth/providers/linkedin";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google,

    LinkedIn({
      authorization: { params: { scope: "openid profile email" } },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login", error: "/login" },
  callbacks: {


    async signIn({ user, profile }) {
      const email = profile?.email ?? user?.email;
      return Boolean(email);
    },



    async jwt({ token, profile, account }) {
      if (profile?.email) token.email = profile.email.toLowerCase();

      if (account?.provider) token.provider = account.provider;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.email) {
        session.user.email = token.email;
      }
      if (token.provider) session.provider = token.provider;
      return session;
    },
  },
});
