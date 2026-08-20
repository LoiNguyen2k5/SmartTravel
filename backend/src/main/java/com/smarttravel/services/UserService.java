package com.smarttravel.services;

import com.smarttravel.dto.response.UserResponse;

import java.util.List;

public interface UserService {
    UserResponse getCurrentUserProfile(String email);
    List<UserResponse> getAllUsers();
}
