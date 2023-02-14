import React from 'react'

import Icon from '.'
import { Default } from './index.stories'

const IconsPage = ({ argTypes }) => {
  return (
    <div>
      {Object.keys(argTypes).map((key) => {
        return (
          <div key={`${key}-options`}>
            {argTypes[key]?.options?.map((o) => (
              <div key={`${key}-options-${o}`} style={{ margin: '10px', display: 'inline-block' }}>
                <Icon {...Default.args} {...{ [key]: o }} />
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

export default IconsPage
