import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const ShoppingBag03Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 16 17"
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
      d="M10.666 5.472a2.667 2.667 0 1 1-5.334 0m-2.91-.4-.467 5.6c-.1 1.204-.15 1.805.053 2.27a2 2 0 0 0 .88.956c.445.24 1.048.24 2.256.24h5.71c1.208 0 1.811 0 2.257-.24a2 2 0 0 0 .88-.957c.203-.464.153-1.065.053-2.268l-.467-5.6c-.086-1.035-.13-1.553-.359-1.944a2 2 0 0 0-.863-.794c-.409-.196-.928-.196-1.967-.196H5.61c-1.039 0-1.558 0-1.967.196a2 2 0 0 0-.863.794c-.23.391-.273.909-.359 1.944"
    />
  </svg>
)
const ForwardRef = forwardRef(ShoppingBag03Sm)
export default ForwardRef
