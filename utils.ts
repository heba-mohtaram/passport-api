interface PassportScanResponse {
    birthDate: string | null
    expiryDate: string | null
}

const extractDatesFromPassport = (text: string): PassportScanResponse => {
    const birthRegex = /(DATE OF BIRTH)\r\n(\d{2}.\d{2}.\d{4})/
    const expiryRegex = /(DATE OF EXPIRY)\r\n(\d{2}.\d{2}.\d{4})/
  
    const expiryMatch = text.match(expiryRegex)
    const birthMatch = text.match(birthRegex)
  
    const expiryDate = expiryMatch ? expiryMatch[2] : null
    const birthDate = birthMatch ? birthMatch[2] : null
  
    return { birthDate, expiryDate }
}

module.exports = {extractDatesFromPassport}