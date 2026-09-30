import React, { useRef, useState } from 'react';
import { UploadCloud, CheckCircle2, XCircle, Clock, FileText, AlertTriangle } from 'lucide-react';
import { VisaApplicationResponse, VisaRequirementResponse, VisaDocumentStatus } from '../../types/visa';

interface Props {
  application: VisaApplicationResponse;
  requirements: VisaRequirementResponse[];
  onUploadFile: (requirementId: number, file: File) => Promise<void>;
}

export const MyVisaTracker: React.FC<Props> = ({ application, requirements, onUploadFile }) => {
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedReqIdRef = useRef<number | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const reqId = selectedReqIdRef.current;
    if (e.target.files && e.target.files.length > 0 && reqId) {
      const file = e.target.files[0];
      setUploadingId(reqId);
      try {
        await onUploadFile(reqId, file);
      } finally {
        setUploadingId(null);
        selectedReqIdRef.current = null;
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const openFilePicker = (reqId: number) => {
    selectedReqIdRef.current = reqId;
    fileInputRef.current?.click();
  };

  const getStepStatus = (status: string) => {
    const steps = ['PENDING_DOCS', 'PROCESSING', 'APPROVED'];
    const currentIndex = steps.indexOf(status === 'REJECTED' ? 'PENDING_DOCS' : status);
    
    return steps.map((s, idx) => ({
      name: s === 'PENDING_DOCS' ? 'Nộp hồ sơ' : s === 'PROCESSING' ? 'Đang xử lý (ĐSQ)' : 'Đã cấp Visa',
      active: idx <= currentIndex,
      current: idx === currentIndex,
      isRejected: status === 'REJECTED' && idx === currentIndex
    }));
  };

  const getDocStatusIcon = (status: VisaDocumentStatus | undefined) => {
    if (status === 'APPROVED') return <CheckCircle2 className="text-green-500" size={20} />;
    if (status === 'REJECTED') return <XCircle className="text-red-500" size={20} />;
    if (status === 'PENDING') return <Clock className="text-blue-500" size={20} />;
    return <UploadCloud className="text-gray-400" size={20} />;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Tracker Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Tiến độ Hồ sơ Visa</h2>
        <p className="text-blue-100 opacity-90">Booking #{application.bookingId}</p>
        
        {/* Simple Stepper */}
        <div className="mt-8 flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/20 -z-0"></div>
          {getStepStatus(application.status).map((step, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md
                ${step.isRejected ? 'bg-red-500 text-white ring-4 ring-red-500/30' : 
                  step.current ? 'bg-white text-blue-600 ring-4 ring-white/30' : 
                  step.active ? 'bg-blue-300 text-white' : 'bg-white/20 text-white/50'}`}
              >
                {step.isRejected ? '!' : idx + 1}
              </div>
              <span className={`text-xs font-medium ${step.current || step.isRejected ? 'text-white' : 'text-blue-100/70'}`}>
                {step.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {application.status === 'REJECTED' && (
        <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3 text-red-800">
          <AlertTriangle className="shrink-0" size={24} />
          <div>
            <h4 className="font-bold">Rất tiếc, hồ sơ xin Visa của bạn đã bị từ chối.</h4>
            <p className="text-sm mt-1">{application.notes}</p>
          </div>
        </div>
      )}

      {/* Document Upload Section */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Danh sách giấy tờ cần nộp Online</h3>
        
        <div className="mb-5 bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-800 flex gap-2">
           <AlertTriangle className="shrink-0 text-blue-500 mt-0.5" size={18} />
           <p>
             Để tối ưu thời gian, quý khách chỉ cần tải lên trước (bản chụp/scan) <strong>các giấy tờ quan trọng nhất</strong> bên dưới để hệ thống thẩm định sơ bộ. Các giấy tờ gốc còn lại có thể bổ sung sau qua đường bưu điện!
           </p>
        </div>

        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*,.pdf" 
        />

        <div className="space-y-4">
          {requirements.map(req => {
            // Find if customer already uploaded this doc
            const uploadedDoc = application.documents.find(d => d.requirementId === req.id);
            const isUploading = uploadingId === req.id;
            
            return (
              <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 gap-4">
                <div className="flex gap-4 items-start">
                  <div className="mt-1">
                    {getDocStatusIcon(uploadedDoc?.status)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {req.documentName} {req.isMandatory && <span className="text-red-500">*</span>}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">{req.description}</p>
                    
                    {uploadedDoc && uploadedDoc.status === 'REJECTED' && uploadedDoc.vendorFeedback && (
                      <p className="text-sm text-red-600 mt-2 bg-red-50 p-2 rounded border border-red-100">
                        <strong>Lý do từ chối:</strong> {uploadedDoc.vendorFeedback}
                      </p>
                    )}
                  </div>
                </div>

                <div className="shrink-0 sm:w-auto w-full">
                  {!uploadedDoc || uploadedDoc.status === 'REJECTED' ? (
                    <button
                      onClick={() => openFilePicker(req.id)}
                      disabled={isUploading || application.status === 'PROCESSING' || application.status === 'APPROVED'}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium text-sm"
                    >
                      {isUploading ? (
                        <span className="animate-pulse">Đang tải lên...</span>
                      ) : (
                        <>
                          <UploadCloud size={16} /> 
                          {uploadedDoc ? 'Tải lên lại' : 'Tải lên'}
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <a 
                        href={uploadedDoc.fileUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="relative group block w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shadow-sm"
                      >
                        <img 
                          src={uploadedDoc.fileUrl} 
                          alt="Document Preview" 
                          className="w-full h-full object-cover group-hover:opacity-70 transition-opacity" 
                          onError={(e) => {
                            // If it's a PDF, show a generic PDF icon
                            (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/337/337946.png';
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <FileText size={20} className="text-white drop-shadow-md" />
                        </div>
                      </a>
                      
                      <button
                        onClick={() => openFilePicker(req.id)}
                        disabled={isUploading || application.status === 'PROCESSING' || application.status === 'APPROVED'}
                        className="text-[10px] text-gray-500 hover:text-blue-600 uppercase font-bold tracking-wider"
                      >
                        {isUploading ? 'Đang xử lý...' : 'Tải lại'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
