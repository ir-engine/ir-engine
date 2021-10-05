import React from 'react'
import Terms from './TermsAndPolicy/terms'
import Policy from './TermsAndPolicy/policy'

const TemporarySolution = ({ view, setView }: any) => {
  return (
    <>
      {view === 'terms' ? <Terms setView={setView} /> : null}
      {view === 'policy' ? <Policy setView={setView} /> : null}
    </>
  )
}

export default TemporarySolution
