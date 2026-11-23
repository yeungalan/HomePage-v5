// Generates the site's icons from one design: a white "A" (Geist, weight 800)
// on an Asagi teal squircle, #33A6B8 being the site's accent colour.
//
//   npm run icons
//
// Writes
//   src/app/icon.svg                     tab icon for current browsers
//   src/app/favicon.ico                  16, 32 and 48 px, for everything else
//   src/app/apple-icon.png               180 px iOS home-screen icon (iOS rounds the corners)
//   public/icons/icon-192.png            web manifest icons (src/app/manifest.ts)
//   public/icons/icon-512.png
//   public/icons/icon-maskable-512.png   Android adaptive icon: full bleed, letter inside the safe zone
//
// Next.js adds the <link> tags for the files in src/app by itself. sharp
// ships with Next.js, so this needs nothing beyond `npm ci`.

import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const TEAL = '#33A6B8'

// Both shapes are drawn on a 32 x 32 grid.
// Rounded square with continuous (iOS-style) corners, corner radius 7.
const SQUIRCLE =
  'M10.7 0H21.3C24.38 0 25.92 0 27.58 .52C29.39 1.18 30.82 2.61 31.48 4.42C32 6.08 32 7.62 32 10.7V21.3' +
  'C32 24.38 32 25.92 31.48 27.58C30.82 29.39 29.39 30.82 27.58 31.48C25.92 32 24.38 32 21.3 32H10.7' +
  'C7.62 32 6.08 32 4.42 31.48C2.61 30.82 1.18 29.39 .52 27.58C0 25.92 0 24.38 0 21.3V10.7' +
  'C0 7.62 0 6.08 .52 4.42C1.18 2.61 2.61 1.18 4.42 .52C6.08 0 7.62 0 10.7 0Z'
// Geist's "A" at weight 800, 20 units tall and centred. The apex, crossbar and
// baseline sit on even units, so they land on whole pixels at 16, 32 and 48 px.
const LETTER = 'M13.16 6H18.84L26 26H21.02L19.65 22H12.35L10.98 26H6ZM18.29 18 16 11.29 13.71 18Z'

/**
 * The icon as SVG. `scale` shrinks the letter about the centre, `fullBleed`
 * fills the whole square (for icons the OS masks), `size` sets a pixel size.
 */
const svg = ({ scale = 1, fullBleed = false, size } = {}) => {
  const offset = +(16 * (1 - scale)).toFixed(3)
  const transform = scale === 1 ? '' : ` transform="matrix(${scale} 0 0 ${scale} ${offset} ${offset})"`
  const dimensions = size ? ` width="${size}" height="${size}"` : ''
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"${dimensions}>` +
    `<path fill="${TEAL}" d="${fullBleed ? 'M0 0H32V32H0Z' : SQUIRCLE}"/>` +
    `<path fill="#fff" fill-rule="evenodd"${transform} d="${LETTER}"/></svg>`
  )
}

/** Rasterised straight at its final size, so small sizes keep their pixel-aligned edges. */
const png = (size, options = {}) =>
  sharp(Buffer.from(svg({ ...options, size })))
    .png({ compressionLevel: 9 })
    .toBuffer()

/** An .ico of PNG-compressed images, which every current browser and Windows reads. */
const ico = (images) => {
  const header = Buffer.alloc(6 + 16 * images.length)
  header.writeUInt16LE(1, 2) // type: icon
  header.writeUInt16LE(images.length, 4)
  let offset = header.length
  images.forEach(({ size, data }, i) => {
    const entry = 6 + 16 * i
    header.writeUInt8(size, entry) // width
    header.writeUInt8(size, entry + 1) // height
    header.writeUInt16LE(1, entry + 4) // colour planes
    header.writeUInt16LE(32, entry + 6) // bits per pixel
    header.writeUInt32LE(data.length, entry + 8)
    header.writeUInt32LE(offset, entry + 12)
    offset += data.length
  })
  return Buffer.concat([header, ...images.map((image) => image.data)])
}

const write = async (path, data) => {
  const file = join(ROOT, path)
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, data)
  console.log(`${path}  ${data.length} bytes`)
}

const icoImages = await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(size) })))
// iOS shows transparency as black, so the home-screen icon is opaque.
const appleIcon = await sharp(Buffer.from(svg({ fullBleed: true, scale: 0.9, size: 180 })))
  .removeAlpha()
  .png({ compressionLevel: 9 })
  .toBuffer()

await write('src/app/icon.svg', svg() + '\n')
await write('src/app/favicon.ico', ico(icoImages))
await write('src/app/apple-icon.png', appleIcon)
await write('public/icons/icon-192.png', await png(192))
await write('public/icons/icon-512.png', await png(512))
await write('public/icons/icon-maskable-512.png', await png(512, { fullBleed: true, scale: 0.8 }))
