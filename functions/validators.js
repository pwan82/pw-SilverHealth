// Validate email input
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate username (length between 3 and 30 characters)
const isValidUsername = (username) => {
  const minLength = 3
  const maxLength = 30
  return username.length >= minLength && username.length <= maxLength
}

// Validate gender (should be either "male", "female", "binary", or "prefer-not-to-say")
const isValidGender = (gender) => {
  return ['male', 'female', 'non-binary', 'prefer-not-to-say'].includes(gender)
}

// Validate birthday (must be in YYYY-MM-DD format and age > 13)
const isValidBirthday = (birthday) => {
  const birthdayRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!birthdayRegex.test(birthday)) return false

  const birthdayDate = new Date(birthday)
  const today = new Date()

  // Calculate age
  const ageInMilliseconds = today - birthdayDate
  const age = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25)

  return age >= 13
}

// Validate address (all fields are optional, but if provided, validate string length)
const isValidAddress = (address) => {
  const maxLength = 100 // Max length for any address field
  const { building, postcode, state, streetAddress, suburb } = address

  return [building, postcode, state, streetAddress, suburb].every(
    (field) => field === '' || field.length <= maxLength
  ) // Allow empty fields or fields that meet length criteria
}

// Export validation functions
module.exports = {
  isValidEmail,
  isValidUsername,
  isValidGender,
  isValidBirthday,
  isValidAddress
}
