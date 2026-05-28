import { NextRequest, NextResponse } from "next/server";
import {
  getUsuarioByUid,
  getOrCreateUsuario,
} from "@/lib/usuarios/usuario.respository";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");

    if (!uid) {
      return NextResponse.json(
        { error: "uid es requerido" },
        { status: 400 }
      );
    }

    const usuario = await getUsuarioByUid(uid);

    if (!usuario) {
      return NextResponse.json(
        { error: "usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(usuario);
  } catch (error) {
    console.error("GET /usuarios error:", error);

    return NextResponse.json(
      { error: "error interno" },
      { status: 500 }
    );
  }
}


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { uid, nombre, email, rol } = body;

    if (!uid || !nombre || !email) {
      return NextResponse.json(
        { error: "faltan datos" },
        { status: 400 }
      );
    }

    export async function getOrCreateUsuario({
  uid,
  nombre,
  email,
  rol = "docente",
}: {
  uid: string;
  nombre: string;
  email: string;
  rol?: RolUsuario;
}): Promise<Usuario> {
  const existente = await getUsuarioByUid(uid);

  if (existente) {
    return existente;
  }

  const nuevoUsuario: Omit<Usuario, "createdAt"> = {
    uid,
    nombre,
    email,
    rol,
    activo: true,
    imageUrl: "",
    imagePublicId: "",
  };

  await createUsuario(nuevoUsuario);

  return {
    ...nuevoUsuario,
    createdAt: new Date(),
  };
}