import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';

interface TourFilterProps {
  onSearch?: (keyword: string) => void;
}

export const TourFilter: React.FC<TourFilterProps> = ({
  onSearch,
}) => {
  const [keyword, setKeyword] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearch = () => {
    onSearch?.(keyword);
  };

  const handleReset = () => {
    setKeyword('');
    setMinPrice('');
    setMaxPrice('');
    setDuration('');
    onSearch?.('');
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Tìm kiếm tour theo tên, điểm đến..."
            className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-sm focus:border-sky-500 focus:outline-none"
          />
        </div>
        <button onClick={handleSearch} className="rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-sky-500 transition">
          Tìm
        </button>
        <button onClick={() => setIsExpanded(!isExpanded)} className="rounded-xl border border-slate-300 px-3 py-2.5 text-slate-500 hover:bg-slate-50 transition">
          <Filter className="h-4 w-4" />
        </button>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Giá từ (đ)</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="0"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Giá đến (đ)</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="10,000,000"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Số ngày</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:outline-none"
            >
              <option value="">Tất cả</option>
              <option value="2">1-2 ngày</option>
              <option value="4">3-4 ngày</option>
              <option value="7">5-7 ngày</option>
              <option value="99">Trên 7 ngày</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={handleReset} className="flex items-center gap-1 w-full justify-center rounded-xl border border-slate-300 py-2 text-xs text-slate-500 hover:bg-slate-50">
              <X className="h-3 w-3" /> Xóa bộ lọc
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
