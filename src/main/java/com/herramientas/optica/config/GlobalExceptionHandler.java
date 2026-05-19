package com.herramientas.optica.config;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.security.SignatureException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler({ IllegalArgumentException.class, IllegalStateException.class })
    public ResponseEntity<Map<String, Object>> manejarExcepcionesDeNegocio(RuntimeException ex) {
        return crearRespuesta(HttpStatus.BAD_REQUEST, "Error de Negocio", ex.getMessage());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> manejarAccesoDenegado(AccessDeniedException ex) {
        return crearRespuesta(HttpStatus.FORBIDDEN, "Acceso Denegado", "No tienes permisos suficientes para realizar esta acción.");
    }

    @ExceptionHandler(ExpiredJwtException.class)
    public ResponseEntity<Map<String, Object>> manejarJwtExpirado(ExpiredJwtException ex) {
        return crearRespuesta(HttpStatus.UNAUTHORIZED, "Sesión Expirada", "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
    }

    @ExceptionHandler(SignatureException.class)
    public ResponseEntity<Map<String, Object>> manejarJwtInvalido(SignatureException ex) {
        return crearRespuesta(HttpStatus.UNAUTHORIZED, "Sesión Inválida", "La firma del token no es válida.");
    }

    @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> manejarValidaciones(org.springframework.web.bind.MethodArgumentNotValidException ex) {
        Map<String, String> errores = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            errores.put(error.getField(), error.getDefaultMessage())
        );
        
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("timestamp", LocalDateTime.now());
        respuesta.put("status", HttpStatus.BAD_REQUEST.value());
        respuesta.put("error", "Error de Validación");
        respuesta.put("validations", errores);
        
        return new ResponseEntity<>(respuesta, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> manejarErroresGenerales(Exception ex) {
        return crearRespuesta(HttpStatus.INTERNAL_SERVER_ERROR, "Error Interno", "Ha ocurrido un error inesperado: " + ex.getMessage());
    }

    private ResponseEntity<Map<String, Object>> crearRespuesta(HttpStatus status, String error, String message) {
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("timestamp", LocalDateTime.now());
        respuesta.put("status", status.value());
        respuesta.put("error", error);
        respuesta.put("message", message);
        return new ResponseEntity<>(respuesta, status);
    }
}