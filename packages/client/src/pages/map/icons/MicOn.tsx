import React from 'react'

export const MicOn = () => {
  return (
    <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#filter0_d)">
        <circle cx="27" cy="27" r="25" fill="#27F8AB" />
        <circle cx="27" cy="27" r="24.5" stroke="white" strokeOpacity="0.5" />
        <path
          d="M26.9998 29.6514C29.3321 29.6514 31.2149 27.8749 31.2149 25.6742V17.7196C31.2149 15.5189 29.3321 13.7423 26.9998 13.7423C24.6674 13.7423 22.7847 15.5189 22.7847 17.7196V25.6742C22.7847 27.8749 24.6674 29.6514 26.9998 29.6514Z"
          fill="white"
        />
        <path
          d="M34.025 25.6743C34.025 29.3334 30.8777 32.3031 26.9998 32.3031C23.1219 32.3031 19.9746 29.3334 19.9746 25.6743H17.1646C17.1646 30.3542 20.8317 34.1989 25.5948 34.8485V38.9319H28.4049V34.8485C33.1679 34.1989 36.8351 30.3542 36.8351 25.6743H34.025V25.6743Z"
          fill="white"
        />
      </g>
      <defs>
        <filter
          id="filter0_d"
          x="0"
          y="0"
          width="54"
          height="54"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
        </filter>
      </defs>
    </svg>
  )
}
