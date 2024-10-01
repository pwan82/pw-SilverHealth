/**
 * Validate name input
 * @param {boolean} blur - Whether the validation is triggered on blur
 * @param {string} value - The input value
 * @returns {Object} - Returns the validation result and error message
 */
export const validateInputName = (blur, value) => {
  const minLength = 3
  const maxLength = 30

  if (value.length < minLength) {
    return {
      isValid: false,
      message: blur ? `Name must be at least ${minLength} characters.` : null
    }
  } else if (value.length > maxLength) {
    return {
      isValid: false,
      message: blur ? `Name must be no more than ${maxLength} characters.` : null
    }
  } else {
    return { isValid: true, message: null }
  }
}

/**
 * Validate email input
 * @param {boolean} blur - Whether the validation is triggered on blur
 * @param {string} value - The input value
 * @returns {Object} - Returns the validation result and error message
 */
export const validateInputEmail = (blur, value) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!value.trim()) {
    return { isValid: false, message: blur ? 'Email cannot be empty.' : null }
  } else if (!emailRegex.test(value)) {
    return { isValid: false, message: blur ? 'The email address is not valid.' : null }
  } else {
    return { isValid: true, message: null }
  }
}

/**
 * Validate if the email already exists
 * @param {boolean} blur - Whether the validation is triggered on blur
 * @param {string} email - The input email to validate
 * @returns {Object} - Returns an object with the validation result and error message
 */
export const validateNewEmail = (blur, email) => {
  // const authStore = useAuthStore()
  // const existingUser = authStore.allMockUsers.find((user) => user.email === email)

  // if (existingUser) {
  //   return { isValid: false, message: blur ? 'Email already exists.' : null }
  // } else {
  //   return validateInputEmail(blur, email)
  // }
  return validateInputEmail(blur, email)
}

/**
 * Validate password input
 * @param {boolean} blur - Whether the validation is triggered on blur
 * @param {string} value - The input value
 * @returns {Object} - Returns the validation result and error message
 */
export const validateInputPassword = (blur, value) => {
  const minLength = 8
  const hasUppercase = /[A-Z]/.test(value)
  const hasLowercase = /[a-z]/.test(value)
  const hasNumber = /\d/.test(value)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value)

  if (value.length < minLength) {
    return {
      isValid: false,
      message: blur ? `Password must be at least ${minLength} characters long.` : null
    }
  } else if (!hasUppercase) {
    return {
      isValid: false,
      message: blur ? 'Password must contain at least one uppercase letter.' : null
    }
  } else if (!hasLowercase) {
    return {
      isValid: false,
      message: blur ? 'Password must contain at least one lowercase letter.' : null
    }
  } else if (!hasNumber) {
    return { isValid: false, message: blur ? 'Password must contain at least one number.' : null }
  } else if (!hasSpecialChar) {
    return {
      isValid: false,
      message: blur ? 'Password must contain at least one special character.' : null
    }
  } else {
    return { isValid: true, message: null }
  }
}

/**
 * Validate confirm password input
 * @param {boolean} blur - Whether the validation is triggered on blur
 * @param {string} password - The original password
 * @param {string} confirmPassword - The confirm password input value
 * @returns {Object} - Returns an object with the validation result and error message
 */
export const validateInputConfirmPassword = (blur, password, confirmPassword) => {
  if (confirmPassword !== password) {
    return { isValid: false, message: blur ? 'Passwords do not match.' : null }
  } else {
    return { isValid: true, message: null }
  }
}

/**
 * Validate birthday input
 * @param {boolean} blur - Whether the validation is triggered on blur
 * @param {string} value - The input value (date in YYYY-MM-DD format)
 * @returns {Object} - Returns the validation result and error message
 */
export const validateInputBirthday = (blur, value) => {
  if (!value) {
    return { isValid: false, message: blur ? 'Birthday is required.' : null }
  }

  const birthday = new Date(value)
  const today = new Date()

  // Calculate age in milliseconds
  const ageInMilliseconds = today - birthday

  // Convert milliseconds to years
  const age = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25)

  if (age < 13) {
    return {
      isValid: false,
      message: blur ? 'Registration is only permitted for those over the age of 13.' : null
    }
  } else {
    return { isValid: true, message: null }
  }
}
