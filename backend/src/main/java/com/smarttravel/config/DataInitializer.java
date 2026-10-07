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
    private final com.smarttravel.repositories.VendorApplicationRepository vendorApplicationRepository;

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

        // 5. Tạo đơn đăng ký đại lý mẫu (PENDING_REVIEW) nếu chưa có hồ sơ nào
        if (vendorApplicationRepository.count() == 0) {
            User applicant = userRepository.findByEmail("user@smarttravel.com").orElse(null);
            if (applicant != null) {
                com.smarttravel.entities.VendorApplication sampleApp = com.smarttravel.entities.VendorApplication.builder()
                        .user(applicant)
                        .businessName("Công Ty TNHH Du Lịch Quốc Tế Á Châu (Asia Travel)")
                        .taxCode("0318998877")
                        .businessAddress("128 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh")
                        .hotline("02838229988")
                        .contactEmail("contact@asiatravel.vn")
                        .website("https://asiatravel.vn")
                        .description("Chuyên tổ chức các tour du lịch khám phá văn hóa, sinh thái miền Tây và các tour Đông Nam Á cao cấp.")
                        .representativeName("Nguyễn Văn Du Khách")
                        .businessLicenseUrl("https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80")
                        .idCardFrontUrl("https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80")
                        .idCardBackUrl("https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80")
                        .status(com.smarttravel.enums.VendorApplicationStatus.PENDING_REVIEW)
                        .build();
                vendorApplicationRepository.save(sampleApp);
                log.info("Khởi tạo hồ sơ mẫu đăng ký Vendor đang chờ duyệt (PENDING_REVIEW) cho user@smarttravel.com");
            }
        }

        log.info("Khởi tạo dữ liệu mẫu hoàn tất!");
    }
}
