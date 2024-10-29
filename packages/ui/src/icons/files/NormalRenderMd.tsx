import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const NormalRenderMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 20 20"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <path
      fill="#080808"
      fillRule="evenodd"
      d="M16.583 10a6.583 6.583 0 1 1-13.167 0 6.583 6.583 0 0 1 13.167 0m1.75 0a8.333 8.333 0 1 1-16.667 0 8.333 8.333 0 0 1 16.667 0M9.165 6.667a.833.833 0 1 0 0-1.667.833.833 0 0 0 0 1.667m-2.5 1.667a.833.833 0 1 0 0-1.667.833.833 0 0 0 0 1.667M10 9.167a.833.833 0 1 1-1.667 0 .833.833 0 0 1 1.667 0"
      clipRule="evenodd"
    />
  </svg>
)
const ForwardRef = forwardRef(NormalRenderMd)
export default ForwardRef
