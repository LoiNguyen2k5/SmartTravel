import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Lock, CheckCircle, XCircle, Clock } from 'lucide-react';
import { VisaApplicationResponse, VisaApplicationStatus, VisaDocumentStatus } from '../../types/visa';
import { visaService } from '../../services/visaService';
import { VisaDocumentReviewModal } from './VisaDocumentReviewModal';

export const VisaManagementBoard: React.FC = () => {
  const [applications, setApplications] = useState<VisaApplicationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedApp, setSelectedApp] = useState<VisaApplicationResponse | null>(null);

  const fetchApplications = async (syncSelected = true) => {
    try {
      const res = await visaService.getAllApplications();
      setApplications(res);
      if (syncSelected && selectedApp) {
        const updated = res.find((a) => a.id === selectedApp.id);
        if (updated) setSelectedApp(updated);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách hồ sơ Visa:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const filteredApps = applications.filter((app) => {
    const matchStatus = filterStatus === 'ALL' || app.status === filterStatus;
    const q = searchTerm.toLowerCase();
    const matchSearch =
      app.bookingId.toString().includes(searchTerm) ||
      (app.bookingCode?.toLowerCase().includes(q) ?? false) ||
      (app.customerName?.toLowerCase().includes(q) ?? false);
    return matchStatus && matchSearch;
  });

  const getStatusBadge = (status: VisaApplicationStatus) => {
    switch (status) {
      case 'APPROVED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300"><CheckCircle size={14} /> Bước 4 • ĐSQ đã cấp Visa</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/20 text-rose-300"><XCircle size={14} /> Bước 5 • ĐSQ từ chối</span>;
      case 'SUBMITTED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-500/20 text-sky-300"><Clock size={14} /> Bước 2 • Đại lý đã nộp ĐSQ</span>;
      case 'PROCESSING':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300"><Clock size={14} /> Bước 3 • Chờ kết quả ĐSQ</span>;
      case 'REVIEWING':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-300"><Clock size={14} /> Chờ Đại lý sơ duyệt</span>;
      case 'NEED_MORE_DOCS':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300"><Clock size={14} /> Bước 1 • Chờ khách bổ sung</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-700 text-slate-300"><Clock size={14} /> Chờ tải bản mềm</span>;
    }
  };

  const handleUpdateDocumentStatus = async (documentId: number, status: VisaDocumentStatus, feedback?: string) => {
    try {
      const updated = await visaService.updateDocumentStatus(documentId, status, feedback);
      setSelectedApp(updated);
      await fetchApplications();
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái giấy tờ', err);
    }
  };

  const handleUpdateApplicationStatus = async (
    status: VisaApplicationStatus,
    notes?: string,
    embassyReceiptCode?: string
  ): Promise<boolean> => {
    if (!selectedApp) return false;
    try {
      await visaService.updateApplicationStatus(selectedApp.id, status, notes, embassyReceiptCode);
      await fetchApplications(false);
      setSelectedApp(null);
      return true;
    } catch (err: any) {
      console.error('Lỗi cập nhật trạng thái hồ sơ', err);
      alert(err?.message || 'Không thể cập nhật tiến độ hồ sơ.');
      return false;
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-slate-500 text-sm">Đang tải dữ liệu hồ sơ Visa từ hệ thống...</div>;
  }

  return (
    <div className="bg-[#131d30] rounded-xl border border-white/10 text-white">
      <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Quản lý Dịch vụ Ủy quyền Hồ sơ Visa</h2>
          <p className="text-sm text-slate-400">Sơ duyệt bản mềm của khách, theo dõi nộp ĐSQ offline và ghi nhận kết quả trả về.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm mã booking / tên khách..."
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
              <option value="PENDING_DOCS">Chờ tải bản mềm</option>
              <option value="REVIEWING">Chờ Đại lý sơ duyệt</option>
              <option value="NEED_MORE_DOCS">Chờ khách bổ sung</option>
              <option value="SUBMITTED">Đại lý đã nộp ĐSQ</option>
              <option value="PROCESSING">Chờ kết quả ĐSQ</option>
              <option value="APPROVED">ĐSQ đã cấp Visa</option>
              <option value="REJECTED">ĐSQ từ chối</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-slate-300 text-sm border-b border-white/10">
              <th className="py-3 px-6 font-semibold">Khách hàng / Tour</th>
              <th className="py-3 px-6 font-semibold">Bản mềm đạt chuẩn</th>
              <th className="py-3 px-6 font-semibold">Tiến độ dịch vụ Visa</th>
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
                const approvedDocs = app.documents.filter((d) => d.status === 'APPROVED').length;

                return (
                  <tr key={app.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-white flex items-center gap-2">
                        {app.customerName || 'Khách hàng'}
                        <span className="text-xs font-normal text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded-md border border-sky-400/20">
                          #{app.bookingCode || app.bookingId}
                        </span>
                      </div>
                      <div className="text-sm text-slate-400 mt-1 line-clamp-1 max-w-[250px]" title={app.tourTitle}>
                        {app.tourTitle || 'Tour du lịch quốc tế'}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-slate-800/50 rounded-full h-2.5 max-w-[150px] border border-white/5">
                          <div
                            className="bg-sky-500 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${totalDocs === 0 ? 0 : (approvedDocs / totalDocs) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-slate-400 font-medium">{approvedDocs}/{totalDocs}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">{getStatusBadge(app.status)}</td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-md text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        {app.status === 'APPROVED' || app.status === 'REJECTED' ? (
                          <>
                            <Lock size={16} />
                            Xem hồ sơ (Đã chốt)
                          </>
                        ) : (
                          <>
                            <Eye size={16} />
                            Sơ duyệt & Cập nhật
                          </>
                        )}
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
