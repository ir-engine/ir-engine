import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const VideoRecorderSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
      <path d="M14.667 5.954c0-.404 0-.606-.08-.7a.33.33 0 0 0-.28-.115c-.122.01-.265.152-.55.438L11.334 8l2.423 2.423c.285.285.428.428.55.438a.33.33 0 0 0 .28-.116c.08-.094.08-.296.08-.7z" />
      <path d="M1.334 6.533c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874c.428-.218.988-.218 2.108-.218h3.6c1.12 0 1.68 0 2.108.218a2 2 0 0 1 .874.874c.218.428.218.988.218 2.108v2.933c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874c-.428.218-.988.218-2.108.218h-3.6c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874c-.218-.428-.218-.988-.218-2.108z" />
    </g>
  </svg>
)
const ForwardRef = forwardRef(VideoRecorderSm)
export default ForwardRef
