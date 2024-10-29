import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const VideoRecorderMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}>
      <path d="M18.333 7.443c0-.505 0-.757-.1-.874a.42.42 0 0 0-.35-.145c-.153.012-.331.19-.688.548L14.166 10l3.029 3.029c.357.357.535.535.688.547a.42.42 0 0 0 .35-.144c.1-.117.1-.37.1-.875zM1.666 8.167c0-1.4 0-2.1.272-2.635a2.5 2.5 0 0 1 1.093-1.093c.535-.272 1.235-.272 2.635-.272h4.5c1.4 0 2.1 0 2.635.272a2.5 2.5 0 0 1 1.092 1.093c.273.535.273 1.235.273 2.635v3.667c0 1.4 0 2.1-.273 2.635a2.5 2.5 0 0 1-1.092 1.092c-.535.273-1.235.273-2.635.273h-4.5c-1.4 0-2.1 0-2.635-.273a2.5 2.5 0 0 1-1.093-1.092c-.272-.535-.272-1.235-.272-2.635z" />
    </g>
  </svg>
)
const ForwardRef = forwardRef(VideoRecorderMd)
export default ForwardRef
