package com.herramientas.optica.modules.shared.email;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/email")
public class EmailController {
    private final EmailService emailService;

    public EmailController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping("/test")
    public ResponseEntity<?> probarConexion(@RequestParam String correo) {
        emailService.enviarCorreoPrueba(correo);
        return ResponseEntity.ok(Map.of("success", true, "message", "Correo de Prueba Enviado a: " + correo));
    }

}
