import * as React from "react";

function ExploreIconActive(props) {
  return (
    <svg
      aria-label="Explore"
      fill="#262626"
      height={22}
      viewBox="0 0 48 48"
      width={22}
      {...props}
    >
      <path
        clipRule="evenodd"
        d="M24 0C10.8 0 0 10.8 0 24s10.8 24 24 24 24-10.8 24-24S37.2 0 24 0zm12.2 13.8l-7 14.8c-.1.3-.4.6-.7.7l-14.8 7c-.2.1-.4.1-.6.1-.4 0-.8-.2-1.1-.4-.4-.4-.6-1.1-.3-1.7l7-14.8c.1-.3.4-.6.7-.7l14.8-7c.6-.3 1.3-.2 1.7.3.5.4.6 1.1.3 1.7zm-15 7.4l-5 10.5 10.5-5-5.5-5.5z"
        fillRule="evenodd"
      />
    </svg>
  );
}

export default ExploreIconActive;
