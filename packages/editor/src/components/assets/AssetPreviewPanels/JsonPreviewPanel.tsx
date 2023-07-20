/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import ReactJson from '@microlink/react-json-view'
import React, { useEffect, useState } from 'react'

import CircularProgress from '@mui/material/CircularProgress'

import styles from '../styles.module.scss'

/**
 * @param props
 */

export const JsonPreviewPanel = (props) => {
  const url = props.resourceProps.resourceUrl
  const [jsonFile, setJsonFile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadJson = () => {
    fetch(url)
      .then((response) => response.json())
      .then((res) => {
        setLoading(false)
        setJsonFile(res)
      })
      .catch((err) => {
        setLoading(false)
        setError(err.message)
      })
  }

  if (jsonFile && loading) loadJson()

  useEffect(() => {
    if (loading) loadJson()
  }, [])

  return (
    <>
      {loading && (
        <div className={styles.container}>
          <CircularProgress />
        </div>
      )}
      {error && (
        <div className={styles.container}>
          <h1 className={styles.error}>{error}</h1>
        </div>
      )}
      {!loading && !error && <ReactJson style={{ height: '100%', overflow: 'auto' }} theme="monokai" src={jsonFile} />}
    </>
  )
}
