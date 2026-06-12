"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LocationSection from "@/components/LocationSection";
import PublicCarousel from "@/components/PublicCarousel";
import PublicFooter from "@/components/PublicFooter";
import PublicNavbar from "@/components/PublicNavbar";
import VideoPlayer from "@/components/VideoPlayer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { buildAssetUrl } from "@/services/api";
import {
  getThemeStyle,
  mezclarConfiguracion,
  obtenerConfiguracionPublica,
} from "@/services/configuracionSitioService";
import {
  obtenerGaleriaTrabajosPublica,
  obtenerProductosPublicos,
  obtenerPromocionesPublicas,
  obtenerServiciosPublicos,
  obtenerTestimoniosPublicos,
} from "@/services/publicService";

function formatoMoneda(valor) {
  if (valor === null || valor === undefined || valor === "") return "";

  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
  }).format(Number(valor));
}

function MediaModal({ media, onClose }) {
  if (!media) return null;

  return (
    <div className="public-media-modal" role="dialog" aria-modal="true">
      <button
        type="button"
        className="btn btn-light public-media-modal-close"
        onClick={onClose}
      >
        Cerrar
      </button>
      <div className="public-media-modal-content">
        {media.tipo === "VIDEO" ? (
          <VideoPlayer
            url={media.url_media}
            title={media.titulo || "Video de trabajo"}
            className="w-100 rounded"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={buildAssetUrl(media.url_media)}
            alt={media.titulo || "Trabajo Bonnys"}
            className="public-media-modal-image"
          />
        )}
        {(media.titulo || media.descripcion) && (
          <div className="text-white text-center mt-3">
            {media.titulo && <h2 className="h4 fw-bold">{media.titulo}</h2>}
            {media.descripcion && <p className="text-white-75 mb-0">{media.descripcion}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [configuracion, setConfiguracion] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [testimonios, setTestimonios] = useState([]);
  const [promociones, setPromociones] = useState([]);
  const [galeriaTrabajos, setGaleriaTrabajos] = useState([]);
  const [mediaSeleccionada, setMediaSeleccionada] = useState(null);

  useEffect(() => {
    async function cargarDatosPublicos() {
      try {
        const [
          respuestaConfiguracion,
          respuestaServicios,
          respuestaProductos,
          respuestaTestimonios,
          respuestaPromociones,
          respuestaGaleria,
        ] = await Promise.all([
          obtenerConfiguracionPublica(),
          obtenerServiciosPublicos(),
          obtenerProductosPublicos(),
          obtenerTestimoniosPublicos(),
          obtenerPromocionesPublicas(),
          obtenerGaleriaTrabajosPublica(),
        ]);

        setConfiguracion(respuestaConfiguracion?.data || null);
        setServicios(respuestaServicios?.data || []);
        setProductos(respuestaProductos?.data || []);
        setTestimonios(respuestaTestimonios?.data || []);
        setPromociones(respuestaPromociones?.data || []);
        setGaleriaTrabajos(respuestaGaleria?.data || []);
      } catch {
        setConfiguracion(null);
        setServicios([]);
        setProductos([]);
        setTestimonios([]);
        setPromociones([]);
        setGaleriaTrabajos([]);
      }
    }

    cargarDatosPublicos();
  }, []);

  useEffect(() => {
    if (!mediaSeleccionada) return;

    function cerrarConEscape(event) {
      if (event.key === "Escape") {
        setMediaSeleccionada(null);
      }
    }

    document.body.classList.add("modal-open");
    window.addEventListener("keydown", cerrarConEscape);

    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", cerrarConEscape);
    };
  }, [mediaSeleccionada]);

  const config = mezclarConfiguracion(configuracion);
  const serviciosDestacados = servicios.slice(0, 6);
  const productosDestacados = productos.slice(0, 6);

  return (
    <main className="public-home commercial-home" style={getThemeStyle(config)}>
      <PublicNavbar />

      <section
        className="commercial-hero"
        style={
          config.portada_url
            ? {
                backgroundImage: `linear-gradient(180deg, rgba(17, 24, 39, 0.42), rgba(127, 29, 29, 0.72)), url(${buildAssetUrl(config.portada_url)})`,
              }
            : undefined
        }
      >
        <div className="container">
          <div className="commercial-hero-content mx-auto text-center">
            <span className="badge text-bg-light border mb-3">
              Salón de belleza
            </span>
            <h1 className="display-2 fw-bold text-white mb-3">
              {config.titulo_portada || config.nombre_negocio}
            </h1>
            <p className="lead text-white-75 mb-4">
              {config.subtitulo_portada}
            </p>
            <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
              <Link href="/agendar-cita" className="btn btn-primary btn-lg">
                Agendar cita
              </Link>
              <Link href="/servicios-publicos" className="btn btn-light btn-lg">
                Ver servicios
              </Link>
            </div>
          </div>
        </div>
      </section>

      {serviciosDestacados.length > 0 && (
        <section id="servicios" className="commercial-section">
          <div className="container">
            <div className="commercial-section-heading text-center">
              <span className="badge text-bg-light border mb-2">Servicios</span>
              <h2 className="h1 fw-bold">Servicios destacados</h2>
              <p className="text-secondary mb-0">
                Tratamientos seleccionados para resaltar tu estilo y cuidado personal.
              </p>
            </div>

            <PublicCarousel
              items={serviciosDestacados}
              label="servicios destacados"
              itemKey={(servicio) => servicio.id_servicio}
              renderItem={(servicio) => <ServicioCard servicio={servicio} />}
            />
          </div>
        </section>
      )}

      {productosDestacados.length > 0 && (
        <section id="productos" className="commercial-section bg-white">
          <div className="container">
            <div className="commercial-section-heading text-center">
              <span className="badge text-bg-light border mb-2">Productos</span>
              <h2 className="h1 fw-bold">Productos destacados</h2>
              <p className="text-secondary mb-0">
                Selección de productos disponibles para cuidar tu estilo en casa.
              </p>
            </div>

            <PublicCarousel
              items={productosDestacados}
              label="productos destacados"
              itemKey={(producto) => producto.id_producto}
              renderItem={(producto) => <ProductoCard producto={producto} />}
            />
          </div>
        </section>
      )}

      {galeriaTrabajos.length > 0 && (
        <section id="galeria" className="commercial-section">
          <div className="container">
            <div className="commercial-section-heading text-center">
              <span className="badge text-bg-light border mb-2">Galería</span>
              <h2 className="h1 fw-bold">Trabajos recientes</h2>
              <p className="text-secondary mb-0">
                Inspiración visual con resultados reales del salón.
              </p>
            </div>

            <PublicCarousel
              items={galeriaTrabajos}
              label="galería de trabajos"
              itemKey={(trabajo) => trabajo.id_trabajo}
              renderItem={(trabajo) => (
                <TrabajoCard
                  trabajo={trabajo}
                  onClick={() => setMediaSeleccionada(trabajo)}
                />
              )}
            />
          </div>
        </section>
      )}

      {promociones.length > 0 && (
        <section id="promociones" className="commercial-section">
          <div className="container">
            <div className="commercial-section-heading text-center">
              <span className="badge text-bg-light border mb-2">Promociones</span>
              <h2 className="h1 fw-bold">Ofertas para consentirte</h2>
              <p className="text-secondary mb-0">
                Beneficios vigentes para reservar tu próxima visita.
              </p>
            </div>

            <PublicCarousel
              items={promociones}
              label="promociones"
              itemKey={(promo) => promo.id_promocion}
              renderItem={(promo) => <PromocionCard promo={promo} />}
            />
          </div>
        </section>
      )}

      {testimonios.length > 0 && (
        <section id="testimonios" className="commercial-section bg-white">
          <div className="container">
            <div className="commercial-section-heading text-center">
              <span className="badge text-bg-light border mb-2">Testimonios</span>
              <h2 className="h1 fw-bold">Clientes que recomiendan Bonnys</h2>
            </div>

            <PublicCarousel
              items={testimonios}
              label="testimonios"
              itemKey={(testimonio) => testimonio.id_testimonio}
              renderItem={(testimonio) => <ReviewCard testimonio={testimonio} />}
            />
          </div>
        </section>
      )}

      <section id="ubicacion" className="commercial-section">
        <div className="container">
          <LocationSection />
        </div>
      </section>

      <PublicFooter configuracion={configuracion} />
      <WhatsAppButton />
      <MediaModal media={mediaSeleccionada} onClose={() => setMediaSeleccionada(null)} />
    </main>
  );
}

function ReviewCard({ testimonio }) {
  return (
    <article className="google-review-card h-100">
      <div className="d-flex align-items-center gap-3 mb-3">
        {testimonio.url_foto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={buildAssetUrl(testimonio.url_foto)}
            alt={testimonio.nombre_cliente}
            className="public-testimonial-photo"
          />
        ) : (
          <div className="public-testimonial-photo public-testimonial-initial">
            {testimonio.nombre_cliente?.slice(0, 1)}
          </div>
        )}
        <div>
          <h3 className="h6 fw-bold mb-1">{testimonio.nombre_cliente}</h3>
          <div className="text-warning" aria-label={`${testimonio.calificacion} estrellas`}>
            {"★".repeat(Number(testimonio.calificacion || 0))}
          </div>
        </div>
      </div>
      <p className="text-secondary mb-0">“{testimonio.comentario}”</p>
    </article>
  );
}

function ServicioCard({ servicio }) {
  return (
    <article className="commercial-service-card h-100">
      {servicio.url_foto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={buildAssetUrl(servicio.url_foto)}
          alt={servicio.nombre}
          className="commercial-service-image"
        />
      ) : (
        <div className="commercial-service-image commercial-service-placeholder">
          {servicio.nombre?.slice(0, 1)}
        </div>
      )}
      <div className="p-4">
        <div className="d-flex justify-content-between align-items-start gap-3 mb-2">
          <h3 className="h5 fw-bold mb-0">{servicio.nombre}</h3>
          <span className="badge text-bg-light border">
            {servicio.duracion_minutos} min
          </span>
        </div>
        <p className="text-secondary small mb-3">
          {servicio.descripcion || "Servicio profesional disponible en Bonnys."}
        </p>
        <p className="fs-5 fw-bold text-primary mb-4">
          {formatoMoneda(servicio.precio)}
        </p>
        <div className="d-flex flex-column flex-sm-row gap-2">
          <Link
            href={`/servicios-publicos/${servicio.id_servicio}`}
            className="btn btn-outline-primary flex-fill"
          >
            Ver detalles
          </Link>
          <Link href="/agendar-cita" className="btn btn-primary flex-fill">
            Agendar
          </Link>
        </div>
      </div>
    </article>
  );
}

function ProductoCard({ producto }) {
  return (
    <article className="commercial-service-card h-100">
      {producto.url_foto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={buildAssetUrl(producto.url_foto)}
          alt={producto.nombre}
          className="commercial-service-image"
        />
      ) : (
        <div className="commercial-service-image commercial-service-placeholder">
          {producto.nombre?.slice(0, 1)}
        </div>
      )}
      <div className="p-4">
        <h3 className="h5 fw-bold mb-2">{producto.nombre}</h3>
        <p className="text-secondary small mb-3">
          {producto.descripcion || "Producto disponible en Bonnys."}
        </p>
        <div className="d-flex justify-content-between align-items-center gap-3 mb-4">
          <p className="fs-5 fw-bold text-primary mb-0">
            {formatoMoneda(producto.precio_venta)}
          </p>
          {producto.stock_actual !== undefined && (
            <span className="badge text-bg-light border">
              Stock {producto.stock_actual}
            </span>
          )}
        </div>
        <div className="d-flex flex-column flex-sm-row gap-2">
          <Link
            href={`/productos-publicos/${producto.id_producto}`}
            className="btn btn-outline-primary flex-fill"
          >
            Ver producto
          </Link>
          <Link href="/productos-publicos" className="btn btn-primary flex-fill">
            Ver productos
          </Link>
        </div>
      </div>
    </article>
  );
}

