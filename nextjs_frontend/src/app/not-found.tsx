import React from "react";

export default function NotFound() {
  return (
    <main className="container-px py-20">
      <section className="card p-10 text-center" role="alert" aria-live="assertive">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">404 – Page Not Found</h1>
        <p className="text-gray-700">The page you’re looking for doesn’t exist.</p>
      </section>
    </main>
  );
}
