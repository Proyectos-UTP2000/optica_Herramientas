package com.herramientas.optica.modules.productos.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public String subirImagen(MultipartFile archivo, String codigoProducto) throws IOException {
        String folder = "optica/productos/" + codigoProducto;
        Map<String, Object> uploadResult = cloudinary.uploader().upload(archivo.getBytes(), ObjectUtils.asMap(
                "folder", folder
        ));
        return uploadResult.get("secure_url").toString();
    }

    public void eliminarCarpetaProducto(String codigoProducto) throws Exception {
        String folder = "optica/productos/" + codigoProducto;
        // Elimina todos los recursos en la carpeta
        cloudinary.api().deleteResourcesByPrefix(folder, ObjectUtils.emptyMap());
        // Elimina la carpeta en sí
        // Nota: Cloudinary solo permite borrar carpetas si están vacías. 
        // deleteResourcesByPrefix se encarga de vaciarla.
        cloudinary.api().deleteFolder(folder, ObjectUtils.emptyMap());
    }
}
