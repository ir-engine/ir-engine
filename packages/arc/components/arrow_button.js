import React from "react";

export default function ArrowButton({ place, text, ...props }) {
  return (
    <button
      className={`w-12 h-12 absolute ${
        place === "left" ? "left-0" : "right-0"
      } z-10 justify-center items-center flex`}
      {...props}
    >
      <div className="stories-button w-6 h-6 bg-white rounded-full flex items-center justify-center">
        {text}
      </div>
    </button>
  );
}
