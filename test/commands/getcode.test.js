const cli = require('../../src/utils/cli.js');
const tmp = require('tmp');
const fs = require('fs');

describe('getcode command', () => {

  test('Should retrieve code from mainnet and print it to stdout if no destination path is specified', async () => {
    const result = await cli('getcode', '0x06012c8cf97bead5deae237070f9587f8e7a266d');
    expect(result.stdout).toContain(`contract KittyCore is KittyMinting`);
  });

  test('Should retrieve code from mainnet and store it in a file', async () => {

    // Create a temporary directory to hold the output.
    const tmpdir = tmp.dirSync();
    const filepath = `${tmpdir.name}/getcode.test`;

    // Trigger the command.
    const result = await cli(
      'getcode', 
      '0x06012c8cf97bead5deae237070f9587f8e7a266d',
      filepath
    );

    // Verify command output.
    expect(result.stdout).toContain(`Source code written to ${filepath}`);

    // Verify that the file was produced and that it contains the expected text.
    expect(fs.existsSync(filepath)).toBe(true);
    const content = fs.readFileSync(filepath, 'utf8');
    expect(content).toContain(`contract KittyCore is KittyMinting`);
  });

  test('Should complain when an invalid address is provided', async () => {
    const result = await cli('getcode', '0xbccc714d56bc0da0fd');
    expect(result.code).toBe(1);
  });
});
