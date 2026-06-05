package com.herramientas.optica.modules.shared.email;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Value("${app.frontend.url}")
    private String frontendUrl;

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void enviarCredencialesEmpleado(String correoDestino, String nombres, String username, String password) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(correoDestino);
            helper.setSubject("Bienvenido a Aun no hay nombre asi que pos bueno - Credenciales de Acceso");

            String urlLogin = frontendUrl + "/login";
            String contenidoHtml = "<h3>Hola " + nombres + ",</h3>"
                    + "<p>Tu cuenta ha sido creada exitosamente en nuestro sistema de gestión.</p>"
                    + "<p>A continuación, tus credenciales de acceso temporal:</p>"
                    + "<ul>"
                    + "<li><b>Usuario:</b> " + username + "</li>"
                    + "<li><b>Contraseña:</b> " + password + "</li>"
                    + "</ul>"
                    + "<p><i>Te recomendamos cambiar tu contraseña al iniciar sesión por primera vez.</i></p>"
                    + "<a href='" + urlLogin
                    + "' style='background-color: #007BFF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;'>"
                    + "Ir a Iniciar Sesión"
                    + "</a>"
                    + "<br><p>Atentamente,<br><b>El equipo de Administración</b></p>";
            helper.setText(contenidoHtml, true);

            mailSender.send(message);

        } catch (MessagingException e) {
            System.err.println("Error al enviar el correo a " + correoDestino + ": " + e.getMessage());
        }
    }

    public void enviarCorreoPrueba(String correoDestino) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(correoDestino);
            helper.setSubject("test de Conexion");

            String contenidoHtml = "<div style='text-align: center; font-family: Arial, sans-serif;'>"
                    + "<h2 style='color: #28a745;'>¡Conexión Exitosa!</h2>"
                    + "<p>Si estás viendo este mensaje, todo fue bien, tu tranquilo "
                    + "<hr>"
                    + "<p style='font-size: 12px; color: gray;'>Este es un mensaje automático de prueba.</p>"
                    + "</div>";

            helper.setText(contenidoHtml, true);
            mailSender.send(message);

        } catch (MessagingException e) {
            throw new RuntimeException("Fallo en el servicio SMTP: " + e.getMessage());
        }
    }
}