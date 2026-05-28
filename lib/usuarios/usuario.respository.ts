import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { Usuario } from "./usuario.type";

const COLLECTION_NAME = "usuarios";

function mapDocToUsuario(doc: FirebaseFirestore.DocumentSnapshot): Usuario {
  const data = doc.data();

  if (!data) {
    throw new Error("Usuario sin data");
  }

  return {
    uid: doc.id,
    nombre: data.nombre,
    email: data.email,
    rol: data.rol,
    activo: data.activo ?? true,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
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
  data: Omit<Usuario, "createdAt">
) {
  const docRef = adminDb
    .collection(COLLECTION_NAME)
    .doc(data.uid);

  const doc = await docRef.get();

  if (doc.exists) {
    return; // ya existe
  }

  await docRef.set({
    ...data,
    createdAt: Timestamp.now(),
  });
}


export async function getOrCreateUsuario({
  uid,
  nombre,
  email,
}: {
  uid: string;
  nombre: string;
  email: string;
}): Promise<Usuario> {
  const existente = await getUsuarioByUid(uid);

  if (existente) {
    return existente;
  }

  const nuevoUsuario: Omit<Usuario, "createdAt"> = {
    uid,
    nombre,
    email,
    rol: "docente",
    activo: true,
  };

  await createUsuario(nuevoUsuario);

  return {
    ...nuevoUsuario,
    createdAt: new Date(),
  };
}


export async function desactivarUsuario(uid: string) {
  await adminDb
    .collection(COLLECTION_NAME)
    .doc(uid)
    .update({
      activo: false,
    });
}