/**
 * Email utility functions for company email handling
 */

const COMPANY_DOMAIN = '@moviesexpressrentals.com';

/**
 * Normalize email by appending company domain if not present
 * @param {string} localPart - The local part (username) of the email
 * @returns {string} Full company email
 */
function normalizeCompanyEmail(localPart) {
  if (!localPart) {
    throw new Error('Local part is required');
  }
  
  // Clean the local part
  const cleanLocalPart = localPart.trim().toLowerCase();
  
  // Validate local part format
  if (!/^[a-zA-Z0-9._-]+$/.test(cleanLocalPart)) {
    throw new Error('Invalid email format');
  }
  
  return cleanLocalPart + COMPANY_DOMAIN;
}

/**
 * Check if an email is a company email
 * @param {string} email - The email to check
 * @returns {boolean} True if it's a company email
 */
function isCompanyEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  return email.toLowerCase().endsWith(COMPANY_DOMAIN);
}

/**
 * Extract local part from company email
 * @param {string} email - The company email
 * @returns {string|null} Local part or null if not a company email
 */
function getLocalPart(email) {
  if (!isCompanyEmail(email)) {
    return null;
  }
  
  return email.toLowerCase().replace(COMPANY_DOMAIN, '');
}

/**
 * Validate email format (basic validation)
 * @param {string} email - The email to validate
 * @returns {boolean} True if valid email format
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

module.exports = {
  normalizeCompanyEmail,
  isCompanyEmail,
  getLocalPart,
  isValidEmail,
  COMPANY_DOMAIN
};