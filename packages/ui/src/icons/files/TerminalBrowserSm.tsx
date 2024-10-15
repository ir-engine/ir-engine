import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const TerminalBrowserSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 16 16" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M14.666 6H1.333M4 11.667 5.666 10 4 8.333m3.333 3.334H10M1.333 5.2v5.6c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874c.428.218.988.218 2.108.218h6.933c1.12 0 1.68 0 2.108-.218a2 2 0 0 0 .874-.874c.218-.428.218-.988.218-2.108V5.2c0-1.12 0-1.68-.218-2.108a2 2 0 0 0-.874-.874C13.146 2 12.586 2 11.466 2H4.533c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874c-.218.428-.218.988-.218 2.108"
    />
  </svg>
)
const ForwardRef = forwardRef(TerminalBrowserSm)
export default ForwardRef
