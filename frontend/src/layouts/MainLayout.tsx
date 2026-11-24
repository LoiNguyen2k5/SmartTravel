import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { AiChatWidget } from '../components/chat/AiChatWidget';

export const MainLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-[#FAF8F5] text-[#0F172A]">
      {/* Header Navigation Component */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer Component */}
      <Footer />

      {/* Floating Contact & AI Chatbot Action Hub (6 icons) */}
      <AiChatWidget />
    </div>
  );
};
