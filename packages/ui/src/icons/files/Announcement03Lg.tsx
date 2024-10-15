import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Announcement03Lg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 24 24" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M18.5 16c1.933 0 3.5-2.91 3.5-6.5S20.433 3 18.5 3m0 13c-1.933 0-3.5-2.91-3.5-6.5S16.567 3 18.5 3m0 13L5.444 13.626c-.928-.168-1.392-.253-1.767-.437a3 3 0 0 1-1.563-1.873C2 10.914 2 10.443 2 9.5s0-1.414.114-1.816a3 3 0 0 1 1.563-1.873c.375-.184.839-.268 1.767-.437L18.5 3M5 14l.394 5.514c.037.524.056.785.17.984a1 1 0 0 0 .432.402c.206.1.469.1.994.1h1.782c.6 0 .9 0 1.123-.12a1 1 0 0 0 .44-.474c.101-.231.079-.53.032-1.129L10 14.5"
    />
  </svg>
)
const ForwardRef = forwardRef(Announcement03Lg)
export default ForwardRef
