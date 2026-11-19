package com.smarttravel.entities;

import com.smarttravel.enums.VisaApplicationStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "visa_status_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VisaStatusLog extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private VisaApplication application;

    @Enumerated(EnumType.STRING)
    @Column(name = "from_status", length = 30)
    private VisaApplicationStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "to_status", nullable = false, length = 30)
    private VisaApplicationStatus toStatus;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @Column(name = "actor_email", length = 150)
    private String actorEmail;

    @Column(name = "actor_role", length = 50)
    private String actorRole;
}
