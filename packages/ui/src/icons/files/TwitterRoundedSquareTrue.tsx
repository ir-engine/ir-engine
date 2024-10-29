import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const TwitterRoundedSquareTrue = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      fill="#1EA1F2"
      d="M0 16.1c0-5.695 0-8.542 1.126-10.71A10 10 0 0 1 5.39 1.126C7.558 0 10.405 0 16.1 0h15.8c5.695 0 8.542 0 10.71 1.126a10 10 0 0 1 4.264 4.264C48 7.558 48 10.405 48 16.1v15.8c0 5.695 0 8.542-1.126 10.71a10 10 0 0 1-4.264 4.264C40.442 48 37.595 48 31.9 48H16.1c-5.695 0-8.542 0-10.71-1.126a10 10 0 0 1-4.264-4.264C0 40.442 0 37.595 0 31.9z"
    />
    <path
      fill="#fff"
      fillRule="evenodd"
      d="M37.323 18.153q.016.45.015.899c0 9.09-6.394 19.583-18.086 19.583-3.592 0-6.931-1.145-9.745-3.094.497.055 1.002.096 1.515.096 2.978 0 5.72-1.104 7.897-2.958-2.782-.04-5.13-2.044-5.94-4.77q.583.123 1.198.123.868 0 1.676-.245c-2.911-.626-5.104-3.406-5.104-6.745v-.082c.858.504 1.84.817 2.883.858-1.708-1.24-2.83-3.352-2.83-5.737 0-1.253.312-2.44.862-3.461 3.135 4.17 7.82 6.909 13.103 7.195a7.5 7.5 0 0 1-.164-1.567c0-3.802 2.847-6.882 6.358-6.882 1.828 0 3.48.832 4.638 2.167 1.451-.3 2.81-.872 4.04-1.662-.476 1.608-1.483 2.957-2.798 3.801a12 12 0 0 0 3.652-1.076 13.6 13.6 0 0 1-3.17 3.557"
      clipRule="evenodd"
    />
  </svg>
)
const ForwardRef = forwardRef(TwitterRoundedSquareTrue)
export default ForwardRef
