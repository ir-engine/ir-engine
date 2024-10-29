import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const File04Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M9.333 1.513v2.753c0 .374 0 .56.072.703a.67.67 0 0 0 .292.291c.142.073.329.073.702.073h2.754m.18 1.325v4.808c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874c-.428.218-.988.218-2.108.218H5.866c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874c-.218-.428-.218-.988-.218-2.108V4.533c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874c.428-.218.988-.218 2.108-.218h2.141c.49 0 .734 0 .964.055a2 2 0 0 1 .578.24c.202.123.375.296.72.642l2.126 2.126c.346.346.52.519.643.72q.165.27.24.579c.055.23.055.474.055.963"
    />
  </svg>
)
const ForwardRef = forwardRef(File04Sm)
export default ForwardRef
