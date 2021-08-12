import React from 'react'

export const MicOff = () => {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#filter0_b)">
        <rect x="0.842773" y="1.78827" width="32.9067" height="32.9067" rx="16.4534" fill="white" fill-opacity="0.3" />
        <rect x="0.842773" y="1.78827" width="32.9067" height="32.9067" rx="16.4534" fill="url(#paint0_linear)" />
      </g>
      <path
        d="M11.8852 25.1881L27.3619 18.554C28.0803 18.2436 28.0803 17.2325 27.3619 16.9221L11.8852 10.288C11.2999 10.0308 10.6524 10.4654 10.6524 11.0951L10.6436 15.1838C10.6436 15.6272 10.9717 16.0086 11.4152 16.0618L23.9473 17.7381L11.4152 19.4055C10.9717 19.4676 10.6436 19.8489 10.6436 20.2924L10.6524 24.3811C10.6524 25.0108 11.2999 25.4454 11.8852 25.1881V25.1881Z"
        fill="white"
      />
      <defs>
        <filter
          id="filter0_b"
          x="-2.71471"
          y="-1.76921"
          width="40.0217"
          height="40.0217"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feGaussianBlur in="BackgroundImage" stdDeviation="1.77874" />
          <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_backgroundBlur" result="shape" />
        </filter>
        <linearGradient
          id="paint0_linear"
          x1="17.2961"
          y1="1.78827"
          x2="17.2961"
          y2="34.695"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#614AD3" />
          <stop offset="1" stop-color="#614AD3" />
        </linearGradient>
      </defs>
    </svg>
  )
}
