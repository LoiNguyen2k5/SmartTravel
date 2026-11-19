package com.smarttravel.config;

import com.smarttravel.entities.*;
import com.smarttravel.enums.RoleEnum;
import com.smarttravel.enums.TourCategory;
import com.smarttravel.enums.VendorApplicationStatus;
import com.smarttravel.repositories.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final VendorApplicationRepository vendorApplicationRepository;
    private final VisaTemplateRepository visaTemplateRepository;
    private final VisaRequirementRepository visaRequirementRepository;
    private final TourRepository tourRepository;

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
                VendorApplication sampleApp = VendorApplication.builder()
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
                        .status(VendorApplicationStatus.PENDING_REVIEW)
                        .build();
                vendorApplicationRepository.save(sampleApp);
                log.info("Khởi tạo hồ sơ mẫu đăng ký Vendor đang chờ duyệt (PENDING_REVIEW) cho user@smarttravel.com");
            }
        }

        // 6. Seed thư viện mẫu Visa mặc định (tách bạch phí dịch vụ đại lý & lệ phí lãnh sự)
        seedDefaultVisaTemplatesAndLinkTours();

        log.info("Khởi tạo dữ liệu mẫu hoàn tất!");
    }

    private void seedDefaultVisaTemplatesAndLinkTours() {
        if (visaTemplateRepository.count() == 0) {
            VisaTemplate jp = buildTemplate(
                    "Nhật Bản", "JP", "🇯🇵", 7, 3,
                    new BigDecimal("1000000"), new BigDecimal("600000"),
                    "Đại lý nộp hồ sơ ủy quyền theo đoàn tại Tổng Lãnh sự quán Nhật Bản (TP.HCM) hoặc VFS Global.",
                    List.of(
                            doc("Hộ chiếu gốc (còn hạn ít nhất 6 tháng)", "Scan rõ nét trang thông tin cá nhân có chữ ký.", true),
                            doc("Ảnh thẻ 4.5x4.5cm nền trắng", "Chụp trong vòng 6 tháng, không đeo kính, lộ rõ tai.", true),
                            doc("Căn cước công dân (Mặt trước)", "Chụp rõ nét mặt trước CCCD, không mất góc.", true),
                            doc("Căn cước công dân (Mặt sau)", "Chụp rõ nét mặt sau CCCD có chip/ngày cấp và nơi cấp.", true),
                            doc("Sao kê tài khoản ngân hàng 3 tháng / Sổ tiết kiệm", "Số dư tối thiểu 100 triệu VNĐ có xác nhận ngân hàng.", true),
                            doc("Hợp đồng lao động / Xác nhận công tác", "Bổ sung nếu có để tăng tỷ lệ đậu thị thực.", false)
                    )
            );

            VisaTemplate kr = buildTemplate(
                    "Hàn Quốc", "KR", "🇰🇷", 10, 3,
                    new BigDecimal("800000"), new BigDecimal("500000"),
                    "Đại lý đại diện nộp hồ sơ tại Trung tâm Đăng ký Thị thực Hàn Quốc (KVAC).",
                    List.of(
                            doc("Hộ chiếu (còn hạn ít nhất 6 tháng)", "Scan trang thông tin hộ chiếu rõ nét.", true),
                            doc("Ảnh thẻ 3.5x4.5cm nền trắng", "Chụp mới trong vòng 6 tháng.", true),
                            doc("Căn cước công dân (Mặt trước)", "Chụp rõ nét mặt trước CCCD, không mất góc.", true),
                            doc("Căn cước công dân (Mặt sau)", "Chụp rõ nét mặt sau CCCD có chip/ngày cấp và nơi cấp.", true),
                            doc("Chứng minh tài chính / Sao kê lương 3 tháng", "Tối thiểu 100 triệu VNĐ hoặc sao kê tài khoản nhận lương.", true)
                    )
            );

            VisaTemplate eu = buildTemplate(
                    "Khối Schengen (Châu Âu)", "EU", "🇪🇺", 15, 5,
                    new BigDecimal("1800000"), new BigDecimal("2200000"),
                    "Đại lý đặt lịch hẹn sinh trắc học và nộp hồ sơ tại VFS Global / TLScontact của nước nhập cảnh chính.",
                    List.of(
                            doc("Hộ chiếu (còn hạn ít nhất 3 tháng sau ngày về)", "Scan trang thông tin và các trang có dấu xuất nhập cảnh cũ.", true),
                            doc("Ảnh thẻ chuẩn ICAO 3.5x4.5cm nền trắng", "Chụp trong vòng 6 tháng gần nhất.", true),
                            doc("Sao kê tài khoản ngân hàng 6 tháng", "Số dư khuyến nghị từ 150 triệu VNĐ trở lên.", true),
                            doc("Xác nhận công việc & Đơn xin nghỉ phép", "Có mộc tròn xác nhận của đơn vị công tác.", true)
                    )
            );

            VisaTemplate cn = buildTemplate(
                    "Trung Quốc", "CN", "🇨🇳", 5, 3,
                    new BigDecimal("600000"), new BigDecimal("900000"),
                    "Đại lý nộp hồ sơ đoàn/lẻ tại Trung tâm Dịch vụ Thị thực Trung Quốc (CVASC).",
                    List.of(
                            doc("Hộ chiếu (còn hạn ít nhất 6 tháng, còn tối thiểu 2 trang trống)", "Scan rõ nét trang thông tin ảnh.", true),
                            doc("Ảnh thẻ 3.3x4.8cm nền trắng", "Áo tối màu, lộ trán và hai tai, không đeo trang sức.", true),
                            doc("Căn cước công dân (Mặt trước)", "Chụp rõ nét mặt trước CCCD, không mất góc.", true),
                            doc("Căn cước công dân (Mặt sau)", "Chụp rõ nét mặt sau CCCD có chip/ngày cấp và nơi cấp.", true),
                            doc("Xác nhận cư trú CT07", "Chụp/scan rõ nét giấy xác nhận thông tin về cư trú mẫu CT07.", true)
                    )
            );

            visaTemplateRepository.saveAll(List.of(jp, kr, eu, cn));
            log.info("Đã khởi tạo 4 mẫu Visa chuẩn (Nhật Bản, Hàn Quốc, Schengen, Trung Quốc).");
        }

        // Tách các mục CCCD 2 mặt / CT07 gộp chung trong DB cũ thành các tệp riêng biệt (idempotent)
        migrateCombinedIdCardDocuments();

        // Tự động gắn mẫu Visa cho các tour quốc tế sẵn có trong DB nếu chưa gắn (không áp cho Thái Lan/Singapore miễn visa)
        List<VisaTemplate> allTemplates = visaTemplateRepository.findAll();
        List<Tour> tours = tourRepository.findAll();
        for (Tour t : tours) {
            if (t.getCategory() != TourCategory.NUOC_NGOAI || t.getVisaTemplate() != null) {
                continue;
            }
            String haystack = ((t.getDestination() != null && t.getDestination().getCountry() != null ? t.getDestination().getCountry() : "")
                    + " " + (t.getTitle() != null ? t.getTitle() : "")).toLowerCase(Locale.ROOT);

            VisaTemplate matched = null;
            for (VisaTemplate tpl : allTemplates) {
                String c = tpl.getCountry().toLowerCase(Locale.ROOT);
                if (haystack.contains(c)
                        || ("JP".equals(tpl.getCountryCode()) && (haystack.contains("nhật") || haystack.contains("tokyo") || haystack.contains("osaka") || haystack.contains("fuji")))
                        || ("KR".equals(tpl.getCountryCode()) && (haystack.contains("hàn quốc") || haystack.contains("seoul") || haystack.contains("busan") || haystack.contains("jeju")))
                        || ("CN".equals(tpl.getCountryCode()) && (haystack.contains("trung quốc") || haystack.contains("trung hoa") || haystack.contains("phượng hoàng") || haystack.contains("lệ giang") || haystack.contains("cửu trại câu") || haystack.contains("ân thi") || haystack.contains("bắc kinh") || haystack.contains("thượng hải")))
                        || ("EU".equals(tpl.getCountryCode()) && (haystack.contains("châu âu") || haystack.contains("pháp") || haystack.contains("ý") || haystack.contains("thụy sĩ") || haystack.contains("đức") || haystack.contains("schengen")))) {
                    matched = tpl;
                    break;
                }
            }
            if (matched != null) {
                t.setVisaTemplate(matched);
                tourRepository.save(t);
            }
        }
    }

    private void migrateCombinedIdCardDocuments() {
        List<VisaTemplate> templates = visaTemplateRepository.findAll();
        for (VisaTemplate tpl : templates) {
            List<VisaTemplateDocument> docs = tpl.getDocuments();
            if (docs == null || docs.isEmpty()) continue;

            List<VisaTemplateDocument> toAdd = new ArrayList<>();
            boolean changed = false;

            boolean hasBack = docs.stream().anyMatch(d -> d.getDocumentName() != null
                    && d.getDocumentName().toLowerCase(Locale.ROOT).contains("mặt sau"));
            boolean hasResidence = docs.stream().anyMatch(d -> d.getDocumentName() != null
                    && !d.getDocumentName().toLowerCase(Locale.ROOT).contains("2 mặt")
                    && (d.getDocumentName().toLowerCase(Locale.ROOT).contains("cư trú")
                    || d.getDocumentName().toLowerCase(Locale.ROOT).contains("ct07")));

            for (VisaTemplateDocument d : docs) {
                if (d.getDocumentName() == null) continue;
                String lower = d.getDocumentName().toLowerCase(Locale.ROOT);
                if (!lower.contains("2 mặt")) continue;

                boolean combinedWithResidence = lower.contains("cư trú") || lower.contains("ct07");
                boolean mandatory = d.getIsMandatory() == null || d.getIsMandatory();

                // Đổi tên bản ghi cũ in-place để không làm hỏng requirementId của tệp khách đã tải
                d.setDocumentName("Căn cước công dân (Mặt trước)");
                d.setDescription("Chụp rõ nét mặt trước CCCD, không mất góc.");
                changed = true;

                if (!hasBack) {
                    toAdd.add(VisaTemplateDocument.builder()
                            .template(tpl)
                            .documentName("Căn cước công dân (Mặt sau)")
                            .description("Chụp rõ nét mặt sau CCCD có chip/ngày cấp và nơi cấp.")
                            .isMandatory(mandatory)
                            .build());
                    hasBack = true;
                }
                if (combinedWithResidence && !hasResidence) {
                    toAdd.add(VisaTemplateDocument.builder()
                            .template(tpl)
                            .documentName("Xác nhận cư trú CT07")
                            .description("Chụp/scan rõ nét giấy xác nhận thông tin về cư trú mẫu CT07.")
                            .isMandatory(mandatory)
                            .build());
                    hasResidence = true;
                }
            }

            if (changed) {
                docs.addAll(toAdd);
                visaTemplateRepository.save(tpl);
                log.info("Đã tách mục CCCD 2 mặt / CT07 cho mẫu Visa {}", tpl.getCountry());
            }
        }

        // Chuẩn hóa luôn các cấu hình giấy tờ riêng theo tour (nếu tour đã copy từ mẫu cũ)
        Map<Long, List<VisaRequirement>> reqsByTour = visaRequirementRepository.findAll().stream()
                .filter(r -> r.getTour() != null && r.getTour().getId() != null)
                .collect(Collectors.groupingBy(r -> r.getTour().getId()));

        for (List<VisaRequirement> tourReqs : reqsByTour.values()) {
            boolean hasBack = tourReqs.stream().anyMatch(r -> r.getDocumentName() != null
                    && r.getDocumentName().toLowerCase(Locale.ROOT).contains("mặt sau"));
            boolean hasResidence = tourReqs.stream().anyMatch(r -> r.getDocumentName() != null
                    && !r.getDocumentName().toLowerCase(Locale.ROOT).contains("2 mặt")
                    && (r.getDocumentName().toLowerCase(Locale.ROOT).contains("cư trú")
                    || r.getDocumentName().toLowerCase(Locale.ROOT).contains("ct07")));

            List<VisaRequirement> toSave = new ArrayList<>();
            for (VisaRequirement r : tourReqs) {
                if (r.getDocumentName() == null) continue;
                String lower = r.getDocumentName().toLowerCase(Locale.ROOT);
                if (!lower.contains("2 mặt")) continue;

                boolean combinedWithResidence = lower.contains("cư trú") || lower.contains("ct07");
                boolean mandatory = r.getIsMandatory() == null || r.getIsMandatory();

                r.setDocumentName("Căn cước công dân (Mặt trước)");
                r.setDescription("Chụp rõ nét mặt trước CCCD, không mất góc.");
                toSave.add(r);

                if (!hasBack) {
                    toSave.add(VisaRequirement.builder()
                            .tour(r.getTour())
                            .documentName("Căn cước công dân (Mặt sau)")
                            .description("Chụp rõ nét mặt sau CCCD có chip/ngày cấp và nơi cấp.")
                            .isMandatory(mandatory)
                            .build());
                    hasBack = true;
                }
                if (combinedWithResidence && !hasResidence) {
                    toSave.add(VisaRequirement.builder()
                            .tour(r.getTour())
                            .documentName("Xác nhận cư trú CT07")
                            .description("Chụp/scan rõ nét giấy xác nhận thông tin về cư trú mẫu CT07.")
                            .isMandatory(mandatory)
                            .build());
                    hasResidence = true;
                }
            }
            if (!toSave.isEmpty()) {
                visaRequirementRepository.saveAll(toSave);
            }
        }
    }

    private record DocSeed(String name, String desc, boolean mandatory) {}

    private DocSeed doc(String name, String desc, boolean mandatory) {
        return new DocSeed(name, desc, mandatory);
    }

    private VisaTemplate buildTemplate(String country, String code, String flag, int procDays, int bufDays,
                                       BigDecimal visaFee, BigDecimal consularFee, String notes, List<DocSeed> docs) {
        VisaTemplate tpl = VisaTemplate.builder()
                .country(country)
                .countryCode(code)
                .flagEmoji(flag)
                .processingDays(procDays)
                .bufferDays(bufDays)
                .visaFee(visaFee)
                .consularFee(consularFee)
                .notes(notes)
                .vendor(null)
                .build();
        for (DocSeed d : docs) {
            tpl.getDocuments().add(VisaTemplateDocument.builder()
                    .template(tpl)
                    .documentName(d.name())
                    .description(d.desc())
                    .isMandatory(d.mandatory())
                    .build());
        }
        return tpl;
    }
}
