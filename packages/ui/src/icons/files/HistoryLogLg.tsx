import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const HistoryLogLg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 24 24" ref={ref} {...props}>
    <path
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="m8.08 13.347-1.574 4.93-4.934-1.56"
    />
    <path stroke="#000" strokeLinecap="round" strokeWidth={2} d="M12 20a8 8 0 1 0-5.81-2.5" />
    <path
      fill="#000"
      d="M12.5 8.262a1 1 0 1 0-2 0zm-1 3.473h-1v.549l.463.295zm2.647 2.87a1 1 0 1 0 1.074-1.687zM10.5 8.262v3.473h2V8.262zm.463 4.317 3.184 2.026 1.074-1.687-3.184-2.027z"
    />
  </svg>
)
const ForwardRef = forwardRef(HistoryLogLg)
export default ForwardRef
