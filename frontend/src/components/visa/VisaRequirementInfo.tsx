import React from 'react';
import { ShieldAlert, Info, CheckCircle2 } from 'lucide-react';
import { VisaRequirementResponse } from '../../types/visa';

interface Props {
  requirements: VisaRequirementResponse[];
}

export const VisaRequirementInfo: React.FC<Props> = ({ requirements }) => {
  if (!requirements || requirements.length === 0) {
    return null;
  }

  return (
    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <ShieldAlert className="text-blue-600" size={24} />
        <h3 className="text-lg font-bold text-gray-800">Thủ tục Visa (Bắt buộc)</h3>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Tour này yêu cầu quý khách phải có Visa hợp lệ. Dưới đây là danh sách các giấy tờ cơ bản cần chuẩn bị để Đại lý hỗ trợ xin Visa:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {requirements.map((req) => (
          <div key={req.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-start gap-3">
            <CheckCircle2 className="text-blue-500 mt-0.5 shrink-0" size={18} />
            <div>
              <h4 className="font-semibold text-gray-800 text-sm">
                {req.documentName} {req.isMandatory && <span className="text-red-500">*</span>}
              </h4>
              {req.description && (
                <p className="text-xs text-gray-500 mt-1">{req.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-start gap-2 bg-yellow-50 text-yellow-800 p-3 rounded-lg text-xs">
        <Info size={16} className="shrink-0 mt-0.5" />
        <p>Quý khách có thể nộp bản mềm (ảnh chụp/scan) ngay sau khi thanh toán thành công trong phần Quản lý đơn hàng. Đại lý sẽ liên hệ để thu bản cứng nếu Đại sứ quán yêu cầu.</p>
      </div>
    </div>
  );
};
