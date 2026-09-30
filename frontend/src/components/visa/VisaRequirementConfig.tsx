import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { VisaRequirementRequest } from '../../types/visa';

interface Props {
  initialRequirements?: VisaRequirementRequest[];
  onSave: (requirements: VisaRequirementRequest[]) => void;
}

export const VisaRequirementConfig: React.FC<Props> = ({ initialRequirements = [], onSave }) => {
  const [requirements, setRequirements] = useState<VisaRequirementRequest[]>(initialRequirements);

  useEffect(() => {
    if (initialRequirements && initialRequirements.length > 0) {
      setRequirements(initialRequirements);
    }
  }, [initialRequirements]);

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

      {requirements.length === 0 ? (
        <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-xs">
          Chưa có cấu hình giấy tờ Visa nào. Bấm "Thêm giấy tờ" để bắt đầu.
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
