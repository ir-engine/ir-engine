import React, { useEffect, useState } from 'react'
import policyText from '@xrengine/social/src/components/TermsandPolicy/policy'

const PrivacyPolicy = () => {
  return <div dangerouslySetInnerHTML={{ __html: policyText }} />
}

export default PrivacyPolicy
