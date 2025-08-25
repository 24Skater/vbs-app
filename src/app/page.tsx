export default function Home() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-5xl font-extrabold text-red-600">VBS Home</h1>
      <p className="text-lg text-gray-700">
        If this text is gray and the heading is big & red, Tailwind is working.
      </p>
      <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
        Test Button
      </button>
    </div>
  );
}
