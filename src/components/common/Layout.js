import React from "react";
import Navbar from "./Navbar";

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Navbar />
      <main className="main-content">
        <div className="container-fluid py-4">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
