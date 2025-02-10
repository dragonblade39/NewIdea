import React from "react";
import Navbar from "../Navbar/Navbar";
import Component1 from "../Component1/Component1";
import "./MainPage.css";

const MainPage = () => {
  return (
    <div className="mainpage_main-container">
      <Navbar />
      <Component1 />
    </div>
  );
};

export default MainPage;
