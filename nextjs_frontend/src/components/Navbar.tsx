"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import SearchBar from "./SearchBar";

export default function Navbar() {
  const { user, signInWithGoogle, signOut } = useAuth();
  const [openSearch, setOpenSearch] = useState(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-white/70 border-b border-blue-100/40">
      <nav className="container-px flex items-center h-16 gap-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-600 to-amber-400" />
          <span className="font-semibold tracking-tight text-blue-700">StreamFlix</span>
        </Link>

        <div className="ml-6 hidden md:flex gap-4 text-sm">
          <Link href="/" className="text-gray-700 hover:text-blue-700 transition-colors">Home</Link>
          <Link href="/watchlist" className="text-gray-700 hover:text-blue-700 transition-colors">My List</Link>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setOpenSearch((v) => !v)}
            className="btn rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100"
            aria-label="Toggle search"
          >
            <span className="hidden sm:inline">Search</span>
            <svg className="h-5 w-5 sm:ml-1" viewBox="0 0 24 24" fill="none"><path d="M21 21l-4.3-4.3m1.8-5.2a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>

          {!user ? (
            <button onClick={signInWithGoogle} className="btn btn-primary">Sign in</button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700 hidden sm:inline">Hi, {user.email?.split("@")[0]}</span>
              <button onClick={signOut} className="btn btn-secondary">Sign out</button>
            </div>
          )}
        </div>
      </nav>
      {openSearch && (
        <div className="container-px pb-4">
          <SearchBar />
        </div>
      )}
    </header>
  );
}
