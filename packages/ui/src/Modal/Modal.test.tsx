import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import Modal from './index'
import { Default as story } from './index.stories'

describe('Modal', () => {
  it('- should render', () => {
    const wrapper = shallow(<Modal {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
