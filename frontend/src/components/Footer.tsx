export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-gray-900 border-t border-gray-700">
      <div className="mx-auto max-w-5xl px-4 py-4 text-sm text-gray-300 text-center">
        © {year} MyApp. All rights reserved.
      </div>
    </footer>
  );
}
