package com.herramientas.optica.modules.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.herramientas.optica.modules.api.dto.DNI_RUC_dto.RucResponse;
import com.herramientas.optica.modules.api.service.DNI_RUC_Service;

@RestController
@RequestMapping("/api/v1/ruc")
public class RucController {

    private final DNI_RUC_Service dniRucService;

    public RucController(DNI_RUC_Service dniRucService) {
        this.dniRucService = dniRucService;
    }

    /**
     * Consulta datos de SUNAT por RUC para autocompletar formularios internos.
     */
    @GetMapping("/{ruc}")
    public ResponseEntity<RucResponse> consultarRuc(@PathVariable String ruc) {
        return ResponseEntity.ok(dniRucService.consultarRuc(ruc));
    }
}
