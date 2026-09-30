import React, { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, FileText, AlertCircle, Clock } from 'lucide-react';
import { VisaApplicationResponse, VisaDocumentStatus, VisaApplicationStatus } from '../../types/visa';

interface Props {
  application: VisaApplicationResponse;
  onClose: () => void;
  onUpdateDocumentStatus: (documentId: number, status: VisaDocumentStatus, feedback?: string) => void;
  onUpdateApplicationStatus: (status: VisaApplicationStatus, notes?: string) => void;
}

export const VisaDocumentReviewModal: React.FC<Props> = ({ 
  application, 
  onClose, 
  onUpdateDocumentStatus,
  onUpdateApplicationStatus 
}) => {
  const [activeDocId, setActiveDocId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [appNotes, setAppNotes] = useState(application.notes || '');
  const [localDocs, setLocalDocs] = useState(application.documents);

  useEffect(() => {
    setLocalDocs(application.documents);
  }, [application.documents]);

  const handleDocumentAction = (documentId: number, status: VisaDocumentStatus) => {
    // Phản hồi UI ngay lập tức
    setLocalDocs(prev => prev.map(d => (Number(d.id) === Number(documentId) || d.id === documentId) ? { ...d, status, vendorFeedback: status === 'REJECTED' ? feedback : undefined } : d));
    onUpdateDocumentStatus(documentId, status, status === 'REJECTED' ? feedback : undefined);
    setActiveDocId(null);
    setFeedback('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-[#131d30] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-700/60">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-700/50">
          <div>
            <h2 className="text-xl font-bold text-white">
              Duyệt Hồ Sơ Visa {application.customerName ? `- Khách: ${application.customerName}` : `- Booking #${application.bookingId}`}
            </h2>
            <p className="text-sm text-slate-400 mt-1">Trạng thái hiện tại: <span className="font-semibold text-white">{application.status}</span></p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0c1424] flex flex-col md:flex-row gap-6">
          
          {/* Left Column: Documents List */}
          <div className="flex-1 space-y-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Danh sách giấy tờ khách đã nộp</h3>
            
            {localDocs.length === 0 ? (
              <div className="text-center py-8 bg-[#131d30] rounded-xl border border-slate-700/50">
                <AlertCircle className="mx-auto text-yellow-500 mb-2" size={32} />
                <p className="text-slate-300">Khách hàng chưa nộp giấy tờ nào.</p>
              </div>
            ) : (
              localDocs.map((doc) => (
                <div key={doc.id} className="bg-[#131d30] rounded-xl border border-slate-700/50 overflow-hidden shadow-sm">
                  <div className="p-4 flex items-center justify-between border-b border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg">
                        <FileText size={20} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{doc.documentName}</h4>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-xs text-slate-400">Trạng thái:</span>
                          {doc.status === 'APPROVED' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              <CheckCircle size={13} className="text-emerald-400" /> Hợp lệ (Đã duyệt)
                            </span>
                          ) : doc.status === 'REJECTED' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              <XCircle size={13} className="text-rose-400" /> Bị từ chối
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              <Clock size={13} className="text-amber-400" /> Chờ duyệt
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <a 
                        href={doc.fileUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="px-3 py-1.5 text-xs font-bold text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 rounded-lg transition-colors border border-sky-500/20"
                      >
                        Xem file
                      </a>
                      <button 
                        onClick={() => setActiveDocId(activeDocId === doc.id ? null : doc.id)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border ${
                          activeDocId === doc.id
                            ? 'bg-sky-500 text-white border-sky-400'
                            : 'text-slate-300 bg-white/5 hover:bg-white/10 border-white/10'
                        }`}
                      >
                        {doc.status === 'PENDING' ? 'Đánh giá' : 'Đổi đánh giá'}
                      </button>
                    </div>
                  </div>

                  {/* Feedback Action Area */}
                  {activeDocId === doc.id && (
                    <div className="p-4 bg-slate-800/50 border-t border-slate-700/50">
                      <label className="block text-sm font-medium text-slate-300 mb-2">Lời nhắn / Lý do từ chối (nếu có)</label>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Nhập lý do giấy tờ không đạt yêu cầu..."
                        className="w-full px-3 py-2 border border-slate-700/50 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-[#131d30] text-white placeholder-slate-500 mb-3"
                        rows={2}
                      />
                      <div className="flex gap-3 justify-end">
                        <button
                          onClick={() => handleDocumentAction(doc.id, 'REJECTED')}
                          className="flex items-center gap-1 px-4 py-2 bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border border-rose-500/30 rounded-xl font-bold text-xs transition-colors"
                        >
                          <XCircle size={16} /> Từ chối
                        </button>
                        <button
                          onClick={() => handleDocumentAction(doc.id, 'APPROVED')}
                          className="flex items-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition-colors shadow-lg shadow-emerald-600/20"
                        >
                          <CheckCircle size={16} /> Hợp lệ (Duyệt)
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Display previous feedback if rejected */}
                  {doc.status === 'REJECTED' && doc.vendorFeedback && (
                    <div className="p-3 bg-red-500/10 text-sm text-red-400 border-t border-red-500/20">
                      <strong>Lý do từ chối:</strong> {doc.vendorFeedback}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Right Column: General Status update */}
          <div className="w-full md:w-80 space-y-6">
            <div className="bg-[#131d30] p-5 rounded-lg border border-slate-700/50 shadow-sm">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Cập nhật Tổng thể</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Ghi chú cho khách hàng</label>
                  <textarea
                    value={appNotes}
                    onChange={(e) => setAppNotes(e.target.value)}
                    placeholder="VD: Hồ sơ của bạn đã đủ, chúng tôi đang nộp ĐSQ..."
                    className="w-full px-3 py-2 border border-slate-700/50 rounded-md focus:ring-sky-500 focus:border-sky-500 text-sm bg-slate-800/50 text-white placeholder-slate-500"
                    rows={4}
                  />
                </div>
                
                <div className="pt-2">
                  <p className="block text-sm font-medium text-slate-300 mb-2">Chuyển trạng thái hồ sơ:</p>
                  <div className="grid grid-cols-1 gap-2">
                    <button 
                      onClick={() => onUpdateApplicationStatus('PROCESSING', appNotes)}
                      className="w-full text-center px-4 py-2 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-md hover:bg-sky-500/20 transition-colors font-medium text-sm"
                    >
                      Đang xử lý (Nộp ĐSQ)
                    </button>
                    <button 
                      onClick={() => onUpdateApplicationStatus('APPROVED', appNotes)}
                      className="w-full text-center px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-md hover:bg-green-500/20 transition-colors font-medium text-sm"
                    >
                      Đậu Visa (Hoàn tất)
                    </button>
                    <button 
                      onClick={() => onUpdateApplicationStatus('REJECTED', appNotes)}
                      className="w-full text-center px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-md hover:bg-red-500/20 transition-colors font-medium text-sm"
                    >
                      Rớt Visa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
