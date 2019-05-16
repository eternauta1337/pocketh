module.exports = (value) => {
  if(value.includes('0x')) return value.substring(2, value.length);
  return value;
};
