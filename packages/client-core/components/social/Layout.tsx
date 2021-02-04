import React from "react";
import Header from "./Header";

export default function Layout({
  children,
  user
}: any) {
  return (
    <div className="container">
      <Header user={user} />
      <div className="homepage-container flex justify-center">{children}</div>
    </div>
  );
}
