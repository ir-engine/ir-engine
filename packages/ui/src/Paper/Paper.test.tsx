import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import Paper from './index'
import { Default as story } from './index.stories'

describe('Paper', () => {
  it('- should render', () => {
    const wrapper = shallow(<Paper {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
