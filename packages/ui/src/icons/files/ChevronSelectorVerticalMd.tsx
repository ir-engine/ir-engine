import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const ChevronSelectorVerticalMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 20 20" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M5.833 12.5 10 16.666l4.166-4.166m-8.333-5L10 3.333 14.166 7.5"
    />
  </svg>
)
const ForwardRef = forwardRef(ChevronSelectorVerticalMd)
export default ForwardRef
