import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Edit01Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 20 20" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M2.396 15.096c.039-.344.058-.517.11-.678q.07-.215.194-.404c.093-.141.216-.264.461-.509L14.166 2.5A2.357 2.357 0 1 1 17.5 5.833L6.494 16.84c-.245.245-.367.367-.509.46a1.7 1.7 0 0 1-.404.195c-.16.052-.333.07-.678.11l-2.82.313z"
    />
  </svg>
)
const ForwardRef = forwardRef(Edit01Md)
export default ForwardRef
