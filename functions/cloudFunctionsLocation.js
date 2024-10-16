const { defineString } = require('firebase-functions/params')

exports.cloudFunctionsLocation = defineString('CLOUD_FUNCTIONS_LOCATION') || 'australia-southeast1'
