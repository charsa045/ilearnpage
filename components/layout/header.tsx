"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type User = {
  name?: string;
  email?: string;
};

export default function PublicHeader() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/sessionLogout", {
      method: "POST",
    });

    setUser(null);
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 flex items-center px-6 py-5 rounded-b-2xl border-b-4 border-b-gray-400 hover:border-b-blue-500 duration-300 
    bg-white hover:shadow-2xl">

      {/* LOGOTIPO */}
      <Link href="/" className="text-2xl font-extrabold tracking-wide text-blue-600">
        <span className="bg-blue-600 text-white px-4 py-1 rounded-md mr-1">
          i
        </span>
        Learn
      </Link>

      <nav className="ml-auto flex items-center gap-6 text-sm font-semibold text-gray-600 duration-300 text-3xl">

        <Link href="/" className="hover:text-blue-600 hover:font-extrabold hover:italic">
          Inicio
        </Link>

        {!loading && !user && (
          <>
            <Link
              href="/signup" className="hover:text-blue-600 hover:font-extrabold hover:italic"
            >
              Registrarse
            </Link>

            <Link
              href="/login"
              className="bg-white text-blue-600 py-1 rounded-full font-bold transition hover:text-blue-600 hover:font-extrabold hover:italic"
            >
              Acceder
            </Link>
          </>
        )}

        {!loading && user && (
          <div className="flex items-center gap-3">

            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-white text-blue-600 
            flex items-center justify-center font-bold shadow">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            {/* Nombre */}
            <span className="hidden sm:block">
              {user.name || user.email}
            </span>

            <Link
              href="/dashboard"
              className="bg-white text-gray-600 hover:text-blue-600 py-1 rounded-full font-bold transition hover:text-blue-600 hover:font-extrabold hover:italic"
            >
              Portal
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="bg-white text-red-600 px-3 py-1 rounded-full font-bold hover:bg-gray-200 transition"
            >
              Salir
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}