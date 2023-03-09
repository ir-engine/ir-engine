import React, { ReactNode } from 'react'

import { AccordionProps, Accordion as MuiAccordion } from '@mui/material'

import AccordionDetails from '../AccordionDetails'
import AccordionSummary from '../AccordionSummary'

const Accordion = (props: AccordionProps) => <MuiAccordion {...props} />

Accordion.displayName = 'Accordion'

Accordion.defaultProps = {
  open: false,
  children: [<AccordionSummary key="1" />, <AccordionDetails key="2" />]
}

export default Accordion
