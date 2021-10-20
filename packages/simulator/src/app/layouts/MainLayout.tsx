import React, { ReactNode } from 'react';
import Head from 'next/head';

const MainLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="main-layout">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono&display=swap"
          rel="stylesheet"
        />
      </Head>
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
          font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo,
            Courier, monospace;

          margin: 0;
          padding: 0;
          font-size: 12px;
        }
        input,
        textarea,
        button {
          font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo,
            Courier, monospace;

          font-size: 12px;
        }
      `}</style>
    </div>
  );
};

export default MainLayout;
