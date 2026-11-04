package com.angelshot.service;

import com.angelshot.config.JwtTokenProvider;
import com.angelshot.dto.AuthRequest;
import com.angelshot.dto.AuthResponse;
import com.angelshot.dto.RegistroRequest;
import com.angelshot.entity.Rol;
import com.angelshot.entity.RolNombre;
import com.angelshot.entity.Usuario;
import com.angelshot.exception.BadRequestException;
import com.angelshot.repository.RolRepository;
import com.angelshot.repository.UsuarioRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(AuthenticationManager authenticationManager,
                       UsuarioRepository usuarioRepository,
                       RolRepository rolRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider) {
        this.authenticationManager = authenticationManager;
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Credenciales inválidas"));

        List<String> roles = usuario.getRoles().stream()
                .map(r -> r.getNombre().name())
                .collect(Collectors.toList());

        return new AuthResponse(token, usuario.getId(), usuario.getNombre(), usuario.getEmail(), roles);
    }

    @Transactional
    public AuthResponse registrar(RegistroRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("El correo ya se encuentra registrado");
        }

        Usuario usuario = new Usuario(
                request.getNombre(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword())
        );

        usuario.setTelefono(request.getTelefono());
        usuario.setContactoEmergenciaNombre(request.getContactoEmergenciaNombre());
        usuario.setContactoEmergenciaTelefono(request.getContactoEmergenciaTelefono());
        usuario.setPinCancelacion(request.getPinCancelacion());

        Rol rolUsuario = rolRepository.findByNombre(RolNombre.ROLE_USUARIO)
                .orElseGet(() -> rolRepository.save(new Rol(RolNombre.ROLE_USUARIO)));

        usuario.setRoles(Collections.singleton(rolUsuario));
        Usuario guardado = usuarioRepository.save(usuario);

        var authorities = List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority(RolNombre.ROLE_USUARIO.name()));
        Authentication authentication = new UsernamePasswordAuthenticationToken(guardado.getEmail(), null, authorities);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = tokenProvider.generateToken(authentication);
        List<String> roles = List.of(RolNombre.ROLE_USUARIO.name());

        return new AuthResponse(token, guardado.getId(), guardado.getNombre(), guardado.getEmail(), roles);
    }
}
