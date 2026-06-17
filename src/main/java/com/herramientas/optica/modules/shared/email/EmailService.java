package com.herramientas.optica.modules.shared.email;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Value("${app.frontend.url}")
    private String frontendUrl;

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void enviarCredencialesEmpleado(
        String correoDestino,
        String nombres,
        String username,
        String password
    ) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                message,
                true,
                "UTF-8"
            );

            helper.setTo(correoDestino);
            helper.setSubject(
                "Bienvenido a Aun no hay nombre asi que pos bueno - Credenciales de Acceso"
            );

            String urlLogin = frontendUrl + "/login";
            String contenidoHtml =
                "<h3>Hola " +
                nombres +
                ",</h3>" +
                "<p>Tu cuenta ha sido creada exitosamente en nuestro sistema de gestión.</p>" +
                "<p>A continuación, tus credenciales de acceso temporal:</p>" +
                "<ul>" +
                "<li><b>Usuario:</b> " +
                username +
                "</li>" +
                "<li><b>Contraseña:</b> " +
                password +
                "</li>" +
                "</ul>" +
                "<p><i>Te recomendamos cambiar tu contraseña al iniciar sesión por primera vez.</i></p>" +
                "<a href='" +
                urlLogin +
                "' style='background-color: #007BFF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;'>" +
                "Ir a Iniciar Sesión" +
                "</a>" +
                "<br><p>Atentamente,<br><b>El equipo de Administración</b></p>";
            helper.setText(contenidoHtml, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            System.err.println(
                "Error al enviar el correo a " +
                    correoDestino +
                    ": " +
                    e.getMessage()
            );
        }
    }

    public void enviarCorreoPrueba(String correoDestino) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                message,
                true,
                "UTF-8"
            );

            helper.setTo(correoDestino);
            helper.setSubject("test de Conexion");

            String contenidoHtml =
                "<div style='text-align: center; font-family: Arial, sans-serif;'>" +
                "<h2 style='color: #28a745;'>¡Conexión Exitosa!</h2>" +
                "<p>Si estás viendo este mensaje, todo fue bien, tu tranquilo " +
                "<hr>" +
                "<p style='font-size: 12px; color: gray;'>Este es un mensaje automático de prueba.</p>" +
                "</div>";

            helper.setText(contenidoHtml, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException(
                "Fallo en el servicio SMTP: " + e.getMessage()
            );
        }
    }

    public void enviarCodigoRecuperacion(
        String email,
        String nombres,
        String codigo
    ) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                message,
                true,
                "UTF-8"
            );

            helper.setTo(email);
            helper.setSubject("Recuperación de Contraseña");

            String contenidoHtml =
                "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;'>" +
                "<h2 style='color: #007BFF; text-align: center;'>Recuperación de Contraseña</h2>" +
                "<p>Hola <b>" +
                nombres +
                "</b>,</p>" +
                "<p>Has solicitado restablecer tu contraseña. Utiliza el siguiente código de recuperación para completar el proceso:</p>" +
                "<div style='text-align: center; margin: 30px 0;'>" +
                "  <span style='background-color: #f1f3f5; border: 1px dashed #007BFF; color: #007BFF; font-size: 24px; font-weight: bold; letter-spacing: 5px; padding: 15px 30px; border-radius: 6px; display: inline-block;'>" +
                codigo +
                "</span>" +
                "</div>" +
                "<p style='color: #6c757d; font-size: 14px; text-align: center;'>Este código es válido por <b>15 minutos</b>. Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>" +
                "<hr style='border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;'>" +
                "<p style='font-size: 12px; color: gray; text-align: center;'>Este es un mensaje automático, por favor no respondas a este correo.</p>" +
                "</div>";

            helper.setText(contenidoHtml, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException(
                "Error al enviar el correo de recuperación: " + e.getMessage()
            );
        }
    }
}
