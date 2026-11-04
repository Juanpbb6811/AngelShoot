package com.angelshot.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:Angel Shot <onboarding@resend.dev>}")
    private String mailFrom;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void enviarAlertaEmergencia(String destinatario, String nombreUsuario, String tipoAlerta, String ubicacion) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailFrom);
            message.setTo(destinatario);
            message.setSubject("🚨 ALERTA ANGEL SHOT: Solicitud de Auxilio de " + nombreUsuario);
            message.setText("Se ha activado una alerta de seguridad:\n\n" +
                    "Usuario: " + nombreUsuario + "\n" +
                    "Tipo de Alerta: " + tipoAlerta + "\n" +
                    "Ubicación: " + ubicacion + "\n\n" +
                    "Por favor verifica su estado de inmediato o ponte en contacto con las autoridades.");

            mailSender.send(message);
            log.info("Notificación de emergencia enviada con éxito a {}", destinatario);
        } catch (Exception e) {
            log.warn("No se pudo enviar correo de emergencia a {}: {}", destinatario, e.getMessage());
        }
    }
}
