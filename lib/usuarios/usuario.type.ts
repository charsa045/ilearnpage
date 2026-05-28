export type RolUsuario = "admin" | "docente";

export interface Usuario {
  uid: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
  activo: boolean;
  createdAt: Date;
}