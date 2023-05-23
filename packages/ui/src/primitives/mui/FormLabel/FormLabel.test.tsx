import { describe, expect, it } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import FormLabel from './index'
import { Primary as story } from './index.stories'

describe('FormLabel', () => {
  it('- should render', () => {
    const wrapper = shallow(<FormLabel {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
