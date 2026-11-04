package com.angelshot.config;

import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.util.StringUtils;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Value("${spring.datasource.url}")
    private String rawUrl;

    @Value("${spring.datasource.username:}")
    private String rawUsername;

    @Value("${spring.datasource.password:}")
    private String rawPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariDataSource ds = new HikariDataSource();

        String finalUrl = rawUrl;
        String finalUsername = rawUsername;
        String finalPassword = rawPassword;

        // 1. Si la URL viene en formato postgres://user:password@host:port/database (convención estándar de Render / Heroku)
        if (finalUrl != null && (finalUrl.startsWith("postgres://") || finalUrl.startsWith("postgresql://"))) {
            try {
                URI uri = new URI(finalUrl);
                String host = uri.getHost();
                int port = uri.getPort() == -1 ? 5432 : uri.getPort();
                String path = uri.getPath();
                if (path != null && path.startsWith("/")) {
                    path = path.substring(1);
                }
                finalUrl = "jdbc:postgresql://" + host + ":" + port + "/" + path + "?sslmode=require";

                String userInfo = uri.getUserInfo();
                if (userInfo != null && userInfo.contains(":")) {
                    String[] parts = userInfo.split(":", 2);
                    if (!StringUtils.hasText(finalUsername)) finalUsername = parts[0];
                    if (!StringUtils.hasText(finalPassword)) finalPassword = parts[1];
                }
            } catch (Exception e) {
                log.warn("No se pudo interpretar URL como URI de PostgreSQL: {}", e.getMessage());
            }
        }

        // 2. Si la URL contiene el parámetro password= en los query params (ej. ?user=...&password=...)
        if (!StringUtils.hasText(finalPassword) && finalUrl != null && finalUrl.contains("password=")) {
            try {
                int pIndex = finalUrl.indexOf("password=");
                int ampIndex = finalUrl.indexOf("&", pIndex);
                String passFromUrl = ampIndex == -1 ? finalUrl.substring(pIndex + 9) : finalUrl.substring(pIndex + 9, ampIndex);
                if (StringUtils.hasText(passFromUrl)) {
                    finalPassword = passFromUrl;
                }
            } catch (Exception e) {
                log.warn("No se pudo extraer password embebido en la URL: {}", e.getMessage());
            }
        }

        // 3. Si la URL contiene el parámetro user= en los query params
        if (!StringUtils.hasText(finalUsername) && finalUrl != null && finalUrl.contains("user=")) {
            try {
                int uIndex = finalUrl.indexOf("user=");
                int ampIndex = finalUrl.indexOf("&", uIndex);
                String userFromUrl = ampIndex == -1 ? finalUrl.substring(uIndex + 5) : finalUrl.substring(uIndex + 5, ampIndex);
                if (StringUtils.hasText(userFromUrl)) {
                    finalUsername = userFromUrl;
                }
            } catch (Exception e) {
                log.warn("No se pudo extraer username embebido en la URL: {}", e.getMessage());
            }
        }

        ds.setJdbcUrl(finalUrl);
        if (StringUtils.hasText(finalUsername)) {
            ds.setUsername(finalUsername);
        }
        if (StringUtils.hasText(finalPassword)) {
            ds.setPassword(finalPassword);
        }

        ds.setDriverClassName("org.postgresql.Driver");
        ds.setMaximumPoolSize(5);
        ds.setMinimumIdle(1);
        ds.setIdleTimeout(300000);
        ds.setConnectionTimeout(30000);
        ds.setMaxLifetime(600000);

        log.info("Hikari DataSource inicializado con éxito hacia: {}", finalUrl);
        return ds;
    }
}
