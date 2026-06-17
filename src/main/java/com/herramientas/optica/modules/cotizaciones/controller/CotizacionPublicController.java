package com.herramientas.optica.modules.cotizaciones.controller;

import com.herramientas.optica.modules.cotizaciones.dto.CotizacionDTO;
import com.herramientas.optica.modules.cotizaciones.service.CotizacionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/public/cotizaciones")
public class CotizacionPublicController {

    private final CotizacionService cotizacionService;

    public CotizacionPublicController(CotizacionService cotizacionService) {
        this.cotizacionService = cotizacionService;
    }

    @PostMapping
    public ResponseEntity<CotizacionDTO> crearCotizacion(@RequestBody @Valid CotizacionDTO dto) {
        return new ResponseEntity<>(cotizacionService.crearCotizacion(dto), HttpStatus.CREATED);
    }
}
