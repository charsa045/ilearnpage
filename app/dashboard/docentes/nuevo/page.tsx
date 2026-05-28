"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase-client";
import PublicHeader from "@/components/layout/header";

export default function NuevoDocentePage() {
  const router = useRouter();

  const [usuario, setUsuario] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [form, setForm] = useState({
    grado: "",
    area: "",
    titulo: "",
    correo: "",
    password: "",
    especialidad: "",
    institucion: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      router.push("/login");
      return;
    }

    fetch(`/api/usuarios?uid=${user.uid}`)
      .then((res) => res.json())
      .then((data) => {
        setUsuario(data);
        setForm((prev) => ({
          ...prev,
          correo: user.email || "",
        }));
      })
      .finally(() => setLoadingUser(false));
  }, [router]);

  if (loadingUser) {
    return <p className="text-white text-center mt-10">Cargando...</p>;
  }

  const isAdmin = usuario?.rol === "admin";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "grado" || name === "area") {
      const newForm = { ...form, [name]: value };

      if (newForm.grado && newForm.area) {
        newForm.titulo = `${newForm.grado} en ${newForm.area}`;
      }

      setForm(newForm);
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    if (!usuario) {
      throw new Error("Usuario no cargado aún");
    }

    const isAdmin = usuario.rol === "admin";

    const body = isAdmin
      ? {
          email: form.correo,
          password: form.password,
          grado: form.grado,
          titulo: form.titulo,
          especialidad: form.especialidad,
          institucion: form.institucion,
        }
      : {
          uid: usuario.uid,
          grado: form.grado,
          titulo: form.titulo,
          especialidad: form.especialidad,
          institucion: form.institucion,
        };

    const res = await fetch("/api/docentes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Error al guardar docente");
    }

    router.push("/dashboard");

  } catch (error: any) {
    alert(error.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <main className="min-h-screen flex items-center justify-center bg-cover bg-center">
      <div className="absolute inset-0 bg-linear-to-br from-blue-300 via-blue-950 to-emerald-800"></div>
      <form
        onSubmit={handleSubmit}
        className="relative z-10 backdrop-blur-md bg-white/90 p-8 rounded-2xl shadow-xl space-y-4 w-full max-w-md"
      >
        <h1 className="text-2xl font-bold text-center text-gray-800">
          {isAdmin ? "Registrar docente" : "Completa tu perfil"}
        </h1>

        <select name="grado" onChange={handleChange} required className="w-full border p-2 rounded text-blue-800">
          <option value="">Grado</option>
          <option>Licenciatura</option>
          <option>Maestría</option>
          <option>Doctorado</option>
        </select>

        <input name="area" placeholder="Área" onChange={handleChange} required className="w-full border p-2 rounded text-blue-800" />

        <input value={form.titulo} readOnly className="w-full border p-2 rounded bg-gray-200 text-blue-800" />

        {isAdmin && (
          <>
            <input name="correo" placeholder="Correo" onChange={handleChange} required className="w-full border p-2 rounded text-blue-800" />
            <input name="password" type="password" placeholder="Password" onChange={handleChange} required className="w-full border p-2 rounded text-blue-800" />
          </>
        )}

        <input name="especialidad" placeholder="Especialidad" onChange={handleChange} required className="w-full border p-2 rounded text-blue-800" />

        <input name="institucion" placeholder="Institución" onChange={handleChange} required className="w-full border p-2 rounded text-blue-800" />

        <button disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded">
          {loading ? "Guardando..." : "Guardar"}
        </button>
      </form>
    </main>
  );
}