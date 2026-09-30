import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, BookOpen, Check } from 'lucide-react';
import { VisaRequirementRequest } from '../../types/visa';

const TEMPLATES_KEY = 'smart_travel_visa_templates';
const DEFAULT_TEMPLATES_MINIMAL = [
  {
    country: 'Nhật Bản', flagEmoji: '🇯🇵',
    documents: [
      { documentName: 'Hộ chiếu (còn hạn ít nhất 6 tháng)', description: 'Scan trang thông tin rõ nét.', isMandatory: true },
      { documentName: 'Ảnh thẻ 4x6 (nền trắng)', description: 'Chụp trong vòng 6 tháng, không đeo kính.', isMandatory: true },
      { documentName: 'Sao kê tài khoản 3 tháng', description: 'Số dư tối thiểu 30 triệu VND, có đóng dấu ngân hàng.', isMandatory: true },
      { documentName: 'Căn cước công dân (2 mặt)', description: 'Chụp rõ, không bị che.', isMandatory: true },
      { documentName: 'Giấy phép lao động / Hợp đồng việc làm', description: 'Xác nhận công tác.', isMandatory: false },
    ],
  },
  {
    country: 'Hàn Quốc', flagEmoji: '🇰🇷',
    documents: [
      { documentName: 'Hộ chiếu (còn hạn ít nhất 6 tháng)', description: 'Scan trang ảnh đầy đủ.', isMandatory: true },
      { documentName: 'Ảnh thẻ 3.5x4.5 (nền trắng)', description: 'Chụp trong vòng 6 tháng.', isMandatory: true },
      { documentName: 'Đơn xin cấp Visa (điền sẵn)', description: 'Mẫu do SmartTravel cung cấp.', isMandatory: true },
      { documentName: 'Sao kê tài khoản 3 tháng', description: 'Tối thiểu 15 triệu VND.', isMandatory: true },
    ],
  },
  {
    country: 'Khối Schengen (Châu Âu)', flagEmoji: '🇪🇺',
    documents: [
      { documentName: 'Hộ chiếu (còn hạn ít nhất 3 tháng sau ngày về)', description: 'Scan đầy đủ các trang có dấu.', isMandatory: true },
      { documentName: 'Bảo hiểm du lịch Schengen (30.000 EUR+)', description: 'Có hiệu lực toàn bộ hành trình.', isMandatory: true },
      { documentName: 'Xác nhận đặt phòng khách sạn', description: 'Toàn bộ hành trình.', isMandatory: true },
      { documentName: 'Sao kê tài khoản 6 tháng', description: 'Tối thiểu 50 triệu VND.', isMandatory: true },
    ],
  },
  {
    country: 'Trung Quốc', flagEmoji: '🇨🇳',
    documents: [
      { documentName: 'Hộ chiếu (còn hạn ít nhất 6 tháng)', description: 'Scan rõ nét trang ảnh.', isMandatory: true },
      { documentName: 'Ảnh thẻ 3.3x4.8 (nền trắng)', description: 'Ảnh màu, chụp trong 6 tháng.', isMandatory: true },
      { documentName: 'Đơn xin cấp Visa Trung Quốc', description: 'Điền chính xác, ký tên.', isMandatory: true },
      { documentName: 'Xác nhận đặt tour / Vé máy bay', description: 'Từ công ty du lịch.', isMandatory: true },
    ],
  },
];

interface Props {
  initialRequirements?: VisaRequirementRequest[];
  onSave: (requirements: VisaRequirementRequest[]) => void;
}

