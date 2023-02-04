import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import Fade from './index'
import { Default as story } from './index.stories'

describe('Fade', () => {
  it('- should render', () => {
    const wrapper = shallow(<Fade {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
