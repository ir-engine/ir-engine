import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import ListItemSecondaryAction from './index'
import { Default as story } from './index.stories'

describe('ListItemSecondaryAction', () => {
  it('- should render', () => {
    const wrapper = shallow(<ListItemSecondaryAction {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
