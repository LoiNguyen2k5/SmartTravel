package com.smarttravel.services;

import com.smarttravel.dto.request.ChangePasswordRequest;
import com.smarttravel.dto.request.UpdateProfileRequest;
import com.smarttravel.dto.response.UserResponse;

import java.util.List;

public interface UserService {
    UserResponse getCurrentUserProfile(String email);
    UserResponse updateCurrentUserProfile(String email, UpdateProfileRequest request);
    void changePassword(String email, ChangePasswordRequest request);
    List<UserResponse> getAllUsers();
}
