const config = require('../config');

function validateAdminKey(key) {
  return key === config.adminKey;
}

module.exports = {
  validateAdminKey
};
