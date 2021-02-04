import React from "react";
import Header from "./header";

export default function Layout({ children, user }) {
  return (
    <div className="container">
      <Header user={user} />
      <div className="homepage-container flex justify-center">{children}</div>
    </div>
  );
}
