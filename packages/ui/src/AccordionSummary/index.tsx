import React, { ReactNode } from 'react'

import { AccordionSummaryProps, AccordionSummary as MuiAccordionSummary } from '@mui/material'

const AccordionSummary = (props: AccordionSummaryProps) => <MuiAccordionSummary {...props} />

AccordionSummary.displayName = 'AccordionSummary'

AccordionSummary.defaultProps = {
  children: <div>hello, I'm an Accordian Summary</div>
}

export default AccordionSummary
