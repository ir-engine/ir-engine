import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import CardContent from './index'
import { Default as story } from './index.stories'

describe('CardContent', () => {
  it('- should render', () => {
    const wrapper = shallow(<CardContent {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
