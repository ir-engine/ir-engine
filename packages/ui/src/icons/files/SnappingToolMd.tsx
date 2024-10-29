import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const SnappingToolMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M6.667 2.5h-1.5c-.934 0-1.4 0-1.757.182-.314.16-.569.414-.728.728-.182.357-.182.823-.182 1.757v1.5M6.667 17.5h-1.5c-.934 0-1.4 0-1.757-.182a1.67 1.67 0 0 1-.728-.728c-.182-.357-.182-.823-.182-1.757v-1.5m15-6.666v-1.5c0-.934 0-1.4-.182-1.757a1.67 1.67 0 0 0-.728-.728c-.357-.182-.823-.182-1.757-.182h-1.5M17.5 13.333v1.5c0 .934 0 1.4-.182 1.757-.16.314-.414.569-.728.728-.357.182-.823.182-1.757.182h-1.5m0-7.5a3.333 3.333 0 1 1-6.666 0 3.333 3.333 0 0 1 6.666 0"
    />
  </svg>
)
const ForwardRef = forwardRef(SnappingToolMd)
export default ForwardRef
