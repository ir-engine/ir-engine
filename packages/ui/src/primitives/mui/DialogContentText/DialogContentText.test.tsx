import { describe, expect, it } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import DialogContentText from './index'
import { Primary as story } from './index.stories'

describe('DialogContentText', () => {
  it('- should render', () => {
    const wrapper = shallow(<DialogContentText {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
