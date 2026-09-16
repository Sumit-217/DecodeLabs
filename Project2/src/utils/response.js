/**
 * Standard API Response Utilities
 * Follows DecodeLabs Project 2 specification for consistent JSON formatting.
 */

/**
 * Format standard success response
 * @param {any} data 
 * @returns {object} { success: true, data }
 */
export function successResponse(data) {
  return {
    success: true,
    data
  };
}

/**
 * Format standard error response
 * @param {string} code - Machine-readable error code (e.g. VALIDATION_ERROR, NOT_FOUND)
 * @param {string} message - Human-readable explanation
 * @param {object} [fields] - Optional dictionary of field-specific validation errors
 * @returns {object} { success: false, error: { code, message, fields } }
 */
export function errorResponse(code, message, fields = null) {
  const errorObj = {
    code,
    message
  };

  if (fields && Object.keys(fields).length > 0) {
    errorObj.fields = fields;
  }

  return {
    success: false,
    error: errorObj
  };
}
