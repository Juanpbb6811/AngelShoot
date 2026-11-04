package com.angelshot.config;

import com.angelshot.entity.Establecimiento;
import com.angelshot.entity.Rol;
import com.angelshot.entity.RolNombre;
import com.angelshot.entity.Usuario;
import com.angelshot.repository.EstablecimientoRepository;
import com.angelshot.repository.RolRepository;
import com.angelshot.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RolRepository rolRepository;
    private final UsuarioRepository usuarioRepository;
    private final EstablecimientoRepository establecimientoRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(RolRepository rolRepository,
                           UsuarioRepository usuarioRepository,
                           EstablecimientoRepository establecimientoRepository,
                           PasswordEncoder passwordEncoder) {
        this.rolRepository = rolRepository;
        this.usuarioRepository = usuarioRepository;
        this.establecimientoRepository = establecimientoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Inicializar Roles
        for (RolNombre rolNombre : RolNombre.values()) {
            if (rolRepository.findByNombre(rolNombre).isEmpty()) {
                rolRepository.save(new Rol(rolNombre));
            }
        }

        // Crear Administrador por defecto si no existe
        if (!usuarioRepository.existsByEmail("admin@angelshot.app")) {
            Rol rolAdmin = rolRepository.findByNombre(RolNombre.ROLE_ADMIN).orElseThrow();
            Usuario admin = new Usuario("Administrador Angel Shot", "admin@angelshot.app", passwordEncoder.encode("AngelShotAdmin2026*"));
            admin.setRoles(Set.of(rolAdmin));
            admin.setTelefono("+573001234567");
            usuarioRepository.save(admin);
        }

        // Crear Establecimientos de prueba si no existen
        if (establecimientoRepository.count() == 0) {
            establecimientoRepository.save(new Establecimiento(
                "La Cervecería Central",
                "Calle 85 # 14-25, Zona Rosa, Bogotá",
                "BAR",
                4.6682,
                -74.0535,
                "+573105550101"
            ));

            establecimientoRepository.save(new Establecimiento(
                "Club Teatrón Punto Seguro",
                "Calle 58 # 10-18, Chapinero, Bogotá",
                "DISCOTECA",
                4.6465,
                -74.0620,
                "+573105550202"
            ));

            establecimientoRepository.save(new Establecimiento(
                "Punto Violeta Parque de la 93",
                "Carrera 11A # 93-40, Bogotá",
                "ZONA_PUBLICA",
                4.6766,
                -74.0483,
                "+573105550303"
            ));
        }
    }
}
