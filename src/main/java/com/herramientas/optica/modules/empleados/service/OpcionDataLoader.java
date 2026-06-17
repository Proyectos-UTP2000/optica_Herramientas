package com.herramientas.optica.modules.empleados.service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.herramientas.optica.modules.empleados.model.Opcion;
import com.herramientas.optica.modules.empleados.repository.OpcionRepository;
import com.herramientas.optica.modules.empleados.service.OpcionCatalog.OpcionDefinition;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

@Component
@Order(0)
@ConditionalOnProperty(name = "app.seeding.enabled", havingValue = "true", matchIfMissing = true)
public class OpcionDataLoader implements ApplicationRunner {

    private final OpcionRepository opcionRepository;

    public OpcionDataLoader(OpcionRepository opcionRepository) {
        this.opcionRepository = opcionRepository;
    }

    /**
     * Verifica el catalogo de opciones en cada inicio sin duplicar registros.
     */
    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        verificarOpciones();
    }

    /**
     * Crea o actualiza opciones actuales y planificadas.
     */
    @Transactional
    public String verificarOpciones() {
        List<OpcionDefinition> definiciones = OpcionCatalog.definiciones();
        Map<String, Opcion> opcionesPorNombre = new LinkedHashMap<>();

        for (OpcionDefinition definicion : definiciones) {
            Opcion padre = definicion.padreNombre() != null ? opcionesPorNombre.get(definicion.padreNombre()) : null;
            Opcion opcion = opcionRepository.findByNombre(definicion.nombre()).orElse(new Opcion());
            opcion.setNombre(definicion.nombre());
            opcion.setRuta(definicion.ruta());
            opcion.setIcono(definicion.icono());
            opcion.setOrden(definicion.orden());
            opcion.setVisibleEnMenu(definicion.visibleEnMenu());
            opcion.setPadre(padre);
            opcionesPorNombre.put(definicion.nombre(), opcionRepository.save(opcion));
        }

        return "Opciones verificadas y sincronizadas";
    }
}
