import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Image01Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M13.5 17.5H5.776c-.505 0-.757 0-.874-.1a.42.42 0 0 1-.145-.35c.012-.153.19-.331.548-.688l7.086-7.086c.33-.33.495-.495.685-.557a.83.83 0 0 1 .515 0c.19.062.355.227.685.557L17.5 12.5v1m-4 4c1.4 0 2.1 0 2.635-.273a2.5 2.5 0 0 0 1.092-1.092c.273-.535.273-1.235.273-2.635m-4 4h-7c-1.4 0-2.1 0-2.635-.273a2.5 2.5 0 0 1-1.093-1.092C2.5 15.6 2.5 14.9 2.5 13.5v-7c0-1.4 0-2.1.272-2.635a2.5 2.5 0 0 1 1.093-1.093C4.4 2.5 5.1 2.5 6.5 2.5h7c1.4 0 2.1 0 2.635.272a2.5 2.5 0 0 1 1.092 1.093C17.5 4.4 17.5 5.1 17.5 6.5v7M8.75 7.083a1.667 1.667 0 1 1-3.333 0 1.667 1.667 0 0 1 3.333 0"
    />
  </svg>
)
const ForwardRef = forwardRef(Image01Md)
export default ForwardRef
