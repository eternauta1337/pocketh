module.exports = {
  getNumericSubstring: (str) => {
    const digits = str.match(/\d+/);
    if(!digits) throw new Error('No digits found in string.')
    return parseInt(digits, 10); 
  },
};
