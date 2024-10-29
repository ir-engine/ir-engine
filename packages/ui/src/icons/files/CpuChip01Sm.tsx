import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const CpuChip01Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 16 16"
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
        strokeWidth={1.5}
        d="M6 1.333v1.333m4-1.333v1.333M6 13.333v1.333m4-1.333v1.333M13.333 6h1.333m-1.333 3.333h1.333M1.333 6h1.333M1.333 9.333h1.333m3.2 4h4.267c1.12 0 1.68 0 2.108-.218a2 2 0 0 0 .874-.874c.218-.428.218-.988.218-2.108V5.866c0-1.12 0-1.68-.218-2.108a2 2 0 0 0-.874-.874c-.428-.218-.988-.218-2.108-.218H5.866c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874c-.218.428-.218.988-.218 2.108v4.267c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874c.428.218.988.218 2.108.218M7.066 10h1.867c.373 0 .56 0 .703-.073a.67.67 0 0 0 .291-.291c.073-.143.073-.33.073-.703V7.066c0-.373 0-.56-.073-.702a.67.67 0 0 0-.291-.292C9.493 6 9.306 6 8.933 6H7.066c-.373 0-.56 0-.702.072a.67.67 0 0 0-.292.292C6 6.506 6 6.693 6 7.066v1.867c0 .373 0 .56.072.703a.67.67 0 0 0 .292.291c.142.073.329.073.702.073"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(CpuChip01Sm)
export default ForwardRef
