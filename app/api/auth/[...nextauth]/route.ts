import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password)
          throw new Error("Missing credentials");

        await connectDB();
        const user = await User.findOne({ email: credentials.email });
        if (!user) throw new Error("No user found with this email");

        if (!user.password)
          throw new Error("User registered via OAuth. Please sign in with Google/GitHub.");

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) throw new Error("Invalid password");

        // Update lastLogin on successful credentials login
        user.lastLogin = new Date();
        await user.save();

        return user;
      },
    }),
  ],
  callbacks: {
    // Sign-in callback: ensure OAuth users are saved to DB on first sign-in
    async signIn({ user, account }) {
      await connectDB();
      if (account?.provider === "google" || account?.provider === "github") {
        const existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          await User.create({
            name: user.name,
            email: user.email,
            image: user.image || "",
            provider: account.provider,
            lastLogin: new Date(), // Set lastLogin when creating new OAuth user
          });
        } else {
          // Update lastLogin for returning OAuth users
          existingUser.lastLogin = new Date();
          await existingUser.save();
        }
      }
      return true;
    },

    // Attach DB user info (id, provider) into session.user
    async session({ session }: { session: any }) {
      await connectDB();
      if (session?.user?.email) {
        const dbUser = await User.findOne({ email: session.user.email });
        if (dbUser) {
          session.user = {
            ...session.user,
            id: dbUser._id?.toString(),
            provider: dbUser.provider,
          };
        }
      }
      return session;
    },

    // Robust redirect handler
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // If url is relative (starts with "/"), resolve to full url
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      // If url is absolute and same origin, allow it *except* internal api/auth callbacks
      try {
        const dest = new URL(url);
        if (dest.origin === baseUrl) {
          // if this is a NextAuth callback path, redirect to baseUrl (home)
          if (dest.pathname.startsWith("/api/auth/")) {
            return baseUrl;
          }
          // otherwise allow the url (same origin)
          return url;
        }
      } catch {
      }
      return baseUrl;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };