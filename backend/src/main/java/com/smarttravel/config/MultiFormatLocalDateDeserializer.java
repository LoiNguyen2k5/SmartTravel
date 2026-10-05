package com.smarttravel.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class MultiFormatLocalDateDeserializer extends JsonDeserializer<LocalDate> {

    private static final DateTimeFormatter[] FORMATTERS = new DateTimeFormatter[]{
            DateTimeFormatter.ISO_LOCAL_DATE,                    // yyyy-MM-dd (2026-10-10)
            DateTimeFormatter.ofPattern("dd-MM-yyyy"),          // 10-10-2026
            DateTimeFormatter.ofPattern("dd/MM/yyyy"),          // 10/10/2026
            DateTimeFormatter.ofPattern("yyyy/MM/dd"),          // 2026/10/10
            DateTimeFormatter.ofPattern("d/M/yyyy"),            // 5/9/2026
            DateTimeFormatter.ofPattern("d-M-yyyy")             // 5-9-2026
    };

    @Override
    public LocalDate deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String text = p.getText();
        if (text == null || text.isBlank()) {
            return null;
        }
        text = text.trim();
        for (DateTimeFormatter formatter : FORMATTERS) {
            try {
                return LocalDate.parse(text, formatter);
            } catch (Exception ignored) {
            }
        }
        try {
            return LocalDate.parse(text);
        } catch (Exception e) {
            return null;
        }
    }
}
