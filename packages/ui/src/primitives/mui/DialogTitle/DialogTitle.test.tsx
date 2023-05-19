import { describe, expect, it } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import DialogTitle from './index'
import { Primary as story } from './index.stories'

describe('DialogTitle', () => {
  it('- should render', () => {
    const wrapper = shallow(<DialogTitle {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
