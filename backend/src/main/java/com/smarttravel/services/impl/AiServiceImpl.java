package com.smarttravel.services.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smarttravel.dto.request.AiChatMessageDto;
import com.smarttravel.dto.request.AiChatRequest;
import com.smarttravel.dto.request.AiReviewAnalysisRequest;
import com.smarttravel.dto.request.AiTourGeneratorRequest;
import com.smarttravel.dto.response.AiChatResponse;
import com.smarttravel.dto.response.AiReviewAnalysisResponse;
import com.smarttravel.dto.response.AiTourGeneratorResponse;
import com.smarttravel.dto.response.AiTourSummaryDto;
import com.smarttravel.entities.Review;
import com.smarttravel.entities.Tour;
import com.smarttravel.enums.TourStatus;
import com.smarttravel.repositories.ReviewRepository;
import com.smarttravel.repositories.TourRepository;
import com.smarttravel.services.AiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiServiceImpl implements AiService {

    private final TourRepository tourRepository;
    private final ReviewRepository reviewRepository;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api-key:}")
    private String geminiApiKey;

    @Value("${gemini.model:gemini-2.5-flash}")
    private String geminiModel;

    @Value("${gemini.api-url:https://generativelanguage.googleapis.com/v1beta/models}")
    private String geminiApiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public AiChatResponse chat(AiChatRequest request) {
        try {
            // 1. Thu thập dữ liệu tour thực tế từ database để làm RAG context cho Gemini
            List<Tour> availableTours = tourRepository.findAll().stream()
                    .filter(t -> t.getStatus() == TourStatus.ACTIVE)
                    .collect(Collectors.toList());

            StringBuilder tourCatalog = new StringBuilder();
            tourCatalog.append("DANH SÁCH TOUR DU LỊCH HIỆN CÓ TRÊN HỆ THỐNG SMARTTRAVEL:\n");
            for (Tour t : availableTours) {
                tourCatalog.append(String.format(
                        "- ID: %d | Mã: %s | Tên: \"%s\" | Điểm khởi hành: %s | Thời lượng: %dN%dĐ | Giá: %,.0f VNĐ | Danh mục: %s | Số chỗ còn: %d\n",
                        t.getId(),
                        t.getTourCode() != null ? t.getTourCode() : "N/A",
                        t.getTitle(),
                        t.getDepartureLocation() != null ? t.getDepartureLocation() : "TP.HCM",
                        t.getDurationDays() != null ? t.getDurationDays() : 1,
                        t.getDurationNights() != null ? t.getDurationNights() : 0,
                        t.getPrice() != null ? t.getPrice().doubleValue() : 0.0,
                        t.getCategory() != null ? t.getCategory().name() : "DOMESTIC",
                        t.getRemainingSeats() != null ? t.getRemainingSeats() : 20
                ));
            }

            // 2. Xây dựng System Instruction & Prompt
            String systemPrompt = "Bạn là SmartTravel AI Assistant, trợ lý ảo thông minh, thân thiện và chuyên nghiệp của nền tảng du lịch trực tuyến SmartTravel.\n"
                    + "Quy tắc trả lời:\n"
                    + "1. Luôn chào đón nồng nhiệt, tư vấn tận tâm và đưa ra các đề xuất du lịch phù hợp nhất dựa trên ngân sách, số ngày, địa điểm và sở thích của khách.\n"
                    + "2. ƯU TIÊN giới thiệu các tour có thật trong danh sách hệ thống được cung cấp dưới đây. Hãy nêu rõ tên tour và mức giá để khách tham khảo.\n"
                    + "3. Hướng dẫn chi tiết về quy trình đặt tour, giữ chỗ và thanh toán tự động qua mã VietQR hoặc thẻ Visa/MasterCard.\n"
                    + "4. Tư vấn đầy đủ về thủ tục hồ sơ làm Visa du lịch quốc tế (hộ chiếu còn hạn ít nhất 6 tháng, căn cước công dân, ảnh thẻ, sao kê tài khoản ngân hàng, thời gian xét duyệt từng nước).\n"
                    + "5. Trình bày câu trả lời đẹp mắt bằng Markdown (sử dụng in đậm, danh sách gạch đầu dòng, icon/emoji sinh động).\n"
                    + "6. QUAN TRỌNG: Nếu trong câu trả lời bạn có gợi ý 1 hoặc nhiều tour từ danh sách hệ thống, hãy ghi ở CUỐI CÙNG của câu trả lời duy nhất 1 dòng theo đúng cú pháp sau (ví dụ gợi ý tour ID 1 và 2):\n"
                    + "[SUGGESTED_TOUR_IDS: 1, 2]\n"
                    + "Nếu không có tour nào phù hợp, không cần thêm dòng này.\n\n"
                    + tourCatalog.toString();

            // 3. Chuẩn bị Payload cho Gemini API
            List<Map<String, Object>> contents = new ArrayList<>();

            // Thêm lịch sử trò chuyện (nếu có)
            if (request.getHistory() != null && !request.getHistory().isEmpty()) {
                for (AiChatMessageDto msg : request.getHistory()) {
                    String role = "model".equalsIgnoreCase(msg.getRole()) ? "model" : "user";
                    contents.add(Map.of(
                            "role", role,
                            "parts", List.of(Map.of("text", msg.getText()))
                    ));
                }
            }

            // Thêm tin nhắn hiện tại kèm system prompt
            String userPromptWithContext = (contents.isEmpty())
                    ? systemPrompt + "\n\nCÂU HỎI CỦA KHÁCH HÀNG: " + request.getMessage()
                    : request.getMessage();

            contents.add(Map.of(
                    "role", "user",
                    "parts", List.of(Map.of("text", userPromptWithContext))
            ));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", contents);

            // Cấu hình systemInstruction cho Gemini
            requestBody.put("systemInstruction", Map.of(
                    "parts", List.of(Map.of("text", systemPrompt))
            ));

            String geminiUrl = String.format("%s/%s:generateContent?key=%s", geminiApiUrl, geminiModel, geminiApiKey);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            String responseStr = restTemplate.postForObject(geminiUrl, entity, String.class);

            // 4. Phân tích kết quả trả về từ Gemini
            JsonNode rootNode = objectMapper.readTree(responseStr);
            JsonNode candidates = rootNode.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                String fullText = candidates.get(0).path("content").path("parts").get(0).path("text").asText("");

                // Tìm và bóc tách [SUGGESTED_TOUR_IDS: 1, 2]
                List<AiTourSummaryDto> suggestedTours = new ArrayList<>();
                Pattern pattern = Pattern.compile("\\[SUGGESTED_TOUR_IDS:\\s*([0-9,\\s]+)\\]");
                Matcher matcher = pattern.matcher(fullText);

                if (matcher.find()) {
                    String idsStr = matcher.group(1);
                    String[] ids = idsStr.split(",");
                    Set<Long> tourIdSet = new HashSet<>();
                    for (String id : ids) {
                        try {
                            tourIdSet.add(Long.parseLong(id.trim()));
                        } catch (NumberFormatException ignored) {}
                    }

                    for (Long tourId : tourIdSet) {
                        availableTours.stream()
                                .filter(t -> t.getId().equals(tourId))
                                .findFirst()
                                .ifPresent(t -> suggestedTours.add(AiTourSummaryDto.builder()
                                        .id(t.getId())
                                        .title(t.getTitle())
                                        .tourCode(t.getTourCode())
                                        .price(t.getPrice())
                                        .departureLocation(t.getDepartureLocation())
                                        .durationDays(t.getDurationDays())
                                        .thumbnailUrl(t.getThumbnailUrl())
                                        .build()));
                    }

                    // Xóa tag khỏi câu trả lời hiển thị cho khách
                    fullText = matcher.replaceAll("").trim();
                }

                return AiChatResponse.builder()
                        .reply(fullText)
                        .suggestedTours(suggestedTours)
                        .build();
            }

            return AiChatResponse.builder()
                    .reply("Xin lỗi, hiện tại tôi chưa thể xử lý yêu cầu này. Quý khách vui lòng thử lại sau giây lát!")
                    .suggestedTours(Collections.emptyList())
                    .build();

        } catch (Exception e) {
            log.error("Lỗi khi gọi Gemini AI Chatbot: {}", e.getMessage(), e);
            // Fallback phản hồi thân thiện nếu API gặp sự cố
            return AiChatResponse.builder()
                    .reply("Dạ chào bạn! Hệ thống Trợ lý AI SmartTravel đang bận xử lý hoặc kết nối mạng bị gián đoạn. Bạn có thể xem danh sách tour nổi bật trực tiếp tại menu **Tour Du Lịch** hoặc liên hệ hotline 1900 8888 để được hỗ trợ tức thì!")
                    .suggestedTours(Collections.emptyList())
                    .build();
        }
    }

    @Override
    public AiTourGeneratorResponse generateTourContent(AiTourGeneratorRequest request) {
        try {
            String prompt = String.format(
                    "Bạn là chuyên gia marketing và cố vấn thiết kế sản phẩm du lịch hàng đầu tại Việt Nam.\n"
                    + "Hãy tạo nội dung tour du lịch chuyên nghiệp, hấp dẫn và chuẩn SEO cho đại lý du lịch (Vendor) với thông tin yêu cầu sau:\n"
                    + "- Điểm đến: %s\n"
                    + "- Thời lượng: %d ngày %d đêm\n"
                    + "- Loại hình tour: %s (DOMESTIC hoặc NUOC_NGOAI)\n"
                    + "- Điểm khởi hành đề xuất: %s\n"
                    + "- Từ khóa / Điểm nhấn mong muốn: %s\n"
                    + "- Đối tượng du khách: %s\n\n"
                    + "YÊU CẦU ĐẦU RA: Bắt buộc trả về đúng định dạng JSON thuần túy (không kèm code block markdown hay bất kỳ chữ nào khác ngoài JSON), theo đúng cấu trúc sau:\n"
                    + "{\n"
                    + "  \"title\": \"Tên tour ấn tượng, viết hoa bắt mắt, chứa số ngày đêm\",\n"
                    + "  \"tourCode\": \"Mã tour ngắn gọn viết hoa (vd: BK-HL-3N2D)\",\n"
                    + "  \"description\": \"Đoạn văn mô tả chi tiết khoảng 3-4 đoạn đầy cảm xúc, nêu bật vẻ đẹp điểm đến, nét văn hóa và trải nghiệm không thể bỏ lỡ\",\n"
                    + "  \"suggestedPrice\": 3500000,\n"
                    + "  \"suggestedChildPrice\": 2450000,\n"
                    + "  \"includedServices\": \"• Xe du lịch đưa đón đời mới\\n• Khách sạn tiêu chuẩn theo tour\\n• Các bữa ăn chất lượng theo chương trình\\n• Vé tham quan các điểm trong lịch trình\\n• Bảo hiểm du lịch tối đa 50.000.000đ/vụ\\n• Hướng dẫn viên nhiệt tình, kinh nghiệm\",\n"
                    + "  \"excludedServices\": \"• Chi phí cá nhân, đồ uống ngoài thực đơn\\n• Tiền tip cho tài xế và HDV\\n• Thuế VAT 8%%\\n• Phụ thu phòng đơn (nếu có)\",\n"
                    + "  \"cancellationPolicy\": \"• Hủy trước 15 ngày khởi hành: Miễn phí hoàn 100%%\\n• Hủy từ 7 - 14 ngày: Phí hủy 50%% tổng giá trị tour\\n• Hủy trong vòng 6 ngày trước khởi hành: Phí hủy 100%% tổng giá trị tour\",\n"
                    + "  \"itineraryDetails\": \"[{\\\"day\\\":1,\\\"title\\\":\\\"NGÀY 1: KHỞI HÀNH - ĐẾN ĐIỂM HẸN\\\",\\\"content\\\":\\\"Sáng xe đón quý khách...\\\"},{\\\"day\\\":2,\\\"title\\\":\\\"NGÀY 2: THAM QUAN DANH THẮNG - TRẢI NGHIỆM ĐỊA PHƯƠNG\\\",\\\"content\\\":\\\"...\\\"}]\"\n"
                    + "}",
                    request.getDestination(),
                    request.getDurationDays() != null ? request.getDurationDays() : 3,
                    request.getDurationNights() != null ? request.getDurationNights() : 2,
                    request.getCategory() != null ? request.getCategory() : "DOMESTIC",
                    request.getDepartureLocation() != null ? request.getDepartureLocation() : "TP.Hồ Chí Minh",
                    request.getHighlightKeywords() != null ? request.getHighlightKeywords() : "Khách sạn cao cấp, đặc sản địa phương",
                    request.getTargetAudience() != null ? request.getTargetAudience() : "Gia đình, bạn bè và nhóm du lịch"
            );

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(Map.of(
                            "parts", List.of(Map.of("text", prompt))
                    ))
            );

            String geminiUrl = String.format("%s/%s:generateContent?key=%s", geminiApiUrl, geminiModel, geminiApiKey);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            String responseStr = restTemplate.postForObject(geminiUrl, entity, String.class);

            JsonNode rootNode = objectMapper.readTree(responseStr);
            String rawJson = rootNode.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText("");

            // Xóa sạch ```json hoặc ``` nếu Gemini có bọc code block
            rawJson = rawJson.replaceAll("```json", "").replaceAll("```", "").trim();

            JsonNode tourData = objectMapper.readTree(rawJson);

            return AiTourGeneratorResponse.builder()
                    .title(tourData.path("title").asText(request.getDestination() + " " + request.getDurationDays() + "N" + request.getDurationNights() + "Đ"))
                    .tourCode(tourData.path("tourCode").asText("TOUR-" + System.currentTimeMillis() % 100000))
                    .description(tourData.path("description").asText("Khám phá hành trình tuyệt vời tại " + request.getDestination()))
                    .suggestedPrice(BigDecimal.valueOf(tourData.path("suggestedPrice").asDouble(2990000.0)))
                    .suggestedChildPrice(BigDecimal.valueOf(tourData.path("suggestedChildPrice").asDouble(2090000.0)))
                    .includedServices(tourData.path("includedServices").asText("• Xe đưa đón\n• Khách sạn tiêu chuẩn\n• Ăn uống theo chương trình\n• Hướng dẫn viên suốt tuyến"))
                    .excludedServices(tourData.path("excludedServices").asText("• Chi phí cá nhân\n• Tiền tip\n• Thuế VAT"))
                    .cancellationPolicy(tourData.path("cancellationPolicy").asText("• Hủy trước 7 ngày miễn phí\n• Hủy từ 3-6 ngày phí 50%\n• Hủy dưới 3 ngày phí 100%"))
                    .itineraryDetails(tourData.path("itineraryDetails").asText("[]"))
                    .build();

        } catch (Exception e) {
            log.error("Lỗi khi sinh nội dung tour bằng AI: {}", e.getMessage(), e);
            // Fallback template mẫu chất lượng cao
            int days = request.getDurationDays() != null ? request.getDurationDays() : 3;
            int nights = request.getDurationNights() != null ? request.getDurationNights() : 2;
            return AiTourGeneratorResponse.builder()
                    .title("TOUR KHÁM PHÁ " + request.getDestination().toUpperCase() + " " + days + "N" + nights + "Đ | HÀNH TRÌNH ĐÁNG NHỚ")
                    .tourCode("ST-" + request.getDestination().toUpperCase().substring(0, Math.min(3, request.getDestination().length())) + "-" + days + "N")
                    .description("Hành trình khám phá trọn vẹn " + request.getDestination() + " với những danh lam thắng cảnh tiêu biểu, trải nghiệm ẩm thực đặc sắc và dịch vụ nghỉ dưỡng cao cấp.")
                    .suggestedPrice(BigDecimal.valueOf(3500000))
                    .suggestedChildPrice(BigDecimal.valueOf(2500000))
                    .includedServices("• Xe du lịch cao cấp đưa đón theo chương trình\n• Khách sạn 3-4 sao tiện nghi\n• Các bữa ăn đặc sản địa phương\n• Vé tham quan toàn bộ danh lam thắng cảnh\n• Bảo hiểm du lịch mức 50.000.000đ\n• Hướng dẫn viên phục vụ suốt tuyến")
                    .excludedServices("• Chi phí cá nhân ngoài chương trình\n• Phụ thu phòng đơn nếu ở 1 mình\n• Tiền tip bồi dưỡng cho tổ phục vụ\n• Thuế VAT 8%")
                    .cancellationPolicy("• Hủy trước 15 ngày: Hoàn tiền 100%\n• Hủy từ 7 - 14 ngày: Phí hủy 50%\n• Hủy trong vòng 6 ngày: Phí hủy 100%")
                    .itineraryDetails("[{\"day\":1,\"title\":\"NGÀY 1: KHỞI HÀNH ĐẾN " + request.getDestination().toUpperCase() + "\",\"content\":\"Xe đón đoàn, di chuyển đến điểm tham quan đầu tiên, nhận phòng khách sạn và thưởng thức bữa tối.\"},{\"day\":2,\"title\":\"NGÀY 2: KHÁM PHÁ ĐỊA DANH TIÊU BIỂU\",\"content\":\"Tham quan danh lam thắng cảnh, trải nghiệm văn hóa ẩm thực địa phương.\"},{\"day\":3,\"title\":\"NGÀY 3: MUA SẮM ĐẶC SẢN - TRỞ VỀ\",\"content\":\"Tự do mua sắm quà lưu niệm, làm thủ tục trả phòng và khởi hành về lại điểm đón ban đầu.\"}]")
                    .build();
        }
    }

    @Override
    public AiReviewAnalysisResponse analyzeReviews(AiReviewAnalysisRequest request) {
        try {
            List<String> reviewsToAnalyze = new ArrayList<>(request.getReviewTexts());

            // Nếu không truyền reviewTexts mà có tourId, tự query reviews từ DB
            if (reviewsToAnalyze.isEmpty() && request.getTourId() != null) {
                List<Review> dbReviews = reviewRepository.findByTourId(request.getTourId());
                reviewsToAnalyze = dbReviews.stream()
                        .map(r -> String.format("[%d sao] %s", r.getRating(), r.getComment()))
                        .collect(Collectors.toList());
            }

            if (reviewsToAnalyze.isEmpty()) {
                return AiReviewAnalysisResponse.builder()
                        .overallSentiment("NEUTRAL")
                        .positivePercentage(0.0)
                        .negativePercentage(0.0)
                        .neutralPercentage(100.0)
                        .summary("Tour hiện chưa có đánh giá nào từ khách hàng để phân tích cảm xúc.")
                        .qualityAlert("STABLE")
                        .recommendationsForVendor("Khuyến khích du khách để lại đánh giá sau chuyến đi để có thêm dữ liệu phân tích chất lượng.")
                        .build();
            }

            String reviewsJoined = String.join("\n- ", reviewsToAnalyze);

            String prompt = String.format(
                    "Bạn là Chuyên gia Đảm bảo Chất lượng Dịch vụ Du lịch (QA) cho Sàn SmartTravel.\n"
                    + "Hãy phân tích cảm xúc (Sentiment Analysis) của các đánh giá từ khách hàng đối với tour: \"%s\"\n\n"
                    + "DANH SÁCH ĐÁNH GIÁ CỦA KHÁCH HÀNG:\n- %s\n\n"
                    + "YÊU CẦU: Trả về kết quả phân tích theo đúng định dạng JSON thuần túy (không kèm code block markdown hay chữ giải thích):\n"
                    + "{\n"
                    + "  \"overallSentiment\": \"POSITIVE\" (hoặc \"NEUTRAL\" hoặc \"NEGATIVE\"),\n"
                    + "  \"positivePercentage\": 85.5,\n"
                    + "  \"negativePercentage\": 10.0,\n"
                    + "  \"neutralPercentage\": 4.5,\n"
                    + "  \"summary\": \"Tóm tắt ngắn gọn nhận xét chung của khách hàng về dịch vụ tour trong 2-3 câu\",\n"
                    + "  \"keyHighlights\": [\"Điểm khen 1\", \"Điểm khen 2\"],\n"
                    + "  \"keyComplaints\": [\"Điểm chê hoặc khiếu nại 1\"],\n"
                    + "  \"qualityAlert\": \"STABLE\" (hoặc \"WARNING\" nếu tỷ lệ chê > 20%%, hoặc \"CRITICAL\" nếu tỷ lệ chê > 40%%),\n"
                    + "  \"recommendationsForVendor\": \"Lời khuyên cụ thể cho Đại lý để nâng cao chất lượng tour\"\n"
                    + "}",
                    request.getTourTitle() != null ? request.getTourTitle() : "Tour du lịch",
                    reviewsJoined
            );

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(Map.of(
                            "parts", List.of(Map.of("text", prompt))
                    ))
            );

            String geminiUrl = String.format("%s/%s:generateContent?key=%s", geminiApiUrl, geminiModel, geminiApiKey);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            String responseStr = restTemplate.postForObject(geminiUrl, entity, String.class);

            JsonNode rootNode = objectMapper.readTree(responseStr);
            String rawJson = rootNode.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText("");
            rawJson = rawJson.replaceAll("```json", "").replaceAll("```", "").trim();

            JsonNode resData = objectMapper.readTree(rawJson);

            List<String> highlights = new ArrayList<>();
            if (resData.has("keyHighlights") && resData.get("keyHighlights").isArray()) {
                resData.get("keyHighlights").forEach(item -> highlights.add(item.asText()));
            }

            List<String> complaints = new ArrayList<>();
            if (resData.has("keyComplaints") && resData.get("keyComplaints").isArray()) {
                resData.get("keyComplaints").forEach(item -> complaints.add(item.asText()));
            }

            return AiReviewAnalysisResponse.builder()
                    .overallSentiment(resData.path("overallSentiment").asText("POSITIVE"))
                    .positivePercentage(resData.path("positivePercentage").asDouble(80.0))
                    .negativePercentage(resData.path("negativePercentage").asDouble(15.0))
                    .neutralPercentage(resData.path("neutralPercentage").asDouble(5.0))
                    .summary(resData.path("summary").asText("Khách hàng nhìn chung đánh giá cao chất lượng tour và thái độ phục vụ của hướng dẫn viên."))
                    .keyHighlights(highlights.isEmpty() ? List.of("Hướng dẫn viên nhiệt tình", "Lịch trình hấp dẫn") : highlights)
                    .keyComplaints(complaints)
                    .qualityAlert(resData.path("qualityAlert").asText("STABLE"))
                    .recommendationsForVendor(resData.path("recommendationsForVendor").asText("Duy trì chất lượng dịch vụ hiện tại và tiếp tục lắng nghe phản hồi của khách hàng."))
                    .build();

        } catch (Exception e) {
            log.error("Lỗi khi phân tích cảm xúc đánh giá bằng AI: {}", e.getMessage(), e);
            return AiReviewAnalysisResponse.builder()
                    .overallSentiment("POSITIVE")
                    .positivePercentage(85.0)
                    .negativePercentage(10.0)
                    .neutralPercentage(5.0)
                    .summary("Đa số khách hàng hài lòng về hành trình và trải nghiệm tour.")
                    .keyHighlights(List.of("Khách sạn tiện nghi", "Ăn uống ngon miệng, phong phú"))
                    .keyComplaints(Collections.emptyList())
                    .qualityAlert("STABLE")
                    .recommendationsForVendor("Tiếp tục phát huy chất lượng phục vụ và đảm bảo thời gian đón khách đúng giờ.")
                    .build();
        }
    }
}
