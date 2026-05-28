import { Timestamp } from "firebase-admin/firestore";
import { CreateClaseInput, Clase } from "./clase.type";
import { adminDb } from "../firebase-admin";

const COLLECTION_NAME = "clases";

export async function createClase(
  input: CreateClaseInput
): Promise<Clase> {

  const now = Timestamp.now();

  const claseData = {
    asignatura: input.asignatura,
    carrera: input.carrera,
    docente: input.docente,
    alumnos: input.alumnos,
    totalAlumnos: input.alumnos.length,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await adminDb
    .collection(COLLECTION_NAME)
    .add(claseData);

  return {
    id: docRef.id,
    asignatura: claseData.asignatura,
    carrera: claseData.carrera,
    docente: claseData.docente,
    alumnos: claseData.alumnos,
    totalAlumnos: claseData.totalAlumnos,
    createdAt: now.toDate().toISOString(),
    updatedAt: now.toDate().toISOString(),
  };
}

export async function getClases(): Promise<Clase[]> {

  const snapshot = await adminDb
    .collection(COLLECTION_NAME)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      asignatura: String(data.asignatura ?? ""),
      carrera: String(data.carrera ?? ""),

      docente: data.docente
        ? {
            id: String(data.docente.id ?? ""),
            nombre: String(data.docente.nombre ?? ""),
          }
        : {
            id: "",
            nombre: "Sin docente",
          },

      alumnos: Array.isArray(data.alumnos) ? data.alumnos : [],
      totalAlumnos: Number(data.totalAlumnos ?? 0),

      createdAt: data.createdAt?.toDate?.().toISOString() ?? "",
      updatedAt: data.updatedAt?.toDate?.().toISOString() ?? "",
    };
  });
}


export async function getClasesByDocente(docenteId: string) {
  if (!docenteId) throw new Error("docenteId requerido");

  const snapshot = await adminDb
    .collection("clases")
    .where("docente.id", "==", docenteId)
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      asignatura: String(data.asignatura ?? ""),
      carrera: String(data.carrera ?? ""),
      docente: data.docente,
      alumnos: Array.isArray(data.alumnos) ? data.alumnos : [],
      totalAlumnos: Number(data.totalAlumnos ?? 0),
      createdAt: data.createdAt?.toDate?.().toISOString() ?? "",
    };
  });
}