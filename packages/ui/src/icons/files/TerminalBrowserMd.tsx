import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const TerminalBrowserMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 20 20" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M18.334 7.5H1.667M5 14.583 7.084 12.5 5 10.417m4.167 4.166H12.5M1.667 6.5v7c0 1.4 0 2.1.272 2.635a2.5 2.5 0 0 0 1.093 1.092c.535.273 1.235.273 2.635.273h8.667c1.4 0 2.1 0 2.635-.273a2.5 2.5 0 0 0 1.092-1.092c.273-.535.273-1.235.273-2.635v-7c0-1.4 0-2.1-.273-2.635a2.5 2.5 0 0 0-1.092-1.093c-.535-.272-1.235-.272-2.635-.272H5.667c-1.4 0-2.1 0-2.635.272a2.5 2.5 0 0 0-1.093 1.093C1.667 4.4 1.667 5.1 1.667 6.5"
    />
  </svg>
)
const ForwardRef = forwardRef(TerminalBrowserMd)
export default ForwardRef
