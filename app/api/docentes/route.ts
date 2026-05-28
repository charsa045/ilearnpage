import { NextRequest, NextResponse } from "next/server";
import {
  createDocente,
  getDocentes,
} from "@/lib/docentes/docente.repository";
import {
  getUsuarioByUid,
} from "@/lib/usuarios/usuario.respository";
import { adminAuth } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const docentes = await getDocentes();

    return NextResponse.json(docentes, { status: 200 });
  } catch (error) {
    console.error("Error al obtener docentes:", error);

    return NextResponse.json(
      { error: "Error al obtener docentes" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      uid,
      email,
      password,
      grado,
      titulo,
      especialidad,
      institucion,
    } = await req.json();

    let finalUid = uid;

    if (!uid) {
      if (!email || !password) {
        return NextResponse.json(
          { error: "Email y password requeridos" },
          { status: 400 }
        );
      }

      const user = await adminAuth.createUser({
        email,
        password,
      });

      finalUid = user.uid;
    }

    if (!finalUid) {
      return NextResponse.json(
        { error: "UID requerido" },
        { status: 400 }
      );
    }

    const docente = await createDocente({
      uid: finalUid,
      grado,
      titulo,
      especialidad,
      institucion,
    });

    return NextResponse.json(docente, { status: 201 });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}