import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const MusicNote02Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M8 12V3.726c0-.571 0-.857.12-1.03a.67.67 0 0 1 .45-.276c.207-.031.463.097.974.352L12 4m-4 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0"
    />
  </svg>
)
const ForwardRef = forwardRef(MusicNote02Sm)
export default ForwardRef
