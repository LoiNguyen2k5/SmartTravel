package com.smarttravel.services.impl;

import com.smarttravel.dto.request.*;
import com.smarttravel.dto.response.JwtAuthResponse;
import com.smarttravel.dto.response.UserResponse;
import com.smarttravel.entities.Role;
import com.smarttravel.entities.User;
import com.smarttravel.enums.OtpType;
import com.smarttravel.enums.RoleEnum;
import com.smarttravel.exceptions.BadRequestException;
import com.smarttravel.exceptions.ResourceNotFoundException;
import com.smarttravel.repositories.RoleRepository;
import com.smarttravel.repositories.UserRepository;
import com.smarttravel.security.JwtProvider;
import com.smarttravel.services.AuthService;
import com.smarttravel.services.OtpService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final OtpService otpService;

    @Override
    public JwtAuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        if (Boolean.FALSE.equals(user.getEnabled())) {
            throw new BadRequestException("Tài khoản chưa được kích hoạt bằng mã OTP! Vui lòng xác thực email trước khi đăng nhập.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtProvider.generateJwtToken(authentication);

        UserResponse userResponse = mapToUserResponse(user);

        return JwtAuthResponse.builder()
                .accessToken(jwt)
                .tokenType("Bearer")
                .user(userResponse)
                .build();
    }

    @Override
    @Transactional
    public UserResponse register(RegisterRequest request) {
        Optional<User> existingUserOpt = userRepository.findByEmail(request.getEmail());

        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();
            if (Boolean.TRUE.equals(existingUser.getEnabled())) {
                throw new BadRequestException("Email đã được sử dụng!");
            }
            // Nếu tài khoản chưa được kích hoạt, cập nhật lại thông tin và gửi lại OTP
            existingUser.setFullName(request.getFullName());
            existingUser.setPhone(request.getPhone());
            existingUser.setPassword(passwordEncoder.encode(request.getPassword()));
            userRepository.save(existingUser);

            otpService.generateAndSendOtp(request.getEmail(), OtpType.REGISTER);
            return mapToUserResponse(existingUser);
        }

        Set<Role> roles = new HashSet<>();
        if (request.getRoles() == null || request.getRoles().isEmpty()) {
            Role userRole = roleRepository.findByName(RoleEnum.ROLE_USER)
                    .orElseGet(() -> roleRepository.save(Role.builder().name(RoleEnum.ROLE_USER).build()));
            roles.add(userRole);
        } else {
            request.getRoles().forEach(roleStr -> {
                RoleEnum roleEnum = RoleEnum.valueOf(roleStr.toUpperCase());
                Role role = roleRepository.findByName(roleEnum)
                        .orElseGet(() -> roleRepository.save(Role.builder().name(roleEnum).build()));
                roles.add(role);
            });
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .enabled(false) // Chưa kích hoạt cho đến khi nhập mã OTP thành công
                .roles(roles)
                .build();

        User savedUser = userRepository.save(user);

        // Gửi mã OTP xác thực đăng ký
        otpService.generateAndSendOtp(savedUser.getEmail(), OtpType.REGISTER);

        return mapToUserResponse(savedUser);
    }

    @Override
    @Transactional
    public UserResponse verifyRegisterOtp(VerifyOtpRequest request) {
        otpService.verifyOtp(request.getEmail(), request.getCode(), OtpType.REGISTER);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        user.setEnabled(true);
        User updatedUser = userRepository.save(user);

        return mapToUserResponse(updatedUser);
    }

    @Override
    public void resendOtp(ResendOtpRequest request) {
        if (request.getType() == OtpType.REGISTER) {
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));
            if (Boolean.TRUE.equals(user.getEnabled())) {
                throw new BadRequestException("Tài khoản đã được kích hoạt rồi!");
            }
        } else if (request.getType() == OtpType.FORGOT_PASSWORD) {
            userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("Tài khoản không tồn tại với email: " + request.getEmail()));
        }

        otpService.generateAndSendOtp(request.getEmail(), request.getType());
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Email không tồn tại trong hệ thống!"));

        if (Boolean.FALSE.equals(user.getEnabled())) {
            throw new BadRequestException("Tài khoản chưa được kích hoạt. Vui lòng xác thực email đăng ký trước.");
        }

        otpService.generateAndSendOtp(user.getEmail(), OtpType.FORGOT_PASSWORD);
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        otpService.verifyOtp(request.getEmail(), request.getCode(), OtpType.FORGOT_PASSWORD);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return mapToUserResponse(user);
    }

    private UserResponse mapToUserResponse(User user) {
        Set<String> roleNames = user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet());

        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .enabled(user.getEnabled())
                .roles(roleNames)
                .build();
    }
}
