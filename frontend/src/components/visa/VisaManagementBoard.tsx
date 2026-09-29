import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { VisaApplicationResponse, VisaApplicationStatus } from '../../types/visa';
import { visaService } from '../../services/visaService';
import { VisaDocumentReviewModal } from './VisaDocumentReviewModal';

export const VisaManagementBoard: React.FC = () => {
  const [applications, setApplications] = useState<VisaApplicationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedApp, setSelectedApp] = useState<VisaApplicationResponse | null>(null);

  const fetchApplications = async () => {
    try {
      const res = await visaService.getAllApplications();
      setApplications(res);
      // Update selected app if modal is open
      if (selectedApp) {
        const updated = res.find(a => a.id === selectedApp.id);
        if (updated) setSelectedApp(updated);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách visa:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const filteredApps = applications.filter((app) => {
    const matchStatus = filterStatus === 'ALL' || app.status === filterStatus;
    const matchSearch = app.bookingId.toString().includes(searchTerm);
    return matchStatus && matchSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle size={14} /> Đã duyệt</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle size={14} /> Từ chối</span>;
      case 'PROCESSING':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><Clock size={14} /> Đang xử lý</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock size={14} /> Chờ hồ sơ</span>;
    }
  };

  const handleUpdateDocumentStatus = async (documentId: number, status: any, feedback?: string) => {
    try {
      await visaService.updateDocumentStatus(documentId, status, feedback);
      await fetchApplications();
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái giấy tờ', err);
    }
  };

  const handleUpdateApplicationStatus = async (status: VisaApplicationStatus, notes?: string) => {
    if (!selectedApp) return;
    try {
      await visaService.updateApplicationStatus(selectedApp.id, status, notes);
      await fetchApplications();
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái hồ sơ', err);
    }
  };

  const handleClearMockData = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ dữ liệu mẫu (Mock Data) của Hồ sơ Visa không?')) {
      localStorage.removeItem('mock_visa_apps');
      setApplications([]);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-slate-500 text-sm">Đang tải dữ liệu hồ sơ Visa...</div>;
  }

  return (
    <div className="bg-[#131d30] rounded-xl border border-white/10 text-white">
      <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Quản lý Hồ sơ Visa</h2>
          <p className="text-sm text-slate-400">Theo dõi và xét duyệt hồ sơ Visa của khách hàng.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm theo Mã Booking..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-700/50 bg-slate-800/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 w-full sm:w-64 placeholder-slate-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-8 py-2 border border-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none bg-slate-800/50 text-white cursor-pointer"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING_DOCS">Chờ nộp hồ sơ</option>
              <option value="PROCESSING">Đang xử lý</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="REJECTED">Bị từ chối</option>
            </select>
          </div>
          <button 
            onClick={handleClearMockData}
            className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 rounded-lg text-sm font-medium transition-colors"
            title="Xóa toàn bộ dữ liệu mẫu (Mock Data) trên trình duyệt này"
          >
            Làm mới (Clear Mock)
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-slate-300 text-sm border-b border-white/10">
              <th className="py-3 px-6 font-semibold">Khách hàng / Tour</th>
              <th className="py-3 px-6 font-semibold">Tiến độ giấy tờ</th>
              <th className="py-3 px-6 font-semibold">Trạng thái Visa</th>
              <th className="py-3 px-6 font-semibold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredApps.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500">
                  Không tìm thấy hồ sơ nào phù hợp.
                </td>
              </tr>
            ) : (
              filteredApps.map((app) => {
                const totalDocs = app.documents.length;
                const approvedDocs = app.documents.filter(d => d.status === 'APPROVED').length;
                
                return (
                  <tr key={app.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-white flex items-center gap-2">
                        {app.customerName || 'Khách vãng lai'} 
                        <span className="text-xs font-normal text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded-md border border-sky-400/20">#{app.bookingId}</span>
                      </div>
                      <div className="text-sm text-slate-400 mt-1 line-clamp-1 max-w-[250px]" title={app.tourTitle}>
                        {app.tourTitle || 'Tour du lịch quốc tế'}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-slate-800/50 rounded-full h-2.5 max-w-[150px] border border-white/5">
                          <div 
                            className="bg-sky-500 h-2.5 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(14,165,233,0.5)]" 
                            style={{ width: `${totalDocs === 0 ? 0 : (approvedDocs / totalDocs) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-slate-400 font-medium">{approvedDocs}/{totalDocs}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(app.status)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => setSelectedApp(app)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-md text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        <Eye size={16} />
                        Xem & Duyệt
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedApp && (
        <VisaDocumentReviewModal
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
          onUpdateDocumentStatus={handleUpdateDocumentStatus}
          onUpdateApplicationStatus={handleUpdateApplicationStatus}
        />
      )}
    </div>
  );
};
