import { NextRequest, NextResponse } from "next/server";

import {
  getUsuarioByUid,
  getOrCreateUsuario,
} from "@/lib/usuarios/usuario.respository";

import { RolUsuario } from "@/lib/usuarios/usuario.type";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const uid = searchParams.get("uid");

    if (!uid) {
      return NextResponse.json(
        {
          error: "uid es requerido",
        },
        {
          status: 400,
        }
      );
    }

    const usuario = await getUsuarioByUid(uid);

    if (!usuario) {
      return NextResponse.json(
        {
          error: "usuario no encontrado",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(usuario);
  } catch (error) {
    console.error("GET /usuarios error:", error);

    return NextResponse.json(
      {
        error: "error interno",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      uid?: string;
      nombre?: string;
      email?: string;
      rol?: RolUsuario;
    };

    const { uid, nombre, email, rol } = body;

    if (!uid || !nombre || !email) {
      return NextResponse.json(
        {
          error: "faltan datos",
        },
        {
          status: 400,
        }
      );
    }

    const usuario = await getOrCreateUsuario({
      uid,
      nombre,
      email,
      rol: rol || "docente",
    });

    return NextResponse.json(usuario, {
      status: 201,
    });
  } catch (error) {
    console.error("POST /usuarios error:", error);

    return NextResponse.json(
      {
        error: "error interno",
      },
      {
        status: 500,
      }
    );
  }
}