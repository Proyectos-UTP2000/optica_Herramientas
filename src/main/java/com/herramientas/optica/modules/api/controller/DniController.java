package com.herramientas.optica.modules.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.herramientas.optica.modules.api.dto.DNI_RUC_dto.DniResponse;
import com.herramientas.optica.modules.api.service.DNI_RUC_Service;

@RestController
@RequestMapping("/api/v1/dni")
@CrossOrigin(origins = "*")
public class DniController {

    private final DNI_RUC_Service dniRucService;

    public DniController(DNI_RUC_Service dniRucService) {
        this.dniRucService = dniRucService;
    }

    @GetMapping("/{dni}")
    public ResponseEntity<DniResponse> consultarDni(@PathVariable String dni) {
        return ResponseEntity.ok(dniRucService.consultarDni(dni));
    }
}