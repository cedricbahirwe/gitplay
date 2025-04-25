import { getServerSession } from "next-auth";
import LoginButton from "../components/LoginButton";
import Feed from "../components/Feed";

export default async function Home() {
  const session = await getServerSession();

  if (!session) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <h1 className="mb-8 text-4xl font-bold">Welcome to GitPlay</h1>
        <p className="mb-8 text-center text-xl text-gray-600">
          View fun, personalized updates about the GitHub users you follow
        </p>
        <LoginButton />
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8 pt-20">
      <Feed />
    </main>
  );
}
