package com.smarttravel.repositories;

import com.smarttravel.entities.VisaDocument;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VisaDocumentRepository extends JpaRepository<VisaDocument, Long> {

    @EntityGraph(attributePaths = {"application", "application.booking", "application.booking.tour", "application.booking.user"})
    Optional<VisaDocument> findWithBookingById(Long id);

    Optional<VisaDocument> findByApplicationIdAndRequirementId(Long applicationId, Long requirementId);
}
