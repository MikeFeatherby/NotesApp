export default function AboutPage() {
  return (
    <main className="mx-auto max-w-2xl p-8 space-y-4">
      <h1 className="text-3xl font-bold">About this app</h1>
      <p className="text-lg opacity-80">
        Built with Next.js + Tailwind. You’re editing files locally and seeing hot reloads.
      </p>
      <a href="/" className="btn">← Back home</a>
    </main>
  );
}
