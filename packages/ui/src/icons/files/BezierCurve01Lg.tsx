import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const BezierCurve01Lg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M11 7H4m18 0h-7m0 .252c3.45.888 6 4.02 6 7.748M5 15c0-3.728 2.55-6.86 6-7.748M4.6 19h.8c.56 0 .84 0 1.054-.109a1 1 0 0 0 .437-.437C7 18.24 7 17.96 7 17.4v-.8c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437C6.24 15 5.96 15 5.4 15h-.8c-.56 0-.84 0-1.054.109a1 1 0 0 0-.437.437C3 15.76 3 16.04 3 16.6v.8c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437C3.76 19 4.04 19 4.6 19m8-10h.8c.56 0 .84 0 1.054-.109a1 1 0 0 0 .437-.437C15 8.24 15 7.96 15 7.4v-.8c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437C14.24 5 13.96 5 13.4 5h-.8c-.56 0-.84 0-1.054.109a1 1 0 0 0-.437.437C11 5.76 11 6.04 11 6.6v.8c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437C11.76 9 12.04 9 12.6 9m8 10h.8c.56 0 .84 0 1.054-.109a1 1 0 0 0 .437-.437C23 18.24 23 17.96 23 17.4v-.8c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437C22.24 15 21.96 15 21.4 15h-.8c-.56 0-.84 0-1.054.109a1 1 0 0 0-.437.437C19 15.76 19 16.04 19 16.6v.8c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437C19.76 19 20.04 19 20.6 19M23 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0M5 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0"
    />
  </svg>
)
const ForwardRef = forwardRef(BezierCurve01Lg)
export default ForwardRef
