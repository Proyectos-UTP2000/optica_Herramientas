package com.herramientas.optica.modules.empleados.service;

import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.herramientas.optica.modules.empleados.model.Opcion;
import com.herramientas.optica.modules.empleados.model.Perfil;
import com.herramientas.optica.modules.empleados.repository.OpcionRepository;
import com.herramientas.optica.modules.empleados.repository.PerfilRepository;
import com.herramientas.optica.modules.empleados.service.OpcionCatalog.OpcionDefinition;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

@Component
@Order(1)
@ConditionalOnProperty(name = "app.seeding.enabled", havingValue = "true", matchIfMissing = true)
public class PerfilOpcionDataLoader implements ApplicationRunner {

    private final OpcionRepository opcionRepository;
    private final PerfilRepository perfilRepository;

    public PerfilOpcionDataLoader(OpcionRepository opcionRepository, PerfilRepository perfilRepository) {
        this.opcionRepository = opcionRepository;
        this.perfilRepository = perfilRepository;
    }

    /**
     * Verifica la relacion perfil_opcion despues de que el catalogo de opciones ya
     * fue sincronizado.
     */
    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        verificarRelacionesPerfilOpcion();
    }

    /**
     * Asigna al perfil ADMINISTRADOR solo las opciones marcadas como implementadas
     * en el catalogo, sin duplicar relaciones existentes.
     */
    @Transactional
    public String verificarRelacionesPerfilOpcion() {
        Map<String, Opcion> opcionesPorNombre = opcionRepository.findAll().stream()
                .collect(Collectors.toMap(Opcion::getNombre, Function.identity(), (actual, duplicada) -> actual));

        perfilRepository.findByNombre("ADMINISTRADOR")
                .ifPresent(perfil -> asignarOpcionesAdministrador(perfil, opcionesPorNombre));

        return "Relaciones perfil_opcion verificadas";
    }

    private void asignarOpcionesAdministrador(Perfil perfil, Map<String, Opcion> opcionesPorNombre) {
        OpcionCatalog.definiciones().stream()
                .filter(OpcionDefinition::asignarAdministrador)
                .map(definicion -> opcionesPorNombre.get(definicion.nombre()))
                .filter(opcion -> opcion != null)
                .forEach(perfil.getOpciones()::add);
        perfilRepository.save(perfil);
    }
}
