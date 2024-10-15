import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const PieChart02Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 20 20" ref={ref} {...props}>
    <g stroke="#080808" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} clipPath="url(#prefix__a)">
      <path d="M14.334 11.667c.23 0 .346 0 .44.051a.44.44 0 0 1 .183.203c.041.098.031.202.01.411a6.666 6.666 0 1 1-7.299-7.299c.209-.02.314-.031.412.01.08.035.16.107.202.184.052.093.052.209.052.44V11c0 .233 0 .35.045.44.04.078.104.141.182.181.09.046.206.046.44.046zM11.667 2.333c0-.23 0-.346.051-.44a.44.44 0 0 1 .203-.183c.098-.041.203-.031.412-.01A6.67 6.67 0 0 1 18.3 7.668c.021.209.032.313-.01.411a.44.44 0 0 1-.183.203c-.094.051-.21.051-.44.051h-5.333c-.234 0-.35 0-.44-.045a.4.4 0 0 1-.182-.182c-.045-.09-.045-.206-.045-.44z" />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h20v20H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(PieChart02Md)
export default ForwardRef
