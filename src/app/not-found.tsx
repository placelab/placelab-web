import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="section-wrapper pt-40 pb-24 flex flex-col items-start">
      <p className="text-xs font-mono text-lab-400 mb-4 uppercase tracking-widest">404</p>
      <h1 className="text-2xl md:text-3xl font-sans font-semibold text-lab-900 mb-6">
        Page not found
      </h1>
      <p className="text-sm text-lab-500 mb-10 max-w-sm">
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link
        href="/"
        className="text-sm text-lab-400 hover:text-lab-900 transition-colors"
      >
        ← Back to home
      </Link>
    </div>
  );
}
