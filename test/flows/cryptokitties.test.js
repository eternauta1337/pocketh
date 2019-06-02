const cli = require('../../src/utils/cli.js');
const tmp = require('tmp');
const fs = require('fs');

const CRYPTOKITTIES_MAINNET = '0x06012c8cf97bead5deae237070f9587f8e7a266d';
const CONTRACT_NAME = 'KittyCore';
const NUM_FILES = 16;

describe('Cryptokitties flow', () => {
  test('Retrieves Cryptokitties\' code from Etherscan, splits it, compiles it, and runs a series of commands on the code', async () => {
    
    // Set up a temp directory to hold the output.
    const tmpdir = tmp.dirSync();
    const filepath = `${tmpdir.name}/${CONTRACT_NAME}.sol`;
    console.log(`Test directory: ${tmpdir.name}`);

    // Retrieve the code.
    let result = await cli(
      'getcode', 
      CRYPTOKITTIES_MAINNET,
      filepath
    );
    expect(result.stdout).toContain(`Source code written to ${filepath}`);

    // Split the contract.
    result = await cli('split', filepath, tmpdir.name);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain(`New files written to ${tmpdir.name}`);

    // Number of files should match.
    expect(result.stdout).toContain(`into ${NUM_FILES} files`);

    // Expected files should exist.
    expect(fs.existsSync(`${tmpdir.name}/KittyAccessControl.sol`));
    expect(fs.existsSync(`${tmpdir.name}/KittyMinting.sol`));
    expect(fs.existsSync(`${tmpdir.name}/KittyBreeding.sol`));

    // Files should have expected content.
    expect(fs.readFileSync(`${tmpdir.name}/KittyBreeding.sol`, 'utf8')).toContain('contract KittyBreeding is KittyOwnership');

    // Files should compile.
    result = await cli('compile', `${tmpdir.name}/${CONTRACT_NAME}.sol`, `${tmpdir.name}/`);
    expect(result.code).toBe(0);

    // Compilation output should exist and have content.
    expect(fs.existsSync(`${tmpdir.name}/${CONTRACT_NAME}.json`));
    expect(fs.readFileSync(`${tmpdir.name}/${CONTRACT_NAME}.json`, 'utf8').length).toBeGreaterThan(0);

    // Should have the right inheritance tree.
    result = await cli('inheritance', `${tmpdir.name}/${CONTRACT_NAME}.json`);
    expect(result.stdout).toContain(`└─ KittyCore
   └─ KittyMinting
      └─ KittyAuction
         └─ KittyBreeding
            └─ KittyOwnership
               ├─ KittyBase
               │  └─ KittyAccessControl
               └─ ERC721`);

    // Should have the right members.
    result = await cli('members', `${tmpdir.name}/${CONTRACT_NAME}.json`, '--inherited', '--disable-colors');
    let expectedStdout = fs.readFileSync('test/output/cryptokitties.members.output', 'utf8');
    expect(result.stdout).toBe(expectedStdout);
    
    // Should read the right storage.
    result = await cli('liststorage', 'mainnet', `${tmpdir.name}/${CONTRACT_NAME}.json`, CRYPTOKITTIES_MAINNET, '--disable-colors');
    expect(result.stdout).toContain(`0xaf1e54b359b0897133f437fc961dd16f20c045e1`);
    expect(result.stdout).toContain(`0xa874aa3e03842a84e4b252315488d27837d89544`);
    expect(result.stdout).toContain(`0x09191d18729da57a83a9afc8ace0c8d7d104e118`);
    expect(result.stdout).toContain(`0xb1690c08e213a35ed9bab7b318de14420fb57d8c`);
    expect(result.stdout).toContain(`0xc7af99fe5513eb6710e6d5f44f9989da40f27f26`);
    expect(result.stdout).toContain(`3087`);
  });
});
