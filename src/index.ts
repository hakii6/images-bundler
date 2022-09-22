// ref: https://github.com/Hopding/pdf-lib#embed-png-and-jpeg-images
// import fetch from 'node-fetch';
import { PDFDocument, PDFImage } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

const rootDir = process.env.ROOT_DIR;

const books = fs.readdirSync(rootDir);

for (const bookName of books) {
  const bookPath = path.join(rootDir, bookName);
  const bookPdfPath = bookPath + '.pdf';
  if (
    !fs.lstatSync(bookPath).isDirectory() ||
    fs.existsSync(bookPdfPath)
  ) {
    continue;
  }

  const pdfDoc = await PDFDocument.create();
  const imageNameArray = fs
    .readdirSync(bookPath)
    .sort((a, b) => {
      return (
        Number(a.slice(0, a.indexOf('.'))) -
        Number(b.slice(0, b.indexOf('.')))
      );
    });

  for (const imageName of imageNameArray) {
    const imagePath = path.join(bookPath, imageName);
    const imageBytes = fs.readFileSync(imagePath);

    let image: PDFImage;
    switch (path.extname(imagePath)) {
      case '.jpg':
        image = await pdfDoc.embedJpg(imageBytes);
        break;
      case '.png':
        image = await pdfDoc.embedPng(imageBytes);
        break;
      default:
        image = await pdfDoc.embedJpg(imageBytes);
        break;
    }
    const page = pdfDoc.addPage();
    // scale to same width with pdf
    const ratio = page.getWidth() / image.width;
    const dims = image.scale(ratio);

    page.drawImage(image, {
      // centeralize
      x: page.getWidth() / 2 - dims.width / 2,
      y: page.getHeight() / 2 - dims.height / 2,
      width: dims.width,
      height: dims.height,
    });
  }

  // Serialize the PDFDocument to bytes (a Uint8Array)
  const pdfBytes = await pdfDoc.save();

  console.log(bookPdfPath);
  fs.writeFileSync(bookPdfPath, pdfBytes);
}
