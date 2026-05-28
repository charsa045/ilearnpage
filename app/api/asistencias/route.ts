import { NextRequest, NextResponse } from "next/server";
import {
  crearAsistencia,
  getAsistenciaHoy,
  editarAsistencia,
  getAsistenciasByClase,
  getAsistenciaByFecha,
} from "@/lib/asistencias/asistencia.repository";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { claseId, alumnos, fecha } = body;

    if (!claseId || !alumnos || !fecha) {
      return NextResponse.json(
        { message: "Datos incompletos" },
        { status: 400 }
      );
    }

    const existente = await getAsistenciaByFecha(
      claseId,
      fecha
    );

    if (existente?.id) {
      return NextResponse.json(
        {
          message:
            "La asistencia para esta fecha ya existe (usa edición)",
        },
        { status: 400 }
      );
    }

    await adminDb.collection("asistencias").add({
      claseId,
      fecha,
      alumnos,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error al guardar" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    const { claseId, alumnos, fecha } = body;

    if (!claseId || !alumnos || !fecha) {
      return NextResponse.json(
        { message: "Datos incompletos" },
        { status: 400 }
      );
    }

    const existente = await getAsistenciaByFecha(
      claseId,
      fecha
    );

    if (!existente?.id) {
      return NextResponse.json(
        { message: "No existe asistencia para editar" },
        { status: 404 }
      );
    }

    await adminDb
      .collection("asistencias")
      .doc(existente.id)
      .update({
        alumnos,
      });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error al actualizar" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const claseId = searchParams.get("claseId");
    const hoy = searchParams.get("hoy");
    const fecha = searchParams.get("fecha"); // 👈 NUEVO

    if (!claseId) {
      return NextResponse.json(
        { message: "claseId es requerido" },
        { status: 400 }
      );
    }

    if (hoy === "true") {
      const asistencia = await getAsistenciaHoy(claseId);
      return NextResponse.json(asistencia);
    }

    if (fecha) {
      const asistencia = await getAsistenciaByFecha(
        claseId,
        fecha
      );

      return NextResponse.json(asistencia);
    }

    const asistencias = await getAsistenciasByClase(
      claseId
    );

    return NextResponse.json(asistencias);
  } catch (error) {
    console.error("ERROR API ASISTENCIAS:", error);

    return NextResponse.json(
      { message: "Error al obtener asistencias" },
      { status: 500 }
    );
  }
}

