const path = require('path');
const fs = require('fs');

module.exports = function(contractPath) {

  // Determine if passed value is .sol or .json.
  const filename = path.basename(contractPath);
  const name = filename.split('.')[0]; 
  const ext = filename.split('.')[1];
  let filepath;
  switch(ext) {
    case 'sol':
      filepath = path.resolve(path.dirname(contractPath), '../build/contracts/', name + '.json');
      break;
    case 'json':
      filepath = contractPath;
      break;
    default:
      throw new Error(`Invalid contractPath: ${contractPath}`);
  }

  // Retrieve contract artifacts.
  console.log(`filepath:`, filepath);
  if(!fs.existsSync(filepath)) throw new Error(`Cannot find ${filepath}.`);

  // Parse json.
  return JSON.parse(fs.readFileSync(filepath, 'utf8'));
};
