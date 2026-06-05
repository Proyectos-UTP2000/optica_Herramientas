package com.herramientas.optica.modules.ventas.model;

public enum EstadoVenta {
    ANULADA(0),
    EMITIDA(1);

    private final int codigo;

    EstadoVenta(int codigo) {
        this.codigo = codigo;
    }

    public int getCodigo() {
        return codigo;
    }

    public static EstadoVenta desdeCodigo(Integer codigo) {
        if (codigo == null) {
            return null;
        }
        for (EstadoVenta estado : values()) {
            if (estado.codigo == codigo) {
                return estado;
            }
        }
        throw new IllegalArgumentException("Estado de venta no reconocido: " + codigo);
    }
}
