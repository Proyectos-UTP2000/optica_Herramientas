package com.herramientas.optica.modules.proveedores.service;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.herramientas.optica.modules.clientes.model.TipoDocumento;
import com.herramientas.optica.modules.clientes.repository.TipoDocumentoRepository;
import com.herramientas.optica.modules.proveedores.model.Proveedor;
import com.herramientas.optica.modules.proveedores.repository.ProveedorRepository;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

@Component
@Order(1)
@ConditionalOnProperty(name = "app.seeding.enabled", havingValue = "true", matchIfMissing = true)
public class ProveedorDataLoader implements ApplicationRunner {

    private final ProveedorRepository proveedorRepository;
    private final TipoDocumentoRepository tipoDocumentoRepository;

    public ProveedorDataLoader(ProveedorRepository proveedorRepository, TipoDocumentoRepository tipoDocumentoRepository) {
        this.proveedorRepository = proveedorRepository;
        this.tipoDocumentoRepository = tipoDocumentoRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (proveedorRepository.count() == 0) {
            TipoDocumento ruc = tipoDocumentoRepository.findAll().stream()
                .filter(td -> "RUC".equals(td.getNombre()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("TipoDocumento RUC no encontrado para inicializar Proveedor"));

            proveedorRepository.save(Proveedor.builder()
                .tipoDocumento(ruc)
                .numeroDocumento("20123456789")
                .razonSocial("Distribuidora Optica S.A.")
                .nombreComercial("Optica Distribuidora")
                .nacionalidad("PERUANA")
                .direccion("Av. Larco 123, Miraflores, Lima")
                .telefono("014445566")
                .correo("contacto@distribuidoraoptica.com")
                .estado(1)
                .build());

            proveedorRepository.save(Proveedor.builder()
                .tipoDocumento(ruc)
                .numeroDocumento("20987654321")
                .razonSocial("Lentes del Perú S.A.C.")
                .nombreComercial("Lentes Perú")
                .nacionalidad("PERUANA")
                .direccion("Jr. Carabaya 456, Cercado de Lima")
                .telefono("015556677")
                .correo("ventas@lentesperu.com")
                .estado(1)
                .build());
        }
    }
}
