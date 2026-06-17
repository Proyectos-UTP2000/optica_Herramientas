package com.herramientas.optica.modules.webconfig.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.herramientas.optica.modules.productos.service.CloudinaryService;
import com.herramientas.optica.modules.webconfig.dto.WebConfigDTO;
import com.herramientas.optica.modules.webconfig.dto.WebConfigDTO.CarouselImagenDTO;
import com.herramientas.optica.modules.webconfig.model.WebConfig;
import com.herramientas.optica.modules.webconfig.repository.WebConfigRepository;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class WebConfigServiceTest {

    @Autowired
    private WebConfigService webConfigService;

    @Autowired
    private WebConfigRepository webConfigRepository;

    @Autowired
    private jakarta.persistence.EntityManager entityManager;

    @MockitoBean
    private CloudinaryService cloudinaryService;

    @BeforeEach
    void setUp() {
        entityManager.createNativeQuery("DELETE FROM web_carousel_imagen").executeUpdate();
        entityManager.createNativeQuery("DELETE FROM web_config").executeUpdate();
        entityManager.createNativeQuery("INSERT INTO web_config (id_web_config, web_telefono_contacto, web_correo_contacto, web_direccion, web_horario_atencion) " +
                "VALUES (1, '+51999999999', 'contacto@optica.com', 'Av. Principal 123', 'Lunes a Sábado 9:00 AM - 8:00 PM')").executeUpdate();
        entityManager.flush();
        entityManager.clear();
    }

    @Test
    void obtenerConfiguracionRetornaRegistroConId1() {
        // La migracion V12 inserta el ID 1 por defecto
        WebConfigDTO config = webConfigService.obtenerConfiguracion();
        assertThat(config).isNotNull();
        assertThat(config.getTelefonoContacto()).isEqualTo("+51999999999");
    }

    @Test
    void actualizarConfiguracionModificaCamposBasicosYActualizaLogo() throws Exception {
        // Configurar mock de Cloudinary
        MockMultipartFile logoFile = new MockMultipartFile("logo", "logo.png", "image/png", "bytes-del-logo".getBytes());
        when(cloudinaryService.subirImagen(any(), eq("web_config"))).thenReturn("http://res.cloudinary.com/demo/image/upload/v1234/web_config/logo_nuevo.png");

        WebConfigDTO updateDto = WebConfigDTO.builder()
                .telefonoContacto("+51987654321")
                .correoContacto("nuevo@optica.com")
                .direccion("Av. Progreso 456")
                .horarioAtencion("Lunes a Viernes 8am - 6pm")
                .enlaceFacebook("https://fb.com/optica")
                .enlaceInstagram("https://ig.com/optica")
                .enlaceTiktok("https://tk.com/optica")
                .logoUrl("") // Se envia vacio porque se sube nuevo archivo
                .carouselImagenes(new ArrayList<>())
                .build();

        WebConfigDTO result = webConfigService.actualizarConfiguracion(updateDto, logoFile, null);

        assertThat(result.getTelefonoContacto()).isEqualTo("+51987654321");
        assertThat(result.getCorreoContacto()).isEqualTo("nuevo@optica.com");
        assertThat(result.getDireccion()).isEqualTo("Av. Progreso 456");
        assertThat(result.getLogoUrl()).isEqualTo("http://res.cloudinary.com/demo/image/upload/v1234/web_config/logo_nuevo.png");
    }

    @Test
    void gestionarImagenesCarruselAgregarEliminarYOrdenar() throws Exception {
        // Cargar actual para obtener estado inicial
        WebConfigDTO actual = webConfigService.obtenerConfiguracion();

        // 1. Agregar una imagen al carrusel
        MockMultipartFile carruselFile = new MockMultipartFile("carrusel", "banner1.png", "image/png", "carrusel1".getBytes());
        when(cloudinaryService.subirImagen(any(), eq("web_config/carrusel"))).thenReturn("http://res.cloudinary.com/demo/image/upload/v1234/web_config/carrusel/img1.png");

        List<CarouselImagenDTO> imgs = new ArrayList<>();
        imgs.add(CarouselImagenDTO.builder()
                .id(null)
                .orden(1)
                .fileIndex(0)
                .build());

        WebConfigDTO updateDto = WebConfigDTO.builder()
                .telefonoContacto(actual.getTelefonoContacto())
                .correoContacto(actual.getCorreoContacto())
                .direccion(actual.getDireccion())
                .horarioAtencion(actual.getHorarioAtencion())
                .carouselImagenes(imgs)
                .build();

        WebConfigDTO result = webConfigService.actualizarConfiguracion(updateDto, null, List.of(carruselFile));
        assertThat(result.getCarouselImagenes()).hasSize(1);
        CarouselImagenDTO imgAgregada = result.getCarouselImagenes().get(0);
        assertThat(imgAgregada.getId()).isNotNull();
        assertThat(imgAgregada.getUrl()).isEqualTo("http://res.cloudinary.com/demo/image/upload/v1234/web_config/carrusel/img1.png");
        assertThat(imgAgregada.getOrden()).isEqualTo(1);

        // 2. Modificar orden y agregar otra
        MockMultipartFile carruselFile2 = new MockMultipartFile("carrusel", "banner2.png", "image/png", "carrusel2".getBytes());
        when(cloudinaryService.subirImagen(any(), eq("web_config/carrusel"))).thenReturn("http://res.cloudinary.com/demo/image/upload/v1234/web_config/carrusel/img2.png");

        List<CarouselImagenDTO> imgs2 = new ArrayList<>();
        // Mantener la primera pero cambiar su orden a 2
        imgs2.add(CarouselImagenDTO.builder()
                .id(imgAgregada.getId())
                .url(imgAgregada.getUrl())
                .orden(2)
                .build());
        // Agregar la segunda con orden 1
        imgs2.add(CarouselImagenDTO.builder()
                .id(null)
                .orden(1)
                .fileIndex(0)
                .build());

        updateDto.setCarouselImagenes(imgs2);
        WebConfigDTO result2 = webConfigService.actualizarConfiguracion(updateDto, null, List.of(carruselFile2));
        assertThat(result2.getCarouselImagenes()).hasSize(2);

        // Deberían estar ordenadas por orden (1 y luego 2) debido al @OrderBy("orden ASC") en la entidad
        // Sin embargo, en la respuesta mapToDTO dependemos del orden del listado.
        // Verificamos que contenga ambas y que sus ordenes sean correctas.
        CarouselImagenDTO i1 = result2.getCarouselImagenes().stream().filter(i -> i.getUrl().contains("img1")).findFirst().orElseThrow();
        CarouselImagenDTO i2 = result2.getCarouselImagenes().stream().filter(i -> i.getUrl().contains("img2")).findFirst().orElseThrow();
        assertThat(i1.getOrden()).isEqualTo(2);
        assertThat(i2.getOrden()).isEqualTo(1);

        // 3. Eliminar la primera imagen
        List<CarouselImagenDTO> imgs3 = new ArrayList<>();
        imgs3.add(CarouselImagenDTO.builder()
                .id(i2.getId())
                .url(i2.getUrl())
                .orden(1)
                .build());

        updateDto.setCarouselImagenes(imgs3);
        WebConfigDTO result3 = webConfigService.actualizarConfiguracion(updateDto, null, null);
        assertThat(result3.getCarouselImagenes()).hasSize(1);
        assertThat(result3.getCarouselImagenes().get(0).getId()).isEqualTo(i2.getId());
    }
}
