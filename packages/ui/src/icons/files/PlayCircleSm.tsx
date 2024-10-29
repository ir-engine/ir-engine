import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const PlayCircleSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} clipPath="url(#prefix__a)">
      <path d="M8 14.666A6.667 6.667 0 1 0 8 1.333a6.667 6.667 0 0 0 0 13.333" />
      <path d="M6.334 5.977c0-.319 0-.478.066-.567a.33.33 0 0 1 .244-.132c.11-.008.244.078.512.25l3.147 2.023c.232.15.348.224.388.319a.33.33 0 0 1 0 .26c-.04.094-.156.169-.388.318l-3.147 2.023c-.268.172-.402.258-.512.25a.33.33 0 0 1-.244-.132c-.066-.089-.066-.248-.066-.566z" />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(PlayCircleSm)
export default ForwardRef
