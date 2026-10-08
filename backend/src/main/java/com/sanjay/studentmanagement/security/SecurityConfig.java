package com.sanjay.studentmanagement.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;

/**
 * Central security configuration.
 *
 * How login works here:
 * 1. The frontend POSTs { username, password } as JSON to /api/auth/login.
 * 2. AuthController (not this class) checks the credentials via AuthenticationManager
 *    and, on success, starts an HTTP session (a JSESSIONID cookie is sent back).
 * 3. The browser sends that cookie automatically on every later request, so the
 *    Spring Security filter chain below recognises the user as logged in.
 * 4. /api/auth/logout invalidates the session.
 *
 * This is simple, cookie-based "form login done manually" - no JWTs, easy to explain.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        // BCrypt: a one-way hash designed for passwords (slow on purpose, salted automatically)
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider(
            AdminUserDetailsService adminUserDetailsService, PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(adminUserDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // REST API with a same-site frontend: CSRF protection is disabled to keep
                // the login/CRUD requests simple for a fresher project. A production app
                // would either re-enable CSRF or switch to token-based auth.
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .authorizeHttpRequests(auth -> auth
                        // Login/logout and the static frontend files are open to everyone
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/", "/*.html", "/css/**", "/js/**").permitAll()
                        // Everything else (student, department, dashboard APIs) requires login
                        .anyRequest().authenticated())
                // Return 401 JSON instead of redirecting to a login page when not authenticated
                .exceptionHandling(ex -> ex.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                .httpBasic(basic -> basic.disable())
                .formLogin(form -> form.disable());

        return http.build();
    }
}
