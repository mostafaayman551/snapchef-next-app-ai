import Link from "next/link";

export default function NotFound() {
  return (
    <main className="bg-beige py-28 px-4 w-full">
      <div className="container mx-auto w-full min-h-screen text-center">
        <h1 className="text-2xl font-extrabold text-red-500 mb-8">404 - Page Not Found</h1>
        <p>The page you are looking for does not exist.</p>
        <Link href="/" className="hover:text-orange hover:underline hover:underline-offset-2 transition-colors duration-300">Go back to the homepage</Link>
      </div>
    </main>
  );
}
