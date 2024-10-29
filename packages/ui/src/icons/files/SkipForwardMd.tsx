import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const SkipForwardMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M15.833 4.167v11.667m-9.5-.9 4.865-3.892c.445-.356.667-.534.748-.75a.83.83 0 0 0 0-.584c-.08-.215-.303-.393-.748-.749L6.332 5.067C5.64 4.512 5.292 4.234 5 4.234a.83.83 0 0 0-.652.314c-.182.228-.182.672-.182 1.56v7.785c0 .888 0 1.332.182 1.56a.83.83 0 0 0 .652.314c.292 0 .639-.278 1.332-.833"
    />
  </svg>
)
const ForwardRef = forwardRef(SkipForwardMd)
export default ForwardRef
