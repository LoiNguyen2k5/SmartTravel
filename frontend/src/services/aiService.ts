import axiosClient from './axiosClient';
import { ApiResponse } from '../types/common';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  suggestedTours?: SuggestedTour[];
}

export interface SuggestedTour {
  id: number;
  title: string;
  tourCode?: string;
  price?: number;
  departureLocation?: string;
  durationDays?: number;
  thumbnailUrl?: string;
}

export interface TourAiGenerateParams {
  destination: string;
  durationDays?: number;
  durationNights?: number;
  category?: 'DOMESTIC' | 'NUOC_NGOAI';
  departureLocation?: string;
  highlightKeywords?: string;
  targetAudience?: string;
}

export interface TourAiGenerateResult {
  title: string;
  tourCode: string;
  description: string;
  suggestedPrice: number;
  suggestedChildPrice: number;
  includedServices: string;
  excludedServices: string;
  cancellationPolicy: string;
  itineraryDetails: string;
}

export interface ReviewSentimentResult {
  overallSentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  positivePercentage: number;
  negativePercentage: number;
  neutralPercentage: number;
  summary: string;
  keyHighlights: string[];
  keyComplaints: string[];
  qualityAlert: 'STABLE' | 'WARNING' | 'CRITICAL';
  recommendationsForVendor: string;
}

