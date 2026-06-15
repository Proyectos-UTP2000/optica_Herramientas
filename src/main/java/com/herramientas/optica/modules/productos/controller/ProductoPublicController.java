package com.herramientas.optica.modules.productos.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.herramientas.optica.modules.productos.dto.ProductoPublicResponseDTO;
import com.herramientas.optica.modules.productos.service.ProductoService;

@RestController
@RequestMapping("/api/v1/public/productos")
public class ProductoPublicController {

    private final ProductoService productoService;

    public ProductoPublicController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @GetMapping
    public ResponseEntity<List<ProductoPublicResponseDTO>> listarPublicos() {
        return ResponseEntity.ok(productoService.listarPublicos());
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ProductoPublicResponseDTO> buscarPorSlug(@PathVariable String slug) {
        return ResponseEntity.ok(productoService.buscarPorSlug(slug));
    }
}
