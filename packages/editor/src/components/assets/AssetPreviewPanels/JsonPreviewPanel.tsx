import React, { useEffect, useState } from 'react'
import ReactJson from 'react-json-view'

/**
 * @author Fabrice IRANKUNDA
 */

/**
 * @author Fabrice IRANKUNDA <irankundafabrice8@gmail.com>
 * @param props
 */

export const JsonPreviewPanel = (props) => {
  const url = props.resourceProps.resourceUrl
  const [jsonFile, setJsonFile] = useState<any>(null)

  const loadJson = () => {
    fetch(url)
      .then((response) => response.json())
      .then((res) => {
        setJsonFile(res)
      })
  }

  if (jsonFile) loadJson()

  useEffect(() => {
    loadJson()
  }, [])

  return <ReactJson style={{ height: '100%', overflow: 'auto' }} theme="monokai" src={jsonFile} />
}
