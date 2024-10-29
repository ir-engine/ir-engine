import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Image05Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      strokeWidth={2}
      d="M15.834 17.5h.842c.81 0 1.214 0 1.437-.169a.83.83 0 0 0 .33-.615c.016-.279-.208-.616-.657-1.289l-2.509-3.763c-.37-.556-.556-.835-.79-.931a.83.83 0 0 0-.639 0c-.233.096-.419.375-.79.931l-.62.93m3.396 4.906L9.431 8.25c-.369-.532-.553-.798-.783-.891a.83.83 0 0 0-.628 0c-.23.093-.414.36-.782.891l-4.955 7.158c-.47.677-.704 1.016-.69 1.298a.83.83 0 0 0 .325.623c.225.171.637.171 1.461.171zM17.501 5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"
    />
  </svg>
)
const ForwardRef = forwardRef(Image05Md)
export default ForwardRef
