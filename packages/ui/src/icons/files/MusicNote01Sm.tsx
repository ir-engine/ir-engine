import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const MusicNote01Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M6 12V4.237c0-.321 0-.482.058-.612a.67.67 0 0 1 .24-.282c.118-.08.277-.106.593-.159l5.867-.977c.427-.072.64-.107.808-.045a.67.67 0 0 1 .346.293c.088.154.088.37.088.804v7.407M6 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0m8-1.334a2 2 0 1 1-4 0 2 2 0 0 1 4 0"
    />
  </svg>
)
const ForwardRef = forwardRef(MusicNote01Sm)
export default ForwardRef
