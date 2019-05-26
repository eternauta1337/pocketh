const cli = require('../../src/utils/cli.js');
const tmp = require('tmp');
const fs = require('fs');

describe('split command', () => {

  test('Should succesfully split the cryptokitties contract, and it should compile', async () => {

    // Set up a temp directory to hold the output.
    const tmpdir = tmp.dirSync();
    console.log(`Test directory: ${tmpdir.name}`);

    // Split the contract.
    let result = await cli('split', 'test/contracts/KittyCore.sol', `${tmpdir.name}/`);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain(`New files written to ${tmpdir.name}`);

    // Number of files should match.
    expect(result.stdout).toContain(`into 16 files`);

    // Expected files should exist.
    expect(fs.existsSync(`${tmpdir.name}/KittyAccessControl.sol`));
    expect(fs.existsSync(`${tmpdir.name}/KittyMinting.sol`));
    expect(fs.existsSync(`${tmpdir.name}/KittyBreeding.sol`));

    // Files should have expected content.
    expect(fs.readFileSync(`${tmpdir.name}/KittyBreeding.sol`, 'utf8')).toContain('contract KittyBreeding is KittyOwnership');

    // Files should compile.
    result = await cli('compile', `${tmpdir.name}/KittyCore.sol`, `${tmpdir.name}/`);
    expect(result.code).toBe(0);

    // Compilation output should exist and have content.
    expect(fs.existsSync(`${tmpdir.name}/KittyCore.json`));
    expect(fs.readFileSync(`${tmpdir.name}/KittyCore.json`, 'utf8').length).toBeGreaterThan(0);
  });
});
