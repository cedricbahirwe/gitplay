import NextAuth, { AuthOptions, Session } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { JWT } from "next-auth/jwt";

export const authOptions: AuthOptions = {
	providers: [
		GithubProvider({
			clientId: process.env.GITHUB_ID || "",
			clientSecret: process.env.GITHUB_SECRET || "",
			authorization: {
				params: {
					scope: "read:user user:follow user:email repo",
				},
			},
		}),
	],
	callbacks: {
		async jwt({ token, account }) {
			if (account && account.access_token) {
				token.accessToken = account.access_token;
			}
			return token;
		},
		async session({ session, token }: { session: Session; token: JWT }) {
			if (token) {
				session.accessToken = token.accessToken;
			}
			return session;
		},
	},
	session: {
		strategy: "jwt" as const,
	},
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
