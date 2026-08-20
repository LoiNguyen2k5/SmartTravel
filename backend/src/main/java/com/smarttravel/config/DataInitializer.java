package com.smarttravel.config;

import com.smarttravel.entities.Role;
import com.smarttravel.entities.User;
import com.smarttravel.enums.RoleEnum;
import com.smarttravel.repositories.RoleRepository;
import com.smarttravel.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("Khởi tạo dữ liệu mẫu (Seed Data) cho hệ thống SmartTravel...");

        // 1. Tạo các Roles mặc định nếu chưa tồn tại
        Role adminRole = roleRepository.findByName(RoleEnum.ROLE_ADMIN)
                .orElseGet(() -> roleRepository.save(new Role(null, RoleEnum.ROLE_ADMIN)));

        Role vendorRole = roleRepository.findByName(RoleEnum.ROLE_VENDOR)
                .orElseGet(() -> roleRepository.save(new Role(null, RoleEnum.ROLE_VENDOR)));

        Role userRole = roleRepository.findByName(RoleEnum.ROLE_USER)
                .orElseGet(() -> roleRepository.save(new Role(null, RoleEnum.ROLE_USER)));

        // 2. Tạo tài khoản mẫu Admin
        if (!userRepository.existsByEmail("admin@smarttravel.com")) {
            User admin = User.builder()
                    .email("admin@smarttravel.com")
                    .password(passwordEncoder.encode("password123"))
                    .fullName("System Administrator")
                    .phone("0901234567")
                    .enabled(true)
                    .roles(Set.of(adminRole))
                    .build();
            userRepository.save(admin);
            log.info("Tạo tài khoản Admin mẫu: admin@smarttravel.com / password123");
        }

        // 3. Tạo tài khoản mẫu Vendor
        if (!userRepository.existsByEmail("vendor@smarttravel.com")) {
            User vendor = User.builder()
                    .email("vendor@smarttravel.com")
                    .password(passwordEncoder.encode("password123"))
                    .fullName("Vietravel Official")
                    .phone("0908888999")
                    .enabled(true)
                    .roles(Set.of(vendorRole))
                    .build();
            userRepository.save(vendor);
            log.info("Tạo tài khoản Vendor mẫu: vendor@smarttravel.com / password123");
        }

        // 4. Tạo tài khoản mẫu Customer (User)
        if (!userRepository.existsByEmail("user@smarttravel.com")) {
            User customer = User.builder()
                    .email("user@smarttravel.com")
                    .password(passwordEncoder.encode("password123"))
                    .fullName("Nguyễn Văn Du Khách")
                    .phone("0912345678")
                    .enabled(true)
                    .roles(Set.of(userRole))
                    .build();
            userRepository.save(customer);
            log.info("Tạo tài khoản User mẫu: user@smarttravel.com / password123");
        }

        log.info("Khởi tạo dữ liệu mẫu hoàn tất!");
    }
}
