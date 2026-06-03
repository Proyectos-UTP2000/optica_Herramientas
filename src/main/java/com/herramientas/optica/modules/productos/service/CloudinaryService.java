package com.herramientas.optica.modules.productos.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import java.io.IOException;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public String subirImagen(MultipartFile archivo, String codigoProducto)
        throws IOException {
        String folder = "optica/productos/" + codigoProducto;
        Map<String, Object> uploadResult = cloudinary
            .uploader()
            .upload(archivo.getBytes(), ObjectUtils.asMap("folder", folder));
        return uploadResult.get("secure_url").toString();
    }

    public String actualizarImagen(MultipartFile archivo, String codigoProducto)
        throws IOException {
        String folder = "optica/productos/" + codigoProducto;

        try {
            // 1. Intentamos eliminar las imágenes previas
            cloudinary
                .api()
                .deleteResourcesByPrefix(folder, ObjectUtils.emptyMap());
        } catch (Exception e) {
            // 2. Si Cloudinary lanza error (ej. la carpeta no existe), entra aquí.
            // IMPORTANTE: Solo imprimimos un log, pero NO volvemos a lanzar la excepción (throw).
            // Esto permite que el error "muera" aquí y el código siga su camino.
            System.out.println(
                "Aviso: No se pudo vaciar la carpeta previa (probablemente no existía). Detalle: " +
                    e.getMessage()
            );
        }

        // 3. Como el error fue capturado e ignorado, el flujo continúa y sube la nueva imagen sin problemas.
        return subirImagen(archivo, codigoProducto);
    }

    public void eliminarCarpetaProducto(String codigoProducto)
        throws Exception {
        String folder = "optica/productos/" + codigoProducto;

        try {
            // Elimina todos los recursos en la carpeta
            cloudinary
                .api()
                .deleteResourcesByPrefix(folder, ObjectUtils.emptyMap());
            // Elimina la carpeta en sí
            cloudinary.api().deleteFolder(folder, ObjectUtils.emptyMap());
        } catch (Exception e) {
            System.out.println(
                "Aviso al eliminar: La carpeta o sus recursos no se encontraron. Detalle: " +
                    e.getMessage()
            );
        }
    }
}