function TrabajoCard({ trabajo, onClick }) {
  return (
    <button type="button" className="instagram-grid-item w-100" onClick={onClick}>
      {trabajo.tipo === "VIDEO" ? (
        <>
          <VideoPlayer
            url={trabajo.url_media}
            title={trabajo.titulo || "Video de trabajo"}
            muted
            controls={false}
          />
          <span className="instagram-grid-badge">Video</span>
        </>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={buildAssetUrl(trabajo.url_media)}
          alt={trabajo.titulo || "Trabajo Bonnys"}
        />
      )}
      <span className="instagram-grid-overlay">
        {trabajo.titulo || "Ver trabajo"}
      </span>
    </button>
  );
}

function PromocionCard({ promo }) {
  return (
    <article className="premium-promo-card h-100">
      {promo.url_imagen && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={buildAssetUrl(promo.url_imagen)}
          alt={promo.titulo}
          className="premium-promo-image"
        />
      )}
      <div className="p-4">
        <span className="badge text-bg-primary mb-3">Oferta especial</span>
        <h3 className="h4 fw-bold">{promo.titulo}</h3>
        <p className="text-secondary promo-description">
          {promo.descripcion}
        </p>
        <div className="premium-price-row mb-4">
          {promo.precio_original && (
            <span className="premium-price-old">
              {formatoMoneda(promo.precio_original)}
            </span>
          )}
          {promo.precio_promocion && (
            <span className="premium-price-new">
              {formatoMoneda(promo.precio_promocion)}
            </span>
          )}
        </div>
        <Link href="/agendar-cita" className="btn btn-primary w-100">
          Agendar ahora
        </Link>
      </div>
    </article>
  );
}
