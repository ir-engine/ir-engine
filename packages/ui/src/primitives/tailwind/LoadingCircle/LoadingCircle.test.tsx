import { expect } from '@jest/globals'
import { shallow } from 'enzyme'
import React from 'react'

import LoadingCircle from './index'
import { Default as story } from './index.stories'

<<<<<<< HEAD
//loadingCircle story test

=======
>>>>>>> dev
describe('LoadingCircle', () => {
  it('- should render', () => {
    const wrapper = shallow(<LoadingCircle {...story?.args} />)
    expect(wrapper).toMatchSnapshot()
  })
})
