import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const FastForwardMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      <path d="M10.833 13.697c0 .942 0 1.413.19 1.644.165.2.415.312.674.303.3-.012.651-.325 1.355-.95l4.16-3.698c.387-.344.581-.517.653-.72a.83.83 0 0 0 0-.552c-.072-.204-.266-.376-.653-.72l-4.16-3.698c-.704-.626-1.056-.939-1.355-.95a.83.83 0 0 0-.674.303c-.19.23-.19.702-.19 1.643zM1.666 13.697c0 .942 0 1.413.19 1.644.165.2.415.312.675.303.298-.012.65-.325 1.354-.95l4.16-3.698c.388-.344.582-.517.653-.72a.83.83 0 0 0 0-.552c-.071-.204-.265-.376-.653-.72l-4.16-3.698c-.704-.626-1.056-.939-1.354-.95a.83.83 0 0 0-.675.303c-.19.23-.19.702-.19 1.643z" />
    </g>
  </svg>
)
const ForwardRef = forwardRef(FastForwardMd)
export default ForwardRef
