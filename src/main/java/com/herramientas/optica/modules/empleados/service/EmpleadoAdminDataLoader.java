package com.herramientas.optica.modules.empleados.service;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.herramientas.optica.modules.clientes.model.TipoDocumento;
import com.herramientas.optica.modules.clientes.repository.TipoDocumentoRepository;
import com.herramientas.optica.modules.empleados.model.Empleado;
import com.herramientas.optica.modules.empleados.model.Perfil;
import com.herramientas.optica.modules.empleados.repository.EmpleadoRepository;
import com.herramientas.optica.modules.empleados.repository.PerfilRepository;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

@Component
@Order(2)
@ConditionalOnProperty(name = "app.seeding.enabled", havingValue = "true", matchIfMissing = true)
public class EmpleadoAdminDataLoader implements ApplicationRunner {

    private final EmpleadoRepository empleadoRepository;
    private final PerfilRepository perfilRepository;
    private final TipoDocumentoRepository tipoDocumentoRepository;
    private final PasswordEncoder passwordEncoder;

    public EmpleadoAdminDataLoader(EmpleadoRepository empleadoRepository,
                                  PerfilRepository perfilRepository,
                                  TipoDocumentoRepository tipoDocumentoRepository,
                                  PasswordEncoder passwordEncoder) {
        this.empleadoRepository = empleadoRepository;
        this.perfilRepository = perfilRepository;
        this.tipoDocumentoRepository = tipoDocumentoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (empleadoRepository.count() == 0) {
            Perfil administrador = perfilRepository.findByNombre("ADMINISTRADOR")
                .orElseThrow(() -> new IllegalStateException("Perfil ADMINISTRADOR no encontrado para inicializar Empleado Admin"));

            TipoDocumento dni = tipoDocumentoRepository.findAll().stream()
                .filter(td -> "DNI".equals(td.getNombre()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("TipoDocumento DNI no encontrado para inicializar Empleado Admin"));

            empleadoRepository.save(Empleado.builder()
                .nombre("admin")
                .username("admin")
                .apellidoPaterno("")
                .apellidoMaterno("")
                .correo("admin@ejemplo.com")
                .contrasena(passwordEncoder.encode("admin123456"))
                .telefono("1")
                .direccion("")
                .estado(1)
                .numeroDocumento("1")
                .perfil(administrador)
                .idTipoDocumento(dni.getId())
                .build());
        }
    }
}
