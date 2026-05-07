import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import crypto from "crypto";

const devSecret = crypto.randomBytes(32).toString("base64");
const secret = process.env.NODE_ENV === "production"
  ? process.env.AUTH_SECRET
  : devSecret;

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return `${baseUrl}/auth_redirect`;
    },
  },
});
