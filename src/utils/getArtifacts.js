const path = require('path');
const fs = require('fs');

module.exports = function(contractPath) {

  // Determine if passed value is .sol or .json.
  const filename = path.basename(contractPath);
  const name = filename.split('.')[0]; 
  const ext = filename.split('.')[1];
  if(ext !== 'json') throw new Error('Please provide compiled json artifacts for "contractPath".');

  // Retrieve contract artifacts.
  if(!fs.existsSync(contractPath)) throw new Error(`Cannot find ${contractPath}.`);

  // Parse json.
  return JSON.parse(fs.readFileSync(contractPath, 'utf8'));
};
