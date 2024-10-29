import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const MusicNotePlusMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M12.083 15V4.658c0-.715 0-1.072.15-1.287a.83.83 0 0 1 .561-.347c.26-.038.58.122 1.218.441L17.082 5m-5 10a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0M5.417 8.334v-5m-2.5 2.5h5"
    />
  </svg>
)
const ForwardRef = forwardRef(MusicNotePlusMd)
export default ForwardRef
