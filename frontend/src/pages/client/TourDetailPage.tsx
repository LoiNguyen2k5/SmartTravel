import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { tourService } from '../../services/tourService';
import { reviewService } from '../../services/reviewService';
import { bookingService } from '../../services/bookingService';
import { Tour } from '../../types/tour';
import { Review } from '../../types/review';
import useAuth from '../../hooks/useAuth';
import { MOCK_TOURS, findMockTourById } from '../../data/mockTours';
import { 
  Star, Clock, Calendar, MapPin, 
  HelpCircle, ShieldCheck, ChevronRight, ChevronLeft, PhoneCall, 
  Send, AlertCircle, Image as ImageIcon, X, Maximize2, Users,
  Sparkles, Building2, CheckCircle2, Plane, Bus
} from 'lucide-react';
import { getTourTransportInfo } from '../../utils/tourTransport';
import { VoucherSelectorModal } from '../../components/booking/VoucherSelectorModal';
import { VisaRequirementInfo } from '../../components/visa/VisaRequirementInfo';
import { visaService } from '../../services/visaService';
import { VisaRequirementResponse } from '../../types/visa';
import { 
  tourScheduleService, 
  formatScheduleDate, 
  computeScheduleStatus, 
  TourScheduleStatus,
  ScheduleLeadTimeConfig
} from '../../services/tourScheduleService';

const MOCK_DETAIL_TOUR: Tour = MOCK_TOURS[0]; // Default fallback = first tour

interface TimelineActivity {
  time: string;
  icon: string;
  badge: string;
  badgeType: 'meal' | 'hotel' | 'tour' | 'transit';
  content: string;
}

interface SessionBlock {
  key: string;
  sessionName: string;
  sessionIcon: string;
  timeRange: string;
  activities: TimelineActivity[];
}

// Helper to check if an itinerary JSON has rich details (hotel, meals, morning/afternoon/evening, highlights)
const isRichItineraryData = (itineraryStr?: string): boolean => {
  if (!itineraryStr) return false;
  try {
    const list = JSON.parse(itineraryStr);
    if (!Array.isArray(list) || list.length === 0) return false;
    return list.some((day: any) => !!(day.hotel || day.meals || day.morning || day.afternoon || day.evening || (day.highlights && day.highlights.length > 0)));
  } catch {
    return false;
  }
};

