import React from 'react'
import { Section } from './Section'
import ToggleItem from './ToggleItem'

export default function SetupScreen() {
  const [tosAgreed, setTosAgreed] = React.useState(false)
  const [ageAgreed, setAgeAgreed] = React.useState(false)

  return (
    <div className="flex h-full flex-col gap-4">
      <div>By signing up, you agree to the following:</div>
      <Section>
        <ToggleItem
          checked={tosAgreed}
          onClick={() => setTosAgreed(!tosAgreed)}
          label="I agree to the Infinite Reality Terms of Service"
        />
        <ToggleItem
          checked={ageAgreed}
          onClick={() => setAgeAgreed(!ageAgreed)}
          label="I am 18 years of age or older"
        />
      </Section>
    </div>
  )
}
