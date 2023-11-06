import express from 'express'
import multer from 'multer'
const { ocrSpace } = require('ocr-space-api-wrapper')
const { extractDatesFromPassport } = require('./utils')

// Instantiate Express with port.
const app = express()
const port = process.env.PORT || 3000
app.use(express.json());

// Use Multer to handle file upload & processing.
const storage = multer.memoryStorage()
const upload = multer({ storage })

app.post('/analyze-passport', async (req, res) => {
  try {
    // Use OCR Space API to consume the image & read the text.
    const ocrResponse = await ocrSpace(req.body.url, { apiKey: process.env.OCR_API_KEY, language: 'eng' })
    console.log(ocrResponse)

    // OCR Space API fails when exit codes are 3 or 4.
    if (ocrResponse.OCRExitCode === 3 || ocrResponse.OCRExitCode === 4) {
      return res.status(500).send('OCR API Error:' + ocrResponse.ErrorMessage)
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
    console.log(error)
    res.status(500).send('An error occurred while processing the image.')
  }
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}...`)
})
