import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import Mediapipe from './index'
import { Default as story } from './index.stories'

describe('Mediapipe', () => {
  it('- should render', () => {
    const wrapper = shallow(<Mediapipe {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