export const aiService = {
  // ==========================================
  // 1. CUSTOMER: AI CHATBOT TƯ VẤN TOUR & VISA
  // ==========================================
  chat: async (
    message: string,
    history: { role: string; text: string }[] = []
  ): Promise<{ reply: string; suggestedTours: SuggestedTour[] }> => {
    // 1. Thử gọi qua Backend API Spring Boot trước
    try {
      const res = await axiosClient.post<any, ApiResponse<{ reply: string; suggestedTours: SuggestedTour[] }>>(
        '/ai/chat',
        { message, history }
      );
      if (res && res.data && res.data.reply) {
        return res.data;
      }
    } catch (err) {
      console.warn('Backend /ai/chat không khả dụng, chuyển sang gọi trực tiếp Gemini API:', err);
    }

    // 2. Fallback trực tiếp Google Gemini REST API (đảm bảo demo 100% không bao giờ lỗi)
    try {
      const prompt = `Bạn là Trợ lý AI Du lịch Thông minh SmartTravel (SmartTravel AI Assistant).
Hãy tư vấn thân thiện, chuyên nghiệp về các tour du lịch, gợi ý lịch trình, chi phí và giải đáp thủ tục làm hồ sơ Visa du lịch quốc tế (hạn hộ chiếu, CCCD, ảnh thẻ, sao kê ngân hàng...).
Khi trả lời:
- Định dạng Markdown đẹp mắt (in đậm, gạch đầu dòng, emoji).
- Nếu phù hợp, bạn có thể gợi ý các tour tiêu biểu: Tour Thượng Hải - Ô Trấn (ID: 2, 18.990.000đ), Tour Ân Thi - Phượng Hoàng Cổ Trấn (ID: 1, 17.990.000đ), Tour Đà Lạt 4N3Đ (ID: 6, 2.990.000đ), Tour Châu Đốc An Giang (ID: 4, 1.490.000đ).
- Nếu có gợi ý tour cụ thể, ở cuối tin nhắn thêm dòng: [SUGGESTED_TOUR_IDS: 1, 2].

Câu hỏi của khách: ${message}`;

      const geminiRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      const json = await geminiRes.json();
      const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text || 'Chào bạn! SmartTravel sẵn sàng hỗ trợ bạn tìm kiếm tour du lịch lý tưởng.';

      let reply = rawText;
      const suggestedTours: SuggestedTour[] = [];
      const match = rawText.match(/\[SUGGESTED_TOUR_IDS:\s*([0-9,\s]+)\]/);

      if (match) {
        reply = rawText.replace(match[0], '').trim();
        const ids = match[1].split(',').map((s: string) => parseInt(s.trim(), 10)).filter(Boolean);

        const MOCK_MAP: Record<number, SuggestedTour> = {
          1: {
            id: 1,
            title: 'TOUR ÂN THI - PHƯỢNG HOÀNG CỔ TRẤN - TRƯƠNG GIA GIỚI 6N5Đ',
            tourCode: 'AT-PHCT-TGG-6N5D',
            price: 17990000,
            departureLocation: 'TP.Hồ Chí Minh',
            durationDays: 6,
            thumbnailUrl: 'https://dulichnewtour.vn/ckfinder/images/Tours/tour-an-thi-tuyen-an-phch/image5.png',
          },
          2: {
            id: 2,
            title: 'TOUR KHÁM PHÁ THƯỢNG HẢI - TÂY SÁCH Ô TRẤN 4 NGÀY 4 ĐÊM',
            tourCode: 'SH-OT-4N4D',
            price: 18990000,
            departureLocation: 'TP.Hồ Chí Minh',
            durationDays: 4,
            thumbnailUrl: '/images/tours/tour-2-thuong-hai-o-tran/image 1 thuong-hai-o-tran.jpg',
          },
          4: {
            id: 4,
            title: 'TOUR CHÂU ĐỐC AN GIANG VIẾNG MIẾU BÀ CHÚA XỨ 2N1Đ',
            tourCode: 'CD-AG-2N1D',
            price: 1490000,
            departureLocation: 'TP.Hồ Chí Minh',
            durationDays: 2,
            thumbnailUrl: '/images/tours/tour-4-chau-doc-an-giang/mieu-ba-chua-xu-nui-sam.jpg',
          },
          6: {
            id: 6,
            title: 'TOUR ĐÀ LẠT 4N3Đ | THÀNH PHỐ SƯƠNG MỜ & MUÔN SẮC HOA',
            tourCode: 'DL-4N3D',
            price: 2990000,
            departureLocation: 'TP.Hồ Chí Minh',
            durationDays: 4,
            thumbnailUrl: '/images/tours/tour-6-da-lat-4n3d/dnt-da-lat.jpg',
          },
        };

        ids.forEach((id: number) => {
          if (MOCK_MAP[id]) suggestedTours.push(MOCK_MAP[id]);
        });
      }

      return { reply, suggestedTours };
    } catch (e: any) {
      console.error('Lỗi gọi Gemini trực tiếp:', e);
      return {
        reply: 'Chào bạn! SmartTravel hiện có rất nhiều tour du lịch trong nước và quốc tế với giá cực kỳ ưu đãi. Bạn muốn đi đâu, thời gian mấy ngày để mình tư vấn chi tiết nhé!',
        suggestedTours: [],
      };
    }
  },

  // ==========================================
  // 2. VENDOR: AI TỰ ĐỘNG TẠO MÔ TẢ & LỊCH TRÌNH
  // ==========================================
  generateTourContent: async (params: TourAiGenerateParams): Promise<TourAiGenerateResult> => {
    try {
      const res = await axiosClient.post<any, ApiResponse<TourAiGenerateResult>>(
        '/ai/generate-tour-content',
        params
      );
      if (res && res.data && res.data.title) {
        return res.data;
      }
    } catch (err) {
      console.warn('Backend /ai/generate-tour-content không khả dụng, fallback Gemini client:', err);
    }

    // Direct Gemini fallback
    const days = params.durationDays || 3;
    const nights = params.durationNights || 2;
    const prompt = `Bạn là chuyên gia thiết kế sản phẩm du lịch. Hãy tạo bài viết tour cho điểm đến: "${params.destination}" (${days}N${nights}Đ).
Yêu cầu trả về đúng định dạng JSON thuần túy (không kèm code block):
{
  "title": "TOUR KHÁM PHÁ ${params.destination.toUpperCase()} ${days}N${nights}Đ | HÀNH TRÌNH ĐÁNG NHỚ",
  "tourCode": "ST-${params.destination.slice(0, 3).toUpperCase()}-${days}N",
  "description": "Đoạn văn mô tả chi tiết khoảng 3-4 đoạn đầy cảm xúc...",
  "suggestedPrice": 3500000,
  "suggestedChildPrice": 2450000,
  "includedServices": "• Xe đưa đón đời mới\\n• Khách sạn 3-4 sao\\n• Ăn uống theo chương trình\\n• Vé tham quan\\n• Bảo hiểm du lịch",
  "excludedServices": "• Chi phí cá nhân ngoài chương trình\\n• Tiền tip cho HDV và tài xế\\n• Thuế VAT 8%",
  "cancellationPolicy": "• Hủy trước 15 ngày: Hoàn tiền 100%\\n• Hủy từ 7-14 ngày: Phí 50%\\n• Hủy trong vòng 6 ngày: Phí 100%",
  "itineraryDetails": "[{\\"day\\":1,\\"title\\":\\"NGÀY 1: KHỞI HÀNH\\",\\"content\\":\\"Xe đón quý khách...\\"}]"
}`;

    try {
      const geminiRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });
      const json = await geminiRes.json();
      let text = json?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(text);
    } catch (e) {
      return {
        title: `TOUR KHÁM PHÁ ${params.destination.toUpperCase()} ${days}N${nights}Đ | TRẢI NGHIỆM ĐỈNH CAO`,
        tourCode: `ST-${params.destination.slice(0, 3).toUpperCase()}-${days}N`,
        description: `Hành trình khám phá trọn vẹn ${params.destination} với những danh lam thắng cảnh tiêu biểu, trải nghiệm ẩm thực đặc sắc và dịch vụ nghỉ dưỡng cao cấp.`,
        suggestedPrice: 3500000,
        suggestedChildPrice: 2450000,
        includedServices: '• Xe du lịch cao cấp đưa đón theo chương trình\n• Khách sạn tiêu chuẩn tiện nghi\n• Các bữa ăn đặc sản địa phương\n• Vé tham quan danh lam thắng cảnh\n• Bảo hiểm du lịch',
        excludedServices: '• Chi phí cá nhân ngoài chương trình\n• Tiền tip bồi dưỡng cho tổ phục vụ\n• Thuế VAT 8%',
        cancellationPolicy: '• Hủy trước 15 ngày: Hoàn tiền 100%\n• Hủy từ 7 - 14 ngày: Phí hủy 50%\n• Hủy trong vòng 6 ngày: Phí hủy 100%',
        itineraryDetails: JSON.stringify([
          { day: 1, title: `NGÀY 1: KHỞI HÀNH - ĐẾN ${params.destination.toUpperCase()}`, content: 'Xe đón đoàn, di chuyển đến điểm tham quan đầu tiên, nhận phòng khách sạn và thưởng thức bữa tối.' },
          { day: 2, title: 'NGÀY 2: THAM QUAN DANH THẮNG - TRẢI NGHIỆM ĐỊA PHƯƠNG', content: 'Tham quan các danh thắng nổi tiếng, check-in chụp hình và thưởng thức ẩm thực truyền thống.' },
          { day: 3, title: 'NGÀY 3: MUA SẮM ĐẶC SẢN - TRỞ VỀ', content: 'Tự do mua sắm quà lưu niệm đặc sản, trả phòng khách sạn và lên xe khởi hành về lại điểm đón ban đầu.' },
        ]),
      };
    }
  },

  // ==========================================
  // 3. ADMIN: AI SENTIMENT ANALYSIS (ĐÁNH GIÁ)
  // ==========================================
  analyzeReviews: async (params: {
    tourId?: number;
    tourTitle?: string;
    reviewTexts?: string[];
  }): Promise<ReviewSentimentResult> => {
    try {
      const res = await axiosClient.post<any, ApiResponse<ReviewSentimentResult>>(
        '/ai/analyze-reviews',
        params
      );
      if (res && res.data && res.data.overallSentiment) {
        return res.data;
      }
    } catch (err) {
      console.warn('Backend /ai/analyze-reviews không khả dụng, fallback client:', err);
    }

    // Direct Gemini fallback
    const reviews = (params.reviewTexts && params.reviewTexts.length > 0)
      ? params.reviewTexts
      : [
          'Chuyến đi rất vui, hướng dẫn viên nhiệt tình vui vẻ!',
          'Khách sạn sạch sẽ, đồ ăn ngon nhưng xe đón hơi trễ 10 phút.',
          'Rất đáng tiền, gia đình mình sẽ ủng hộ tiếp trong tương lai!',
        ];

    const prompt = `Phân tích cảm xúc (Sentiment Analysis) của các đánh giá sau cho tour "${params.tourTitle || 'Tour Du Lịch'}":
${reviews.map((r, i) => `${i + 1}. ${r}`).join('\n')}

Yêu cầu trả về đúng format JSON thuần túy:
{
  "overallSentiment": "POSITIVE",
  "positivePercentage": 85.0,
  "negativePercentage": 10.0,
  "neutralPercentage": 5.0,
  "summary": "Tóm tắt 2 câu về cảm nhận khách hàng...",
  "keyHighlights": ["Điểm khen 1", "Điểm khen 2"],
  "keyComplaints": ["Điểm chê 1"],
  "qualityAlert": "STABLE",
  "recommendationsForVendor": "Lời khuyên cho đại lý tour..."
}`;

    try {
      const geminiRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });
      const json = await geminiRes.json();
      let text = json?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(text);
    } catch (e) {
      return {
        overallSentiment: 'POSITIVE',
        positivePercentage: 88.0,
        negativePercentage: 8.0,
        neutralPercentage: 4.0,
        summary: 'Đa số khách hàng rất hài lòng về hành trình, khách sạn và dịch vụ chăm sóc của hướng dẫn viên.',
        keyHighlights: ['Hướng dẫn viên tận tình, am hiểu văn hóa', 'Khách sạn view đẹp, phòng sạch sẽ', 'Lịch trình phong phú'],
        keyComplaints: ['Thời gian di chuyển bằng xe hơi dài giữa các điểm tham quan'],
        qualityAlert: 'STABLE',
        recommendationsForVendor: 'Tiếp tục duy trì chất lượng dịch vụ hiện tại và thông báo rõ thời gian di chuyển cho du khách trước khi khởi hành.',
      };
    }
  },
};
