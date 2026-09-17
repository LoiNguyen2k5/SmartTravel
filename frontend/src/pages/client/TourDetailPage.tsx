import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { tourService } from '../../services/tourService';
import { reviewService } from '../../services/reviewService';
import { bookingService } from '../../services/bookingService';
import { Tour } from '../../types/tour';
import { Review } from '../../types/review';
import { MOCK_TOURS, findMockTourById } from '../../data/mockTours';
import { 
  Star, Clock, Calendar, MapPin, 
  HelpCircle, ShieldCheck, Tag, ChevronRight, ChevronLeft, PhoneCall, 
  Send, UserCheck, AlertCircle, Image as ImageIcon, X, Maximize2
} from 'lucide-react';
import { tourScheduleService, formatScheduleDate } from '../../services/tourScheduleService';

const MOCK_DETAIL_TOUR: Tour = MOCK_TOURS[0]; // Default fallback = first tour

export const TourDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);

  // Lightbox Modal State
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'itinerary' | 'policy' | 'faq' | 'reviews'>('itinerary');
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [isPolicyExpanded, setIsPolicyExpanded] = useState<boolean>(false);

  // Synchronized schedules state from tourScheduleService
  const [schedulesWithDynamicSeats, setSchedulesWithDynamicSeats] = useState<Array<{
    id: number;
    startDate: string;
    endDate: string;
    seats: number;
    note: string;
  }>>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number>(1);

  const loadSchedules = (tourId: number) => {
    const active = tourScheduleService.getUpcomingSchedulesForUser(tourId);
    const mapped = active.map((s) => ({
      id: s.id,
      startDate: formatScheduleDate(s.startDate),
      endDate: formatScheduleDate(s.endDate),
      seats: Math.max(0, s.maxParticipants - s.bookedCount),
      note: s.note || 'Lịch mở bán',
    }));
    setSchedulesWithDynamicSeats(mapped);
    if (mapped.length > 0) {
      setSelectedScheduleId(mapped[0].id);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    const targetId = tour?.id || (id ? Number(id) : null);
    if (targetId) {
      loadSchedules(targetId);
    }
  }, [tour?.id, id]);

  // Listen to schedule updates from Vendor or booking
  useEffect(() => {
    const handleUpdate = (e: any) => {
      const targetId = tour?.id || (id ? Number(id) : null);
      if (targetId && (!e.detail?.tourId || e.detail?.tourId === targetId)) {
        loadSchedules(targetId);
      }
    };
    window.addEventListener('tour_schedules_updated', handleUpdate);
    return () => window.removeEventListener('tour_schedules_updated', handleUpdate);
  }, [tour?.id, id]);

  const selectedSchedule = schedulesWithDynamicSeats.find(s => s.id === selectedScheduleId) || schedulesWithDynamicSeats[0] || {
    id: 0,
    startDate: 'Hết đợt khởi hành',
    endDate: 'N/A',
    seats: 0,
    note: 'Đã hết hạn',
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

  // Reviews state & validation
  const [reviews, setReviews] = useState<Review[]>([]);
  const [eligibleToReview, setEligibleToReview] = useState<boolean>(true);
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
          setTour({
            ...res.data,
            thumbnailUrl: (res.data.thumbnailUrl && !res.data.thumbnailUrl.includes('unsplash')) ? res.data.thumbnailUrl : fallback.thumbnailUrl,
            gallery: (res.data.gallery && res.data.gallery.length > 0) ? res.data.gallery : fallback.gallery,
            itineraryDetails: res.data.itineraryDetails || fallback.itineraryDetails,
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

      // Fetch Reviews
      if (id) {
        try {
          const revRes = await reviewService.getReviewsByTourId(tourId);
          if (revRes.success && revRes.data) {
            setReviews(revRes.data);
          }
        } catch { /* reviews not available */ }

        // Always enable review form for authenticated user
        setEligibleToReview(true);
      }
    } catch (err) {
      console.error(err);
      setTour(getMockFallback());
    } finally {
      setLoading(false);
    }
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim() || !tour) return;
    try {
      const originalTotal = (tour.price * adults) + ((tour.childPrice || tour.price * 0.7) * children);
      const res = await bookingService.validateVoucher(voucherCode.trim(), originalTotal);
      if (res.success && res.data) {
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
      }
    });
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tour || !newComment.trim()) return;
    setSubmittingReview(true);
    const newRevObj: Review = {
      id: Date.now(),
      tourId: tour.id,
      userId: 1,
      userName: 'Khách Hàng SmartTravel',
      rating: newRating,
      comment: newComment.trim(),
      imageUrl: newImageUrl.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await reviewService.createReview({
        tourId: tour.id,
        rating: newRating,
        comment: newComment.trim(),
        imageUrl: newImageUrl.trim() || undefined,
      });
      if (res.success && res.data) {
        setReviews([res.data, ...reviews]);
      } else {
        setReviews([newRevObj, ...reviews]);
      }
    } catch {
      setReviews([newRevObj, ...reviews]);
    } finally {
      setNewComment('');
      setNewImageUrl('');
      setSubmittingReview(false);
      alert('Đăng đánh giá thành công! Cảm ơn phản hồi của bạn.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center bg-[#020204]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen bg-[#020204] flex items-center justify-center p-16 text-center text-slate-400 font-bold">
        Không tìm thấy thông tin tour.
      </div>
    );
  }

  const rawItinerary = tour.itineraryDetails ? JSON.parse(tour.itineraryDetails) : [];
  const adultTotal = tour.price * adults;
  const childPriceVal = tour.childPrice || Math.round(tour.price * 0.7);
  const childTotal = childPriceVal * children;
  const subtotal = adultTotal + childTotal;
  const finalTotal = Math.max(0, subtotal - voucherDiscount);

  return (
    <div className="bg-[#020204] text-white min-h-screen pb-20 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-sky-600/10 rounded-full blur-[140px] pointer-events-none" />
      {/* Breadcrumb Bar */}
      <div className="bg-white/[0.02] border-b border-white/10 py-3.5 px-4 sm:px-6 lg:px-8 relative z-10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs font-medium text-slate-400">
          <span className="hover:text-sky-400 cursor-pointer transition" onClick={() => navigate('/')}>Trang Chủ</span>
          <ChevronRight className="h-3 w-3 text-slate-600" />
          <span className="hover:text-sky-400 cursor-pointer transition" onClick={() => navigate(`/tours?type=${tour.category}`)}>
            {tour.category === 'NUOC_NGOAI' ? 'Nước Ngoài' : 'Trong Nước'}
          </span>
          <ChevronRight className="h-3 w-3 text-slate-600" />
          <span className="text-white font-bold line-clamp-1">{tour.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8 relative z-10">
        
        {/* Top Hero Image Gallery (Click to open Lightbox & navigate) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[360px] sm:h-[400px] lg:h-[440px] rounded-2xl overflow-hidden relative z-0">
          {/* Main Large Image */}
          <div 
            onClick={() => openLightbox(0)}
            className="lg:col-span-2 rounded-2xl overflow-hidden bg-slate-900 border border-white/10 h-full relative group cursor-pointer shadow-2xl transition"
          >
            <img 
              src={galleryImages[0]} 
              alt={tour.title} 
              className="h-full w-full object-cover group-hover:scale-105 transition duration-700 ease-out" 
            />
            <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <span className="bg-[#0a111d]/90 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 border border-sky-400/30 shadow-[0_0_15px_rgba(56,189,248,0.25)]">
                <Maximize2 className="h-4 w-4 text-sky-400" />
                <span>Nhấn để xem & chuyển ảnh</span>
              </span>
            </div>
            <div className="absolute bottom-4 left-4 bg-[#0a111d]/85 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/10">
              Mã tour: <span className="text-sky-400">{tour.tourCode || 'N/A'}</span>
            </div>
            <div className="absolute bottom-4 right-4 bg-[#0a111d]/85 hover:bg-[#0a111d] text-white text-xs font-bold px-3.5 py-1.5 rounded-lg backdrop-blur-md border border-white/15 flex items-center gap-1.5 transition">
              <ImageIcon className="h-3.5 w-3.5 text-sky-400" />
              <span>{galleryImages.length} hình ảnh</span>
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
                  className="rounded-2xl overflow-hidden bg-slate-900 border border-white/10 relative cursor-pointer group shadow-lg transition min-h-0 h-full"
                >
                  <img 
                    src={imgUrl} 
                    alt={`Gallery ${idx}`} 
                    className="h-full w-full object-cover group-hover:scale-105 transition duration-500" 
                  />
                  <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <Maximize2 className="h-5 w-5 text-white drop-shadow-md" />
                  </div>
                  {isLast && (
                    <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[3px] flex flex-col items-center justify-center text-white font-bold text-xs group-hover:bg-slate-950/85 transition">
                      <ImageIcon className="h-5 w-5 mb-1 text-sky-400" />
                      <span>+ Xem tất cả ({galleryImages.length})</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Grid: Left Detailed Tabs vs Right Summary Booking Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10 pt-2">
          
          {/* Left Column: Details & Tabs */}
          <div className="lg:col-span-2 space-y-8">

            {/* Rating Breakdown Card (Matching Screenshot 2) */}
            <div className="bg-[#0a111d]/85 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-xl flex flex-col md:flex-row items-center gap-8">
              <div className="text-center md:text-left space-y-1 pr-6 border-b md:border-b-0 md:border-r border-white/10 pb-4 md:pb-0">
                <div className="text-5xl font-black text-white">{tour.averageRating || 4.9}<span className="text-xl text-slate-400 font-normal">/5</span></div>
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Đánh Giá Kinh Ngạc</div>
                <div className="text-xs text-slate-400">Dựa trên {tour.totalReviews || 14} lượt đánh giá thực tế</div>
              </div>

              <div className="flex-1 space-y-2 w-full">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = tour.ratingBreakdown?.[star] || (star === 5 ? 12 : star === 4 ? 2 : 0);
                  const pct = Math.round((count / (tour.totalReviews || 14)) * 100);
                  return (
                    <div key={star} className="flex items-center gap-3 text-xs">
                      <span className="font-semibold text-slate-300 w-10">{star} Sao</span>
                      <div className="flex-1 bg-white/10 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-amber-400 h-full rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>
                      <span className="w-12 text-right text-slate-400 font-medium">{count} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation Tabs Header matching screenshot 2 style */}
            <div className="bg-[#0a111d]/85 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl overflow-hidden">
              <div className="flex items-center border-b border-white/10 overflow-x-auto text-xs font-bold scrollbar-none">
                {[
                  { id: 'itinerary', label: 'Lịch trình tour' },
                  { id: 'policy', label: 'Chính sách tour' },
                  { id: 'faq', label: 'Câu hỏi thường gặp' },
                  { id: 'reviews', label: `Đánh giá (${reviews.length || tour.totalReviews || 0})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-6 py-4 border-b-2 transition whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-sky-400 text-sky-400 bg-sky-500/10'
                        : 'border-transparent text-slate-400 hover:text-white hover:bg-white/[0.02]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* TAB CONTENT: Lịch trình tour */}
              {activeTab === 'itinerary' && (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Left Day Selection Menu (Matching Screenshot 2) */}
                    <div className="md:col-span-1 space-y-2 border-b md:border-b-0 md:border-r border-white/10 pr-0 md:pr-4 pb-4 md:pb-0">
                      {rawItinerary.map((item: any, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedDay(item.day)}
                          className={`w-full text-left p-3 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                            selectedDay === item.day
                              ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-lg shadow-sky-500/25 border border-sky-400/40'
                              : 'bg-white/[0.03] text-slate-300 hover:bg-white/[0.08] hover:text-white border border-white/5'
                          }`}
                        >
                          <span className="line-clamp-2">{item.title}</span>
                        </button>
                      ))}
                    </div>

                    {/* Right Day Details Panel */}
                    <div className="md:col-span-3 space-y-4">
                      {rawItinerary
                        .filter((item: any) => item.day === selectedDay)
                        .map((item: any, idx: number) => (
                          <div key={idx} className="space-y-4 animate-fade-in">
                            <div className="bg-sky-500/10 p-4 rounded-xl border border-sky-500/20">
                              <h4 className="text-sm font-black text-sky-300 uppercase tracking-wide">
                                {item.title}
                              </h4>
                            </div>
                            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line font-normal">
                              {item.content}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: Chính sách tour (Khớp 100% hình 1, 2, 3) */}
              {activeTab === 'policy' && (
                <div className="p-6 space-y-6 text-xs text-slate-300 leading-relaxed font-sans">
                  
                  {/* BẢNG GIÁ TOUR GHÉP LẺ */}
                  <div className="space-y-3">
                    <h3 className="font-black text-white text-base uppercase tracking-tight">
                      BẢNG GIÁ TOUR GHÉP LẺ
                    </h3>

                    <div className="overflow-x-auto border border-white/15 rounded-xl">
                      <table className="w-full text-center border-collapse">
                        <thead>
                          <tr className="border-b border-white/15 bg-white/[0.06] font-black text-xs text-white">
                            <th className="p-3 border-r border-white/15 w-1/4">KHỞI HÀNH</th>
                            <th colSpan={3} className="p-3">GIÁ TRỌN GÓI: VND/KHÁCH</th>
                          </tr>
                          <tr className="border-b border-white/15 bg-white/[0.03] font-bold text-[11px] text-slate-300">
                            <th className="p-2 border-r border-white/15"></th>
                            <th className="p-2 border-r border-white/15 w-1/4">
                              NGƯỜI LỚN<br/><span className="font-normal italic text-slate-400">(Từ 10 tuổi trở lên)</span>
                            </th>
                            <th className="p-2 border-r border-white/15 w-1/4">
                              TRẺ EM<br/><span className="font-normal italic text-slate-400">(Từ 02 - dưới 10 tuổi)</span>
                            </th>
                            <th className="p-2 w-1/4">
                              EM BÉ<br/><span className="font-normal italic text-slate-400">(Dưới 02 tuổi)</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10 font-bold text-slate-200 text-xs">
                          <tr>
                            <td className="p-2.5 border-r border-white/15">10, 15, 24, 29/05</td>
                            <td className="p-2.5 border-r border-white/15">16.490.000</td>
                            <td className="p-2.5 border-r border-white/15">14.850.000</td>
                            <td className="p-2.5">4.990.000</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 border-r border-white/15">07, 12, 21, 26/06</td>
                            <td className="p-2.5 border-r border-white/15">16.990.000</td>
                            <td className="p-2.5 border-r border-white/15">15.390.000</td>
                            <td className="p-2.5">5.190.000</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 border-r border-white/15">05, 10, 19, 24/07</td>
                            <td className="p-2.5 border-r border-white/15">16.990.000</td>
                            <td className="p-2.5 border-r border-white/15">15.390.000</td>
                            <td className="p-2.5">5.190.000</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 border-r border-white/15">02, 07, 16, 21/08</td>
                            <td className="p-2.5 border-r border-white/15">16.490.000</td>
                            <td className="p-2.5 border-r border-white/15">14.850.000</td>
                            <td className="p-2.5">4.990.000</td>
                          </tr>
                          <tr className="bg-sky-500/10 font-black text-white">
                            <td className="p-2.5 border-r border-white/15 text-sky-300">30/08</td>
                            <td className="p-2.5 border-r border-white/15 text-rose-400">17.990.000</td>
                            <td className="p-2.5 border-r border-white/15">16.190.000</td>
                            <td className="p-2.5">5.490.000</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 border-r border-white/15">04, 13, 18, 27/09</td>
                            <td className="p-2.5 border-r border-white/15">16.490.000</td>
                            <td className="p-2.5 border-r border-white/15">14.850.000</td>
                            <td className="p-2.5">4.990.000</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 border-r border-white/15">02, 11, 16, 25/10</td>
                            <td className="p-2.5 border-r border-white/15">16.490.000</td>
                            <td className="p-2.5 border-r border-white/15">14.850.000</td>
                            <td className="p-2.5">4.990.000</td>
                          </tr>
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-white/15 bg-white/[0.04] font-bold text-slate-300 text-xs">
                            <td className="p-3 border-r border-white/15 uppercase">CHUYẾN BAY DỰ KIẾN</td>
                            <td colSpan={3} className="p-3 text-left pl-8 space-y-1 font-mono text-[11px]">
                              <div className="text-slate-300">VJ3674 SGN ENH 14:35 – 19:00</div>
                              <div className="text-slate-300">VJ3675 ENH SGN 20:00 – 23:05</div>
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* GIÁ TOUR BAO GỒM */}
                  <div className="space-y-2 pt-2">
                    <h3 className="font-black text-white text-sm uppercase">GIÁ TOUR BAO GỒM</h3>
                    <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                      <li>Vé máy bay khứ hồi Hồ Chí Minh – Ân Thi – Hồ Chí Minh bao gồm 07kg hành lý xách tay + 20kg hành lý ký gửi.</li>
                      <li>Phí an ninh, phí xăng dầu, thuế sân bay 2 nước.</li>
                      <li>Xe du lịch và vé tham quan theo chương trình.</li>
                      <li>Các bữa ăn chính theo chương trình. <i className="text-slate-400">(mức ăn 40 RMB/khách/bữa)</i></li>
                      <li>Khách sạn tiêu chuẩn 4 sao địa phương. <i className="text-slate-400">(02 người/phòng)</i></li>
                      <li>Trưởng đoàn và HDV địa phương phục vụ suốt tuyến theo chương trình.</li>
                    </ul>
                  </div>

                  {/* THÔNG TIN CHI TIẾT KHI BẤM XEM THÊM */}
                  {isPolicyExpanded && (
                    <div className="space-y-6 pt-4 border-t border-white/10 animate-fade-in">
                      
                      {/* GIÁ TOUR KHÔNG BAO GỒM */}
                      <div className="space-y-2">
                        <h3 className="font-black text-white text-sm uppercase">GIÁ TOUR KHÔNG BAO GỒM</h3>
                        <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                          <li>Chi phí làm hộ chiếu.</li>
                          <li>Phụ thu phòng đơn: 4.500.000 VND/khách/tour <i className="text-slate-400">(Không áp dụng Lễ, Tết)</i></li>
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
                        <h3 className="font-black text-white text-sm uppercase">ĐIỀU KIỆN HỦY (Không áp dụng cho Lễ, Tết)</h3>
                        <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                          <li>Ngay sau khi đăng ký tour, Quý khách vui lòng đóng cọc 60% tổng giá tour, phần còn lại vui lòng thanh toán trước 15 ngày tour khởi hành.</li>
                          <li>Hủy tour ngay sau khi Đại Sứ Quán, Lãnh Sự Quán đã cấp visa: Chi phí hủy tour là 100% trên tổng giá tour.</li>
                          <li>Hủy tour sau khi đăng ký: Phí hủy tour là 60% cọc và chi phí visa và vé máy bay nếu có.</li>
                          <li>Hủy tour trước 15 ngày khởi hành: Phí hủy tour là 90% trên tổng giá tour.</li>
                          <li>Hủy tour sau thời gian trên: Phí hủy tour là 100% trên tổng giá tour.</li>
                        </ul>
                        <p className="text-[11px] italic text-slate-400 pt-1">
                          Thời gian hủy tour và thanh toán được tính theo ngày làm việc, không tính Thứ 7, Chủ Nhật và các ngày Lễ, Tết.
                        </p>
                      </div>

                      {/* CHÍNH SÁCH TRẺ EM, EM BÉ */}
                      <div className="space-y-2">
                        <h3 className="font-black text-white text-sm uppercase">CHÍNH SÁCH TRẺ EM, EM BÉ</h3>
                        <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                          <li>Em bé: Dưới 02 tuổi <i className="text-slate-400">(ngủ chung giường với bố, mẹ)</i></li>
                          <li>Trẻ em: Từ 02 đến dưới 10 tuổi <i className="text-slate-400">(ngủ chung giường với bố, mẹ)</i></li>
                          <li>Trẻ em từ 10 tuổi trở lên được tính như người lớn.</li>
                          <li>Trẻ em ngủ giường riêng tính 100% giá tour.</li>
                        </ul>
                      </div>

                      {/* QUY ĐỊNH MUA TOUR VÀ THANH TOÁN */}
                      <div className="space-y-2">
                        <h3 className="font-black text-white text-sm uppercase">QUY ĐỊNH MUA TOUR VÀ THANH TOÁN</h3>
                        <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                          <li>Khách hàng điền phiếu đăng ký và cung cấp hồ sơ xin visa trước ngày khởi hành ít nhất 15 ngày.</li>
                          <li>Đóng tiền cọc tour 60% tổng giá tour <i className="text-slate-400">(gồm phí visa + vé máy bay)</i>.</li>
                          <li>Khách có quốc tịch được miễn visa hoặc đã có visa, chúng tôi sẽ trừ lại 500.000 VND/khách.</li>
                        </ul>
                      </div>

                      {/* LƯU Ý */}
                      <div className="space-y-2">
                        <h3 className="font-black text-white text-sm uppercase">LƯU Ý</h3>
                        <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                          <li>Trẻ em dưới 16 tuổi phải có bố mẹ đi cùng. Trường hợp trẻ em đi với người nhà <i className="text-slate-400">(không phải Bố Mẹ)</i>, phải nộp kèm giấy đồng ý cho con đi du lịch được chính quyền địa phương xác nhận <i className="text-slate-400">(do Bố Mẹ ủy quyền cho người thân dẫn đi du lịch)</i>.</li>
                          <li>Quý khách có yêu cầu ở phòng đơn, vui lòng thanh toán thêm tiền phụ thu.</li>
                          <li>Thứ tự các điểm tham quan và lộ trình chuyến đi có thể thay đổi tùy theo tình hình thực tế <i className="text-slate-400">(thời tiết, giao thông, ...)</i> nhưng vẫn đảm bảo đầy đủ các điểm tham quan như lúc đầu.</li>
                          <li>Chương trình có các điểm shopping: Cửa hàng thuốc, đá quý, tơ lụa.</li>
                          <li>Nếu quý khách mang quốc tịch khác, hoặc nhiều quốc tịch. Xin vui lòng chủ động báo lại chúng tôi trước khi chốt tour.</li>
                          <li>Trường hợp quý khách ngoại quốc <i className="text-slate-400">(không phải Việt Kiều)</i>, phía Trung Quốc sẽ phụ thu 100 USD/khách.</li>
                          <li>Khách từ 70 đến dưới 75 tuổi yêu cầu ký cam kết sức khỏe với Công ty.</li>
                          <li>Quý khách từ 75 tuổi trở lên yêu cầu phải có giấy xác nhận đầy đủ sức khỏe đi du lịch nước ngoài của bác sĩ + giấy cam kết sức khỏe với Công ty và phải có người thân dưới 60 tuổi <i className="text-slate-400">(đầy đủ sức khỏe)</i> đi theo. Ngoài ra, khách trên 75 tuổi vui lòng đóng thêm phí bảo hiểm cao cấp.</li>
                          <li>Không nhận khách từ 80 tuổi trở lên.</li>
                          <li>Quý khách mang thai xin vui lòng báo cho Công ty khi đăng ký tour để được tư vấn thêm thông tin. Không nhận khách mang thai từ 05 tháng trở lên vì lý do an toàn.</li>
                          <li>Giá tour không bao gồm visa tái nhập Việt Nam đối với khách Việt Kiều & Ngoại kiều.</li>
                          <li>Giá Công ty đưa ra là giá trung bình áp dụng cho 01 khách cho đoàn ghép lẻ từ 20 khách.</li>
                        </ul>
                      </div>

                    </div>
                  )}

                  {/* NÚT XEM THÊM / THU GỌN */}
                  <div className="text-center pt-4 border-t border-white/10">
                    <button
                      onClick={() => setIsPolicyExpanded(!isPolicyExpanded)}
                      className="px-6 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-sky-300 font-extrabold text-xs transition inline-flex items-center gap-1.5 shadow-sm border border-white/10 cursor-pointer"
                    >
                      {isPolicyExpanded ? 'Thu gọn ^' : 'Xem thêm v'}
                    </button>
                  </div>

                </div>
              )}

              {/* TAB CONTENT: Câu hỏi thường gặp */}
              {activeTab === 'faq' && (
                <div className="p-6 space-y-4 text-sm text-slate-300">
                  {[
                    { q: 'Tour đã bao gồm visa chưa?', a: 'Đối với tour Trung Quốc Ân Thi - Phượng Hoàng Cổ Trấn, giá tour đã bao gồm phí Visa đoàn nhập cảnh.' },
                    { q: 'Trẻ em dưới 2 tuổi tính giá thế nào?', a: 'Trẻ em dưới 2 tuổi tính 30% giá tour người lớn và không có giường riêng.' },
                    { q: 'Có hỗ trợ tách đoàn tự do không?', a: 'Theo quy định du lịch theo đoàn của chính phủ Trung Quốc, khách hàng không được tự ý tách đoàn.' },
                  ].map((faq, i) => (
                    <div key={i} className="bg-white/[0.03] p-4 rounded-xl border border-white/10 space-y-1.5">
                      <div className="font-bold text-white flex items-center gap-2">
                        <HelpCircle className="h-4 w-4 text-sky-400" /> {faq.q}
                      </div>
                      <div className="text-xs text-slate-300 pl-6 leading-relaxed">{faq.a}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB CONTENT: Đánh giá */}
              {activeTab === 'reviews' && (
                <div className="p-6 space-y-6">
                  {/* Verified User Review Restriction Notice */}
                  {eligibleToReview ? (
                    <form onSubmit={handleReviewSubmit} className="bg-white/[0.03] p-5 rounded-2xl border border-white/10 space-y-4">
                      <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                        <UserCheck className="h-5 w-5" />
                        <span>Tài khoản đã hoàn thành tour - Viết Đánh Giá Thực Tế</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-300">Số sao:</span>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setNewRating(star)}
                            className="p-1 focus:outline-none cursor-pointer"
                          >
                            <Star className={`h-5 w-5 ${star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                          </button>
                        ))}
                      </div>

                      <div>
                        <textarea
                          rows={3}
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Chia sẻ nhận xét chân thực về chuyến đi, chất lượng phục vụ và món ăn..."
                          className="w-full rounded-xl border border-white/10 p-3 text-xs focus:border-sky-400 focus:outline-none bg-white/[0.05] text-white placeholder-slate-500"
                          required
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-slate-400" />
                        <input
                          type="url"
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          placeholder="URL ảnh thực tế chuyến đi (tùy chọn)..."
                          className="flex-1 rounded-xl border border-white/10 px-3 py-1.5 text-xs focus:border-sky-400 focus:outline-none bg-white/[0.05] text-white placeholder-slate-500"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white px-5 py-2.5 text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-sky-500/20 cursor-pointer"
                      >
                        <Send className="h-3.5 w-3.5" /> Gửi Đánh Giá
                      </button>
                    </form>
                  ) : (
                    <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex items-center gap-3 text-xs text-amber-300">
                      <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-400" />
                      <span>Chính sách minh bạch: Chỉ những tài khoản đã hoàn thành chuyến đi (trạng thái <strong>COMPLETED</strong>) mới được phép để lại bình luận và đính kèm ảnh thực tế.</span>
                    </div>
                  )}

                  {/* Existing Reviews List */}
                  <div className="space-y-4">
                    {reviews.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-4">Chưa có bình luận nào cho tour này.</p>
                    ) : (
                      reviews.map((rev) => (
                        <div key={rev.id} className="bg-white/[0.02] p-4 rounded-xl border border-white/8 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 font-bold flex items-center justify-center text-xs">
                                {rev.userName ? rev.userName.charAt(0) : 'U'}
                              </div>
                              <div>
                                <div className="text-xs font-bold text-white">{rev.userName}</div>
                                <div className="text-[10px] text-slate-400">{new Date(rev.createdAt).toLocaleDateString('vi-VN')}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-3.5 w-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-slate-300 pl-10 leading-relaxed">{rev.comment}</p>
                          {rev.imageUrl && (
                            <div className="pl-10 pt-2">
                              <img src={rev.imageUrl} alt="Review attachment" className="h-20 w-20 object-cover rounded-lg border border-white/10" />
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Summary Card (Matching Screenshot 2) */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-[#0a111d]/90 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl space-y-6 lg:sticky lg:top-24 z-10">
              
              <div className="space-y-2 border-b border-white/10 pb-4">
                <h2 className="text-base font-extrabold text-white leading-snug uppercase">
                  {tour.title}
                </h2>
                
                {/* Price Display */}
                <div className="pt-2">
                  <div className="text-xs text-slate-400 font-medium">Giá từ:</div>
                  <div className="text-3xl font-black text-rose-400 tracking-tight">
                    {tour.price.toLocaleString('vi-VN')} đ <span className="text-xs font-normal text-slate-400">/ Khách</span>
                  </div>
                </div>
              </div>

              {/* Details Specs Table matching Reference Image 2 */}
              <div className="space-y-3 text-xs text-slate-300">
                <div className="space-y-1.5 pb-2 border-b border-white/10">
                  <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-sky-400" /> Chọn Lịch Khởi Hành:
                  </label>
                  {schedulesWithDynamicSeats.length === 0 ? (
                    <div className="rounded-xl bg-amber-500/10 p-3 border border-amber-500/30 text-xs font-semibold text-amber-300">
                      ⚠️ Các đợt khởi hành của tour này đã kết thúc hoặc quá hạn.
                    </div>
                  ) : (
                    <select
                      value={selectedScheduleId}
                      onChange={(e) => setSelectedScheduleId(Number(e.target.value))}
                      className="w-full rounded-xl border border-white/15 bg-slate-900/90 p-2.5 text-xs font-bold text-white focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 shadow-inner cursor-pointer"
                    >
                      {schedulesWithDynamicSeats.map((sch) => (
                        <option key={sch.id} value={sch.id} disabled={sch.seats <= 0} className="bg-slate-900 text-white">
                          📅 {sch.startDate} - {sch.endDate} ({sch.seats > 0 ? `${sch.seats} chỗ` : 'HẾT CHỖ'}) - {sch.note}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5"><Clock className="h-4 w-4 text-sky-400" /> Thời gian:</span>
                  <span className="font-bold text-white">{tour.durationDays} ngày {tour.durationNights} đêm</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5"><MapPin className="h-4 w-4 text-sky-400" /> Nơi khởi hành:</span>
                  <span className="font-bold text-white">{tour.departureLocation}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5"><Tag className="h-4 w-4 text-sky-400" /> Số chỗ còn nhận:</span>
                  <span className={`font-bold px-2 py-0.5 rounded text-xs ${
                    selectedSchedule.seats > 0 
                      ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30' 
                      : 'text-rose-400 bg-rose-500/10 border border-rose-500/30'
                  }`}>
                    {selectedSchedule.seats > 0 ? `${selectedSchedule.seats} chỗ` : 'Hết chỗ (0 chỗ)'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-sky-400" /> Mã tour:</span>
                  <span className="font-bold text-sky-400">{tour.tourCode || 'DAHT14VQDZ'}</span>
                </div>
              </div>

              {/* Guest Selector Counter */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">Người lớn (từ 12 tuổi)</div>
                    <div className="text-[10px] text-slate-400">{tour.price.toLocaleString('vi-VN')} đ / khách</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      className="h-7 w-7 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-white font-bold border border-white/10 flex items-center justify-center text-xs transition cursor-pointer"
                    >-</button>
                    <span className="font-bold text-sm w-4 text-center text-white">{adults}</span>
                    <button 
                      onClick={() => setAdults(adults + 1)}
                      className="h-7 w-7 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-white font-bold border border-white/10 flex items-center justify-center text-xs transition cursor-pointer"
                    >+</button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">Trẻ em (2 - 11 tuổi)</div>
                    <div className="text-[10px] text-slate-400">{childPriceVal.toLocaleString('vi-VN')} đ / khách</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setChildren(Math.max(0, children - 1))}
                      className="h-7 w-7 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-white font-bold border border-white/10 flex items-center justify-center text-xs transition cursor-pointer"
                    >-</button>
                    <span className="font-bold text-sm w-4 text-center text-white">{children}</span>
                    <button 
                      onClick={() => setChildren(children + 1)}
                      className="h-7 w-7 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-white font-bold border border-white/10 flex items-center justify-center text-xs transition cursor-pointer"
                    >+</button>
                  </div>
                </div>
              </div>

              {/* Voucher Application Form */}
              <div className="space-y-2 pt-3 border-t border-white/10">
                <label className="text-[11px] font-bold text-slate-300">Mã giảm giá (Voucher):</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    placeholder="Nhập mã (Ví dụ: SUMMER2026)"
                    className="flex-1 rounded-xl border border-white/10 px-3 py-2 text-xs focus:border-sky-400 focus:outline-none uppercase font-semibold bg-white/[0.05] text-white placeholder-slate-500"
                  />
                  <button
                    onClick={handleApplyVoucher}
                    className="rounded-xl bg-white/[0.1] hover:bg-white/[0.18] text-white border border-white/15 px-3.5 py-2 text-xs font-bold transition cursor-pointer"
                  >
                    Áp dụng
                  </button>
                </div>
                {voucherMsg && (
                  <p className={`text-[11px] font-semibold ${voucherMsg.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {voucherMsg.text}
                  </p>
                )}
              </div>

              {/* Total Calculation Breakdown */}
              <div className="bg-white/[0.03] p-4 rounded-xl border border-white/10 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Tạm tính ({adults} NL, {children} TE):</span>
                  <span className="text-slate-200 font-semibold">{subtotal.toLocaleString('vi-VN')} đ</span>
                </div>
                {voucherDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Giảm giá Voucher:</span>
                    <span>-{voucherDiscount.toLocaleString('vi-VN')} đ</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-white pt-2 border-t border-white/10">
                  <span>Tổng tiền:</span>
                  <span className="text-rose-400">{finalTotal.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>

              {/* CTA Action Buttons (Matching Screenshot 2) */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleBookNow}
                  disabled={selectedSchedule.seats <= 0}
                  className={`w-full rounded-xl py-3.5 text-sm font-black transition flex items-center justify-center gap-2 cursor-pointer ${
                    selectedSchedule.seats <= 0 
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5' 
                      : 'bg-gradient-to-r from-sky-500 via-cyan-500 to-sky-600 hover:from-sky-400 hover:to-cyan-400 text-white shadow-[0_0_20px_rgba(56,189,248,0.35)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] active:scale-[0.99]'
                  }`}
                >
                  {selectedSchedule.seats <= 0 ? 'Lịch Này Đã Hết Chỗ' : 'Đặt ngay'}
                </button>
                
                <button
                  onClick={() => alert('Đội ngũ tư vấn viên Smart Travel đang sẵn sàng! Hotline hỗ trợ 24/7: 1900 6868')}
                  className="w-full rounded-xl border border-sky-400/40 text-sky-300 hover:bg-sky-500/10 hover:border-sky-400 py-3 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PhoneCall className="h-4 w-4" /> Liên hệ tư vấn
                </button>
              </div>

            </div>
          </aside>
        </div>

        {/* SECTION: CÓ THỂ BẠN SẼ THÍCH (Khớp 100% Screenshot 4) */}
        <div className="pt-12 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-white tracking-tight">Có thể bạn sẽ thích</h3>
            <button 
              onClick={() => {
                const el = document.getElementById('recommended-carousel');
                if (el) el.scrollBy({ left: 320, behavior: 'smooth' });
              }}
              className="h-10 w-10 rounded-full bg-white/[0.08] hover:bg-white/[0.16] text-white flex items-center justify-center transition border border-white/10 shadow-sm cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div id="recommended-carousel" className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-x-auto pb-4">
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
              <div key={rec.id} className="bg-[#0a111d]/80 backdrop-blur-md rounded-2xl border border-white/10 hover:border-sky-500/40 overflow-hidden shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col justify-between group">
                <div>
                  <div className="h-48 overflow-hidden relative bg-slate-900">
                    <img src={rec.img} alt={rec.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  </div>

                  <div className="p-4 space-y-3">
                    <h4 className="font-black text-xs text-white uppercase line-clamp-2 leading-snug group-hover:text-sky-300 transition">
                      {rec.title}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                      <span>👁 Lượt xem: {rec.views}</span>
                      <span>★ Đánh giá: 0/5</span>
                      <span>📌 Đặt chỗ: 0</span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-300 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-sky-400" />
                        <span>Khởi hành: <strong className="text-white">{rec.departure}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-sky-400" />
                        <span>Thời gian: <strong className="text-white">{rec.duration}</strong></span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="text-[11px] text-slate-400">Giá từ</div>
                      <div className="text-lg font-black text-rose-400">
                        {rec.price.toLocaleString('vi-VN')} đ <span className="text-[11px] font-normal text-slate-400">/ Khách</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium mt-1">
                        Còn lại <strong className="text-white">{rec.remaining}</strong> chỗ
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
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-between p-4 sm:p-6 select-none animate-fade-in"
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
              className="z-10 max-w-5xl mx-auto w-full overflow-x-auto pb-2 pt-1 flex items-center justify-center gap-2.5 px-4 scrollbar-thin"
              onClick={(e) => e.stopPropagation()}
            >
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
          )}
        </div>
      )}
    </div>
  );
};
