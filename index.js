'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./lib/i18nshell.min.js');
} else {
  module.exports = require('./lib/i18nshell.js');
}
