"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/authService";
import { guardarToken, guardarUsuario } from "@/utils/auth";

export default function LoginPage() {
  const router = useRouter();
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setCargando(true);

    try {
      const respuesta = await login(nombreUsuario, password);
      const token = respuesta?.data?.token;
      const usuario = respuesta?.data?.usuario;

      if (!token || !usuario) {
        throw new Error("Respuesta de login invalida");
      }

      guardarToken(token);
      guardarUsuario(usuario);
      router.push("/dashboard");
    } catch {
      setError("Credenciales incorrectas. Verifica tu usuario y contraseña.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="login-page d-flex align-items-center">
      <section className="container py-5">
        <div className="row justify-content-center align-items-center g-4">
          <div className="col-12 col-lg-5">
            <div className="login-intro text-center text-lg-start">
              <span className="badge text-bg-light border mb-3">
                Bonnys
              </span>
              <h1 className="display-5 fw-bold text-dark mb-3">
                Bienvenida al sistema
              </h1>
              <p className="lead text-secondary mb-0">
                Administra citas, clientes y servicios del salón desde un solo
                lugar.
              </p>
            </div>
          </div>

          <div className="col-12 col-md-8 col-lg-5">
            <div className="card border-0 shadow login-card">
              <div className="card-body p-4 p-md-5">
                <div className="text-center mb-4">
                  <span className="login-mark d-inline-flex align-items-center justify-content-center mb-3">
                    B
                  </span>
                  <h2 className="h3 fw-bold mb-1">Iniciar sesión</h2>
                  <p className="text-secondary mb-0">
                    Ingresa tus credenciales para continuar.
                  </p>
                </div>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="nombre_usuario" className="form-label">
                      Usuario
                    </label>
                    <input
                      id="nombre_usuario"
                      name="nombre_usuario"
                      type="text"
                      className="form-control form-control-lg"
                      value={nombreUsuario}
                      onChange={(event) => setNombreUsuario(event.target.value)}
                      autoComplete="username"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password" className="form-label">
                      Contraseña
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      className="form-control form-control-lg"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete="current-password"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100"
                    disabled={cargando}
                  >
                    {cargando ? "Iniciando sesión..." : "Iniciar sesión"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
