import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const UnitMeterMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 21 20"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <path
      fill="#5F7DBF"
      d="M5.422 13.584v-7h1.246l.084 1.288v5.712zm4.844 0V10l1.33-.42v4.004zm4.844 0V10l1.316-.42v4.004zM10.266 10q0-.952-.224-1.442-.21-.504-.602-.7-.378-.195-.882-.21-.855 0-1.33.602t-.476 1.694h-.574q0-1.105.322-1.89.321-.798.924-1.218.615-.42 1.47-.42 1.26 0 1.974.784.728.77.728 2.38zm4.844 0q0-.952-.224-1.442-.224-.504-.602-.7t-.882-.21q-.855 0-1.33.602t-.476 1.694h-.574q0-1.105.322-1.89.321-.798.924-1.218.615-.42 1.47-.42 1.26 0 1.974.784.727.77.714 2.38z"
    />
  </svg>
)
const ForwardRef = forwardRef(UnitMeterMd)
export default ForwardRef
