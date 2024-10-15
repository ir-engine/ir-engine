import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Send01Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 16 16" ref={ref} {...props}>
    <g clipPath="url(#prefix__a)">
      <path
        stroke="#080808"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="m7 9 7-7M7.085 9.22l1.752 4.505c.154.397.232.595.343.653.096.05.211.05.308 0 .11-.057.188-.256.343-.652l4.394-11.259c.14-.358.21-.537.171-.651a.33.33 0 0 0-.21-.21c-.115-.04-.294.03-.652.17L2.275 6.17c-.396.155-.595.232-.652.344a.33.33 0 0 0 0 .307c.058.111.256.189.653.343l4.505 1.752c.08.031.121.047.155.071q.045.033.078.078c.024.034.04.074.071.155"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(Send01Sm)
export default ForwardRef
