import express from 'express'
import multer from 'multer'
const { ocrSpace } = require('ocr-space-api-wrapper')
const { extractDatesFromPassport } = require('./utils')

// Instantiate Express with port.
const app = express()
const port = process.env.PORT || 3000

// Use Multer to handle file upload & processing.
const storage = multer.memoryStorage()
const upload = multer({ storage })

app.post('/analyze-passport', upload.single('passport'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('Please upload a passport image.');
    }

    // Convert image to base64 for OCR library to consume it, special header required.
    const encodedImage = 'data:image/jpeg;base64,' + req.file.buffer.toString('base64')

    // Use OCR Space API to consume the image & read the text.
    const ocrResponse = await ocrSpace(encodedImage, { apiKey: process.env.OCR_API_KEY, language: 'eng' })

    // OCR Space API fails when exit codes are 3 or 4.
    if (ocrResponse.OCRExitCode === 3 || ocrResponse.OCRExitCode === 4) {
      return res.status(500).send('OCR API Error:' + ocrResponse.ParsedResults[0].ErrorMessage)
    }

    // Fetch the text from image from OCR response
    const text = ocrResponse.ParsedResults[0].ParsedText

    // Make sure the DOB and DOE are present in text, throw error otherwise
    if (!text?.includes('DATE OF BIRTH') || !text?.includes('DATE OF EXPIRY')) {
      res.status(500).send('Passport image doesnt contain "DATE OF BIRTH" or "DATE OF EXPIRY"!')
    }  

    // Extract the dates from the OCR received text.
    res.json(extractDatesFromPassport(text))
  } catch (error) {
    res.status(500).send('An error occurred while processing the image.')
  }
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}...`)
})
