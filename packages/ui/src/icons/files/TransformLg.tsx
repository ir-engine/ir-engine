import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const TransformLg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M19 7v10M5 7v10M17 5H7m10 14H7M4.6 7h.8c.56 0 .84 0 1.054-.109a1 1 0 0 0 .437-.437C7 6.24 7 5.96 7 5.4v-.8c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437C6.24 3 5.96 3 5.4 3h-.8c-.56 0-.84 0-1.054.109a1 1 0 0 0-.437.437C3 3.76 3 4.04 3 4.6v.8c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437C3.76 7 4.04 7 4.6 7m0 14h.8c.56 0 .84 0 1.054-.109a1 1 0 0 0 .437-.437C7 20.24 7 19.96 7 19.4v-.8c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437C6.24 17 5.96 17 5.4 17h-.8c-.56 0-.84 0-1.054.109a1 1 0 0 0-.437.437C3 17.76 3 18.04 3 18.6v.8c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437C3.76 21 4.04 21 4.6 21m14-14h.8c.56 0 .84 0 1.054-.109a1 1 0 0 0 .437-.437C21 6.24 21 5.96 21 5.4v-.8c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437C20.24 3 19.96 3 19.4 3h-.8c-.56 0-.84 0-1.054.109a1 1 0 0 0-.437.437C17 3.76 17 4.04 17 4.6v.8c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437C17.76 7 18.04 7 18.6 7m0 14h.8c.56 0 .84 0 1.054-.109a1 1 0 0 0 .437-.437C21 20.24 21 19.96 21 19.4v-.8c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437C20.24 17 19.96 17 19.4 17h-.8c-.56 0-.84 0-1.054.109a1 1 0 0 0-.437.437C17 17.76 17 18.04 17 18.6v.8c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437C17.76 21 18.04 21 18.6 21"
    />
  </svg>
)
const ForwardRef = forwardRef(TransformLg)
export default ForwardRef
