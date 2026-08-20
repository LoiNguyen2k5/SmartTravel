import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Download, FileText, X, Compass, MapPin, Clock, Sparkles, CheckCircle2, Loader2, Image as ImageIcon } from 'lucide-react';

export interface ActivityPdfItem {
  id: number;
  time: string;
  name: string;
  location: string;
  category: 'ATTRACTION' | 'RESTAURANT' | 'HOTEL' | 'TRANSPORT';
  categoryLabel: string;
  cost: number;
  imageUrl: string;
}

interface ItineraryPdfExporterProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  activities: ActivityPdfItem[];
  estimatedBudget: number;
  totalCost: number;
}

export const ItineraryPdfExporter: React.FC<ItineraryPdfExporterProps> = ({
  isOpen,
  onClose,
  title = 'Kế Hoạch Hành Trình Du Lịch Đà Nẵng - Hội An',
  activities,
  estimatedBudget,
  totalCost,
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  if (!isOpen) return null;

  const handleExportPdf = async () => {
    if (!printRef.current) return;
    setIsExporting(true);
    setExportSuccess(false);

    try {
      const element = printRef.current;

      // Ensure images are fully loaded before capturing
      const images = element.getElementsByTagName('img');
      const loadPromises = Array.from(images).map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      });
      await Promise.all(loadPromises);

      // Render canvas
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution output
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Multi-page handling if content exceeds one A4 page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`SmartTravel_LichTrinh_${Date.now()}.pdf`);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Đã xảy ra lỗi khi tạo file PDF. Vui lòng thử lại!');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-900 text-white shadow-md">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Xem Trước Bản In Lịch Trình PDF</h3>
              <p className="text-xs text-slate-500 font-medium">Lịch trình tự động ghép bộ sưu tập ảnh riêng cho từng địa điểm theo đúng thứ tự chuyến đi</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportPdf}
              disabled={isExporting}
              className={`rounded-2xl px-5 py-2.5 text-xs font-extrabold text-white transition-all shadow-md flex items-center gap-2 ${
                isExporting 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95'
              }`}
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Đang tạo PDF...
                </>
              ) : exportSuccess ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-white" /> Đã tải file PDF!
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" /> Xuất & Tải File PDF
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Container */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100">
          <div className="max-w-[794px] mx-auto bg-white shadow-lg rounded-2xl overflow-hidden" ref={printRef}>
            
            {/* PDF Header Banner */}
            <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-sky-900 text-white p-8 space-y-4 relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-10 translate-x-8 -translate-y-4">
                <Compass className="h-64 w-64 text-white" />
              </div>
              
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 text-sky-300 text-xs font-bold uppercase tracking-widest">
                    <Sparkles className="h-4 w-4" /> SMART TRAVEL - KẾ HOẠCH HÀNH TRÌNH
                  </div>
                  <h1 className="text-2xl font-black mt-1 text-white tracking-tight">{title}</h1>
                </div>

                <div className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/20 text-right">
                  <span className="text-[10px] text-sky-200 uppercase font-semibold block">Ngày Xuất Lịch Trình</span>
                  <span className="text-xs font-extrabold text-white">{new Date().toLocaleDateString('vi-VN')}</span>
                </div>
              </div>

              {/* Summary Stats Strip */}
              <div className="relative z-10 grid grid-cols-3 gap-3 pt-2">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                  <span className="text-[10px] text-sky-200 block font-semibold">TỔNG SỐ ĐỊA ĐIỂM</span>
                  <span className="text-lg font-black text-white">{activities.length} ĐIỂM ĐẾN</span>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                  <span className="text-[10px] text-sky-200 block font-semibold">DỰ TOÁN CHI PHÍ</span>
                  <span className="text-lg font-black text-amber-300">{totalCost.toLocaleString('vi-VN')} đ</span>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                  <span className="text-[10px] text-sky-200 block font-semibold">HẠN MỨC NGÂN SÁCH</span>
                  <span className="text-lg font-black text-emerald-300">{estimatedBudget.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>
            </div>

            {/* Destination Gallery Grid Section (Matching user UI reference) */}
            <div className="p-8 pb-4 bg-white border-b border-slate-100 space-y-3">
              <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                <ImageIcon className="h-4 w-4 text-sky-600" />
                <span>Bộ Sưu Tập Hình Ảnh 4 Địa Điểm Du Lịch Thực Tế</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {activities.slice(0, 4).map((act, idx) => (
                  <div key={act.id} className="relative rounded-2xl overflow-hidden border border-slate-200 group h-44 shadow-sm bg-slate-100">
                    <img
                      src={act.imageUrl}
                      alt={act.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      crossOrigin="anonymous"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-3 text-white">
                      <span className="text-[10px] font-bold text-sky-300 uppercase tracking-wider">
                        #{idx + 1} - {act.time}
                      </span>
                      <h4 className="text-xs font-black truncate">{act.name}</h4>
                      <span className="text-[10px] text-slate-300 flex items-center gap-1">
                        <MapPin className="h-2.5 w-2.5 text-sky-400" /> {act.location}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activities Timeline in Sorted Order */}
            <div className="p-8 space-y-6 bg-slate-50">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Compass className="h-4 w-4 text-sky-600" /> Chi Tiết Hành Trình Theo Thứ Tự Khởi Hành
                </h2>
                <span className="text-xs font-bold text-slate-500">Thứ tự: Từ điểm đầu tiên đến điểm cuối</span>
              </div>

              <div className="space-y-4">
                {activities.map((act, index) => (
                  <div 
                    key={act.id} 
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {/* Sequence Order Number Badge */}
                        <div className="h-10 w-10 rounded-2xl bg-sky-900 text-white font-black text-sm flex items-center justify-center shadow-md flex-shrink-0">
                          #{index + 1}
                        </div>

                        {/* Thumbnail image right in timeline card */}
                        <img
                          src={act.imageUrl}
                          alt={act.name}
                          className="w-16 h-16 rounded-xl object-cover border border-slate-200 flex-shrink-0 shadow-sm"
                          crossOrigin="anonymous"
                        />

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="bg-slate-900 text-white font-mono text-xs font-black px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                              <Clock className="h-3 w-3 text-sky-400" /> {act.time}
                            </span>
                            <span className="bg-sky-100 text-sky-800 text-[11px] font-bold px-2.5 py-0.5 rounded-lg">
                              {act.categoryLabel}
                            </span>
                          </div>
                          <h3 className="text-sm font-extrabold text-slate-900 mt-1">{act.name}</h3>
                          <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5 font-medium">
                            <MapPin className="h-3 w-3 text-sky-600" />
                            <span>{act.location}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="text-[11px] text-slate-400 font-semibold block">Chi phí dự kiến</span>
                        <span className="text-sm font-black text-rose-600">
                          {act.cost > 0 ? `${act.cost.toLocaleString('vi-VN')} đ` : 'Miễn phí'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PDF Footer Branding */}
            <div className="bg-white border-t border-slate-200 px-8 py-5 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2 font-bold text-slate-700">
                <Compass className="h-4 w-4 text-sky-600" />
                <span>Smart Travel Planner © 2026</span>
              </div>
              <p className="italic text-[11px]">Chúc bạn có chuyến du lịch trải nghiệm tuyệt vời & an toàn!</p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
