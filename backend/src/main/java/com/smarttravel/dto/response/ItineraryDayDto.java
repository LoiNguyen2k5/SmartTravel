package com.smarttravel.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItineraryDayDto {
    private Long id;
    private Integer dayNumber;
    private LocalDate date;
    private String title;
    private List<ItineraryItemDto> items;
}
