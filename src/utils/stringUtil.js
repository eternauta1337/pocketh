module.exports = {
  getNumericSubstring: (str) => {
    const digits = str.match(/\d+/);
    if(!digits) throw new Error('No digits found in string.')
    return parseInt(digits, 10); 
  },

  remove0x: (hex) => {
    return hex.startsWith('0x') ? hex.substring(2, hex.length) : hex;
  },
};
