export const gap = 0.02
export const itemWidth = 1
export const itemHeight = 0.5
export const totalWidth = itemWidth * 3 + gap * 4
export const totalHeight = itemHeight * 3 + gap * 4

const urls = [
  '360/VR THUMBNAIL/ARCTIC/_DSC5882x 2.JPG',
  '360/VR THUMBNAIL/CUBA/DSC_9484.jpg',
  '360/VR THUMBNAIL/GALAPAGOS/20171020_GALAPAGOS_5281.jpg',
  '360/VR THUMBNAIL/GREAT WHITES/_K4O2342PIX2.jpg',
  '360/VR THUMBNAIL/HAWAII/20171020_GALAPAGOS_4273.jpg',
  '360/VR THUMBNAIL/INTO THE NOW/20171020_GALAPAGOS_0782.jpg',
  '360/VR THUMBNAIL/SHARKS OF THE WORLD/_DSC3143.jpg',
  '360/VR THUMBNAIL/WILD COAST AFRICA/_MG_8949.jpg',
  '360/VR THUMBNAIL/WRECKS AND CAVES/_DSC2512.JPG'
]

export const url = (index) => {
  const i = index % urls.length
  return urls[i]
}

export const envUrl = '360/env/table_mountain_2.jpg'

export const videoUrl = '360/ITN_Wrecks_FOR_REVIEW_4kx2k_360_h264_40Mbps.mp4'
