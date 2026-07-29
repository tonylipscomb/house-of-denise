/* eslint-disable @typescript-eslint/no-require-imports */
const sharp = require("sharp");

(async () => {
  const { data, info } = await sharp("HDheader.png")
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  let minX = w;
  let minY = h;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const a = data[(y * w + x) * 4 + 3];
      if (a > 90) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  const pad = 24;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(w - 1, maxX + pad);
  maxY = Math.min(h - 1, maxY + pad);
  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;

  function paint(rgb) {
    const out = Buffer.alloc(cw * ch * 4);
    for (let y = 0; y < ch; y++) {
      for (let x = 0; x < cw; x++) {
        const a = data[((minY + y) * w + (minX + x)) * 4 + 3];
        const na = a < 90 ? 0 : Math.min(255, Math.round((a - 90) * 2.2));
        const di = (y * cw + x) * 4;
        out[di] = rgb[0];
        out[di + 1] = rgb[1];
        out[di + 2] = rgb[2];
        out[di + 3] = na;
      }
    }
    return out;
  }

  const cream = paint([248, 243, 236]);
  const gold = paint([184, 138, 77]);

  await sharp(gold, { raw: { width: cw, height: ch, channels: 4 } })
    .resize(560, 300, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile("public/images/house-of-denise/hd-crest-gold.png");

  await sharp(cream, { raw: { width: cw, height: ch, channels: 4 } })
    .resize(560, 300, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile("public/images/house-of-denise/hd-crest-light.png");

  const size = 512;
  const mark = await sharp(cream, { raw: { width: cw, height: ch, channels: 4 } })
    .resize(Math.round(size * 0.78), Math.round(size * 0.78), {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer();

  const composed = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 50, g: 30, b: 35, alpha: 1 }
    }
  })
    .composite([{ input: mark, gravity: "centre" }])
    .png()
    .toBuffer();

  const radius = Math.round(size * 0.18);
  const roundedMask = await sharp(
    Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="#fff"/></svg>`
    )
  )
    .png()
    .toBuffer();

  await sharp(composed)
    .composite([{ input: roundedMask, blend: "dest-in" }])
    .png()
    .toFile("app/icon.png");

  await sharp("app/icon.png").resize(180, 180).png().toFile("app/apple-icon.png");

  console.log("done", { cw, ch });
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
