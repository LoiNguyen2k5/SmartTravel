package com.smarttravel.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class CloudinaryConfig {

    @Value("${app.cloudinary.cloud-name:demo}")
    private String cloudName;

    @Value("${app.cloudinary.api-key:123456789}")
    private String apiKey;

    @Value("${app.cloudinary.api-secret:secret}")
    private String apiSecret;

    public Map<String, String> getCloudinaryConfig() {
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", cloudName);
        config.put("api_key", apiKey);
        config.put("api_secret", apiSecret);
        return config;
    }
}
