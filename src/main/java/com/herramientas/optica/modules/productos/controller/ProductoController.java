package com.herramientas.optica.modules.productos.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.herramientas.optica.modules.productos.dto.ProductoRequestDTO;
import com.herramientas.optica.modules.productos.dto.ProductoResponseDTO;
import com.herramientas.optica.modules.productos.service.ProductoService;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/v1/productos")
@CrossOrigin(origins = "*")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @GetMapping
    public ResponseEntity<List<ProductoResponseDTO>> listar() {
        return ResponseEntity.ok(productoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductoResponseDTO> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(productoService.buscarPorId(id));
    }

    @PostMapping(consumes = { "multipart/form-data" })
    public ResponseEntity<ProductoResponseDTO> crear(
            @RequestPart("producto") String productoJson,
            @RequestPart(value = "imagenes", required = false) List<MultipartFile> imagenes) throws Exception {

        ObjectMapper mapper = new ObjectMapper();
        mapper.findAndRegisterModules();
        ProductoRequestDTO dto = mapper.readValue(productoJson, ProductoRequestDTO.class);

        return new ResponseEntity<>(productoService.crear(dto, imagenes), HttpStatus.CREATED);
    }

    @PutMapping(value = "/{id}", consumes = { "multipart/form-data" })
    public ResponseEntity<ProductoResponseDTO> actualizar(
            @PathVariable Long id,
            @RequestPart("producto") String productoJson,
            @RequestPart(value = "imagenes", required = false) List<MultipartFile> imagenes) throws Exception {

        ObjectMapper mapper = new ObjectMapper();
        mapper.findAndRegisterModules();
        ProductoRequestDTO dto = mapper.readValue(productoJson, ProductoRequestDTO.class);

        return ResponseEntity.ok(productoService.actualizar(id, dto, imagenes));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<ProductoResponseDTO> cambiarEstado(@PathVariable Long id) {
        return ResponseEntity.ok(productoService.cambiarEstado(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        productoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
