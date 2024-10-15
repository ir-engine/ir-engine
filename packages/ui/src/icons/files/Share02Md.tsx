import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Share02Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 20 20" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M5.833 9.167c-.775 0-1.162 0-1.48.085a2.5 2.5 0 0 0-1.768 1.768c-.085.318-.085.705-.085 1.48v1c0 1.4 0 2.1.272 2.635a2.5 2.5 0 0 0 1.093 1.092C4.4 17.5 5.1 17.5 6.5 17.5h7c1.4 0 2.1 0 2.635-.273a2.5 2.5 0 0 0 1.092-1.092c.273-.535.273-1.235.273-2.635v-1c0-.775 0-1.162-.085-1.48a2.5 2.5 0 0 0-1.768-1.768c-.318-.085-.705-.085-1.48-.085m-.834-3.334L10 2.5m0 0L6.667 5.833M10 2.5v10"
    />
  </svg>
)
const ForwardRef = forwardRef(Share02Md)
export default ForwardRef
