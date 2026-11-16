// Step 4 (client side): decode, fix orientation, downscale and re-encode as JPEG so uploads are small
// and the model service always receives a format it can read.
const MAX_SIDE = 1024

export async function prepareImage(file) {
  let bitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    throw Object.assign(new Error('This image format cannot be read by your browser.'), { key: 'err.decode' })
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * scale)
  const h = Math.round(bitmap.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h)
  bitmap.close?.()
  const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.9))
  if (!blob) throw Object.assign(new Error('Could not process the image.'), { key: 'err.process' })
  return blob
}

export function validateFile(file) {
  if (!file) return 'err.generic'
  const okType = file.type.startsWith('image/') || /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name)
  if (!okType) return 'err.notImage'
  if (file.size > 25 * 1024 * 1024) return 'err.tooBig'
  return null
}
