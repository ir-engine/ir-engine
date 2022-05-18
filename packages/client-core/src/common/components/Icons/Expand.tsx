import React from 'react'

export const Expand = () => {
  return (
    <svg width="42" height="42" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#filter0_d)">
        <path
          d="M20 0L23.0667 3.06667L19.2133 6.89333L21.1067 8.78667L24.9333 4.93333L28 8V0H20ZM4 8L7.06667 4.93333L10.8933 8.78667L12.7867 6.89333L8.93333 3.06667L12 0H4V8ZM12 24L8.93333 20.9333L12.7867 17.1067L10.8933 15.2133L7.06667 19.0667L4 16V24H12ZM28 16L24.9333 19.0667L21.1067 15.2133L19.2133 17.1067L23.0667 20.9333L20 24H28V16Z"
          fill="white"
        />
      </g>
      <defs>
        <filter
          id="filter0_d"
          x="0"
          y="0"
          width="32"
          height="32"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="2" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
        </filter>
      </defs>
    </svg>
  )
}
