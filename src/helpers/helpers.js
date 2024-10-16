/**
 * Redirects the user to the login page with optional parameters.
 *
 * @param {import('vue-router').Router} router - The Vue Router instance.
 * @param {Object} [options] - Optional parameters for the redirect.
 * @param {import('vue-router').RouteLocationNormalizedLoaded} [options.route] - The current route object.
 * @param {string} [options.redirectPath] - A specific path to redirect to after login.
 * @returns {void}
 */
export const redirectToLogin = (router, options = {}) => {
  const { route, redirectPath } = options

  // Determine the appropriate query object for redirection
  let query = {}
  let targetPath = ''

  if (redirectPath) {
    targetPath = redirectPath
  } else if (route && route.fullPath) {
    targetPath = route.fullPath
  }

  // Clean the targetPath
  if (targetPath) {
    // Remove any existing 'redirect' query parameter
    const url = new URL(targetPath, 'http://temp.com')
    url.searchParams.delete('redirect')
    targetPath = url.pathname + url.search

    // Check if the target is not the signup page
    if (!['', '/', '/login', '/signup'].includes(targetPath)) {
      query.redirect = targetPath
    }
  }

  // Navigate to the Login route with the determined query
  const navigationTarget = {
    name: 'Login',
    query: Object.keys(query).length > 0 ? query : undefined
  }
  console.log(`Navigating to: ${JSON.stringify(navigationTarget)}`)
  router.push(navigationTarget)
}
