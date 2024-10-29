import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const VolumeMinusSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M10 8h4.667M6.424 2.91l-2.11 2.111a1.4 1.4 0 0 1-.241.214.7.7 0 0 1-.193.08c-.077.019-.158.019-.321.019H2.4c-.374 0-.56 0-.703.072a.67.67 0 0 0-.291.292c-.073.142-.073.329-.073.702v3.2c0 .374 0 .56.073.703a.67.67 0 0 0 .291.291c.143.073.33.073.703.073h1.158c.163 0 .244 0 .321.018a.7.7 0 0 1 .193.08c.067.041.125.1.24.214l2.11 2.11c.286.286.429.43.551.439a.33.33 0 0 0 .28-.116c.08-.094.08-.295.08-.7V3.289c0-.404 0-.606-.08-.7a.33.33 0 0 0-.28-.115c-.122.01-.265.152-.55.438"
    />
  </svg>
)
const ForwardRef = forwardRef(VolumeMinusSm)
export default ForwardRef
