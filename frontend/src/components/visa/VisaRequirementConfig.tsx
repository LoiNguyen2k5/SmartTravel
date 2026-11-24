import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, BookOpen, Check } from 'lucide-react';
import { VisaRequirementRequest, VisaTemplate } from '../../types/visa';
import { visaService } from '../../services/visaService';

interface Props {
  initialRequirements?: VisaRequirementRequest[];
  selectedTemplateId?: number | null;
  suggestCountry?: string;
  onSelectTemplate?: (templateId: number | null) => void;
  onSave: (requirements: VisaRequirementRequest[]) => void;
}

export const VisaRequirementConfig: React.FC<Props> = ({
  initialRequirements = [],
  selectedTemplateId,
  suggestCountry,
  onSelectTemplate,
  onSave,
}) => {
  const [requirements, setRequirements] = useState<VisaRequirementRequest[]>(initialRequirements);
  const [templates, setTemplates] = useState<VisaTemplate[]>([]);
  const [chosenTemplateId, setChosenTemplateId] = useState<string>(
    selectedTemplateId != null ? String(selectedTemplateId) : ''
  );
  const [templateAppliedMsg, setTemplateAppliedMsg] = useState<string>('');

  useEffect(() => {
    visaService
      .getTemplates(suggestCountry)
      .then((list) => setTemplates(list))
      .catch(() => setTemplates([]));
  }, [suggestCountry]);

  useEffect(() => {
    if (selectedTemplateId != null) {
      setChosenTemplateId(String(selectedTemplateId));
    }
  }, [selectedTemplateId]);

  useEffect(() => {
    if (initialRequirements && initialRequirements.length > 0) {
      setRequirements(initialRequirements);
    }
  }, [initialRequirements]);

  const handleApplyTemplate = (val: string) => {
    setChosenTemplateId(val);
    if (!val) {
      onSelectTemplate?.(null);
      return;
    }
    const tpl = templates.find((t) => String(t.id) === val);
    if (!tpl) return;

    onSelectTemplate?.(tpl.id);
    const docs = (tpl.documents || []).map((d) => ({
      documentName: d.documentName,
      description: d.description || '',
      isMandatory: d.isMandatory !== false,
    }));
    setRequirements(docs);
    setTemplateAppliedMsg(
      `Đã gắn mẫu Visa ${tpl.country} (${tpl.processingDays} ngày ĐSQ + ${tpl.bufferDays ?? 3} ngày sơ duyệt, ${docs.length} giấy tờ)`
    );
    setTimeout(() => setTemplateAppliedMsg(''), 5000);
  };

  const handleAdd = () => {
    setRequirements([...requirements, { documentName: '', description: '', isMandatory: true }]);
  };

  const handleRemove = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: keyof VisaRequirementRequest, value: string | boolean) => {
    const next = [...requirements];
    next[index] = { ...next[index], [field]: value };
    setRequirements(next);
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-6">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <div>
          <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
            Cấu hình Mẫu & Danh mục Hồ sơ Visa
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Gắn mẫu Visa theo quốc gia (nếu tour cần xin thị thực) hoặc để trống với tour miễn Visa (VD: Thái Lan, Singapore).
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-1.5 rounded-xl bg-[#0B3B49] px-4 py-2 text-xs font-bold text-white hover:bg-[#0F5264] transition"
        >
          <Plus size={16} />
          Thêm giấy tờ riêng
        </button>
      </div>

      {/* Chọn từ mẫu Backend */}
      <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-600">
              <BookOpen size={16} />
            </span>
            <div>
              <p className="text-xs font-bold text-slate-800">Thư Viện Mẫu Visa Quốc Gia (Từ hệ thống)</p>
              <p className="text-[11px] text-slate-500">
                Tự động đồng bộ số ngày xử lý, phí dịch vụ Đại lý và lệ phí Lãnh sự
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={chosenTemplateId}
              onChange={(e) => handleApplyTemplate(e.target.value)}
              className="bg-white border border-sky-200 text-xs font-semibold text-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:border-sky-500 shadow-sm"
            >
              <option value="">-- Miễn Visa / Không gắn mẫu --</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.flagEmoji || '🌐'} {t.country} ({t.processingDays} ngày xử lý • DV: {t.visaFee.toLocaleString('vi-VN')}đ)
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
        <div className="text-center py-8 text-[#526071] bg-slate-50 rounded-xl border border-dashed border-slate-300 text-xs">
          Tour này hiện không yêu cầu nộp hồ sơ Visa (Miễn thị thực). Chọn một Mẫu Visa phía trên nếu hành trình yêu cầu xin Visa.
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
                      placeholder="VD: Hộ chiếu gốc còn hạn 6 tháng"
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
                    placeholder="VD: Scan rõ nét trang thông tin có chữ ký..."
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
          className="flex items-center gap-2 rounded-2xl bg-[#0B3B49] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#0F5264] transition"
        >
          <Save size={16} />
          Lưu danh mục giấy tờ riêng cho Tour
        </button>
      </div>
    </div>
  );
};
