const cli = require('../../src/utils/cli.js');
const tmp = require('tmp');
const fs = require('fs');

describe('split command', () => {

  test('Should succesfully split the cryptokitties contract, and it should compile', async () => {

    // Set up a temp directory to hold the output.
    const tmpdir = tmp.dirSync();
    console.log(`Test directory: ${tmpdir.name}`);

    // Split a test contract.
    let result = await cli('split', 'test/contracts/SplitMe.sol', tmpdir.name);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain(`New files written to ${tmpdir.name}`);
    
    // Number of files should match.
    expect(result.stdout).toContain(`into 3 files`);

    // All expected files should exist.
    expect(fs.existsSync(`${tmpdir.name}/SplitMe1.sol`));
    expect(fs.existsSync(`${tmpdir.name}/SplitMe2.sol`));
    expect(fs.existsSync(`${tmpdir.name}/SplitMe3.sol`));

    // Files should have the expected contract definitions.
    const content1 = fs.readFileSync(`${tmpdir.name}/SplitMe1.sol`, 'utf8');
    const content2 = fs.readFileSync(`${tmpdir.name}/SplitMe2.sol`, 'utf8');
    const content3 = fs.readFileSync(`${tmpdir.name}/SplitMe3.sol`, 'utf8');
    expect(content1).toContain('contract SplitMe1');
    expect(content2).toContain('contract SplitMe2');
    expect(content3).toContain('contract SplitMe3');

    // Files should have the expected imports.
    expect(content1.includes('import')).toBe(false);
    expect(content2.includes('import "./SplitMe1.sol";')).toBe(true);
    expect(content2.includes('import "./SplitMe2.sol";')).toBe(false);
    expect(content2.includes('import "./SplitMe3.sol";')).toBe(false);
    expect(content3.includes('import "./SplitMe1.sol";')).toBe(true);
    expect(content3.includes('import "./SplitMe2.sol";')).toBe(true);
    expect(content3.includes('import "./SplitMe3.sol";')).toBe(false);

    // Additional expected content.
    expect(content1.includes('This comment should be part of SplitMe1.')).toBe(true);
  });
});
