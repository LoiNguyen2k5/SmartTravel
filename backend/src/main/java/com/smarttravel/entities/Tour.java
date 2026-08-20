package com.smarttravel.entities;

import com.smarttravel.enums.TourCategory;
import com.smarttravel.enums.TourStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tours")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tour extends BaseEntity {

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", columnDefinition = "LONGTEXT")
    private String description;

    @Column(name = "price", nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "duration_days", nullable = false)
    private Integer durationDays;

    @Column(name = "duration_nights", nullable = false)
    private Integer durationNights;

    @Column(name = "departure_location", nullable = false, length = 150)
    private String departureLocation;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    @Column(name = "tour_code", length = 50)
    private String tourCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", length = 30)
    @Builder.Default
    private TourCategory category = TourCategory.DOMESTIC;

    @Column(name = "child_price", precision = 12, scale = 2)
    private BigDecimal childPrice;

    @Column(name = "included_services", columnDefinition = "TEXT")
    private String includedServices;

    @Column(name = "excluded_services", columnDefinition = "TEXT")
    private String excludedServices;

    @Column(name = "cancellation_policy", columnDefinition = "TEXT")
    private String cancellationPolicy;

    @Column(name = "itinerary_details", columnDefinition = "LONGTEXT")
    private String itineraryDetails;

    @Column(name = "remaining_seats")
    @Builder.Default
    private Integer remainingSeats = 20;

    @Column(name = "view_count")
    @Builder.Default
    private Integer viewCount = 100;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private TourStatus status = TourStatus.ACTIVE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false)
    private User vendor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_id")
    private Destination destination;

    @OneToMany(mappedBy = "tour", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TourSchedule> schedules = new ArrayList<>();

    @OneToMany(mappedBy = "tour", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Review> reviews = new ArrayList<>();
}
