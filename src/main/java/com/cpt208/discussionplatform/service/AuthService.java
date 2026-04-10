package com.cpt208.discussionplatform.service;

import com.cpt208.discussionplatform.dto.request.LoginRequest;
import com.cpt208.discussionplatform.dto.request.RegisterRequest;
import com.cpt208.discussionplatform.dto.response.AuthResponse;
import com.cpt208.discussionplatform.dto.response.UserProfileResponse;
import com.cpt208.discussionplatform.entity.User;
import com.cpt208.discussionplatform.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            throw new IllegalArgumentException("Email is already registered");
        });
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());
        user.setRole(request.getRole());
        User savedUser = userRepository.save(user);
        return toAuthResponse(savedUser);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new IllegalArgumentException("Account does not exist"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Incorrect password");
        }
        return toAuthResponse(user);
    }

    public AuthResponse toAuthResponse(User user) {
        AuthResponse response = new AuthResponse();
        response.setAccessToken(jwtService.generateToken(user));
        response.setUser(toProfile(user));
        return response;
    }

    public UserProfileResponse toProfile(User user) {
        UserProfileResponse response = new UserProfileResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setName(user.getName());
        response.setRole(user.getRole());
        response.setPersonality(user.getPersonality());
        return response;
    }
}
