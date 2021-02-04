import React from "react";
import SuggestionItem from "./suggestion-item";

export default function RightBarSuggestions({ data }) {
  return (
    <div className="flex flex-col">
      <div className="suggestions-header flex" style={{ marginTop: 12 }}>
        <span className="text-14-bold mr-auto" style={{ color: "#8e8e8e" }}>
          Suggestions For You
        </span>
        <a href="#" className="text-12-bold">
          See All
        </a>
      </div>
      <div
        className="right-bar-suggestions"
        style={{ paddingBottom: 8, paddingTop: 8 }}
      >
        {data.map((item) => {
          return <SuggestionItem data={item} key={item.username} />;
        })}
      </div>
    </div>
  );
}
