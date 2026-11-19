package com.smarttravel.services.impl;

import com.smarttravel.entities.VisaApplication;
import com.smarttravel.entities.VisaDocument;
import com.smarttravel.enums.VisaApplicationStatus;
import com.smarttravel.repositories.VisaApplicationRepository;
import com.smarttravel.repositories.VisaDocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.List;

/**
 * Tự động xóa các file giấy tờ cá nhân nhạy cảm (hộ chiếu, CCCD, sao kê)
 * sau N ngày kể từ khi hồ sơ Visa đã hoàn tất (APPROVED / REJECTED),
 * vẫn giữ lại bản ghi metadata và lịch sử trạng thái để đối soát.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class VisaDocumentCleanupScheduler {

    private final VisaApplicationRepository visaApplicationRepository;
    private final VisaDocumentRepository visaDocumentRepository;

    @Value("${app.visa.storage-dir:uploads/visa-documents}")
    private String storageDir;

    @Value("${app.visa.retention-days:30}")
    private int retentionDays;

    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public int purgeExpiredSensitiveVisaFiles() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(Math.max(1, retentionDays));
        List<VisaApplication> completedApps = visaApplicationRepository.findByStatusInAndCompletedAtBefore(
                EnumSet.of(VisaApplicationStatus.APPROVED, VisaApplicationStatus.REJECTED),
                cutoff
        );

        if (completedApps == null || completedApps.isEmpty()) {
            return 0;
        }

        Path rootDir = Paths.get(storageDir).toAbsolutePath().normalize();
        int purgedCount = 0;

        for (VisaApplication app : completedApps) {
            if (app.getDocuments() == null) continue;
            for (VisaDocument doc : app.getDocuments()) {
                if (Boolean.TRUE.equals(doc.getFilePurged()) || doc.getStoredFilePath() == null) {
                    continue;
                }
                try {
                    Path p = Paths.get(doc.getStoredFilePath()).toAbsolutePath().normalize();
                    if (p.startsWith(rootDir)) {
                        Files.deleteIfExists(p);
                    }
                    doc.setStoredFilePath(null);
                    doc.setFilePurged(true);
                    visaDocumentRepository.save(doc);
                    purgedCount++;
                } catch (Exception e) {
                    log.warn("Không thể xóa file Visa quá hạn lưu trữ [docId={}]: {}", doc.getId(), e.getMessage());
                }
            }
        }

        if (purgedCount > 0) {
            log.info("🛡️ [Privacy Cleanup] Đã tự động xóa {} tệp giấy tờ Visa nhạy cảm quá {} ngày sau khi hoàn tất hồ sơ.", purgedCount, retentionDays);
        }
        return purgedCount;
    }
}
