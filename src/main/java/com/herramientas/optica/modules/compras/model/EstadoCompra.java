package com.herramientas.optica.modules.compras.model;

public enum EstadoCompra {
    ANULADA(0),
    REGISTRADA(1),
    RECIBIDA(2);

    private final int codigo;

    EstadoCompra(int codigo) {
        this.codigo = codigo;
    }

    public int getCodigo() {
        return codigo;
    }

    public static EstadoCompra desdeCodigo(Integer codigo) {
        if (codigo == null) {
            return null;
        }
        for (EstadoCompra estado : values()) {
            if (estado.codigo == codigo) {
                return estado;
            }
        }
        throw new IllegalArgumentException("Estado de compra no reconocido: " + codigo);
    }
}
