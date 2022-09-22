// ref: https://github.com/Hopding/pdf-lib#embed-png-and-jpeg-images
// import fetch from 'node-fetch';
import { PDFDocument, rgb } from 'pdf-lib';
import fs from 'fs';

const rootDir = process.env.ROOT_DIR;

const bookName = 'aaa';

const imagesUrl = [
  './src/4.jpg',
  // './src/1.jpg',
  './src/2.jpg',
  // './src/3.jpg',
];

const pdfDoc = await PDFDocument.create();

for (const imageUrl of imagesUrl) {
  const jpgImageBytes = fs.readFileSync(imageUrl);
  const jpgImage = await pdfDoc.embedJpg(jpgImageBytes);
  const page = pdfDoc.addPage();
  // scale to same width with pdf
  const ratio = page.getWidth() / jpgImage.width;
  const jpgDims = jpgImage.scale(ratio);

  page.drawImage(jpgImage, {
    // centeralize
    x: page.getWidth() / 2 - jpgDims.width / 2,
    y: page.getHeight() / 2 - jpgDims.height / 2,
    width: jpgDims.width,
    height: jpgDims.height,
  });
}

// Serialize the PDFDocument to bytes (a Uint8Array)
const pdfBytes = await pdfDoc.save();

fs.writeFileSync(bookName + '.pdf', pdfBytes);

// Trigger the browser to download the PDF document
// download(pdfBytes, "pdf-lib_image_embedding_example.pdf", "application/pdf");
