import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Image05Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M12.667 14h.674c.647 0 .971 0 1.15-.135a.67.67 0 0 0 .263-.492c.013-.223-.166-.493-.525-1.031l-2.007-3.01c-.297-.446-.445-.668-.633-.746a.67.67 0 0 0-.51 0c-.187.078-.336.3-.632.745l-.497.745M12.667 14 7.544 6.6c-.294-.425-.442-.638-.626-.713a.67.67 0 0 0-.502 0c-.184.075-.331.288-.626.713l-3.964 5.726c-.375.542-.563.813-.552 1.039.01.196.105.378.26.498.18.137.51.137 1.17.137zm1.334-10a2 2 0 1 1-4 0 2 2 0 0 1 4 0"
    />
  </svg>
)
const ForwardRef = forwardRef(Image05Sm)
export default ForwardRef
