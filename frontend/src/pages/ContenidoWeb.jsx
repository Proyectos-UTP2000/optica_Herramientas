import { useState, useEffect, useRef } from "react";
import { useBlocker } from "react-router-dom";
import api from "../api/axiosConfig";
import { Toast, confirmarAccion } from "../utils/alerts";
import {
  Globe,
  TelephoneFill,
  EnvelopeFill,
  GeoAltFill,
  ClockFill,
  Facebook,
  Instagram,
  Tiktok,
  CloudUpload,
  Trash3Fill,
  ArrowUp,
  ArrowDown,
  SaveFill,
} from "react-bootstrap-icons";

const ContenidoWeb = () => {
  const [telefonoContacto, setTelefonoContacto] = useState("");
  const [correoContacto, setCorreoContacto] = useState("");
  const [direccion, setDireccion] = useState("");
  const [horarioAtencion, setHorarioAtencion] = useState("");
  const [enlaceFacebook, setEnlaceFacebook] = useState("");
  const [enlaceInstagram, setEnlaceInstagram] = useState("");
  const [enlaceTiktok, setEnlaceTiktok] = useState("");

  // Logo states
  const [logoUrl, setLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");

  // Carrusel images state
  // Elements: { id: null/Long, url: String, file: File/null, orden: Int, preview: String }
  const [imagenes, setImagenes] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);

  const logoInputRef = useRef();
  const carruselInputRef = useRef();
  const [originalConfig, setOriginalConfig] = useState(null);

  const cargarConfiguracion = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/api/v1/contenido-web", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data;
      setTelefonoContacto(data.telefonoContacto || "");
      setCorreoContacto(data.correoContacto || "");
      setDireccion(data.direccion || "");
      setHorarioAtencion(data.horarioAtencion || "");
      setEnlaceFacebook(data.enlaceFacebook || "");
      setEnlaceInstagram(data.enlaceInstagram || "");
      setEnlaceTiktok(data.enlaceTiktok || "");
      setLogoUrl(data.logoUrl || "");
      setLogoPreview(data.logoUrl || "");

      const listImgs = (data.carouselImagenes || []).map((img, idx) => ({
        id: img.id,
        url: img.url,
        file: null,
        orden: img.orden || idx,
        preview: img.url,
      }));
      // Sort by order
      listImgs.sort((a, b) => a.orden - b.orden);
      setImagenes(listImgs);
      setOriginalConfig({
        telefonoContacto: data.telefonoContacto || "",
        correoContacto: data.correoContacto || "",
        direccion: data.direccion || "",
        horarioAtencion: data.horarioAtencion || "",
        enlaceFacebook: data.enlaceFacebook || "",
        enlaceInstagram: data.enlaceInstagram || "",
        enlaceTiktok: data.enlaceTiktok || "",
        imagenes: listImgs.map((img) => ({ ...img })),
      });
    } catch (error) {
      console.error("Error al cargar configuración web:", error);
      Toast.fire({
        icon: "error",
        title: "No se pudo cargar la configuración",
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  const sonImagenesIguales = (origImgs, curImgs) => {
    if (origImgs.length !== curImgs.length) return false;
    for (let i = 0; i < origImgs.length; i++) {
      const orig = origImgs[i];
      const cur = curImgs[i];
      if (cur.file !== null) return false;
      if (orig.id !== cur.id) return false;
      if (orig.url !== cur.url) return false;
      if (orig.orden !== cur.orden) return false;
    }
    return true;
  };

  const comprobarCambios = () => {
    if (!originalConfig) return false;
    const orig = originalConfig;

    if (telefonoContacto !== orig.telefonoContacto) return true;
    if (correoContacto !== orig.correoContacto) return true;
    if (direccion !== orig.direccion) return true;
    if (horarioAtencion !== orig.horarioAtencion) return true;
    if (enlaceFacebook !== orig.enlaceFacebook) return true;
    if (enlaceInstagram !== orig.enlaceInstagram) return true;
    if (enlaceTiktok !== orig.enlaceTiktok) return true;
    if (logoFile !== null) return true;

    if (!sonImagenesIguales(orig.imagenes, imagenes)) return true;

    return false;
  };

  const tieneCambios = comprobarCambios();

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      tieneCambios && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (blocker.state === "blocked") {
      confirmarAccion(
        "¿Salir sin guardar cambios?",
        "Tienes cambios sin guardar en la configuración. Si sales, se perderán.",
        "Sí, salir",
        "warning",
      ).then((result) => {
        if (result.isConfirmed) {
          blocker.proceed();
        } else {
          blocker.reset();
        }
      });
    }
  }, [blocker.state]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (tieneCambios) {
        e.preventDefault();
        e.returnValue = "Tienes cambios sin guardar. ¿Deseas salir?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [tieneCambios]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleAgregarImagenesCarrusel = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const nuevas = files.map((file, idx) => ({
        id: null,
        url: "",
        file: file,
        orden: imagenes.length + idx,
        preview: URL.createObjectURL(file),
      }));
      setImagenes([...imagenes, ...nuevas]);
    }
  };

  const handleEliminarImagen = (index) => {
    const nuevas = imagenes.filter((_, idx) => idx !== index);
    // Re-ordenar
    nuevas.forEach((img, idx) => {
      img.orden = idx;
    });
    setImagenes(nuevas);
  };

  const handleMoverArriba = (index) => {
    if (index === 0) return;
    const nuevas = [...imagenes];
    const temp = nuevas[index - 1];
    nuevas[index - 1] = nuevas[index];
    nuevas[index] = temp;

    // Actualizar orden
    nuevas.forEach((img, idx) => {
      img.orden = idx;
    });
    setImagenes(nuevas);
  };

  const handleMoverAbajo = (index) => {
    if (index === imagenes.length - 1) return;
    const nuevas = [...imagenes];
    const temp = nuevas[index + 1];
    nuevas[index + 1] = nuevas[index];
    nuevas[index] = temp;

    // Actualizar orden
    nuevas.forEach((img, idx) => {
      img.orden = idx;
    });
    setImagenes(nuevas);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      // List of files to upload for carousel
      const filesToUpload = [];
      let fileCount = 0;

      // Construct DTO structure
      const carouselDTO = imagenes.map((img) => {
        if (img.id) {
          return {
            id: img.id,
            url: img.url,
            orden: img.orden,
            fileIndex: null,
          };
        } else {
          filesToUpload.push(img.file);
          const index = fileCount;
          fileCount++;
          return {
            id: null,
            url: "",
            orden: img.orden,
            fileIndex: index,
          };
        }
      });

      const configDTO = {
        logoUrl: logoFile ? "" : logoUrl, // If new file is selected, logoUrl is empty/overwritten
        telefonoContacto,
        correoContacto,
        direccion,
        horarioAtencion,
        enlaceFacebook,
        enlaceInstagram,
        enlaceTiktok,
        carouselImagenes: carouselDTO,
      };

      formData.append("config", JSON.stringify(configDTO));

      if (logoFile) {
        formData.append("logo", logoFile);
      }

      filesToUpload.forEach((file) => {
        formData.append("carrusel", file);
      });

      await api.put("/api/v1/contenido-web", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Toast.fire({ icon: "success", title: "Configuración web guardada" });
      cargarConfiguracion();
      setLogoFile(null);
    } catch (error) {
      console.error("Error al guardar configuración web:", error);
      Toast.fire({
        icon: "error",
        title: "No se pudo guardar la configuración",
      });
    } finally {
      setGuardando(false);
    }
  };

  const styles = {
    container: {
      padding: "30px",
      backgroundColor: "#f8fafc",
      minHeight: "100vh",
      fontFamily: "'Segoe UI', sans-serif",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "25px",
      borderBottom: "2px solid #e2e8f0",
      paddingBottom: "15px",
    },
    title: {
      fontSize: "26px",
      color: "#1e293b",
      margin: 0,
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    form: { display: "flex", flexDirection: "column", gap: "24px" },
    row: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      gap: "20px",
    },
    card: {
      backgroundColor: "#ffffff",
      borderRadius: "14px",
      padding: "24px",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
      border: "1px solid #e2e8f0",
    },
    cardTitle: {
      fontSize: "16px",
      color: "#334155",
      fontWeight: "600",
      marginBottom: "20px",
      borderBottom: "1px solid #f1f5f9",
      paddingBottom: "10px",
    },
    label: {
      display: "block",
      fontSize: "13px",
      color: "#475569",
      fontWeight: "600",
      marginBottom: "6px",
    },
    inputGroup: {
      display: "flex",
      alignItems: "center",
      border: "1px solid #cbd5e1",
      borderRadius: "10px",
      padding: "10px 14px",
      backgroundColor: "#fff",
      marginBottom: "15px",
    },
    inputIcon: { color: "#94a3b8", marginRight: "10px" },
    input: {
      border: "none",
      outline: "none",
      width: "100%",
      fontSize: "14px",
      color: "#334155",
    },
    logoContainer: { display: "flex", alignItems: "center", gap: "20px" },
    logoPreview: {
      width: "100px",
      height: "100px",
      borderRadius: "10px",
      objectFit: "contain",
      border: "1px dashed #cbd5e1",
      backgroundColor: "#f8fafc",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    uploadBtn: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      border: "1px dashed #2563eb",
      padding: "10px 16px",
      borderRadius: "8px",
      color: "#2563eb",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "13px",
      backgroundColor: "#f0f9ff",
    },
    carouselGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
      gap: "15px",
      marginTop: "15px",
    },
    carouselItem: {
      position: "relative",
      borderRadius: "10px",
      overflow: "hidden",
      border: "1px solid #e2e8f0",
      height: "140px",
    },
    carouselImg: { width: "100%", height: "100%", objectFit: "cover" },
    carouselActions: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: "rgba(15,23,42,0.75)",
      display: "flex",
      justifyContent: "space-around",
      padding: "6px",
      alignItems: "center",
    },
    actionBtn: {
      border: "none",
      background: "none",
      color: "#fff",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "4px",
    },
    btnGuardar: {
      backgroundColor: "#2563eb",
      color: "#fff",
      border: "none",
      padding: "12px 24px",
      borderRadius: "10px",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      cursor: "pointer",
      alignSelf: "flex-end",
      fontSize: "14px",
      boxShadow: "0 4px 6px -1px rgba(37,99,235,0.2)",
    },
  };

  if (cargando) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>
          Cargando datos de configuración web...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>
          <Globe /> Configuración del Catálogo Web
        </h2>
      </div>

      <form style={styles.form} onSubmit={handleGuardar}>
        <div style={styles.row}>
          {/* Card 1: Información de Contacto */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Datos de Contacto de la Tienda</h3>

            <label style={styles.label}>WhatsApp / Teléfono de Pedidos</label>
            <div style={styles.inputGroup}>
              <TelephoneFill style={styles.inputIcon} />
              <input
                type="text"
                placeholder="+51999999999"
                style={styles.input}
                value={telefonoContacto}
                onChange={(e) => setTelefonoContacto(e.target.value)}
                required
              />
            </div>

            <label style={styles.label}>Correo Electrónico Comercial</label>
            <div style={styles.inputGroup}>
              <EnvelopeFill style={styles.inputIcon} />
              <input
                type="email"
                placeholder="contacto@optica.com"
                style={styles.input}
                value={correoContacto}
                onChange={(e) => setCorreoContacto(e.target.value)}
              />
            </div>

            <label style={styles.label}>Dirección Física</label>
            <div style={styles.inputGroup}>
              <GeoAltFill style={styles.inputIcon} />
              <input
                type="text"
                placeholder="Av. Principal 123, Ciudad"
                style={styles.input}
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
              />
            </div>

            <label style={styles.label}>Horario de Atención</label>
            <div style={styles.inputGroup}>
              <ClockFill style={styles.inputIcon} />
              <input
                type="text"
                placeholder="Lunes a Sábado 9:00 AM - 8:00 PM"
                style={styles.input}
                value={horarioAtencion}
                onChange={(e) => setHorarioAtencion(e.target.value)}
              />
            </div>
          </div>

          {/* Card 2: Logo y Redes Sociales */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Logo y Redes Sociales</h3>

            <label style={styles.label}>Logo Oficial</label>
            <div style={styles.logoContainer}>
              <div style={styles.logoPreview}>
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                    Sin Logo
                  </span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                ref={logoInputRef}
                style={{ display: "none" }}
                onChange={handleLogoChange}
              />
              <button
                type="button"
                style={styles.uploadBtn}
                onClick={() => logoInputRef.current.click()}
              >
                <CloudUpload /> Subir Logo
              </button>
            </div>

            <div style={{ marginTop: "24px" }}>
              <label style={styles.label}>Facebook Link</label>
              <div style={styles.inputGroup}>
                <Facebook style={styles.inputIcon} />
                <input
                  type="url"
                  placeholder="https://facebook.com/..."
                  style={styles.input}
                  value={enlaceFacebook}
                  onChange={(e) => setEnlaceFacebook(e.target.value)}
                />
              </div>

              <label style={styles.label}>Instagram Link</label>
              <div style={styles.inputGroup}>
                <Instagram style={styles.inputIcon} />
                <input
                  type="url"
                  placeholder="https://instagram.com/..."
                  style={styles.input}
                  value={enlaceInstagram}
                  onChange={(e) => setEnlaceInstagram(e.target.value)}
                />
              </div>

              <label style={styles.label}>Tiktok Link</label>
              <div style={styles.inputGroup}>
                <Tiktok style={styles.inputIcon} />
                <input
                  type="url"
                  placeholder="https://tiktok.com/..."
                  style={styles.input}
                  value={enlaceTiktok}
                  onChange={(e) => setEnlaceTiktok(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Imágenes del Carrusel B2C */}
        <div style={styles.card}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #f1f5f9",
              paddingBottom: "10px",
              marginBottom: "15px",
            }}
          >
            <h3
              style={{
                fontSize: "16px",
                color: "#334155",
                fontWeight: "600",
                margin: 0,
              }}
            >
              Imágenes del Carrusel Principal (Home B2C)
            </h3>
            <input
              type="file"
              accept="image/*"
              multiple
              ref={carruselInputRef}
              style={{ display: "none" }}
              onChange={handleAgregarImagenesCarrusel}
            />
            <button
              type="button"
              style={styles.uploadBtn}
              onClick={() => carruselInputRef.current.click()}
            >
              <CloudUpload /> Agregar Banner
            </button>
          </div>
          <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
            Añade imágenes destacadas que se proyectarán en la cabecera del
            catálogo público. Puedes reordenarlas con las flechas.
          </p>

          {imagenes.length === 0 ? (
            <div
              style={{
                padding: "40px 10px",
                textAlign: "center",
                border: "2px dashed #cbd5e1",
                borderRadius: "10px",
                marginTop: "20px",
                color: "#94a3b8",
              }}
            >
              No hay imágenes en el carrusel. ¡Agrega tu primer banner
              comercial!
            </div>
          ) : (
            <div style={styles.carouselGrid}>
              {imagenes.map((img, idx) => (
                <div style={styles.carouselItem} key={img.id || `new-${idx}`}>
                  <img
                    src={img.preview}
                    alt={`Banner ${idx}`}
                    style={styles.carouselImg}
                  />
                  <div style={styles.carouselActions}>
                    <button
                      type="button"
                      style={styles.actionBtn}
                      onClick={() => handleMoverArriba(idx)}
                      disabled={idx === 0}
                      title="Mover hacia arriba"
                    >
                      <ArrowUp
                        size={14}
                        style={{ opacity: idx === 0 ? 0.3 : 1 }}
                      />
                    </button>
                    <button
                      type="button"
                      style={styles.actionBtn}
                      onClick={() => handleMoverAbajo(idx)}
                      disabled={idx === imagenes.length - 1}
                      title="Mover hacia abajo"
                    >
                      <ArrowDown
                        size={14}
                        style={{
                          opacity: idx === imagenes.length - 1 ? 0.3 : 1,
                        }}
                      />
                    </button>
                    <button
                      type="button"
                      style={{ ...styles.actionBtn, color: "#f87171" }}
                      onClick={() => handleEliminarImagen(idx)}
                      title="Eliminar imagen"
                    >
                      <Trash3Fill size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          style={styles.btnGuardar}
          disabled={guardando || !tieneCambios}
        >
          <SaveFill /> {guardando ? "Guardando..." : "Guardar Cambios"}
        </button>
      </form>
    </div>
  );
};

export default ContenidoWeb;
