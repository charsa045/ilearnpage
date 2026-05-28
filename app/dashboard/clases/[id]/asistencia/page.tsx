import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { getAlumnosPorClase } from "@/lib/alumnos/alumno.repository";
import {
  getAsistenciaHoy,
  getAsistenciasByClase,
} from "@/lib/asistencias/asistencia.repository";

import TomarAsistencia from "./TomarAsistencia";
import PublicHeader from "@/components/layout/header";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id: claseId } = await params;

    if (!claseId) throw new Error("claseId undefined");

    const cookieStore = cookies();
    const session = (await cookies()).get("__session");

    if (!session) {
      redirect("/");
    }

    const alumnos = await getAlumnosPorClase(claseId);
    const asistenciaHoy = await getAsistenciaHoy(claseId);
    const asistencias = await getAsistenciasByClase(claseId);


    const alumnosOrdenados = [...alumnos].sort((a: any, b: any) =>
      a.nombre.localeCompare(b.nombre)
    );

    const asistenciasOrdenadas = [...asistencias].sort(
      (a: any, b: any) =>
        new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    );
    const yaTomada = !!asistenciaHoy;

    const fechas = [
      ...new Set(asistenciasOrdenadas.map((a: any) => a.fecha)),
    ];

    return (
      <div className="min-h-screen bg-linear-0 from-blue-600 to-emerald-700 flex flex-col">

        {/* HEADER */}
        <PublicHeader />

        <div className="max-w-6xl mx-auto w-full px-6 py-10 space-y-8">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <h1 className="text-3xl font-extrabold text-yellow-200 text-shadow-md">
                Asistencia de la clase
              </h1>

              <p className={`text-sm mt-1 text-shadow-md ${
                yaTomada ? "text-green-200" : "text-yellow-600"
              }`}>
                {yaTomada
                  ? "Asistencia de hoy registrada"
                  : "Falta tomar asistencia hoy"}
              </p>
            </div>

            {/* BOTÓN VOLVER */}
            <a
              href="/dashboard"
              className="bg-white text-blue-700 border-2 border-white px-5 py-2 rounded-full font-bold 
              hover:bg-blue-700 hover:text-white hover:border-2 hover:border-white transition text-center"
            >
              ← Regresar
            </a>
          </div>

          {/* PRINCIPAL */}
          <div className="bg-white/90 rounded-2xl shadow p-6">

            <h2 className="text-xl font-bold mb-4 text-gray-700">
              Tomar / Editar asistencia
            </h2>

            <TomarAsistencia
              alumnos={alumnosOrdenados}
              claseId={claseId}
              fechas={fechas}
              yaTomada={yaTomada}
            />
          </div>

          {/* HISTORIAL */}
          <div className="bg-white/90 rounded-2xl shadow p-6 overflow-auto">

            <h2 className="text-xl font-bold mb-4 text-gray-700">
              Historial de asistencia
            </h2>

            <table className="min-w-full text-sm">

              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="p-3 text-left">
                    Alumno
                  </th>

                  {fechas.map((f: string) => (
                    <th
                      key={f}
                      className="p-3 text-center whitespace-nowrap"
                    >
                      {new Date(f).toLocaleDateString()}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {alumnosOrdenados.length === 0 ? (
                  <tr>
                    <td
                      colSpan={fechas.length + 1}
                      className="p-6 text-center text-gray-500"
                    >
                      No hay alumnos registrados
                    </td>
                  </tr>
                ) : (
                  alumnosOrdenados.map((alumno: any) => (
                    <tr
                      key={alumno.id}
                      className="border-t bg-gray-50 hover:bg-yellow-100 transition"
                    >
                      {/* Nombre */}
                      <td className="p-3 font-medium whitespace-nowrap text-gray-800">
                        {alumno.nombre}
                      </td>

                      {/* Asistencias */}
                      {asistenciasOrdenadas.map((a: any) => {
                        const registro = a.alumnos.find(
                          (al: any) =>
                            al.alumnoId === alumno.id
                        );

                        return (
                          <td
                            key={a.fecha}
                            className="p-3 text-center"
                          >
                            {registro ? (
                              registro.presente ? (
                                <span className="inline-block px-2 py-1 text-xs font-bold bg-green-100 text-green-700 rounded-full">
                                  Presente
                                </span>
                              ) : (
                                <span className="inline-block px-2 py-1 text-xs font-bold bg-red-100 text-red-700 rounded-full">
                                  Ausente
                                </span>
                              )
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error en asistencia:", error);

    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 text-lg">
          Error cargando la asistencia
        </p>
      </div>
    );
  }
}