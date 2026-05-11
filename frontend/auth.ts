import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { supabase } from "./lib/supabase";

export const { handlers, signIn, signOut, auth } = NextAuth({
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
    async signIn({ user, account }) {
      // Upsert user into Supabase profiles table on Google sign-in
      if (account?.provider === "google" && user.email) {
        try {
          const { error } = await supabase.from("profiles").upsert(
            {
              id: user.email, // use email as primary key
              email: user.email,
              username: user.name || user.email.split("@")[0],
              avatar_url: user.image || null,
              bio: "",
              provider: "google",
            },
            { onConflict: "id", ignoreDuplicates: true }
          );
          if (error) {
            console.error("[supabase] upsert profile error:", error.message);
          } else {
            console.log(`[supabase] ✅ profile upserted for ${user.email}`);
          }
        } catch (err) {
          console.error("[supabase] profile upsert failed:", err);
        }
      }
      return true; // always allow sign-in
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return `${baseUrl}/auth_redirect`;
    },
  },
});