export const VisaRequirementConfig: React.FC<Props> = ({ initialRequirements = [], onSave }) => {
  const [requirements, setRequirements] = useState<VisaRequirementRequest[]>(initialRequirements);
  const [selectedTemplateCountry, setSelectedTemplateCountry] = useState<string>('');
  const [templateAppliedMsg, setTemplateAppliedMsg] = useState<string>('');

  // Load templates from localStorage or fallback
  const getAvailableTemplates = () => {
    try {
      const stored = localStorage.getItem(TEMPLATES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // fallback
    }
    return DEFAULT_TEMPLATES_MINIMAL;
  };

  const availableTemplates = getAvailableTemplates();

  useEffect(() => {
    if (initialRequirements && initialRequirements.length > 0) {
      setRequirements(initialRequirements);
    }
  }, [initialRequirements]);

  const handleApplyTemplate = (country: string) => {
    if (!country) return;
    const tpl = availableTemplates.find((t: any) => t.country === country);
    if (!tpl) return;
    
    const docs = tpl.documents.map((d: any) => ({
      documentName: d.documentName,
      description: d.description || '',
      isMandatory: d.isMandatory !== false,
    }));

    setRequirements(docs);
    setSelectedTemplateCountry(country);
    setTemplateAppliedMsg(`Đã áp dụng mẫu giấy tờ visa ${tpl.country} (${docs.length} giấy tờ)`);
    setTimeout(() => setTemplateAppliedMsg(''), 4000);
  };

  const handleAdd = () => {
    setRequirements([...requirements, { documentName: '', description: '', isMandatory: true }]);
  };

  const handleRemove = (index: number) => {
    const newReqs = [...requirements];
    newReqs.splice(index, 1);
    setRequirements(newReqs);
  };

  const handleChange = (index: number, field: keyof VisaRequirementRequest, value: string | boolean) => {
    const newReqs = [...requirements];
    newReqs[index] = { ...newReqs[index], [field]: value };
    setRequirements(newReqs);
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-6">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <div>
          <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">Cấu hình Hồ sơ Visa</h3>
          <p className="text-sm text-slate-500 mt-1">Thiết lập các giấy tờ bắt buộc khách hàng cần nộp để xin Visa cho tour này.</p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
        >
          <Plus size={16} />
          Thêm giấy tờ
        </button>
      </div>

      {/* Chọn từ mẫu có sẵn */}
      <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-600">
              <BookOpen size={16} />
            </span>
            <div>
              <p className="text-xs font-bold text-slate-800">Chọn nhanh từ Thư Viện Mẫu Visa</p>
              <p className="text-[11px] text-slate-500">Áp dụng mẫu giấy tờ chuẩn theo quốc gia thay vì tự nhập lại</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedTemplateCountry}
              onChange={(e) => handleApplyTemplate(e.target.value)}
              className="bg-white border border-sky-200 text-xs font-semibold text-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:border-sky-500 shadow-sm"
            >
              <option value="">-- Chọn quốc gia / Mẫu Visa --</option>
              {availableTemplates.map((t: any, idx: number) => (
                <option key={idx} value={t.country}>
                  {t.flagEmoji || '🌐'} Mẫu Visa {t.country} ({t.documents?.length || 0} giấy tờ)
                </option>
              ))}
            </select>
          </div>
        </div>
        {templateAppliedMsg && (
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
            <Check size={14} className="text-emerald-600" />
            {templateAppliedMsg}
          </div>
        )}
      </div>

      {requirements.length === 0 ? (
        <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-xs">
          Chưa có cấu hình giấy tờ Visa nào. Chọn mẫu phía trên hoặc bấm "Thêm giấy tờ" để bắt đầu.
        </div>
      ) : (
        <div className="space-y-4">
          {requirements.map((req, index) => (
            <div key={index} className="flex gap-4 items-start p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex-1 space-y-3">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Tên giấy tờ *</label>
                    <input
                      type="text"
                      value={req.documentName}
                      onChange={(e) => handleChange(index, 'documentName', e.target.value)}
                      placeholder="VD: Hộ chiếu bản gốc"
                      className="w-full px-4 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={req.isMandatory}
                        onChange={(e) => handleChange(index, 'isMandatory', e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                      />
                      <span className="text-xs font-bold text-slate-700">Bắt buộc</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Mô tả / Yêu cầu chi tiết</label>
                  <textarea
                    value={req.description}
                    onChange={(e) => handleChange(index, 'description', e.target.value)}
                    placeholder="VD: Hộ chiếu phải còn hạn ít nhất 6 tháng..."
                    className="w-full px-4 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 resize-none"
                    rows={2}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors mt-6"
                title="Xóa"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onSave(requirements)}
          className="flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
        >
          <Save size={16} />
          Lưu cấu hình Visa
        </button>
      </div>
    </div>
  );
};
