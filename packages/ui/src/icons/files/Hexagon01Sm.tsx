import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Hexagon01Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M7.482 1.622c.189-.106.284-.158.384-.179a.7.7 0 0 1 .268 0c.1.021.195.073.384.178l4.933 2.741c.2.111.3.167.373.246q.097.106.142.242c.034.102.034.216.034.445v5.411c0 .229 0 .343-.034.445a.7.7 0 0 1-.142.242c-.073.08-.173.135-.373.245L8.518 14.38c-.189.105-.284.158-.384.178a.7.7 0 0 1-.268 0c-.1-.02-.195-.073-.384-.178l-4.933-2.74c-.2-.111-.3-.167-.373-.246a.7.7 0 0 1-.142-.242C2 11.049 2 10.935 2 10.706V5.295c0-.229 0-.343.034-.445a.7.7 0 0 1 .142-.242c.073-.08.173-.135.373-.246z"
    />
  </svg>
)
const ForwardRef = forwardRef(Hexagon01Sm)
export default ForwardRef
