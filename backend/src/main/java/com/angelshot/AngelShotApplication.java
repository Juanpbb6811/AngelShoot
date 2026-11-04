package com.angelshot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Properties;

@SpringBootApplication
public class AngelShotApplication {

    public static void main(String[] args) {
        cargarVariablesEntorno();
        SpringApplication.run(AngelShotApplication.class, args);
    }

    private static void cargarVariablesEntorno() {
        String[] posiblesArchivos = {".env", "backend/.env", "../.env"};
        for (String path : posiblesArchivos) {
            File f = new File(path);
            if (f.exists() && f.isFile()) {
                try (var isr = new InputStreamReader(new FileInputStream(f), StandardCharsets.UTF_8)) {
                    Properties props = new Properties();
                    props.load(isr);
                    props.forEach((key, value) -> {
                        String k = key.toString().trim();
                        String v = value.toString().trim();
                        if (System.getProperty(k) == null && System.getenv(k) == null) {
                            System.setProperty(k, v);
                        }
                    });
                    System.out.println("Configuración cargada desde archivo local: " + f.getName());
                    break;
                } catch (Exception e) {
                    System.err.println("Advertencia al leer .env: " + e.getMessage());
                }
            }
        }
    }
}
