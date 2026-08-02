import "next-auth";
import "next-auth/jwt";

// Campos extras que os callbacks do auth adicionam a sessao e ao token.
declare module "next-auth" {
  interface Session {
    /** Provedor usado no login (google/linkedin). */
    provider?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    provider?: string;
  }
}
