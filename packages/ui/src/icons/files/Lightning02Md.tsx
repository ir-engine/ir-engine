import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Lightning02Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 20 21"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <g clipPath="url(#prefix__a)">
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M11.874 1.806H7.077c-.15 0-.224 0-.29.022a.4.4 0 0 0-.156.097c-.05.049-.083.115-.15.25l-3.5 7c-.16.319-.24.478-.22.608.016.114.08.215.173.28.108.076.286.076.643.076H8.75l-2.5 8.333 10.16-10.537c.343-.355.515-.533.525-.685a.42.42 0 0 0-.147-.346c-.117-.098-.363-.098-.857-.098H9.999z"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 .139h20v20H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(Lightning02Md)
export default ForwardRef
