package com.smarttravel.services.impl;

import com.smarttravel.dto.request.ChangePasswordRequest;
import com.smarttravel.dto.request.UpdateProfileRequest;
import com.smarttravel.dto.response.UserResponse;
import com.smarttravel.entities.User;
import com.smarttravel.exceptions.BadRequestException;
import com.smarttravel.exceptions.ResourceNotFoundException;
import com.smarttravel.repositories.UserRepository;
import com.smarttravel.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserResponse getCurrentUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        return mapToUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateCurrentUserProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl().trim());
        }

        User saved = userRepository.save(user);
        return mapToUserResponse(saved);
    }

    @Override
    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BadRequestException("Mật khẩu hiện tại không chính xác.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    private UserResponse mapToUserResponse(User u) {
        Set<String> roleNames = u.getRoles() != null
                ? u.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toSet())
                : Set.of();

        return UserResponse.builder()
                .id(u.getId())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .avatarUrl(u.getAvatarUrl())
                .enabled(u.getEnabled())
                .createdAt(u.getCreatedAt())
                .roles(roleNames)
                .build();
    }
}
