import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import LinkedIn from "next-auth/providers/linkedin";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google,
    // Garante que o LinkedIn peça o e-mail (mesma identidade do Google).
    LinkedIn({
      authorization: { params: { scope: "openid profile email" } },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login", error: "/login" },
  callbacks: {
    // Sem e-mail não há como unificar a identidade (ex.: e-mail oculto no
    // LinkedIn). Nega o login para não deixar o usuário entrar "quebrado".
    async signIn({ user, profile }) {
      const email = profile?.email ?? user?.email;
      return Boolean(email);
    },
    // A identidade do usuário é o e-mail: garante que ele esteja sempre no token
    // e na sessão (em minúsculas), para Google e LinkedIn compartilharem os
    // mesmos dados quando o e-mail é o mesmo.
    async jwt({ token, profile }) {
      if (profile?.email) token.email = profile.email.toLowerCase();
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.email) {
        session.user.email = token.email;
      }
      return session;
    },
  },
});
