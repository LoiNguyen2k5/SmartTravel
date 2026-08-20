import React, { useState } from 'react';
import { Tour } from '../../types/tour';
import { BookingCreateRequest } from '../../types/booking';
import { Users, Calendar, CreditCard } from 'lucide-react';

interface TourBookingFormProps {
  tour: Tour;
  onSubmit?: (data: BookingCreateRequest) => void;
  isLoading?: boolean;
}

export const TourBookingForm: React.FC<TourBookingFormProps> = ({
  tour,
  onSubmit,
  isLoading = false,
}) => {
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [departureDate, setDepartureDate] = useState('');

  const totalPrice = tour.price * adults;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.({
      tourId: tour.id,
      tourScheduleId: 1,
      numberOfAdults: adults,
      numberOfChildren: children,
      departureDate,
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
      <h3 className="text-lg font-bold text-slate-900 border-b pb-3">Đặt Tour ngay</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            <Calendar className="inline h-3.5 w-3.5 mr-1" />Ngày khởi hành
          </label>
          <input
            type="date"
            required
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            <Users className="inline h-3.5 w-3.5 mr-1" />Số người lớn
          </label>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setAdults(Math.max(1, adults - 1))}
              className="h-8 w-8 rounded-lg border border-slate-300 font-bold hover:bg-slate-50">−</button>
            <span className="w-8 text-center font-bold">{adults}</span>
            <button type="button" onClick={() => setAdults(adults + 1)}
              className="h-8 w-8 rounded-lg border border-slate-300 font-bold hover:bg-slate-50">+</button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Số trẻ em</label>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setChildren(Math.max(0, children - 1))}
              className="h-8 w-8 rounded-lg border border-slate-300 font-bold hover:bg-slate-50">−</button>
            <span className="w-8 text-center font-bold">{children}</span>
            <button type="button" onClick={() => setChildren(children + 1)}
              className="h-8 w-8 rounded-lg border border-slate-300 font-bold hover:bg-slate-50">+</button>
          </div>
        </div>

        <div className="bg-sky-50 rounded-xl p-4 border border-sky-100">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Tổng cộng</span>
            <span className="font-extrabold text-sky-700 text-lg">
              {totalPrice.toLocaleString('vi-VN')} đ
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 py-3 text-sm font-bold text-white hover:bg-sky-500 transition disabled:opacity-50"
        >
          <CreditCard className="h-4 w-4" />
          {isLoading ? 'Đang xử lý...' : 'Đặt tour ngay'}
        </button>
      </form>
    </div>
  );
};
