import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Award, Target, Eye, Compass, CheckCircle2, ChevronRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('intro');

  const menuItems = [
    { id: 'intro', label: 'Giới thiệu' },
    { id: 'services', label: 'Giới thiệu dịch vụ' },
    { id: 'terms', label: 'Điều kiện & điều khoản' },
    { id: 'rules', label: 'Quy chế hoạt động' },
    { id: 'privacy', label: 'Chính sách riêng tư' },
    { id: 'security', label: 'Chính sách bảo mật' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link to="/" className="hover:text-sky-600">Trang Chủ</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-900 font-bold">Giới thiệu</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar Menu matching Screenshot 3 */}
          <aside className="lg:col-span-3 space-y-2">
            <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                    activeTab === item.id
                      ? 'bg-sky-900 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-sky-600'
                  }`}
                >
                  <span>{item.label}</span>
                  {activeTab === item.id && <ChevronRight className="h-4 w-4 text-sky-400" />}
                </button>
              ))}
            </div>
          </aside>

          {/* Main Content Area matching Screenshot 3 */}
          <main className="lg:col-span-9 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-8 text-xs text-slate-700 leading-relaxed">
            
            {activeTab === 'intro' && (
              <div className="space-y-6 animate-fade-in">
                <h1 className="text-xl font-black text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-4">
                  CÔNG TY TNHH DỊCH VỤ DU LỊCH VÀ SỰ KIỆN SMART TRAVEL
                </h1>

                <div className="space-y-3 font-medium">
                  <p className="font-extrabold text-slate-900 text-sm">Kính thưa Quý khách!</p>
                  <p>
                    Lời đầu tiên, thay mặt cho Ban Lãnh Đạo và đội ngũ nhân viên Công ty TNHH Dịch vụ Du lịch và Sự kiện Smart Travel, chúng tôi xin gửi đến Quý khách lời chào trân trọng và những lời chúc tốt đẹp nhất. Chúng tôi cảm ơn Quý khách đã luôn tin tưởng và ủng hộ Smart Travel trong suốt chặng đường phát triển. Đây là động lực quý báu giúp chúng tôi không ngừng nỗ lực và hoàn thiện mình để mang đến những trải nghiệm tốt nhất cho Quý khách.
                  </p>
                  <p>
                    Smart Travel được thành lập dưới sự lãnh đạo của Ban Lãnh Đạo có kinh nghiệm trên 15 năm trong lĩnh vực Du lịch và Sự kiện. Sự am hiểu sâu sắc về ngành cùng với khả năng nắm bắt xu hướng thị trường đã giúp Smart Travel xây dựng được uy tín và thương hiệu vững chắc trên thị trường. Đội ngũ nhân sự của chúng tôi không chỉ trẻ trung, đầy nhiệt huyết mà còn được đào tạo bài bản, chuyên nghiệp, luôn sẵn sàng cống hiến và mang đến cho khách hàng những dịch vụ tốt nhất.
                  </p>
                </div>

                {/* TẦM NHÌN - SỨ MỆNH - GIÁ TRỊ CỐT LÕI */}
                <div className="space-y-6 pt-4 border-t border-slate-100">
                  <h2 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    <Compass className="h-5 w-5 text-sky-600" /> TẦM NHÌN - SỨ MỆNH - GIÁ TRỊ CỐT LÕI
                  </h2>

                  <div className="space-y-3">
                    <h3 className="text-xs font-black text-sky-900 uppercase flex items-center gap-1.5">
                      <Eye className="h-4 w-4 text-sky-600" /> TẦM NHÌN
                    </h3>
                    <p className="pl-5 border-l-2 border-sky-500">
                      Smart Travel trở thành công ty uy tín, chất lượng, đáng tin cậy - là sự lựa chọn hàng đầu của khách hàng khi trong dịch vụ du lịch và sự kiện tại thị trường Việt Nam.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xs font-black text-sky-900 uppercase flex items-center gap-1.5">
                      <Target className="h-4 w-4 text-sky-600" /> SỨ MỆNH
                    </h3>
                    <p className="pl-5 border-l-2 border-sky-500">
                      Với sứ mệnh "Khách hàng là trên hết", Smart Travel luôn mong muốn có cơ hội được đồng hành và phục vụ khách hàng bằng tất cả trách nhiệm và danh dự của mình. Bên cạnh đó chúng tôi cũng không ngừng lắng nghe, học hỏi kinh nghiệm để ngày một đáp ứng yêu cầu tốt hơn của quý khách hàng cũng như những giá trị tốt đẹp hơn cho cộng đồng.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xs font-black text-sky-900 uppercase flex items-center gap-1.5">
                      <Award className="h-4 w-4 text-sky-600" /> GIÁ TRỊ CỐT LÕI
                    </h3>
                    <div className="space-y-2 pl-2">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div><strong>An toàn:</strong> Luôn đặt sự an toàn của khách hàng lên hàng đầu. Mọi dịch vụ và hoạt động đều được kiểm tra kỹ lưỡng để đảm bảo an toàn tuyệt đối cho khách hàng trong suốt hành trình.</div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div><strong>Sáng tạo:</strong> Không ngừng đổi mới và sáng tạo để mang đến những trải nghiệm du lịch độc đáo và mới lạ.</div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div><strong>Đáng giá:</strong> Cam kết mang lại giá trị tốt nhất cho khách hàng. Mỗi dịch vụ đều được thiết kế để mang lại sự hài lòng tối đa.</div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {activeTab !== 'intro' && (
              <div className="space-y-4 animate-fade-in py-6 text-center">
                <ShieldCheck className="h-12 w-12 text-sky-600 mx-auto" />
                <h3 className="text-base font-extrabold text-slate-900">
                  {menuItems.find(m => m.id === activeTab)?.label}
                </h3>
                <p className="text-slate-500 max-w-md mx-auto">
                  Nội dung đầy đủ về {menuItems.find(m => m.id === activeTab)?.label.toLowerCase()} được niêm yết công khai và đảm bảo quyền lợi pháp lý tối đa cho toàn bộ quý khách hàng khi đặt tour tại Smart Travel.
                </p>
              </div>
            )}

          </main>

        </div>

      </div>
    </div>
  );
};
