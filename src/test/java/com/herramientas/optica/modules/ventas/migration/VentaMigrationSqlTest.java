package com.herramientas.optica.modules.ventas.migration;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import org.junit.jupiter.api.Test;

class VentaMigrationSqlTest {

    @Test
    void v5EsCompatibleConTablasLegacyYaExistentes() throws IOException {
        String sql = Files.readString(Path.of("src/main/resources/db/migration/V5__crear_modulo_ventas.sql"));

        assertThat(sql).contains("information_schema.columns");
        assertThat(sql).contains("ensure_column");
        assertThat(sql).contains("id_caja");
        assertThat(sql).contains("venta_numero_comprobante");
        assertThat(sql).contains("venta_subtotal");
        assertThat(sql).contains("venta_descuento");
        assertThat(sql).contains("venta_observaciones");
        assertThat(sql).contains("stock_previo");
        assertThat(sql).contains("stock_actual");
    }
}
