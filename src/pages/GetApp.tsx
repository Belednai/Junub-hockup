import React from 'react';
import GetApp from '@/components/GetApp';

const GetAppPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-8">
      <div className="container mx-auto px-4">
        <GetApp />
      </div>
    </div>
  );
};

export default GetAppPage;
