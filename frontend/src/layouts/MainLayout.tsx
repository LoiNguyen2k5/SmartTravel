import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { AiChatWidget } from '../components/chat/AiChatWidget';

export const MainLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-[#020204]">
      {/* Header Navigation Component */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer Component */}
      <Footer />

      {/* Floating AI Chatbot Assistant 24/7 */}
      <AiChatWidget />
    </div>
  );
};

