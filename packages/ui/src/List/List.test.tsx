import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import List from './index'
import { Default as story } from './index.stories'

describe('List', () => {
  it('- should render', () => {
    const wrapper = shallow(<List {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
