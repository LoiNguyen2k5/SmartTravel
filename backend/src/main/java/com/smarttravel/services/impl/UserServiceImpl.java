package com.smarttravel.services.impl;

import com.smarttravel.dto.response.UserResponse;
import com.smarttravel.entities.User;
import com.smarttravel.exceptions.ResourceNotFoundException;
import com.smarttravel.repositories.UserRepository;
import com.smarttravel.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public UserResponse getCurrentUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        Set<String> roleNames = user.getRoles() != null
                ? user.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toSet())
                : Set.of();

        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .enabled(user.getEnabled())
                .createdAt(user.getCreatedAt())
                .roles(roleNames)
                .build();
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(u -> {
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
                })
                .collect(Collectors.toList());
    }
}
