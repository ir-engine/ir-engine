import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

/**
 * @author Fabrice IRANKUNDA
 */
const TxtPreview = styled.div`
  margin-left: auto;
  margin-right: auto;
  color: #fff;
  padding: 10px;
  height: 100%;
  overflow: auto;
`

/**
 * @author Fabrice IRANKUNDA <irankundafabrice8@gmail.com>
 * @param props
 */

export const TxtPreviewPanel = (props) => {
  const url = props.resourceProps.resourceUrl
  const [txt, setTxt] = useState('')

  const loadTxt = () => {
    fetch(url)
      .then((response) => response.text())
      .then((res) => {
        setTxt(res)
      })
  }

  if (txt) loadTxt()

  useEffect(() => {
    loadTxt()
  }, [])

  return <TxtPreview>{txt}</TxtPreview>
}
