import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const ArchiveSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M2.667 5.331a1.5 1.5 0 0 1-.26-.023A1.33 1.33 0 0 1 1.36 4.26c-.026-.129-.026-.284-.026-.593 0-.31 0-.465.026-.594a1.33 1.33 0 0 1 1.047-1.047C2.536 2 2.691 2 3.001 2h10c.31 0 .464 0 .593.026.529.105.943.518 1.048 1.047.025.129.025.284.025.594s0 .464-.025.593a1.33 1.33 0 0 1-1.048 1.048 1.5 1.5 0 0 1-.26.023M6.667 8.667h2.667M2.667 5.333h10.667V10.8c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874c-.428.218-.988.218-2.108.218H5.867c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874c-.218-.428-.218-.988-.218-2.108z"
    />
  </svg>
)
const ForwardRef = forwardRef(ArchiveSm)
export default ForwardRef
