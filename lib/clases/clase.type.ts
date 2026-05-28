export interface ClaseDocente {
  id: string;
  nombre: string;
}

export interface ClaseAlumno {
  id: string;
  nombre: string;
  matricula: number;
}

export interface Clase {
  id: string;
  asignatura: string;
  carrera: string;
  docente: ClaseDocente;
  alumnos: ClaseAlumno[];
  totalAlumnos: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClaseInput {
  asignatura: string;
  carrera: string;
  docente: ClaseDocente;
  alumnos: ClaseAlumno[];
}