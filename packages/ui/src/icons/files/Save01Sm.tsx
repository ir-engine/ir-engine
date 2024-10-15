import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Save01Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 16 16" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M4.667 2v2.267c0 .373 0 .56.072.702a.67.67 0 0 0 .292.292c.142.072.329.072.702.072h4.534c.373 0 .56 0 .702-.072a.67.67 0 0 0 .292-.292c.072-.142.072-.329.072-.702v-1.6m0 11.333V9.733c0-.373 0-.56-.072-.702a.67.67 0 0 0-.292-.292c-.142-.072-.329-.072-.702-.072H5.733c-.373 0-.56 0-.702.072a.67.67 0 0 0-.292.292c-.072.142-.072.329-.072.702V14M14 6.217V10.8c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C12.48 14 11.92 14 10.8 14H5.2c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874C2 12.48 2 11.92 2 10.8V5.2c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874C3.52 2 4.08 2 5.2 2h4.583c.326 0 .49 0 .643.037q.205.05.385.16c.135.082.25.197.48.428l2.084 2.084c.23.23.346.345.428.48q.11.181.16.385c.037.154.037.317.037.643"
    />
  </svg>
)
const ForwardRef = forwardRef(Save01Sm)
export default ForwardRef
