import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { RolUsuario, Usuario } from "./usuario.type";

const COLLECTION_NAME = "usuarios";

function mapDocToUsuario(
  doc: FirebaseFirestore.DocumentSnapshot
): Usuario {
  const data = doc.data();

  if (!data) {
    throw new Error("Usuario sin data");
  }

  return {
    uid: doc.id,

    nombre: data.nombre ?? "Sin nombre",
    email: data.email ?? "Sin correo",

    rol: data.rol ?? "docente",

    imageUrl: data.imageUrl ?? "",
    imagePublicId: data.imagePublicId ?? "",

    activo: data.activo ?? true,

    createdAt: data.createdAt?.toDate?.() ?? new Date(),
    updatedAt: data.updatedAt?.toDate?.(),
  };
}

export async function getUsuarioByUid(
  uid: string
): Promise<Usuario | null> {
  if (!uid) return null;

  const doc = await adminDb
    .collection(COLLECTION_NAME)
    .doc(uid)
    .get();

  if (!doc.exists) {
    return null;
  }

  return mapDocToUsuario(doc);
}

export async function createUsuario(
  data: Omit<Usuario, "createdAt" | "updatedAt">
): Promise<void> {
  const docRef = adminDb
    .collection(COLLECTION_NAME)
    .doc(data.uid);

  const doc = await docRef.get();

  if (doc.exists) {
    return;
  }

  await docRef.set({
    ...data,
    imageUrl: data.imageUrl ?? "",
    imagePublicId: data.imagePublicId ?? "",
    activo: data.activo ?? true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
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

  const nuevoUsuario: Omit<Usuario, "createdAt" | "updatedAt"> = {
    uid,
    nombre,
    email,
    rol,
    imageUrl: "",
    imagePublicId: "",
    activo: true,
  };

  await createUsuario(nuevoUsuario);

  return {
    ...nuevoUsuario,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function desactivarUsuario(
  uid: string
): Promise<void> {
  if (!uid) {
    throw new Error("uid requerido");
  }

  await adminDb
    .collection(COLLECTION_NAME)
    .doc(uid)
    .update({
      activo: false,
      updatedAt: Timestamp.now(),
    });
}