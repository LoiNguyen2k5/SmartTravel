import React from 'react';
import { Globe as Passport } from 'lucide-react'; // Passport icon available in modern lucide

interface Props {
  hasVisaConfig: boolean;
  isOptedIn: boolean;
  onToggleOptIn: (val: boolean) => void;
  pricePerPerson?: number; // optional addon price
}

export const CheckoutVisaAddon: React.FC<Props> = ({ hasVisaConfig, isOptedIn, onToggleOptIn, pricePerPerson = 0 }) => {
  if (!hasVisaConfig) return null;

  return (
    <div className={`mt-6 p-5 border rounded-xl transition-all ${isOptedIn ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200 bg-white'}`}>
      <label className="flex items-start gap-4 cursor-pointer">
        <div className="pt-1">
          <input
            type="checkbox"
            checked={isOptedIn}
            onChange={(e) => onToggleOptIn(e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Passport className="text-blue-600" size={20} />
            <span className="font-bold text-gray-800">Dịch vụ Hỗ trợ xin Visa</span>
          </div>
          <p className="text-sm text-gray-600">
            Ủy quyền cho chúng tôi hỗ trợ xử lý hồ sơ, làm thủ tục xin Visa nhanh chóng và tiện lợi. Bạn chỉ cần upload giấy tờ sau khi đặt tour.
          </p>
          {pricePerPerson > 0 && (
            <p className="text-sm font-semibold text-blue-700 mt-2">
              Phí dịch vụ: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pricePerPerson)} / người
            </p>
          )}
        </div>
      </label>
    </div>
  );
};
