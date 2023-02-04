import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import Tooltip from './index'
import { Default as story } from './index.stories'

describe('Tooltip', () => {
  it('- should render', () => {
    const wrapper = shallow(<Tooltip {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