export const TourDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const fromBlogValue: unknown = location.state?.fromBlog;
  const blogListValue: unknown = location.state?.blogListUrl;

  const fromBlog =
    typeof fromBlogValue === 'string' &&
    /^\/blogs\/\d+(?:\?[^#]*)?$/.test(fromBlogValue)
      ? fromBlogValue
      : null;

  const blogListUrl =
    typeof blogListValue === 'string' &&
    /^\/blogs(?:\?[^#]*)?$/.test(blogListValue)
      ? blogListValue
      : '/blogs';

  const handleBackToSelection = () => {
    if (fromBlog) {
      navigate(fromBlog, {
        state: { from: blogListUrl },
      });
      return;
    }

    const savedPage = (location.state as any)?.fromPage || sessionStorage.getItem('smart_travel_tour_page');
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(`/tours${savedPage && Number(savedPage) > 1 ? `?page=${savedPage}` : ''}`);
    }
  };

  const { user } = useAuth();
  const currentUserName = user?.fullName || (() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved).fullName : 'Nguyễn Bảo Lợi';
    } catch {
      return 'Nguyễn Bảo Lợi';
    }
  })();

  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [visaReqs, setVisaReqs] = useState<VisaRequirementResponse[]>([]);
  const transportInfo = React.useMemo(() => getTourTransportInfo(tour || MOCK_DETAIL_TOUR), [tour]);

  useEffect(() => {
    const targetId = tour?.id || (id ? Number(id) : null);
    if (targetId) {
      visaService.getRequirements(targetId)
        .then(reqs => setVisaReqs(reqs))
        .catch(err => console.log('Không có visa', err));
    }
  }, [tour?.id, id]);

  // Lightbox Modal State
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'itinerary' | 'policy' | 'faq' | 'reviews'>('itinerary');
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [isPolicyExpanded, setIsPolicyExpanded] = useState<boolean>(false);

  // Single room surcharge selection & Room Allocation
  const [singleRoomRequired, setSingleRoomRequired] = useState<boolean>(false);

  // Synchronized schedules state from tourScheduleService
  const [schedulesWithDynamicSeats, setSchedulesWithDynamicSeats] = useState<Array<{
    id: number;
    rawStartDate: string;
    rawEndDate: string;
    startDate: string;
    endDate: string;
    seats: number;
    bookedCount: number;
    maxParticipants: number;
    minParticipants: number;
    note: string;
    status: TourScheduleStatus;
    reason: string;
    daysRemaining: number;
    minLeadDays: number;
    isBookable: boolean;
  }>>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number>(1);

  const loadSchedules = (tourId: number, category?: string, visaConfig?: ScheduleLeadTimeConfig) => {
    const active = tourScheduleService.getUpcomingSchedulesForUser(tourId, category, visaConfig);
    const mapped = active.map((s) => {
      const computed = computeScheduleStatus(s, category, visaConfig);
      return {
        id: s.id,
        rawStartDate: s.startDate,
        rawEndDate: s.endDate,
        startDate: formatScheduleDate(s.startDate),
        endDate: formatScheduleDate(s.endDate),
        seats: Math.max(0, s.maxParticipants - s.bookedCount),
        bookedCount: s.bookedCount,
        maxParticipants: s.maxParticipants,
        minParticipants: s.minParticipants || 10,
        note: s.note || 'Lịch mở bán',
        status: computed.status,
        reason: computed.reason,
        daysRemaining: computed.daysRemaining,
        minLeadDays: computed.minLeadDays,
        isBookable: computed.isBookable,
      };
    });
    setSchedulesWithDynamicSeats(mapped);
    if (mapped.length > 0) {
      const firstBookable = mapped.find((s) => s.isBookable);
      setSelectedScheduleId(firstBookable ? firstBookable.id : mapped[0].id);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    const targetId = tour?.id || (id ? Number(id) : null);
    if (targetId) {
      loadSchedules(targetId, tour?.category, {
        requiresVisa: tour?.requiresVisa,
        visaProcessingDays: tour?.visaProcessingDays,
        visaBufferDays: tour?.visaBufferDays,
      });
      void tourScheduleService.fetchSchedulesForTour(targetId);
    }
  }, [tour?.id, tour?.category, tour?.requiresVisa, tour?.visaProcessingDays, tour?.visaBufferDays, id]);

  // Listen to schedule updates from Vendor or booking
  useEffect(() => {
    const handleUpdate = (e: any) => {
      const targetId = tour?.id || (id ? Number(id) : null);
      if (targetId && (!e.detail?.tourId || e.detail?.tourId === targetId)) {
        loadSchedules(targetId, tour?.category, {
          requiresVisa: tour?.requiresVisa,
          visaProcessingDays: tour?.visaProcessingDays,
          visaBufferDays: tour?.visaBufferDays,
        });
      }
    };
    window.addEventListener('tour_schedules_updated', handleUpdate);
    return () => window.removeEventListener('tour_schedules_updated', handleUpdate);
  }, [tour?.id, tour?.category, tour?.requiresVisa, tour?.visaProcessingDays, tour?.visaBufferDays, id]);

  const selectedSchedule = schedulesWithDynamicSeats.find(s => s.id === selectedScheduleId) || schedulesWithDynamicSeats[0] || {
    id: 0,
    rawStartDate: '',
    rawEndDate: '',
    startDate: 'Hết đợt khởi hành',
    endDate: 'N/A',
    seats: 0,
    bookedCount: 0,
    maxParticipants: 40,
    minParticipants: 10,
    note: 'Đã hết hạn',
    status: 'COMPLETED' as const,
    reason: 'Đã hết đợt khởi hành',
    daysRemaining: -1,
    minLeadDays: 3,
    isBookable: false,
  };

  // Read URL query parameter for active tab
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('tab') === 'reviews') {
      setActiveTab('reviews');
    }
  }, [location.search]);

  // Booking counter state
  const [adults, setAdults] = useState<number>(1);
  const [children, setChildren] = useState<number>(0);
  const [voucherCode, setVoucherCode] = useState<string>('');
  const [voucherDiscount, setVoucherDiscount] = useState<number>(0);
  const [voucherMsg, setVoucherMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [showVoucherModal, setShowVoucherModal] = useState<boolean>(false);

  // Reviews state & validation
  const [reviews, setReviews] = useState<Review[]>([]);
  const [eligibleToReview, setEligibleToReview] = useState<boolean>(false);
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [newImageUrl, setNewImageUrl] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  // Gallery images list (Deduplicated & Ordered)
  const galleryImages = React.useMemo(() => {
    if (!tour) return [];
    const list: string[] = [];
    if (tour.gallery && tour.gallery.length > 0) {
      tour.gallery.forEach((img) => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    if (tour.thumbnailUrl && !list.includes(tour.thumbnailUrl)) {
      list.unshift(tour.thumbnailUrl);
    }
    return list.length > 0 ? list : [
      'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=1200&q=80'
    ];
  }, [tour]);

  const openLightbox = (index: number) => {
    const validIndex = Math.max(0, Math.min(index, galleryImages.length - 1));
    setActiveImageIndex(validIndex);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    if (galleryImages.length <= 1) return;
    setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    if (galleryImages.length <= 1) return;
    setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  // Keyboard navigation & body scroll locking for Lightbox
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      } else if (e.key === 'ArrowLeft') {
        prevImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [lightboxOpen, galleryImages.length]);

  useEffect(() => {
    fetchTourData();
  }, [id]);

  const fetchTourData = async () => {
    setLoading(true);
    const tourId = Number(id);
    // Helper: find the correct mock tour by id, or fall back to the first one
    const getMockFallback = () => findMockTourById(tourId) || MOCK_DETAIL_TOUR;

    try {
      if (id) {
        const res = await tourService.getTourById(tourId);
        if (res.success && res.data) {
          const fallback = getMockFallback();
          const dbItin = res.data.itineraryDetails;
          const fallbackItin = fallback.itineraryDetails;
          const chosenItinerary = isRichItineraryData(dbItin)
            ? dbItin
            : (isRichItineraryData(fallbackItin) ? fallbackItin : (dbItin || fallbackItin));

          setTour({
            ...res.data,
            thumbnailUrl: (res.data.thumbnailUrl && !res.data.thumbnailUrl.includes('unsplash')) ? res.data.thumbnailUrl : fallback.thumbnailUrl,
            gallery: (res.data.gallery && res.data.gallery.length > 0) ? res.data.gallery : fallback.gallery,
            itineraryDetails: chosenItinerary,
            includedServices: res.data.includedServices || fallback.includedServices,
            excludedServices: res.data.excludedServices || fallback.excludedServices,
            cancellationPolicy: res.data.cancellationPolicy || fallback.cancellationPolicy,
          });
        } else {
          setTour(getMockFallback());
        }
      } else {
        setTour(MOCK_DETAIL_TOUR);
      }

      // Fetch Reviews (sync both MySQL database and localStorage)
      if (id) {
        let localReviews: Review[] = [];
        try {
          const saved = localStorage.getItem(`smarttravel_reviews_${tourId}`);
          if (saved) {
            localReviews = JSON.parse(saved);
          }
        } catch (_) {}

        try {
          const revRes = await reviewService.getReviewsByTourId(tourId);
          const loadedReviews: Review[] = (revRes.success && revRes.data) ? revRes.data : [];

          // Deduplicate and merge by ID
          const reviewMap = new Map<number | string, Review>();
          loadedReviews.forEach((r) => reviewMap.set(r.id, r));
          localReviews.forEach((r) => reviewMap.set(r.id, r));

          const mergedReviews = Array.from(reviewMap.values());
          setReviews(mergedReviews);
        } catch {
          setReviews(localReviews);
        }

        // Kiểm tra điều kiện đánh giá thực tế từ Backend (chỉ tài khoản có đơn COMPLETED của tour mới được đánh giá)
        const hasToken = Boolean(localStorage.getItem('token') || user);
        if (hasToken) {
          try {
            const eligRes = await reviewService.checkEligibility(tourId);
            setEligibleToReview(Boolean(eligRes?.success && eligRes?.data));
          } catch {
            setEligibleToReview(false);
          }
        } else {
          setEligibleToReview(false);
        }
      }
    } catch (err) {
      console.error(err);
      setTour(getMockFallback());
    } finally {
      setLoading(false);
    }
  };

  const singleRoomSurchargeUnit = tour?.singleRoomSurcharge || (tour?.category === 'NUOC_NGOAI' ? 3500000 : 950000);
  const singleRoomSurchargeTotal = singleRoomRequired ? singleRoomSurchargeUnit * Math.max(1, adults) : 0;

  const getRoomAllocationText = () => {
    if (singleRoomRequired) {
      return `${adults} Phòng Đơn riêng biệt (01 người/phòng - Có phụ thu phòng đơn)`;
    }
    if (adults === 1 && children === 0) {
      return '01 Khách ghép phòng đôi tiêu chuẩn 2 người (Twin/Double) cùng giới tính';
    }
    const total = adults + children;
    const doubleRooms = Math.floor(total / 2);
    const extra = total % 2;
    if (extra === 0) {
      return `${doubleRooms} Phòng đôi tiêu chuẩn (02 khách/phòng Twin hoặc Double)`;
    }
    return `${doubleRooms} Phòng đôi tiêu chuẩn (2 khách/phòng) + 01 Giường phụ kê thêm (Extra Bed)`;
  };

  const handleApplyVoucher = async (codeOverride?: string) => {
    const code = (codeOverride !== undefined ? codeOverride : voucherCode).trim();
    if (!code || !tour) return;
    try {
      const originalTotal = (tour.price * adults) + ((tour.childPrice || tour.price * 0.7) * children) + singleRoomSurchargeTotal;
      const res = await bookingService.validateVoucher(code, originalTotal);
      if (res.success && res.data) {
        setVoucherCode(code);
        setVoucherDiscount(res.data.discountAmount);
        setVoucherMsg({ text: `Áp dụng mã thành công! Giảm ${res.data.discountAmount.toLocaleString('vi-VN')} đ`, type: 'success' });
      }
    } catch (err: any) {
      setVoucherDiscount(0);
      setVoucherMsg({ text: err?.response?.data?.message || 'Mã giảm giá không hợp lệ', type: 'error' });
    }
  };

  const handleBookNow = () => {
    if (!tour) return;

    // 1. Kiểm tra quy định thời gian đặt trước (Lead time validation)
    if (!selectedSchedule.isBookable) {
      alert(`⚠️ ${selectedSchedule.reason || 'Lịch khởi hành này hiện không thể đặt do đã quá hạn đặt trước!'}`);
      return;
    }

    // 2. Kiểm tra slot ghế
    if (selectedSchedule.seats <= 0) {
      alert('Lịch khởi hành này hiện đã hết chỗ. Vui lòng chọn ngày khởi hành khác!');
      return;
    }
    const totalGuests = adults + children;
    if (selectedSchedule.seats < totalGuests) {
      alert(`Lịch khởi hành này chỉ còn ${selectedSchedule.seats} chỗ trống, không đủ cho ${totalGuests} người đặt. Vui lòng chọn lịch khác hoặc giảm số lượng khách!`);
      return;
    }

    const childP = tour.childPrice || Math.round(tour.price * 0.7);
    navigate('/checkout', {
      state: {
        tourId: tour.id,
        scheduleId: selectedSchedule.id,
        tourTitle: tour.title,
        tourThumbnailUrl: tour.thumbnailUrl || (tour.gallery && tour.gallery[0]),
        tourCode: tour.tourCode || 'CHAU-DOC-AN-GIANG-1N1D',
        durationDays: tour.durationDays || 1,
        durationNights: tour.durationNights || 1,
        adultPrice: tour.price,
        childPrice: childP,
        numberOfAdults: adults,
        numberOfChildren: children,
        voucherCode: voucherCode.trim() || undefined,
        discountAmount: voucherDiscount,
        departureDate: selectedSchedule.startDate,
        endDate: selectedSchedule.endDate,
        scheduleNote: selectedSchedule.note,
        availableSeats: selectedSchedule.seats,
        // Dữ liệu phụ thu phòng đơn & Phân bổ phòng
        singleRoomRequired,
        singleRoomSurchargeAmount: singleRoomSurchargeTotal,
        singleRoomUnitSurcharge: singleRoomSurchargeUnit,
        roomAllocation: getRoomAllocationText(),
        minParticipants: selectedSchedule.minParticipants || 10,
      }
    });
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tour || !newComment.trim()) return;
    setSubmittingReview(true);
    const reviewerName = currentUserName || 'Khách hàng';

    try {
      const res = await reviewService.createReview({
        tourId: tour.id,
        rating: newRating,
        comment: newComment.trim(),
        imageUrl: newImageUrl.trim() || undefined,
      });
      if (res.success && res.data) {
        const apiRev = {
          ...res.data,
          userName: (res.data.userName && res.data.userName !== 'Khách Hàng SmartTravel') ? res.data.userName : reviewerName
        };
        try {
          const storageKey = `smarttravel_reviews_${tour.id}`;
          const existing = localStorage.getItem(storageKey);
          const list: Review[] = existing ? JSON.parse(existing) : [];
          localStorage.setItem(storageKey, JSON.stringify([apiRev, ...list.filter(item => item.id !== apiRev.id)]));
        } catch (_) {}
        setReviews(prev => [apiRev, ...prev.filter(r => r.id !== apiRev.id)]);
        setNewComment('');
        setNewImageUrl('');
        alert('Đăng đánh giá thành công! Cảm ơn phản hồi của bạn.');
      } else {
        alert(res.message || 'Không thể gửi đánh giá. Chỉ khách hàng đã hoàn thành chuyến đi (COMPLETED) mới có thể đánh giá.');
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || 'Chỉ khách hàng đã hoàn thành chuyến đi (trạng thái COMPLETED) mới có thể viết đánh giá cho tour này.';
      alert(errMsg);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center bg-[#FAF8F5]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0D9488] border-t-transparent"></div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-16 text-center text-[#526071] font-bold">
        Không tìm thấy thông tin tour.
      </div>
    );
  }

  // Parse rawItinerary with guaranteed rich details fallback
  let rawItinerary: any[] = [];
  try {
    if (tour.itineraryDetails) {
      rawItinerary = JSON.parse(tour.itineraryDetails);
    }
  } catch {
    rawItinerary = [];
  }
  const hasRichFields = rawItinerary.some((item: any) => !!(item.hotel || item.meals || item.morning || item.afternoon || item.evening || (item.highlights && item.highlights.length > 0)));
  if (!hasRichFields) {
    const mockMatch = findMockTourById(tour.id) || MOCK_DETAIL_TOUR;
    if (mockMatch?.itineraryDetails) {
      try {
        const mockParsed = JSON.parse(mockMatch.itineraryDetails);
        if (mockParsed.some((item: any) => !!(item.hotel || item.meals || item.morning || item.afternoon || item.evening || (item.highlights && item.highlights.length > 0)))) {
          rawItinerary = mockParsed;
        }
      } catch {}
    }
  }
  const buildDaySessions = (item: any, prevItem?: any): SessionBlock[] => {
    const sessions: SessionBlock[] = [];
    const dayNum = Number(item.day) || 1;
    const isFirstDay = dayNum === 1;
    const isLastDay = dayNum >= (tour?.durationDays || 5);
    const textMorning = (item.morning || '').toLowerCase();
    const textAfternoon = (item.afternoon || '').toLowerCase();

    // Kiểm tra xem hôm nay có chuyển khách sạn / chuyển điểm đến so với hôm trước không
    const hasHotelChanged = !!(prevItem && prevItem.hotel && item.hotel && prevItem.hotel !== item.hotel);
    const prevHotelName = prevItem?.hotel || 'khách sạn trước';
    const currentHotelName = item.hotel || 'khách sạn';

    // Tách lộ trình di chuyển từ tiêu đề (ví dụ: "NGÀY 2: ÂN THI → TUYỀN ÂN → PHƯỢNG HOÀNG CỔ TRẤN")
    const routeParts = (item.title || '')
      .replace(/^NGÀY \d+:\s*/i, '')
      .split(/→|->|-/)
      .map((s: string) => s.trim())
      .filter(Boolean);

    // ─── 1. BUỔI SÁNG ───
    const morningActs: TimelineActivity[] = [];
    if (item.meals?.sang && item.meals.sang !== 'Không có') {
      morningActs.push({
        time: isFirstDay ? '06:00 – 07:00' : '06:30 – 08:00',
        icon: '🍽',
        badge: 'Điểm tâm sáng',
        badgeType: 'meal',
        content: isFirstDay 
          ? item.meals.sang 
          : `${item.meals.sang} (tại nhà hàng ${hasHotelChanged ? prevHotelName : currentHotelName}).`,
      });
    } else if (!isFirstDay) {
      morningActs.push({
        time: '06:30 – 08:00',
        icon: '🍽',
        badge: 'Điểm tâm sáng',
        badgeType: 'meal',
        content: `Dùng bữa sáng buffet tiêu chuẩn tại nhà hàng ${hasHotelChanged ? prevHotelName : currentHotelName}.`,
      });
    }

    // Check-out khách sạn cũ (khi đổi khách sạn, có chữ trả phòng, hoặc ngày cuối)
    if (hasHotelChanged || textMorning.includes('trả phòng') || textMorning.includes('check-out') || (isLastDay && !isFirstDay)) {
      morningActs.push({
        time: '08:00 – 08:30',
        icon: '🏨',
        badge: hasHotelChanged ? 'Check-out khách sạn cũ' : 'Check-out khách sạn',
        badgeType: 'hotel',
        content: `Làm thủ tục trả phòng (Check-out) tại ${hasHotelChanged ? prevHotelName : currentHotelName}, thanh toán chi phí cá nhân (nếu có), thu xếp hành lý lên xe chuẩn bị di chuyển chặng mới.`,
      });
    }

    // Thời gian di chuyển liên tuyến (Transit) khi đổi nơi đến / đổi khách sạn
    if (hasHotelChanged || (routeParts.length >= 2 && !isFirstDay)) {
      const fromLoc = routeParts[0] || 'điểm lưu trú';
      const toLoc = routeParts.length >= 3 ? `${routeParts[1]} & ${routeParts[2]}` : (routeParts[1] || 'điểm tham quan tiếp theo');
      morningActs.push({
        time: '08:30 – 10:00',
        icon: '🚌',
        badge: 'Di chuyển chặng mới',
        badgeType: 'transit',
        content: `Xe du lịch và HDV đón đoàn khởi hành di chuyển từ ${fromLoc} sang ${toLoc}. Quý khách nghỉ ngơi và ngắm cảnh đẹp trên cung đường di chuyển.`,
      });
    }

    if (item.morning) {
      morningActs.push({
        time: (hasHotelChanged || isFirstDay) ? '10:00 – 11:30' : '08:30 – 11:30',
        icon: '📍',
        badge: 'Lịch trình tham quan',
        badgeType: 'tour',
        content: item.morning,
      });
    }

    sessions.push({
      key: 'morning',
      sessionName: 'Buổi Sáng',
      sessionIcon: '🌅',
      timeRange: isFirstDay ? '06:00 – 11:30' : '06:30 – 11:30',
      activities: morningActs,
    });

    // ─── 2. BUỔI CHIỀU ───
    const afternoonActs: TimelineActivity[] = [];
    if (item.meals?.trua && item.meals.trua !== 'Không có') {
      afternoonActs.push({
        time: '11:30 – 13:00',
        icon: '🍽',
        badge: 'Bữa trưa',
        badgeType: 'meal',
        content: item.meals.trua,
      });
    } else {
      afternoonActs.push({
        time: '11:30 – 13:00',
        icon: '🍽',
        badge: 'Bữa trưa',
        badgeType: 'meal',
        content: 'Đoàn dùng bữa trưa tại nhà hàng địa phương, thưởng thức ẩm thực đặc trưng.',
      });
    }

    // Check-in khách sạn mới (ngày đầu tiên hoặc khi đổi khách sạn)
    if (hasHotelChanged || isFirstDay || textAfternoon.includes('nhận phòng') || textAfternoon.includes('check-in')) {
      if (item.hotel) {
        afternoonActs.push({
          time: '14:00 – 14:30',
          icon: '🏨',
          badge: hasHotelChanged ? 'Check-in khách sạn mới' : 'Check-in khách sạn',
          badgeType: 'hotel',
          content: `Xe đưa đoàn đến ${currentHotelName}, HDV hỗ trợ làm thủ tục nhận phòng (Check-in), nghỉ ngơi chuẩn bị cho chương trình buổi chiều.`,
        });
      }
    }

    if (item.afternoon) {
      afternoonActs.push({
        time: (hasHotelChanged || isFirstDay) ? '14:30 – 17:30' : '13:30 – 17:30',
        icon: '📍',
        badge: 'Lịch trình tham quan',
        badgeType: 'tour',
        content: item.afternoon,
      });
    }

    if (item.meals?.chieu && item.meals.chieu !== 'Không có') {
      afternoonActs.push({
        time: '15:30 – 16:30',
        icon: '☕',
        badge: 'Ăn nhẹ buổi chiều',
        badgeType: 'meal',
        content: item.meals.chieu,
      });
    }

    sessions.push({
      key: 'afternoon',
      sessionName: 'Buổi Chiều',
      sessionIcon: '☀️',
      timeRange: '11:30 – 17:30',
      activities: afternoonActs,
    });

    // ─── 3. BUỔI TỐI ───
    const eveningActs: TimelineActivity[] = [];
    const departureLoc = tour?.departureLocation || 'TP.Hồ Chí Minh';
    const textEvening = (item.evening || '').toLowerCase();
    const textTitle = (item.title || '').toLowerCase();

    // Nhận biết hành trình trở về nơi xuất phát hoặc ngày cuối
    const isReturningTrip = isLastDay || 
      textEvening.includes('trở về') || 
      textEvening.includes('về lại') || 
      textEvening.includes('về tp') || 
      textEvening.includes('về đến') ||
      textEvening.includes('lên xe trở về') || 
      textEvening.includes('xuất phát về') ||
      textAfternoon.includes('bay về') ||
      textAfternoon.includes('lên xe trở về') ||
      textAfternoon.includes('về tp') ||
      (textTitle.includes('→') && textTitle.endsWith(departureLoc.toLowerCase()));

    const isFlightTrip = 
      textEvening.includes('máy bay') || 
      textEvening.includes('chuyến bay') || 
      textAfternoon.includes('máy bay') || 
      textAfternoon.includes('sân bay') || 
      textAfternoon.includes('chuyến bay') ||
      (item.meals?.toi && item.meals.toi.toLowerCase().includes('máy bay'));

    const mealToiRaw = item.meals?.toi && item.meals.toi !== 'Không có' ? item.meals.toi : '';
    const mealToiLower = mealToiRaw.toLowerCase();
    const isDinnerAfterReturn = isReturningTrip && (mealToiLower.includes('sau khi về') || mealToiLower.includes('tự túc'));

    // ──────────────────────────────────────────
    // TRƯỜNG HỢP 1: TOUR CÓ CHUYẾN BAY VỀ (FLIGHT RETURN)
    // ──────────────────────────────────────────
    if (isFlightTrip && isReturningTrip) {
      // 1.1 Bữa tối & Chuyến bay xuất phát về (18:00 – 19:30)
      eveningActs.push({
        time: '18:00 – 19:30',
        icon: '✈️',
        badge: 'Bữa tối trên máy bay & Xuất phát về',
        badgeType: 'transit',
        content: mealToiLower.includes('tự do') || mealToiLower.includes('tự túc') || !mealToiRaw
          ? `Quý khách ăn tối tự do / thưởng thức suất ăn nhẹ trên máy bay trong hành trình xuất phát bay về lại ${departureLoc}.`
          : `${mealToiRaw} – Quý khách dùng bữa trên máy bay trong hành trình xuất phát bay về lại ${departureLoc}.`,
      });

      // 1.2 Hạ cánh & Thủ tục nhập cảnh (19:30 – 20:30)
      eveningActs.push({
        time: '19:30 – 20:30',
        icon: '🛬',
        badge: 'Hạ cánh & Thủ tục nhập cảnh (Kết thúc tour)',
        badgeType: 'transit',
        content: item.evening && (textEvening.includes('đáp') || textEvening.includes('nhập cảnh') || textEvening.includes('hạ cánh'))
          ? item.evening
          : `Chuyến bay đáp an toàn tại sân bay Tân Sơn Nhất / Nội Bài (${departureLoc}). Hướng dẫn viên hỗ trợ Quý khách làm thủ tục nhập cảnh, nhận lại hành lý ký gửi. Chia tay đoàn, cảm ơn Quý khách và kết thúc chương trình tour tốt đẹp. Hẹn gặp lại Quý khách!`,
      });
    }
    // ──────────────────────────────────────────
    // TRƯỜNG HỢP 2: TOUR ĐI XE VỀ LẠI ĐIỂM XUẤT PHÁT (ROAD / COACH RETURN)
    // ──────────────────────────────────────────
    else if (isReturningTrip) {
      // 2.1 Di chuyển trên đường về (17:30 – 19:30)
      eveningActs.push({
        time: '17:30 – 19:30',
        icon: '🚌',
        badge: `Khởi hành về lại ${departureLoc}`,
        badgeType: 'transit',
        content: `Xe du lịch và HDV đón đoàn xuất phát trở về điểm hẹn ban đầu tại ${departureLoc}. Quý khách nghỉ ngơi và ngắm cảnh trên đường.`,
      });

      // 2.2 Về đến nơi & Kết thúc tour (19:30 – 20:30)
      eveningActs.push({
        time: '19:30 – 20:30',
        icon: '🏁',
        badge: `Về đến điểm đón & Kết thúc tour`,
        badgeType: 'transit',
        content: item.evening && (textEvening.includes('về đến') || textEvening.includes('kết thúc') || textEvening.includes('chia tay') || textEvening.includes('lên xe'))
          ? item.evening
          : `Xe đưa Quý khách về đến điểm xuất phát ban đầu tại ${departureLoc} an toàn. HDV hỗ trợ Quý khách nhận lại toàn bộ hành lý cá nhân, gửi lời cảm ơn và chia tay đoàn.`,
      });

      // 2.3 Bữa tối tự túc khi về đến nơi (20:30 – 21:30)
      if (mealToiRaw && isDinnerAfterReturn) {
        eveningActs.push({
          time: '20:30 – 21:30',
          icon: '🍽',
          badge: `Bữa tối tự túc khi về đến ${departureLoc}`,
          badgeType: 'meal',
          content: `${mealToiRaw} (Quý khách tự do dùng bữa tối sau khi về đến nơi xuất phát, hoàn tất chuyến đi).`,
        });
      } else if (mealToiRaw && !isDinnerAfterReturn) {
        eveningActs.push({
          time: '18:00 – 19:30',
          icon: '🍽',
          badge: 'Bữa tối',
          badgeType: 'meal',
          content: mealToiRaw,
        });
      }
    }
    // ──────────────────────────────────────────
    // TRƯỜNG HỢP 3: NGÀY TOUR BÌNH THƯỜNG (LƯU TRÚ LẠI)
    // ──────────────────────────────────────────
    else {
      // 3.1 Bữa tối tại nhà hàng (18:00 – 19:30)
      if (mealToiRaw) {
        eveningActs.push({
          time: '18:00 – 19:30',
          icon: '🍽',
          badge: 'Bữa tối',
          badgeType: 'meal',
          content: mealToiRaw,
        });
      } else {
        eveningActs.push({
          time: '18:00 – 19:30',
          icon: '🍽',
          badge: 'Bữa tối',
          badgeType: 'meal',
          content: 'Đoàn dùng bữa tối tại nhà hàng với các món ăn hấp dẫn theo chương trình.',
        });
      }

      // 3.2 Khám phá về đêm (19:30 – 21:30)
      if (item.evening) {
        eveningActs.push({
          time: '19:30 – 21:30',
          icon: '🌙',
          badge: 'Khám phá về đêm',
          badgeType: 'tour',
          content: item.evening,
        });
      }

      // 3.3 Nghỉ đêm tại khách sạn (Từ 21:30)
      const isNoStay = item.hotel && (item.hotel.toLowerCase().includes('không lưu trú') || item.hotel.toLowerCase().includes('tour 1 ngày'));
      if (item.hotel && !isNoStay) {
        eveningActs.push({
          time: 'Từ 21:30',
          icon: '🏨',
          badge: 'Nghỉ đêm tại khách sạn',
          badgeType: 'hotel',
          content: `Quý khách về lại ${currentHotelName} nghỉ ngơi, chuẩn bị năng lượng cho ngày tiếp theo.`,
        });
      }
    }

    sessions.push({
      key: 'evening',
      sessionName: 'Buổi Tối',
      sessionIcon: '🌙',
      timeRange: '18:00 – 22:00',
      activities: eveningActs,
    });

    return sessions;
  };

  const adultTotal = tour.price * adults;
  const childPriceVal = tour.childPrice || Math.round(tour.price * 0.7);
  const childTotal = childPriceVal * children;
  const subtotal = adultTotal + childTotal + singleRoomSurchargeTotal;
  const finalTotal = Math.max(0, subtotal - voucherDiscount);

  return (
    <div className="bg-[#FAF8F5] text-[#0F172A] min-h-screen pb-20 relative overflow-hidden">
      {fromBlog && (
        <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={handleBackToSelection}
            className="rounded-xl border border-[#CBD5E1] bg-white px-4 py-2 text-sm font-semibold text-[#0B3B49] transition hover:bg-[#E6F4F1]"
          >
            ← Quay lại bài viết
          </button>
        </div>
      )}
      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-[#E6E1DA] py-3 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 text-xs font-medium text-[#526071] min-w-0">
            <button
              type="button"
              onClick={handleBackToSelection}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#E6F4F1] text-[#0B3B49] border border-[#E6E1DA] transition text-xs font-bold mr-1 cursor-pointer shrink-0"
              title={fromBlog ? 'Quay lại bài viết' : 'Quay lại danh sách tour'}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Quay lại</span>
            </button>
            <span className="hover:text-[#0B3B49] cursor-pointer transition shrink-0" onClick={() => navigate('/')}>Trang Chủ</span>
            <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
            <span 
              className="hover:text-[#0B3B49] cursor-pointer transition shrink-0" 
              onClick={() => {
                const savedPage = (location.state as any)?.fromPage || sessionStorage.getItem('smart_travel_tour_page');
                const pageParam = savedPage && Number(savedPage) > 1 ? `&page=${savedPage}` : '';
                navigate(`/tours?type=${tour.category}${pageParam}`);
              }}
            >
              {tour.category === 'NUOC_NGOAI' ? 'Nước Ngoài' : 'Trong Nước'}
            </span>
            <ChevronRight className="h-3 w-3 text-slate-400 shrink-0 hidden sm:inline" />
            <span className="text-[#0F172A] font-bold line-clamp-1 hidden sm:inline">{tour.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8 relative z-10">
        
        {/* Top Hero Image Gallery (Click to open Lightbox & navigate) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[240px] sm:h-[360px] lg:h-[440px] rounded-2xl overflow-hidden relative z-0">
          {/* Main Large Image */}
          <div 
            onClick={() => openLightbox(0)}
            className="lg:col-span-2 rounded-2xl overflow-hidden bg-slate-200 border border-[#E6E1DA] h-full relative group cursor-pointer shadow-card transition"
          >
            <img 
              src={galleryImages[0]} 
              alt={tour.title} 
              className="h-full w-full object-cover group-hover:scale-105 transition duration-700 ease-out" 
            />
            <div className="absolute inset-0 bg-[#0B3B49]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <span className="bg-[#0B3B49]/95 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 border border-white/20 shadow-lg">
                <Maximize2 className="h-4 w-4 text-[#5EEAD4]" />
                <span>Nhấn để xem &amp; chuyển ảnh</span>
              </span>
            </div>
            <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 flex items-center justify-between gap-2">
              <div className="bg-[#0B3B49]/90 text-white text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/15 truncate min-w-0">
                Mã tour: <span className="text-[#5EEAD4]">{tour.tourCode || 'N/A'}</span>
              </div>
              <div className="bg-white/95 hover:bg-white text-[#0B3B49] text-[11px] sm:text-xs font-extrabold px-3 sm:px-3.5 py-1.5 rounded-lg backdrop-blur-md border border-[#E6E1DA] flex items-center gap-1.5 shadow-sm transition shrink-0 whitespace-nowrap">
                <ImageIcon className="h-3.5 w-3.5 text-[#0D9488]" />
                <span>{galleryImages.length} hình ảnh</span>
              </div>
            </div>
          </div>
          
          {/* 4 Small Side Thumbnails */}
          <div className="hidden lg:grid grid-cols-2 grid-rows-2 gap-4 h-full">
            {[1, 2, 3, 4].map((idx) => {
              const imgUrl = galleryImages[idx] || galleryImages[idx % galleryImages.length];
              const isLast = idx === 4;
              return (
                <div 
                  key={idx}
                  onClick={() => openLightbox(idx < galleryImages.length ? idx : 0)}
                  className="rounded-2xl overflow-hidden bg-slate-200 border border-[#E6E1DA] relative cursor-pointer group shadow-subtle transition min-h-0 h-full"
                >
                  <img 
                    src={imgUrl} 
                    alt={`Gallery ${idx}`} 
                    className="h-full w-full object-cover group-hover:scale-105 transition duration-500" 
                  />
                  <div className="absolute inset-0 bg-[#0B3B49]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <Maximize2 className="h-5 w-5 text-white drop-shadow-md" />
                  </div>
                  {isLast && (
                    <div className="absolute inset-0 bg-[#0B3B49]/75 backdrop-blur-[2px] flex flex-col items-center justify-center text-white font-bold text-xs group-hover:bg-[#0B3B49]/85 transition">
                      <ImageIcon className="h-5 w-5 mb-1 text-[#5EEAD4]" />
                      <span>+ Xem tất cả ({galleryImages.length})</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tour Title & Vendor Info Header */}
        <div className="bg-white p-6 rounded-2xl border border-[#E6E1DA] shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-lg text-[11px] font-extrabold uppercase tracking-wider bg-[#0B3B49] text-white">
                {tour.category === 'NUOC_NGOAI' ? 'Tour Quốc Tế' : 'Tour Trong Nước'}
              </span>
              <span className="px-3 py-1 rounded-lg text-[11px] font-extrabold uppercase tracking-wider bg-[#E6F4F1] text-[#0B3B49] border border-[#99F6E4] flex items-center gap-1.5">
                {transportInfo.mode === 'FLIGHT' ? <Plane className="w-3.5 h-3.5 text-[#0D9488]" /> : <Bus className="w-3.5 h-3.5 text-[#0D9488]" />}
                {transportInfo.badgeLabel}: {transportInfo.fromCode} → {transportInfo.toCode}
              </span>
              <span className="px-3 py-1 rounded-lg text-[11px] font-extrabold uppercase tracking-wider bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]/50 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Bảo hiểm du lịch trọn gói
              </span>
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-black text-[#0F172A] leading-tight">
              {tour.title}
            </h1>
          </div>

          {/* Vendor Showcase Card */}
          <div className="flex items-center gap-3.5 p-3.5 bg-[#FAF8F5] border border-[#E6E1DA] rounded-xl flex-shrink-0">
            <div className="h-11 w-11 rounded-xl bg-[#0B3B49] flex items-center justify-center text-[#5EEAD4] shadow-sm">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="text-left space-y-0.5">
              <div className="text-[10px] font-extrabold uppercase text-[#526071] tracking-wider">Đơn Vị Tổ Chức (Vendor)</div>
              <div className="text-sm font-extrabold text-[#0F172A] flex items-center gap-1.5">
                <span>{tour.vendorName || 'NewTour Travel Company'}</span>
                <CheckCircle2 className="h-4 w-4 text-[#0D9488]" />
              </div>
              <div className="text-[11px] text-[#0D9488] font-semibold">Đối tác lữ hành chính thức SmartTravel</div>
            </div>
          </div>
        </div>

        {/* Main Grid: Left Detailed Tabs vs Right Summary Booking Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10 pt-2">
          
          {/* Left Column: Details & Tabs */}
          <div className="lg:col-span-2 space-y-6">

            {/* Group Flight & Airport Meeting Point Card (Matching Preview Image 3) */}
            <div className="bg-white rounded-2xl border-2 border-[#99F6E4] shadow-card overflow-hidden">
              <div className="bg-[#0B3B49] px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-white/10 border border-[#5EEAD4]/30 flex items-center justify-center text-[#5EEAD4]">
                    {transportInfo.mode === 'FLIGHT' ? <Plane className="h-5 w-5" /> : <Bus className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wide">
                      {transportInfo.mode === 'FLIGHT'
                        ? 'Thông Tin Vận Chuyển & Chuyến Bay Đoàn Khứ Hồi (Đã Bao Gồm Trong Giá Tour)'
                        : 'Thông Tin Phương Tiện Đoàn Khứ Hồi & Điểm Đón (Đã Bao Gồm Trong Giá Tour)'}
                    </h3>
                    <p className="text-[11px] text-[#5EEAD4] font-medium">
                      Đơn vị vận chuyển: {transportInfo.carrier} · {transportInfo.baggageSummary}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-white/15 text-white border border-white/20">
                  {transportInfo.shortCarrierBadge}
                </span>
              </div>

              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Outbound Leg */}
                  <div className="rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-md bg-[#E6F4F1] text-[#0B3B49] text-[10px] font-black uppercase whitespace-nowrap shrink-0">
                        Chiều đi (Ngày 1)
                      </span>
                      <span className="text-[11px] font-bold text-[#0F5264] truncate">
                        {transportInfo.carrier} · {transportInfo.outbound.code}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-xl font-black text-[#0B3B49]">{transportInfo.fromCode}</div>
                        <div className="text-sm font-extrabold text-[#D95D39]">{transportInfo.outbound.departTime}</div>
                      </div>
                      <div className="flex-1 px-2 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-[#0D9488]">
                          <span className="h-[1.5px] flex-1 bg-[#0D9488]/40" />
                          {transportInfo.mode === 'FLIGHT' ? <Plane className="h-4 w-4" /> : <Bus className="h-4 w-4" />}
                          <span className="h-[1.5px] flex-1 bg-[#0D9488]/40" />
                        </div>
                        <div className="text-[10px] font-bold text-[#0D9488] mt-1">{transportInfo.outbound.duration}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-black text-[#0B3B49]">{transportInfo.toCode}</div>
                        <div className="text-sm font-extrabold text-[#D95D39]">{transportInfo.outbound.arriveTime}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#526071] pt-1.5 border-t border-slate-200">
                      <span className="truncate max-w-[48%]">{transportInfo.fromName}</span>
                      <span className="truncate max-w-[48%] text-right">{transportInfo.toName}</span>
                    </div>
                  </div>

                  {/* Inbound Leg */}
                  <div className="rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-md bg-[#E6F4F1] text-[#0B3B49] text-[10px] font-black uppercase whitespace-nowrap shrink-0">
                        Chiều về (Ngày {tour.durationDays})
                      </span>
                      <span className="text-[11px] font-bold text-[#0F5264] truncate">
                        {transportInfo.carrier} · {transportInfo.inbound.code}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-xl font-black text-[#0B3B49]">{transportInfo.toCode}</div>
                        <div className="text-sm font-extrabold text-[#D95D39]">{transportInfo.inbound.departTime}</div>
                      </div>
                      <div className="flex-1 px-2 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-[#0D9488]">
                          <span className="h-[1.5px] flex-1 bg-[#0D9488]/40" />
                          {transportInfo.mode === 'FLIGHT' ? <Plane className="h-4 w-4" /> : <Bus className="h-4 w-4" />}
                          <span className="h-[1.5px] flex-1 bg-[#0D9488]/40" />
                        </div>
                        <div className="text-[10px] font-bold text-[#0D9488] mt-1">{transportInfo.inbound.duration}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-black text-[#0B3B49]">{transportInfo.fromCode}</div>
                        <div className="text-sm font-extrabold text-[#D95D39]">{transportInfo.inbound.arriveTime}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#526071] pt-1.5 border-t border-slate-200">
                      <span className="truncate max-w-[48%]">{transportInfo.toName}</span>
                      <span className="truncate max-w-[48%] text-right">{transportInfo.fromName}</span>
                    </div>
                  </div>
                </div>

                {/* Perforated Divider & Airport Meeting Point / Baggage Instructions */}
                <div className="border-t border-dashed border-[#CBD5E1] pt-4 space-y-2 text-xs text-[#334155]">
                  <p>
                    <strong className="text-[#0F172A]">• Tiêu chuẩn hành lý theo đoàn:</strong> {transportInfo.baggageSummary} (đã bao gồm thuế phí sân bay / phí cầu đường).
                  </p>
                  <p>
                    <strong className="text-[#0B3B49]">• Điểm tập trung làm thủ tục khởi hành:</strong> {transportInfo.meetingPoint}
                  </p>
                  <p className="text-[#526071]">
                    <strong className="text-[#0F172A]">• Quy trình đón đoàn:</strong> {transportInfo.leaderInstruction}
                  </p>
                  <p className="text-[#526071]">
                    <strong className="text-[#0F172A]">• Phương tiện tại điểm đến:</strong> {transportInfo.localTransport}
                  </p>
                </div>
              </div>
            </div>

            {/* Rating Breakdown Card */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E6E1DA] shadow-card flex flex-col md:flex-row items-center gap-6 md:gap-8">
              <div className="text-center md:text-left space-y-1 md:pr-6 border-b md:border-b-0 md:border-r border-[#E6E1DA] pb-4 md:pb-0 w-full md:w-auto shrink-0">
                <div className="text-5xl font-black text-[#0B3B49] whitespace-nowrap">
                  {reviews.length > 0
                    ? (reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / reviews.length).toFixed(1)
                    : (tour.totalReviews ? Number(tour.averageRating || 5.0).toFixed(1) : '0.0')}
                  <span className="text-xl text-slate-400 font-normal">/5</span>
                </div>
                <div className="text-xs font-extrabold text-[#0D9488] uppercase tracking-wider">
                  {(reviews.length > 0 || (tour.totalReviews && tour.totalReviews > 0)) ? 'Đánh Giá Du Khách' : 'Chưa Có Đánh Giá'}
                </div>
                <div className="text-xs text-[#526071]">
                  {(reviews.length > 0 || (tour.totalReviews && tour.totalReviews > 0))
                    ? `Dựa trên ${reviews.length > 0 ? reviews.length : (tour.totalReviews || 0)} lượt đánh giá thực tế`
                    : 'Chưa có lượt đánh giá nào'}
                </div>
              </div>

              <div className="flex-1 space-y-2 w-full">
                {[5, 4, 3, 2, 1].map((star) => {
                  const total = reviews.length > 0 ? reviews.length : (tour.totalReviews || 0);
                  const count = reviews.length > 0
                    ? reviews.filter(r => Math.round(r.rating) === star).length
                    : (tour.ratingBreakdown?.[star] || 0);
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={star} className="flex items-center gap-3 text-xs">
                      <span className="font-bold text-[#334155] w-10">{star} Sao</span>
                      <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-amber-400 h-full rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>
                      <span className="w-12 text-right text-[#526071] font-semibold">{count} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation Tabs Header */}
            <div className="bg-white rounded-2xl border border-[#E6E1DA] shadow-card overflow-hidden">
              <div className="flex items-center border-b border-[#E6E1DA] overflow-x-auto text-xs font-bold scrollbar-none bg-[#FAF8F5]">
                {[
                  { id: 'itinerary', label: 'Lịch trình tour' },
                  { id: 'policy', label: 'Chính sách tour' },
                  { id: 'faq', label: 'Câu hỏi thường gặp' },
                  { id: 'reviews', label: `Đánh giá (${reviews.length > 0 ? reviews.length : (tour.totalReviews || 0)})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-6 py-4 border-b-2 transition whitespace-nowrap cursor-pointer ${
                      activeTab === tab.id
                        ? 'border-[#D95D39] text-[#0B3B49] bg-white font-extrabold'
                        : 'border-transparent text-[#526071] hover:text-[#0B3B49] hover:bg-white/60'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* TAB CONTENT: Lịch trình tour */}
              {activeTab === 'itinerary' && (
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-5 sm:gap-6">
                    {/* Left Day Selection Menu (Horizontal scroll pills on mobile, vertical sidebar on md+) */}
                    <div className="md:col-span-1 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible border-b md:border-b-0 md:border-r border-[#E6E1DA] pr-0 md:pr-4 pb-3 md:pb-0">
                      {rawItinerary.map((item: any, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedDay(item.day)}
                          className={`shrink-0 md:shrink md:w-full text-left px-3 py-2.5 sm:p-3 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                            selectedDay === item.day
                              ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-lg shadow-sky-500/25 border border-sky-400/40'
                              : 'bg-[#FAF8F5] text-[#475569] hover:bg-[#F4F1EC] hover:text-[#0F172A] border border-[#E6E1DA]'
                          }`}
                        >
                          <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${selectedDay === item.day ? 'bg-white/20' : 'bg-[#F4F1EC]'}`}>
                            {item.day}
                          </span>
                          <span className="whitespace-nowrap md:whitespace-normal md:line-clamp-2 leading-tight max-w-[160px] md:max-w-none truncate md:text-clip">{item.title?.replace(/^NGÀY \d+:\s*/i, '')}</span>
                        </button>
                      ))}
                    </div>

                    {/* Right Day Details Panel – Rich Format */}
                    <div className="md:col-span-3 space-y-5">
                      {rawItinerary
                        .filter((item: any) => item.day === selectedDay)
                        .map((item: any, idx: number) => {
                          const isRich = !!(item.morning || item.afternoon || item.hotel || item.meals);
                          return (
                            <div key={idx} className="space-y-5">
                              {/* Day Title */}
                              <div className="bg-gradient-to-r from-sky-500/15 to-cyan-500/10 p-4 rounded-xl border border-sky-500/25">
                                <h4 className="text-sm font-black text-[#0B3B49] uppercase tracking-wide">{item.title}</h4>
                              </div>

                              {isRich ? (
                                <>
                                  {/* Hotel & Room Info */}
                                  {item.hotel && (
                                    <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                                      <span className="text-amber-700 text-lg flex-shrink-0">🏨</span>
                                      <div>
                                        <p className="text-xs font-black text-amber-800 uppercase tracking-wider mb-0.5">Lưu trú</p>
                                        <p className="text-sm font-semibold text-[#0F172A]">{item.hotel}</p>
                                        {item.hotelRooms && <p className="text-xs text-[#526071] mt-0.5">{item.hotelRooms}</p>}
                                      </div>
                                    </div>
                                  )}

                                  {/* Sessions List with Specific Times for Activities, Meals & Hotel Check-in/out */}
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between border-b border-[#E6E1DA] pb-2">
                                      <p className="text-xs font-black text-[#0D9488] uppercase tracking-widest flex items-center gap-2">
                                        <span>📍</span> Lịch trình chi tiết theo buổi (Khung giờ, Ăn uống & Lưu trú)
                                      </p>
                                    </div>

                                    {buildDaySessions(item, rawItinerary.find((x: any) => x.day === item.day - 1)).map((session) => (
                                      <div key={session.key} className="bg-[#FAF8F5] border border-[#E6E1DA] rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg backdrop-blur-sm">
                                        {/* Session Title Header */}
                                        <div className="flex items-center justify-between border-b border-[#E6E1DA] pb-3">
                                          <div className="flex items-center gap-2.5">
                                            <span className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-500/25 flex items-center justify-center text-base">
                                              {session.sessionIcon}
                                            </span>
                                            <h5 className="text-sm font-extrabold text-[#0F172A] uppercase tracking-wide">
                                              {session.sessionName}
                                            </h5>
                                          </div>
                                          <span className="text-[11px] font-bold text-amber-800 bg-amber-500/15 border border-amber-400/30 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                                            <Clock className="h-3 w-3 text-amber-700" />
                                            {session.timeRange}
                                          </span>
                                        </div>

                                        {/* Activities Timeline within the Session */}
                                        <div className="space-y-3.5 pl-2 sm:pl-3 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#F4F1EC]">
                                          {session.activities.map((act, aIdx) => (
                                            <div key={aIdx} className="relative flex items-start gap-3.5">
                                              {/* Timeline node */}
                                              <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-sm z-10 border shadow-sm ${
                                                act.badgeType === 'meal' 
                                                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700' 
                                                  : act.badgeType === 'hotel' 
                                                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-800' 
                                                    : act.badgeType === 'transit'
                                                      ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-700'
                                                      : 'bg-sky-500/15 border-sky-500/30 text-[#0B3B49]'
                                              }`}>
                                                {act.icon}
                                              </div>

                                              {/* Event detail */}
                                              <div className="flex-1 bg-[#FAF8F5] border border-[#E6E1DA] p-3 rounded-xl hover:bg-[#FAF8F5] transition space-y-1">
                                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                                                    act.badgeType === 'meal'
                                                      ? 'bg-emerald-500/20 text-emerald-700 border-emerald-500/40'
                                                      : act.badgeType === 'hotel'
                                                        ? 'bg-amber-500/20 text-amber-800 border-amber-500/40'
                                                        : act.badgeType === 'transit'
                                                          ? 'bg-indigo-500/20 text-indigo-700 border-indigo-500/40'
                                                          : 'bg-sky-500/20 text-[#0B3B49] border-sky-500/40'
                                                  }`}>
                                                    {act.badge}
                                                  </span>
                                                  <span className="text-[11px] font-bold text-[#475569] flex items-center gap-1">
                                                    <Clock className="h-3 w-3 text-[#526071]" />
                                                    {act.time}
                                                  </span>
                                                </div>
                                                <p className="text-xs text-[#334155] leading-relaxed font-medium">
                                                  {act.content}
                                                </p>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Highlights */}
                                  {item.highlights && item.highlights.length > 0 && (
                                    <div>
                                      <p className="text-[11px] font-black text-[#526071] uppercase tracking-widest mb-2">⭐ Điểm nổi bật trong ngày</p>
                                      <div className="flex flex-wrap gap-2">
                                        {item.highlights.map((hl: string, hIdx: number) => (
                                          <span key={hIdx} className="px-3 py-1.5 bg-sky-500/10 border border-sky-500/20 text-[#0B3B49] text-xs font-semibold rounded-full">
                                            {hl}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </>
                              ) : (
                                /* Legacy plain-text format fallback */
                                <p className="text-sm text-[#475569] leading-relaxed whitespace-pre-line font-normal">
                                  {item.content}
                                </p>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: Chính sách tour (Khớp 100% hình 1, 2, 3) */}
              {activeTab === 'policy' && (
                <div className="p-6 space-y-6 text-xs text-[#475569] leading-relaxed font-sans">
                  
                  {/* VISA REQUIREMENTS */}
                  {visaReqs.length > 0 && (
                     <VisaRequirementInfo requirements={visaReqs} />
                  )}

                  {/* BẢNG GIÁ TOUR GHÉP LẺ */}
                  <div className="space-y-3">
                    <h3 className="font-black text-[#0F172A] text-base uppercase tracking-tight">
                      BẢNG GIÁ TOUR GHÉP LẺ
                    </h3>

                    <div className="overflow-x-auto border border-[#CBD5E1] rounded-xl">
                      <table className="w-full min-w-[460px] text-center border-collapse">
                        <thead>
                          <tr className="border-b border-[#CBD5E1] bg-[#FAF8F5] font-black text-xs text-[#0F172A]">
                            <th className="p-3 border-r border-[#CBD5E1] w-1/4">KHỞI HÀNH</th>
                            <th colSpan={3} className="p-3">GIÁ TRỌN GÓI: VND/KHÁCH</th>
                          </tr>
                          <tr className="border-b border-[#CBD5E1] bg-[#FAF8F5] font-bold text-[11px] text-[#475569]">
                            <th className="p-2 border-r border-[#CBD5E1]"></th>
                            <th className="p-2 border-r border-[#CBD5E1] w-1/4">
                              NGƯỜI LỚN<br/><span className="font-normal italic text-[#526071]">(Từ 10 tuổi trở lên)</span>
                            </th>
                            <th className="p-2 border-r border-[#CBD5E1] w-1/4">
                              TRẺ EM<br/><span className="font-normal italic text-[#526071]">(Từ 02 - dưới 10 tuổi)</span>
                            </th>
                            <th className="p-2 w-1/4">
                              EM BÉ<br/><span className="font-normal italic text-[#526071]">(Dưới 02 tuổi)</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E6E1DA] font-bold text-[#334155] text-xs">
                          <tr>
                            <td className="p-2.5 border-r border-[#CBD5E1]">10, 15, 24, 29/05</td>
                            <td className="p-2.5 border-r border-[#CBD5E1]">16.490.000</td>
                            <td className="p-2.5 border-r border-[#CBD5E1]">14.850.000</td>
                            <td className="p-2.5">4.990.000</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 border-r border-[#CBD5E1]">07, 12, 21, 26/06</td>
                            <td className="p-2.5 border-r border-[#CBD5E1]">16.990.000</td>
                            <td className="p-2.5 border-r border-[#CBD5E1]">15.390.000</td>
                            <td className="p-2.5">5.190.000</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 border-r border-[#CBD5E1]">05, 10, 19, 24/07</td>
                            <td className="p-2.5 border-r border-[#CBD5E1]">16.990.000</td>
                            <td className="p-2.5 border-r border-[#CBD5E1]">15.390.000</td>
                            <td className="p-2.5">5.190.000</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 border-r border-[#CBD5E1]">02, 07, 16, 21/08</td>
                            <td className="p-2.5 border-r border-[#CBD5E1]">16.490.000</td>
                            <td className="p-2.5 border-r border-[#CBD5E1]">14.850.000</td>
                            <td className="p-2.5">4.990.000</td>
                          </tr>
                          <tr className="bg-sky-500/10 font-black text-[#0F172A]">
                            <td className="p-2.5 border-r border-[#CBD5E1] text-[#0B3B49]">30/08</td>
                            <td className="p-2.5 border-r border-[#CBD5E1] text-[#D95D39]">17.990.000</td>
                            <td className="p-2.5 border-r border-[#CBD5E1]">16.190.000</td>
                            <td className="p-2.5">5.490.000</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 border-r border-[#CBD5E1]">04, 13, 18, 27/09</td>
                            <td className="p-2.5 border-r border-[#CBD5E1]">16.490.000</td>
                            <td className="p-2.5 border-r border-[#CBD5E1]">14.850.000</td>
                            <td className="p-2.5">4.990.000</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 border-r border-[#CBD5E1]">02, 11, 16, 25/10</td>
                            <td className="p-2.5 border-r border-[#CBD5E1]">16.490.000</td>
                            <td className="p-2.5 border-r border-[#CBD5E1]">14.850.000</td>
                            <td className="p-2.5">4.990.000</td>
                          </tr>
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-[#CBD5E1] bg-[#FAF8F5] font-bold text-[#475569] text-xs">
                            <td className="p-3 border-r border-[#CBD5E1] uppercase">
                              {transportInfo.mode === 'FLIGHT' ? 'CHUYẾN BAY ĐOÀN DỰ KIẾN' : 'LỊCH XE ĐOÀN DỰ KIẾN'}
                            </td>
                            <td colSpan={3} className="p-3 text-left pl-8 space-y-1 font-mono text-[11px]">
                              <div className="text-[#475569]">
                                {transportInfo.outbound.code} {transportInfo.fromCode} → {transportInfo.toCode} {transportInfo.outbound.departTime} – {transportInfo.outbound.arriveTime} ({transportInfo.carrier})
                              </div>
                              <div className="text-[#475569]">
                                {transportInfo.inbound.code} {transportInfo.toCode} → {transportInfo.fromCode} {transportInfo.inbound.departTime} – {transportInfo.inbound.arriveTime} ({transportInfo.carrier})
                              </div>
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* GIÁ TOUR BAO GỒM */}
                  <div className="space-y-2 pt-2">
                    <h3 className="font-black text-[#0F172A] text-sm uppercase">GIÁ TOUR BAO GỒM</h3>
                    <ul className="list-disc pl-5 space-y-1.5 text-[#475569]">
                      <li>Vé máy bay khứ hồi Hồ Chí Minh – Ân Thi – Hồ Chí Minh bao gồm 07kg hành lý xách tay + 20kg hành lý ký gửi.</li>
                      <li>Phí an ninh, phí xăng dầu, thuế sân bay 2 nước.</li>
                      <li>Xe du lịch và vé tham quan theo chương trình.</li>
                      <li>Các bữa ăn chính theo chương trình. <i className="text-[#526071]">(mức ăn 40 RMB/khách/bữa)</i></li>
                      <li>Khách sạn tiêu chuẩn 4 sao địa phương. <i className="text-[#526071]">(02 người/phòng)</i></li>
                      <li>Trưởng đoàn và HDV địa phương phục vụ suốt tuyến theo chương trình.</li>
                    </ul>
                  </div>

                  {/* THÔNG TIN CHI TIẾT KHI BẤM XEM THÊM */}
                  {isPolicyExpanded && (
                    <div className="space-y-6 pt-4 border-t border-[#E6E1DA] animate-fade-in">
                      
                      {/* GIÁ TOUR KHÔNG BAO GỒM */}
                      <div className="space-y-2">
                        <h3 className="font-black text-[#0F172A] text-sm uppercase">GIÁ TOUR KHÔNG BAO GỒM</h3>
                        <ul className="list-disc pl-5 space-y-1.5 text-[#475569]">
                          <li>Chi phí làm hộ chiếu.</li>
                          <li>Phụ thu phòng đơn: 4.500.000 VND/khách/tour <i className="text-[#526071]">(Không áp dụng Lễ, Tết)</i></li>
                          <li>Chi phí làm visa tái nhập cảnh Việt Nam đối với khách Việt kiều, người nước ngoài.</li>
                          <li>Hành lý quá cước trên các chuyến bay.</li>
                          <li>Các dịch vụ sản phẩm không đề cập trong chương trình, show diễn.</li>
                          <li>Các chi phí cá nhân như: điện thoại, internet, giặt ủi, thức ăn, nước uống trong phòng khách sạn, ...</li>
                          <li>Tiền TIP cho Hướng Dẫn Viên, lái xe: 30 USD/khách/tour.</li>
                          <li>Thuế VAT</li>
                        </ul>
                      </div>

                      {/* ĐIỀU KIỆN HỦY */}
                      <div className="space-y-2">
                        <h3 className="font-black text-[#0F172A] text-sm uppercase">ĐIỀU KIỆN HỦY (Không áp dụng cho Lễ, Tết)</h3>
                        <ul className="list-disc pl-5 space-y-1.5 text-[#475569]">
                          <li>Ngay sau khi đăng ký tour, Quý khách vui lòng đóng cọc 60% tổng giá tour, phần còn lại vui lòng thanh toán trước 15 ngày tour khởi hành.</li>
                          <li>Hủy tour ngay sau khi Đại Sứ Quán, Lãnh Sự Quán đã cấp visa: Chi phí hủy tour là 100% trên tổng giá tour.</li>
                          <li>Hủy tour sau khi đăng ký: Phí hủy tour là 60% cọc và chi phí visa và vé máy bay nếu có.</li>
                          <li>Hủy tour trước 15 ngày khởi hành: Phí hủy tour là 90% trên tổng giá tour.</li>
                          <li>Hủy tour sau thời gian trên: Phí hủy tour là 100% trên tổng giá tour.</li>
                        </ul>
                        <p className="text-[11px] italic text-[#526071] pt-1">
                          Thời gian hủy tour và thanh toán được tính theo ngày làm việc, không tính Thứ 7, Chủ Nhật và các ngày Lễ, Tết.
                        </p>
                      </div>

                      {/* CHÍNH SÁCH TRẺ EM, EM BÉ */}
                      <div className="space-y-2">
                        <h3 className="font-black text-[#0F172A] text-sm uppercase">CHÍNH SÁCH TRẺ EM, EM BÉ</h3>
                        <ul className="list-disc pl-5 space-y-1.5 text-[#475569]">
                          <li>Em bé: Dưới 02 tuổi <i className="text-[#526071]">(ngủ chung giường với bố, mẹ)</i></li>
                          <li>Trẻ em: Từ 02 đến dưới 10 tuổi <i className="text-[#526071]">(ngủ chung giường với bố, mẹ)</i></li>
                          <li>Trẻ em từ 10 tuổi trở lên được tính như người lớn.</li>
                          <li>Trẻ em ngủ giường riêng tính 100% giá tour.</li>
                        </ul>
                      </div>

                      {/* QUY ĐỊNH MUA TOUR VÀ THANH TOÁN */}
                      <div className="space-y-2">
                        <h3 className="font-black text-[#0F172A] text-sm uppercase">QUY ĐỊNH MUA TOUR VÀ THANH TOÁN</h3>
                        <ul className="list-disc pl-5 space-y-1.5 text-[#475569]">
                          <li>Khách hàng điền phiếu đăng ký và cung cấp hồ sơ xin visa trước ngày khởi hành ít nhất 15 ngày.</li>
                          <li>Đóng tiền cọc tour 60% tổng giá tour <i className="text-[#526071]">(gồm phí visa + vé máy bay)</i>.</li>
                          <li>Khách có quốc tịch được miễn visa hoặc đã có visa, chúng tôi sẽ trừ lại 500.000 VND/khách.</li>
                        </ul>
                      </div>

                      {/* LƯU Ý */}
                      <div className="space-y-2">
                        <h3 className="font-black text-[#0F172A] text-sm uppercase">LƯU Ý</h3>
                        <ul className="list-disc pl-5 space-y-1.5 text-[#475569]">
                          <li>Trẻ em dưới 16 tuổi phải có bố mẹ đi cùng. Trường hợp trẻ em đi với người nhà <i className="text-[#526071]">(không phải Bố Mẹ)</i>, phải nộp kèm giấy đồng ý cho con đi du lịch được chính quyền địa phương xác nhận <i className="text-[#526071]">(do Bố Mẹ ủy quyền cho người thân dẫn đi du lịch)</i>.</li>
                          <li>Quý khách có yêu cầu ở phòng đơn, vui lòng thanh toán thêm tiền phụ thu.</li>
                          <li>Thứ tự các điểm tham quan và lộ trình chuyến đi có thể thay đổi tùy theo tình hình thực tế <i className="text-[#526071]">(thời tiết, giao thông, ...)</i> nhưng vẫn đảm bảo đầy đủ các điểm tham quan như lúc đầu.</li>
                          <li>Chương trình có các điểm shopping: Cửa hàng thuốc, đá quý, tơ lụa.</li>
                          <li>Nếu quý khách mang quốc tịch khác, hoặc nhiều quốc tịch. Xin vui lòng chủ động báo lại chúng tôi trước khi chốt tour.</li>
                          <li>Trường hợp quý khách ngoại quốc <i className="text-[#526071]">(không phải Việt Kiều)</i>, phía Trung Quốc sẽ phụ thu 100 USD/khách.</li>
                          <li>Khách từ 70 đến dưới 75 tuổi yêu cầu ký cam kết sức khỏe với Công ty.</li>
                          <li>Quý khách từ 75 tuổi trở lên yêu cầu phải có giấy xác nhận đầy đủ sức khỏe đi du lịch nước ngoài của bác sĩ + giấy cam kết sức khỏe với Công ty và phải có người thân dưới 60 tuổi <i className="text-[#526071]">(đầy đủ sức khỏe)</i> đi theo. Ngoài ra, khách trên 75 tuổi vui lòng đóng thêm phí bảo hiểm cao cấp.</li>
                          <li>Không nhận khách từ 80 tuổi trở lên.</li>
                          <li>Quý khách mang thai xin vui lòng báo cho Công ty khi đăng ký tour để được tư vấn thêm thông tin. Không nhận khách mang thai từ 05 tháng trở lên vì lý do an toàn.</li>
                          <li>Giá tour không bao gồm visa tái nhập Việt Nam đối với khách Việt Kiều & Ngoại kiều.</li>
                          <li>Giá Công ty đưa ra là giá trung bình áp dụng cho 01 khách cho đoàn ghép lẻ từ 20 khách.</li>
                        </ul>
                      </div>

                    </div>
                  )}

                  {/* NÚT XEM THÊM / THU GỌN */}
                  <div className="text-center pt-4 border-t border-[#E6E1DA]">
                    <button
                      onClick={() => setIsPolicyExpanded(!isPolicyExpanded)}
                      className="px-6 py-2.5 rounded-full bg-[#FAF8F5] hover:bg-[#F1ECE4] text-[#0B3B49] font-extrabold text-xs transition inline-flex items-center gap-1.5 shadow-sm border border-[#E6E1DA] cursor-pointer"
                    >
                      {isPolicyExpanded ? 'Thu gọn ^' : 'Xem thêm v'}
                    </button>
                  </div>

                </div>
              )}

              {/* TAB CONTENT: Câu hỏi thường gặp */}
              {activeTab === 'faq' && (
                <div className="p-6 space-y-4 text-sm text-[#475569]">
                  {[
                    { q: 'Tour đã bao gồm visa chưa?', a: 'Đối với tour Trung Quốc Ân Thi - Phượng Hoàng Cổ Trấn, giá tour đã bao gồm phí Visa đoàn nhập cảnh.' },
                    { q: 'Trẻ em dưới 2 tuổi tính giá thế nào?', a: 'Trẻ em dưới 2 tuổi tính 30% giá tour người lớn và không có giường riêng.' },
                    { q: 'Có hỗ trợ tách đoàn tự do không?', a: 'Theo quy định du lịch theo đoàn của chính phủ Trung Quốc, khách hàng không được tự ý tách đoàn.' },
                  ].map((faq, i) => (
                    <div key={i} className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E6E1DA] space-y-1.5">
                      <div className="font-bold text-[#0F172A] flex items-center gap-2">
                        <HelpCircle className="h-4 w-4 text-[#0D9488]" /> {faq.q}
                      </div>
                      <div className="text-xs text-[#475569] pl-6 leading-relaxed">{faq.a}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB CONTENT: Đánh giá */}
              {activeTab === 'reviews' && (
                <div className="p-6 space-y-6">
                  {/* Verified User Review Restriction Notice */}
                  {eligibleToReview ? (
                    <form onSubmit={handleReviewSubmit} className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E6E1DA] space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#475569]">Số sao:</span>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setNewRating(star)}
                            className="p-1 focus:outline-none cursor-pointer"
                          >
                            <Star className={`h-5 w-5 ${star <= newRating ? 'fill-amber-400 text-amber-700' : 'text-slate-600'}`} />
                          </button>
                        ))}
                      </div>

                      <div>
                        <textarea
                          rows={3}
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Chia sẻ nhận xét chân thực về chuyến đi, chất lượng phục vụ và món ăn..."
                          className="w-full rounded-xl border border-[#E6E1DA] p-3 text-xs focus:border-sky-400 focus:outline-none bg-[#FAF8F5] text-[#0F172A] placeholder-slate-400"
                          required
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-[#526071]" />
                        <input
                          type="url"
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          placeholder="URL ảnh thực tế chuyến đi (tùy chọn)..."
                          className="flex-1 rounded-xl border border-[#E6E1DA] px-3 py-1.5 text-xs focus:border-sky-400 focus:outline-none bg-[#FAF8F5] text-[#0F172A] placeholder-slate-400"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="rounded-xl bg-[#0B3B49] hover:bg-[#0F5264] text-white px-5 py-2.5 text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-sky-500/20 cursor-pointer"
                      >
                        <Send className="h-3.5 w-3.5" /> Gửi Đánh Giá
                      </button>
                    </form>
                  ) : (
                    <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex items-center gap-3 text-xs text-amber-800">
                      <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-700" />
                      <span>Chính sách minh bạch: Chỉ những tài khoản đã hoàn thành chuyến đi (trạng thái <strong>COMPLETED</strong>) mới được phép để lại bình luận và đính kèm ảnh thực tế.</span>
                    </div>
                  )}

                  {/* Existing Reviews List */}
                  <div className="space-y-4">
                    {reviews.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-4">Chưa có bình luận nào cho tour này.</p>
                    ) : (
                      reviews.map((rev) => {
                        const displayName = (rev.userName && rev.userName !== 'Khách Hàng SmartTravel') 
                          ? rev.userName 
                          : (currentUserName || 'Nguyễn Bảo Lợi');
                        const initialLetter = displayName.charAt(0).toUpperCase();

                        return (
                          <div key={rev.id} className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E6E1DA] space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-sky-500/20 border border-sky-400/30 text-[#0B3B49] font-bold flex items-center justify-center text-xs">
                                  {initialLetter}
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-[#0F172A]">{displayName}</div>
                                  <div className="text-[10px] text-[#526071]">{new Date(rev.createdAt).toLocaleDateString('vi-VN')}</div>
                                </div>
                              </div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-3.5 w-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-700' : 'text-slate-700'}`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-[#475569] pl-10 leading-relaxed">{rev.comment}</p>
                          {rev.imageUrl && (
                            <div className="pl-10 pt-2">
                              <img src={rev.imageUrl} alt="Review attachment" className="h-20 w-20 object-cover rounded-lg border border-[#E6E1DA]" />
                            </div>
                          )}
                        </div>
                      );
                    })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Summary Card (Matching Screenshot 2) */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white backdrop-blur-xl p-5 sm:p-6 rounded-2xl border border-[#E6E1DA] shadow-2xl space-y-6 lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto z-10">
              
              <div className="space-y-2 border-b border-[#E6E1DA] pb-4">
                <h2 className="text-base font-extrabold text-[#0F172A] leading-snug uppercase">
                  {tour.title}
                </h2>
                
                {/* Price Display */}
                <div className="pt-2">
                  <div className="text-xs text-[#526071] font-medium">
                    Giá trọn gói ({transportInfo.mode === 'FLIGHT' ? 'Đã gồm vé máy bay khứ hồi' : 'Đã gồm phương tiện khứ hồi'}):
                  </div>
                  <div className="text-2xl xl:text-3xl font-black text-[#D95D39] tracking-tight">
                    {tour.price.toLocaleString('vi-VN')} đ <span className="text-xs font-normal text-[#526071] whitespace-nowrap">/ Khách</span>
                  </div>
                </div>

                {/* Group Flight / Transport & ID Document Match Notice */}
                <div className="mt-3 rounded-xl bg-teal-500/10 border border-teal-500/25 p-3 space-y-1 text-[11px]">
                  <div className="font-extrabold text-[#0B3B49] flex items-center gap-1.5">
                    {transportInfo.mode === 'FLIGHT' ? <Plane className="h-3.5 w-3.5 text-[#0D9488]" /> : <Bus className="h-3.5 w-3.5 text-[#0D9488]" />}
                    <span>
                      {transportInfo.mode === 'FLIGHT'
                        ? `Vé máy bay đoàn khứ hồi ${transportInfo.fromCode} ⇄ ${transportInfo.toCode} (${transportInfo.shortCarrierBadge})`
                        : `${transportInfo.badgeLabel}: ${transportInfo.fromCode} ⇄ ${transportInfo.toCode} (${transportInfo.shortCarrierBadge})`}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#475569] leading-relaxed">
                    {transportInfo.idDocumentNotice}
                  </p>
                </div>
              </div>

              {/* Details Specs Table matching Reference Image 2 */}
              <div className="space-y-3 text-xs text-[#475569]">
                <div className="space-y-1.5 pb-2 border-b border-[#E6E1DA]">
                  <label className="text-[11px] font-bold text-[#475569] flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-[#0D9488]" /> Chọn Lịch Khởi Hành:
                  </label>
                  {schedulesWithDynamicSeats.length === 0 ? (
                    <div className="rounded-xl bg-amber-500/10 p-3 border border-amber-500/30 text-xs font-semibold text-amber-800">
                      ⚠️ Các đợt khởi hành của tour này đã kết thúc hoặc quá hạn.
                    </div>
                  ) : (
                    <select
                      value={selectedScheduleId}
                      onChange={(e) => setSelectedScheduleId(Number(e.target.value))}
                      className="w-full rounded-xl border border-[#CBD5E1] bg-white p-2.5 text-xs font-bold text-[#0F172A] focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 shadow-inner cursor-pointer"
                    >
                      {schedulesWithDynamicSeats.map((sch) => (
                        <option key={sch.id} value={sch.id} className="bg-white text-[#0F172A]">
                          {sch.startDate} - {sch.endDate} ({sch.bookedCount}/{sch.maxParticipants} chỗ){sch.note ? ` - ${sch.note}` : ''}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Cut-off Lead Time & Lifecycle Alert / Information */}
                  {selectedSchedule && (
                    <>
                      {!selectedSchedule.isBookable ? (
                        <div className={`rounded-xl border p-3.5 text-xs space-y-1.5 mt-2 ${
                          selectedSchedule.status === 'CANCELLED_NOT_ENOUGH_PARTICIPANTS'
                            ? 'bg-rose-500/15 border-rose-500/40 text-rose-800'
                            : 'bg-amber-500/15 border-amber-500/40 text-amber-800'
                        }`}>
                          <div className={`font-bold flex items-center gap-1.5 ${
                            selectedSchedule.status === 'CANCELLED_NOT_ENOUGH_PARTICIPANTS' ? 'text-[#D95D39]' : 'text-amber-800'
                          }`}>
                            <AlertCircle className="h-4 w-4" /> 
                            {selectedSchedule.status === 'CANCELLED_NOT_ENOUGH_PARTICIPANTS'
                              ? 'Đợt Đi Không Đủ Khách Khởi Hành (Đã Hủy Đoàn)'
                              : 'Đã Đóng Cổng Nhận Đặt Chỗ'}
                          </div>
                          <p className="text-[11px] leading-relaxed">
                            {selectedSchedule.status === 'CANCELLED_NOT_ENOUGH_PARTICIPANTS'
                              ? `Đợt khởi hành này chỉ có ${selectedSchedule.bookedCount}/${selectedSchedule.maxParticipants} chỗ được đặt (chưa đạt tối thiểu 10 khách để khởi hành đoàn) nên đã bị hủy. Hệ thống hoàn tiền 100% cho khách đã đặt. Quý khách vui lòng chọn đợt khởi hành tiếp theo.`
                              : selectedSchedule.reason}
                          </p>
                          <p className="text-[10px] italic opacity-80">
                            Quy định lữ hành: Tour{' '}
                            {tour.requiresVisa
                              ? `yêu cầu Visa cần đặt trước tối thiểu ${selectedSchedule.minLeadDays} ngày (xử lý Lãnh sự & sơ duyệt hồ sơ)`
                              : tour.category === 'NUOC_NGOAI'
                                ? `quốc tế cần đặt trước tối thiểu ${selectedSchedule.minLeadDays} ngày (xuất vé & chốt dịch vụ quốc tế)`
                                : `trong nước cần đặt trước tối thiểu ${selectedSchedule.minLeadDays} ngày (chốt xe & danh sách lưu trú)`}
                            .
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1.5 mt-2">
                          <div className="flex flex-wrap items-center justify-between text-[11px] bg-sky-500/10 border border-sky-500/20 px-3 py-2 rounded-xl text-[#0B3B49] gap-1.5">
                            {(() => {
                              const daysLeftToBook = Math.max(0, selectedSchedule.daysRemaining - selectedSchedule.minLeadDays);
                              return (
                                <>
                                  <span className="flex items-center gap-1.5 flex-shrink-0">
                                    <Clock className="h-3.5 w-3.5 text-[#0D9488] flex-shrink-0" />
                                    <span>
                                      {daysLeftToBook > 0 ? (
                                        <>Còn <strong className="text-[#0F172A] font-bold">{daysLeftToBook} ngày</strong> đặt vé</>
                                      ) : (
                                        <strong className="text-amber-800 font-bold">Hôm nay hạn chót đặt vé</strong>
                                      )}
                                    </span>
                                  </span>
                                  <span className="font-semibold text-[#0F172A] flex-shrink-0">
                                    Đã đặt: <strong className="text-[#0B3B49]">{selectedSchedule.bookedCount}/{selectedSchedule.maxParticipants} chỗ</strong>
                                  </span>
                                </>
                              );
                            })()}
                          </div>
                          {selectedSchedule.seats <= 4 ? (
                            <div className="text-[11px] font-semibold px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700">
                              Sắp hết chỗ — Chỉ còn <strong>{selectedSchedule.seats} chỗ trống</strong> cuối cùng
                            </div>
                          ) : selectedSchedule.bookedCount >= selectedSchedule.minParticipants ? (
                            <div className="text-[11px] font-semibold px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-700">
                              Đã đủ khách khởi hành ({selectedSchedule.bookedCount}/{selectedSchedule.minParticipants} khách tối thiểu)
                            </div>
                          ) : (
                            <div className="text-[11px] font-semibold px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-800">
                              Đang ghép đoàn — Cần thêm <strong>{selectedSchedule.minParticipants - selectedSchedule.bookedCount} khách</strong> nữa để đủ {selectedSchedule.minParticipants} khách khởi hành
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-[#E6E1DA]">
                  <span className="text-[#526071] flex items-center gap-1.5"><Building2 className="h-4 w-4 text-[#0D9488]" /> Đơn vị tổ chức:</span>
                  <span className="font-bold text-[#0B3B49] flex items-center gap-1">
                    {tour.vendorName || 'NewTour Travel Company'}
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#526071] flex items-center gap-1.5"><Clock className="h-4 w-4 text-[#0D9488]" /> Thời gian:</span>
                  <span className="font-bold text-[#0F172A]">{tour.durationDays} ngày {tour.durationNights} đêm</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#526071] flex items-center gap-1.5"><MapPin className="h-4 w-4 text-[#0D9488]" /> Nơi khởi hành:</span>
                  <span className="font-bold text-[#0F172A]">{tour.departureLocation}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#526071] flex items-center gap-1.5"><Users className="h-4 w-4 text-[#0D9488]" /> Số chỗ:</span>
                  <div className="text-right">
                    <span className="font-extrabold text-[#0F172A] text-xs">
                      {selectedSchedule.bookedCount} / {selectedSchedule.maxParticipants} chỗ
                    </span>
                    <span className={`ml-2 font-bold px-2 py-0.5 rounded text-[11px] ${
                      selectedSchedule.status === 'CANCELLED_NOT_ENOUGH_PARTICIPANTS'
                        ? 'text-[#D95D39] bg-rose-500/15 border border-rose-500/30'
                        : selectedSchedule.seats > 0 
                          ? 'text-emerald-700 bg-emerald-500/10 border border-emerald-500/30' 
                          : 'text-[#D95D39] bg-rose-500/10 border border-rose-500/30'
                    }`}>
                      {selectedSchedule.status === 'CANCELLED_NOT_ENOUGH_PARTICIPANTS'
                        ? '(Đã hủy đoàn)'
                        : selectedSchedule.seats > 0 
                          ? `(Còn ${selectedSchedule.seats} chỗ)` 
                          : '(Hết chỗ)'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#526071] flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-[#0D9488]" /> Mã tour:</span>
                  <span className="font-bold text-[#0D9488]">{tour.tourCode || 'DAHT14VQDZ'}</span>
                </div>
              </div>

              {/* Guest Selector Counter */}
              <div className="space-y-3 pt-4 border-t border-[#E6E1DA]">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-[#0F172A]">Người lớn (từ 12 tuổi)</div>
                    <div className="text-[10px] text-[#526071]">{tour.price.toLocaleString('vi-VN')} đ / khách</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      className="h-9 w-9 rounded-lg bg-[#F4F1EC] hover:bg-[#E6E1DA] text-[#0F172A] font-bold border border-[#E6E1DA] flex items-center justify-center text-sm transition cursor-pointer"
                      aria-label="Giảm số người lớn"
                    >-</button>
                    <span className="font-bold text-sm w-5 text-center text-[#0F172A]">{adults}</span>
                    <button 
                      onClick={() => setAdults(adults + 1)}
                      className="h-9 w-9 rounded-lg bg-[#F4F1EC] hover:bg-[#E6E1DA] text-[#0F172A] font-bold border border-[#E6E1DA] flex items-center justify-center text-sm transition cursor-pointer"
                      aria-label="Tăng số người lớn"
                    >+</button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-[#0F172A]">Trẻ em (2 - 11 tuổi)</div>
                    <div className="text-[10px] text-[#526071]">{childPriceVal.toLocaleString('vi-VN')} đ / khách</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setChildren(Math.max(0, children - 1))}
                      className="h-9 w-9 rounded-lg bg-[#F4F1EC] hover:bg-[#E6E1DA] text-[#0F172A] font-bold border border-[#E6E1DA] flex items-center justify-center text-sm transition cursor-pointer"
                      aria-label="Giảm số trẻ em"
                    >-</button>
                    <span className="font-bold text-sm w-5 text-center text-[#0F172A]">{children}</span>
                    <button 
                      onClick={() => setChildren(children + 1)}
                      className="h-9 w-9 rounded-lg bg-[#F4F1EC] hover:bg-[#E6E1DA] text-[#0F172A] font-bold border border-[#E6E1DA] flex items-center justify-center text-sm transition cursor-pointer"
                      aria-label="Tăng số trẻ em"
                    >+</button>
                  </div>
                </div>
              </div>

              {/* SINGLE ROOM SURCHARGE & ROOM ALLOCATION DETAILS */}
              <div className="space-y-3 pt-3 border-t border-[#E6E1DA]">
                <div className="flex items-start justify-between gap-2 text-xs">
                  <label className="font-bold text-[#334155] flex items-start gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={singleRoomRequired}
                      onChange={(e) => setSingleRoomRequired(e.target.checked)}
                      className="h-4 w-4 mt-0.5 rounded border-[#CBD5E1] bg-white text-sky-500 focus:ring-sky-400 cursor-pointer"
                    />
                    <div>
                      <span className="block text-[#0F172A]">Yêu cầu phòng đơn riêng biệt</span>
                      <span className="block text-[10px] text-[#526071] font-normal">Không ghép phòng với khách lẻ khác</span>
                    </div>
                  </label>
                  <span className="text-[11px] font-extrabold text-amber-700 whitespace-nowrap">
                    +{singleRoomSurchargeUnit.toLocaleString('vi-VN')} đ/khách
                  </span>
                </div>

                {/* Clear Room Allocation Display */}
                <div className="rounded-xl bg-[#FAF8F5] border border-[#E6E1DA] p-3 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[#475569] font-semibold">
                    <span className="flex items-center gap-1.5 text-[#0B3B49]">
                      🏨 Tiêu chuẩn xếp phòng:
                    </span>
                    <span className="text-[11px] text-[#526071] font-medium">02 khách/phòng</span>
                  </div>
                  <div className="text-[11px] text-emerald-700 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg leading-relaxed">
                    Phân bổ: {getRoomAllocationText()}
                  </div>
                  <p className="text-[10px] text-[#526071] italic leading-snug">
                    {singleRoomRequired 
                      ? '✓ Đã kích hoạt phụ thu phòng riêng. Quý khách được bố trí phòng đơn 1 giường tiêu chuẩn 3-4 sao.' 
                      : 'ℹ️ Khách đi 1 mình mặc định ghép phòng Twin (2 giường đơn) với khách cùng giới tính. Quý khách có thể tick ô trên nếu muốn ở phòng riêng.'}
                  </p>
                </div>
              </div>

              {/* Voucher Application Form */}
              <div className="space-y-2 pt-3 border-t border-[#E6E1DA]">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-[#475569]">Mã giảm giá (Voucher):</label>
                  <button
                    type="button"
                    onClick={() => setShowVoucherModal(true)}
                    className="text-[11px] text-[#0D9488] hover:text-[#0D9488] font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="h-3 w-3 text-[#0D9488]" />
                    <span>Xem ưu đãi có sẵn</span>
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    placeholder="Nhập mã (Ví dụ: SUMMER2026)"
                    className="flex-1 rounded-xl border border-[#E6E1DA] px-3 py-2 text-xs focus:border-sky-400 focus:outline-none uppercase font-semibold bg-[#FAF8F5] text-[#0F172A] placeholder-slate-400"
                  />
                  <button
                    onClick={() => handleApplyVoucher()}
                    className="rounded-xl bg-[#F1ECE4] hover:bg-[#F1ECE4] text-[#0F172A] border border-[#CBD5E1] px-3.5 py-2 text-xs font-bold transition cursor-pointer"
                  >
                    Áp dụng
                  </button>
                </div>
                {voucherMsg && (
                  <p className={`text-[11px] font-semibold ${voucherMsg.type === 'success' ? 'text-emerald-700' : 'text-[#D95D39]'}`}>
                    {voucherMsg.text}
                  </p>
                )}
              </div>

              {/* Total Calculation Breakdown */}
              <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E6E1DA] space-y-1.5 text-xs">
                <div className="flex justify-between text-[#526071]">
                  <span>Tiền vé ({adults} NL{children > 0 ? `, ${children} TE` : ''}):</span>
                  <span className="text-[#334155] font-semibold">{(adultTotal + childTotal).toLocaleString('vi-VN')} đ</span>
                </div>
                {singleRoomRequired && (
                  <div className="flex justify-between text-amber-800 font-medium">
                    <span>Phụ thu phòng đơn ({adults} phòng):</span>
                    <span>+{singleRoomSurchargeTotal.toLocaleString('vi-VN')} đ</span>
                  </div>
                )}
                {voucherDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Giảm giá Voucher:</span>
                    <span>-{voucherDiscount.toLocaleString('vi-VN')} đ</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-[#0F172A] pt-2 border-t border-[#E6E1DA]">
                  <span>Tổng tiền:</span>
                  <span className="text-[#D95D39]">{finalTotal.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>

              {/* CTA Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleBookNow}
                  disabled={!selectedSchedule.isBookable}
                  className={`w-full rounded-xl py-3.5 text-sm font-black transition flex items-center justify-center gap-2 cursor-pointer ${
                    !selectedSchedule.isBookable 
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-[#E6E1DA]' 
                      : 'bg-[#D95D39] hover:bg-[#C24E2D] text-white shadow-md active:scale-[0.99]'
                  }`}
                >
                  {!selectedSchedule.isBookable
                    ? (selectedSchedule.status === 'CANCELLED_NOT_ENOUGH_PARTICIPANTS' 
                        ? 'Đợt Đã Hủy (Chưa Đủ Đoàn)' 
                        : 'Đã Đóng Cổng Nhận Khách')
                    : 'Đặt ngay'}
                </button>
                
                <a
                  href="tel:0941899554"
                  className="w-full rounded-xl border border-[#0B3B49]/30 text-[#0B3B49] hover:bg-[#E6F4F1] hover:border-[#0B3B49] py-3 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PhoneCall className="h-4 w-4 text-[#0D9488]" /> Liên hệ tư vấn 0941 899 554
                </a>
              </div>

              {/* Policy & Minimum Participants Guarantee Box */}
              <div className="rounded-xl bg-[#FAF8F5] border border-[#E6E1DA] p-3 space-y-1.5 text-[11px] text-[#526071]">
                <div className="flex items-center gap-1.5 font-bold text-[#475569]">
                  <ShieldCheck className="h-4 w-4 text-emerald-700" /> Cam kết quyền lợi khách hàng:
                </div>
                <p className="leading-relaxed">
                  • <strong>Đoàn tối thiểu:</strong> Mỗi đợt khởi hành yêu cầu tối thiểu {selectedSchedule.minParticipants || 10} khách. Nếu không đủ đoàn trước ngày đi {selectedSchedule.minLeadDays} ngày, SmartTravel hoàn tiền 100% hoặc đổi lịch mới tặng voucher giảm 10%.
                </p>
                <p className="leading-relaxed">
                  • <strong>Hạn đặt chỗ:</strong>{' '}
                  {tour.requiresVisa
                    ? `Đặt trước tối thiểu ${selectedSchedule.minLeadDays} ngày để xử lý hồ sơ Visa`
                    : tour.category === 'NUOC_NGOAI'
                      ? `Đặt trước tối thiểu ${selectedSchedule.minLeadDays} ngày cho tour quốc tế`
                      : `Đặt trước tối thiểu ${selectedSchedule.minLeadDays} ngày để chốt dịch vụ`}
                  .
                </p>
              </div>

            </div>
          </aside>
        </div>

        {/* SECTION: CÓ THỂ BẠN SẼ THÍCH (Khớp 100% Screenshot 4) */}
        <div className="pt-12 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">Có thể bạn sẽ thích</h3>
            <button 
              onClick={() => {
                const el = document.getElementById('recommended-carousel');
                if (el) el.scrollBy({ left: 320, behavior: 'smooth' });
              }}
              className="md:hidden h-10 w-10 rounded-full bg-[#F4F1EC] hover:bg-[#F1ECE4] text-[#0F172A] flex items-center justify-center transition border border-[#E6E1DA] shadow-sm cursor-pointer"
              aria-label="Xem thêm tour gợi ý"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div id="recommended-carousel" className="flex md:grid md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-none">
            {[
              {
                id: 2,
                title: 'TOUR KHÁM PHÁ THƯỢNG HẢI - TÂY SÁCH Ô TRẤN 4 NGÀY 4 ĐÊM NOSHOPPING',
                price: 18990000,
                departure: 'Đang cập nhật',
                duration: '4 ngày 4 đêm',
                remaining: 40,
                views: 165,
                img: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
              },
              {
                id: 3,
                title: 'TOUR TẾT: DU LỊCH KHÁM PHÁ HÀNG CHÂU - Ô TRẤN - THƯỢNG HẢI - TÔ CHÂU - TRUNG QUỐC - 6 NGÀY 6 ĐÊM',
                price: 25990000,
                departure: 'Đang cập nhật',
                duration: '6 ngày 6 đêm',
                remaining: 40,
                views: 1238,
                img: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=800&q=80',
              },
              {
                id: 4,
                title: 'TOUR TẾT: DU LỊCH KHÁM PHÁ TRUNG QUỐC - 7 NGÀY 7 ĐÊM',
                price: 27990000,
                departure: 'Đang cập nhật',
                duration: '7 ngày 7 đêm',
                remaining: 40,
                views: 843,
                img: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80',
              },
            ].map((rec) => (
              <div key={rec.id} className="min-w-[84vw] sm:min-w-[320px] md:min-w-0 snap-start bg-white backdrop-blur-md rounded-2xl border border-[#E6E1DA] hover:border-sky-500/40 overflow-hidden shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col justify-between group">
                <div>
                  <div className="h-48 overflow-hidden relative bg-white">
                    <img src={rec.img} alt={rec.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  </div>

                  <div className="p-4 space-y-3">
                    <h4 className="font-black text-xs text-[#0F172A] uppercase line-clamp-2 leading-snug group-hover:text-[#0B3B49] transition">
                      {rec.title}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-[#526071] font-medium">
                      <span>👁 Lượt xem: {rec.views}</span>
                      <span>★ Đánh giá: 0/5</span>
                      <span>📌 Đặt chỗ: 0</span>
                    </div>

                    <div className="space-y-1 text-xs text-[#475569] pt-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-[#0D9488]" />
                        <span>Khởi hành: <strong className="text-[#0F172A]">{rec.departure}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-[#0D9488]" />
                        <span>Thời gian: <strong className="text-[#0F172A]">{rec.duration}</strong></span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="text-[11px] text-[#526071]">Giá từ</div>
                      <div className="text-lg font-black text-[#D95D39]">
                        {rec.price.toLocaleString('vi-VN')} đ <span className="text-[11px] font-normal text-[#526071]">/ Khách</span>
                      </div>
                      <div className="text-[11px] text-[#526071] font-medium mt-1">
                        Còn lại <strong className="text-[#0F172A]">{rec.remaining}</strong> chỗ
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button
                    onClick={() => {
                      navigate(`/tours/${rec.id}`);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white font-black text-xs py-2.5 transition shadow-md shadow-sky-500/20 cursor-pointer"
                  >
                    Đặt ngay
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Lightbox / Fullscreen Image Viewer Modal */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex flex-col justify-between p-4 sm:p-6 select-none animate-fade-in"
          onClick={closeLightbox}
        >
          {/* Top Header Bar */}
          <div 
            className="flex items-center justify-between z-10 w-full max-w-7xl mx-auto pb-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-white">
              <span className="text-xs font-bold px-3 py-1 bg-white/10 rounded-full border border-white/20 text-accent-300">
                Thư viện ảnh ({galleryImages.length} ảnh)
              </span>
              <span className="hidden sm:inline text-xs text-slate-300 font-medium truncate max-w-md">
                {tour.title}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-200 bg-slate-900/80 px-3 py-1 rounded-full border border-white/15">
                {activeImageIndex + 1} / {galleryImages.length}
              </span>
              <button
                onClick={closeLightbox}
                className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center transition border border-white/15"
                title="Đóng (Esc)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Main Large Image & Navigation Buttons */}
          <div 
            className="relative flex-1 flex items-center justify-center max-w-7xl mx-auto w-full my-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prev Button */}
            {galleryImages.length > 1 && (
              <button
                onClick={prevImage}
                className="absolute left-1 sm:left-4 z-20 h-12 w-12 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center transition hover:scale-110 shadow-float border border-white/20 active:scale-95"
                title="Ảnh trước (Mũi tên trái)"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {/* Current Active Image with Smooth Zoom */}
            <div className="h-full max-h-[66vh] sm:max-h-[72vh] flex items-center justify-center relative">
              <img
                key={activeImageIndex}
                src={galleryImages[activeImageIndex]}
                alt={`${tour.title} - Ảnh ${activeImageIndex + 1}`}
                className="max-h-[66vh] sm:max-h-[72vh] max-w-[92vw] sm:max-w-[82vw] object-contain rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] border border-white/15 transition duration-300 select-none"
              />
            </div>

            {/* Next Button */}
            {galleryImages.length > 1 && (
              <button
                onClick={nextImage}
                className="absolute right-1 sm:right-4 z-20 h-12 w-12 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center transition hover:scale-110 shadow-float border border-white/20 active:scale-95"
                title="Ảnh tiếp theo (Mũi tên phải)"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnail Carousel Strip */}
          {galleryImages.length > 1 && (
            <div 
              className="z-10 max-w-5xl mx-auto w-full overflow-x-auto pb-2 pt-1 px-4 scrollbar-thin"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2.5 mx-auto w-max">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`h-14 w-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                      activeImageIndex === idx
                        ? 'border-accent-400 scale-105 shadow-md shadow-accent-400/30 opacity-100'
                        : 'border-transparent opacity-50 hover:opacity-85 hover:scale-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Voucher Selector Modal */}
      <VoucherSelectorModal
        isOpen={showVoucherModal}
        onClose={() => setShowVoucherModal(false)}
        orderTotal={(tour?.price || 0) * adults + ((tour?.childPrice || (tour?.price || 0) * 0.7) * children) + singleRoomSurchargeTotal}
        selectedCode={voucherCode}
        onSelectVoucher={(code) => handleApplyVoucher(code)}
      />
    </div>
  );
};
