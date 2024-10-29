import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const FacebookRoundedSquareFalse = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 48 48"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <path
      fill="#080808"
      fillRule="evenodd"
      d="M1.126 5.39C0 7.558 0 10.405 0 16.1v15.8c0 5.695 0 8.542 1.126 10.71a10 10 0 0 0 4.264 4.264C7.558 48 10.405 48 16.1 48h15.8c5.695 0 8.542 0 10.71-1.126a10 10 0 0 0 4.264-4.264C48 40.442 48 37.595 48 31.9V16.1c0-5.695 0-8.542-1.126-10.71a10 10 0 0 0-4.264-4.264C40.442 0 37.595 0 31.9 0H16.1C10.405 0 7.558 0 5.39 1.126A10 10 0 0 0 1.126 5.39M34.4 24l-1.067 6.667H28V48h-8V30.667h-6V24h6v-5.333c0-6 3.867-9.334 9.333-9.334 1.734 0 3.6.267 5.334.534V16H31.6c-2.933 0-3.6 1.467-3.6 3.333V24z"
      clipRule="evenodd"
    />
  </svg>
)
const ForwardRef = forwardRef(FacebookRoundedSquareFalse)
export default ForwardRef
