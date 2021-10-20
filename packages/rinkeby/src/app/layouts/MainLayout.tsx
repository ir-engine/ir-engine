import React, { ReactNode } from 'react';

const MainLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="main-layout">
      {children}
      <style jsx>{`
        .main-layout {
        }
      `}</style>
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }
        html,
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
            Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
            'Segoe UI Symbol';
          margin: 0;
          padding: 0;
        }
      `}</style>
    </div>
  );
};

export default MainLayout;
