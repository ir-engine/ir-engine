import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const LockUnlocked01Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 20 20" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M5.833 8.333V6.667a4.167 4.167 0 0 1 6.48-3.467M10 12.083v1.667M7.333 17.5h5.333c1.4 0 2.1 0 2.635-.273a2.5 2.5 0 0 0 1.093-1.092c.272-.535.272-1.235.272-2.635v-1.167c0-1.4 0-2.1-.272-2.635A2.5 2.5 0 0 0 15.3 8.606c-.534-.273-1.235-.273-2.635-.273H7.333c-1.4 0-2.1 0-2.635.273a2.5 2.5 0 0 0-1.093 1.092c-.272.535-.272 1.235-.272 2.635V13.5c0 1.4 0 2.1.272 2.635a2.5 2.5 0 0 0 1.093 1.092c.535.273 1.235.273 2.635.273"
    />
  </svg>
)
const ForwardRef = forwardRef(LockUnlocked01Md)
export default ForwardRef
