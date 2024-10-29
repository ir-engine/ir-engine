import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const VolumeMaxLg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 24 24"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19.748 5A11.95 11.95 0 0 1 22 12c0 2.612-.835 5.03-2.252 7M15.745 8A6.97 6.97 0 0 1 17 12a6.97 6.97 0 0 1-1.255 4M9.635 4.366 6.468 7.53c-.173.173-.26.26-.36.322a1 1 0 0 1-.29.12C5.704 8 5.582 8 5.337 8H3.6c-.56 0-.84 0-1.054.109a1 1 0 0 0-.437.437C2 8.76 2 9.04 2 9.6v4.8c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437C2.76 16 3.04 16 3.6 16h1.737c.245 0 .367 0 .482.028a1 1 0 0 1 .29.12c.1.061.187.148.36.32l3.165 3.166c.429.429.643.643.827.657a.5.5 0 0 0 .42-.174c.119-.14.119-.443.119-1.048V4.93c0-.606 0-.908-.12-1.049a.5.5 0 0 0-.42-.173c-.183.014-.397.228-.826.657"
    />
  </svg>
)
const ForwardRef = forwardRef(VolumeMaxLg)
export default ForwardRef
