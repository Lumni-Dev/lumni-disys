import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import LinkedIn from "next-auth/providers/linkedin";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google, LinkedIn],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
});
