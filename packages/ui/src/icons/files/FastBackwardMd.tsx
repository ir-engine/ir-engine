import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const FastBackwardMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      <path d="M18.332 13.697c0 .942 0 1.413-.19 1.644a.83.83 0 0 1-.675.303c-.299-.012-.65-.325-1.354-.95l-4.16-3.698c-.388-.344-.582-.517-.653-.72a.83.83 0 0 1 0-.552c.071-.204.265-.376.653-.72l4.16-3.698c.703-.626 1.055-.939 1.354-.95.26-.01.51.102.674.303.19.23.19.702.19 1.643zM9.165 13.697c0 .942 0 1.413-.19 1.644a.83.83 0 0 1-.675.303c-.298-.012-.65-.325-1.354-.95l-4.16-3.698c-.388-.344-.582-.517-.653-.72a.83.83 0 0 1 0-.552c.071-.204.265-.376.653-.72l4.16-3.698c.704-.626 1.056-.939 1.354-.95.26-.01.51.102.675.303.19.23.19.702.19 1.643z" />
    </g>
  </svg>
)
const ForwardRef = forwardRef(FastBackwardMd)
export default ForwardRef
