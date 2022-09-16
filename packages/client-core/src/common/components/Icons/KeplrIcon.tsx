import React from 'react'

import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon'

export const KeplrIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon {...props}>
      <svg width="100%" height="100%" viewBox="0 0 256 256" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
        <title>k</title>
        <defs>
          <linearGradient x1="7.27233149%" y1="5.60080287%" x2="93.8862913%" y2="92.9848946%" id="linearGradient-1">
            <stop stopColor="#3BA4CE" offset="0%"></stop>
            <stop stopColor="#7868C8" offset="52.0850929%"></stop>
            <stop stopColor="#B54BC1" offset="100%"></stop>
          </linearGradient>
        </defs>
        <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
          <g id="k">
            <rect id="Rectangle" fill="url(#linearGradient-1)" x="0" y="0" width="100%" height="100%" rx="64"></rect>
            <polygon id="Path" fill="#FFFFFF" points="67 54.75 95.4172414 54.75 95.4172414 119.496204 152.675862 54.75 190 54.75 123.18131 127.75 190 200.75 152.675862 200.75 95.4172414 136.003796 95.4172414 200.75 67 200.75"></polygon>
          </g>
        </g>
      </svg>
    </SvgIcon>
  )
}
