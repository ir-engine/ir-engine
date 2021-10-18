/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React, { useState } from 'react'
import { useDispatch } from '@xrengine/client-core/src/store'
import { bindActionCreators, Dispatch } from 'redux'
import { useTranslation } from 'react-i18next'

import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import { FormControl, InputLabel, MenuItem, Select, Typography, Card } from '@material-ui/core'
import BackupIcon from '@material-ui/icons/Backup'

import styles from './ArMediaForm.module.scss'

import { useCreatorState } from '@xrengine/client-core/src/social/state/CreatorState'
import { ArMediaService } from '@xrengine/client-core/src/social/state/ArMediaService'

interface Props {
  projects?: any[]
  view?: any
}

const ArMediaForm = ({ projects, view }: Props) => {
  const [type, setType] = useState(null)
  const [title, setTitle] = useState('')
  const volumetricManifest = React.useRef<HTMLInputElement>()
  const volumetricAudios = React.useRef<HTMLInputElement>()
  const volumetricDracosis = React.useRef<HTMLInputElement>()
  const volumetricPreview = React.useRef<HTMLInputElement>()
  const [manifest, setManifest] = useState(null)
  const [audio, setAudio] = useState(null)
  const [dracosis, setDracosis] = useState(null)
  const [preview, setPreview] = useState(null)
  const dispatch = useDispatch()
  // const [collectionId, setCollectionId] = useState(null);
  const { t } = useTranslation()

  const handleSubmit = (e: any) => {
    e.preventDefault()
    ArMediaService.createArMedia({ type, title }, { manifest, audio, dracosis, preview })
  }

  const handlePickManifest = async (file) => {
    console.log(file.target)
    return setManifest(file.target.files[0])
  }
  const handlePickAudio = async (file) => setAudio(file.target.files[0])
  const handlePickDracosis = async (file) => setDracosis(file.target.files[0])
  const handlePickPreview = async (file) => setPreview(file.target.files[0])

  return (
    <section className={styles.creatorContainer}>
      <form className={styles.form} noValidate onSubmit={(e) => handleSubmit(e)}>
        <section className={styles.content}>
          <div className={styles.formLine}>
            <TextField
              className={styles.textFieldContainer}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              id="title"
              placeholder={t('social:arMediaform.title')}
            />
          </div>
          <div className={styles.formLine}>
            <FormControl className={styles.formLine}>
              <InputLabel id="demo-simple-select-label">{t('social:arMediaform.type')}</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <MenuItem value="clip">{t('social:arMediaform.clip')}</MenuItem>
                {/* <MenuItem value='background'>{t('social:arMediaform.background')}</MenuItem> */}
              </Select>
            </FormControl>
          </div>
          <div className={styles.formLine}>
            <Card className={styles.preCard}>
              <Typography>
                {t('social:arMediaform.audio-file')}
                <br />
                <BackupIcon
                  onClick={() => {
                    ;(volumetricAudios.current as HTMLInputElement).click()
                  }}
                />
                <input
                  required
                  ref={volumetricAudios}
                  type="file"
                  className={styles.displayNone}
                  name="audio"
                  onChange={handlePickAudio}
                  placeholder={t('social:arMediaform.audio-file')}
                />
              </Typography>
            </Card>
          </div>
          <div className={styles.formLine}>
            <Card className={styles.preCard}>
              <Typography>
                {t('social:arMediaform.dracosis-file')}
                <br />
                <BackupIcon
                  onClick={() => {
                    ;(volumetricDracosis.current as HTMLInputElement).click()
                  }}
                />
                <input
                  required
                  ref={volumetricDracosis}
                  type="file"
                  className={styles.displayNone}
                  name="dracosis"
                  onChange={handlePickDracosis}
                  placeholder={t('social:arMediaform.dracosis-file')}
                />
              </Typography>
            </Card>
          </div>
          <div className={styles.formLine}>
            <Card className={styles.preCard}>
              <Typography>
                {t('social:arMediaform.manifest-file')}
                <br />
                <BackupIcon
                  onClick={() => {
                    ;(volumetricManifest.current as HTMLInputElement).click()
                  }}
                />
                <input
                  required
                  ref={volumetricManifest}
                  type="file"
                  className={styles.displayNone}
                  name="manifest"
                  onChange={handlePickManifest}
                  placeholder={t('social:arMediaform.manifest-file')}
                />
              </Typography>
            </Card>
            {/* <FormControl className={styles.formLine}>
                    <InputLabel id="demo-simple-select-label">{t('social:arMediaform.scene')}</InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={collectionId}
                      onChange={(e)=>setCollectionId(e.target.value)}
                    >
                      {projects.map(project=><MenuItem value={project.id}>{project.name}</MenuItem>)}
                    </Select>
                  </FormControl> */}
          </div>
          <div className={styles.formLine}>
            <Card className={styles.preCard}>
              <Typography>
                {t('social:arMediaform.preview-file')}
                <br />
                <BackupIcon
                  onClick={() => {
                    ;(volumetricPreview.current as HTMLInputElement).click()
                  }}
                />
                <input
                  required
                  ref={volumetricPreview}
                  type="file"
                  className={styles.displayNone}
                  name="preview"
                  onChange={handlePickPreview}
                  placeholder={t('social:arMediaform.preview-file')}
                />
              </Typography>
            </Card>
          </div>
          <Button variant="contained" color="primary" type="submit" className={styles.submit}>
            {t('social:arMediaform.save')}
          </Button>
        </section>
      </form>
    </section>
  )
}

export default ArMediaForm
