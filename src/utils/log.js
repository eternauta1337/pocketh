const fs = require('fs');

module.exports = (str) => {
  fs.writeFileSync(`log`, str);
};
