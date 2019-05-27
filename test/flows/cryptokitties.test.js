const cli = require('../../src/utils/cli.js');
const tmp = require('tmp');
const fs = require('fs');

const CRYPTOKITTIES_MAINNET = '0x06012c8cf97bead5deae237070f9587f8e7a266d';

describe('Cryptokitties flow', () => {
  test('Retrieves Cryptokitties\' code from Etherscan, splits it, compiles it, and runs a series of commands on the code', async () => {
    
    // Set up a temp directory to hold the output.
    const tmpdir = tmp.dirSync();
    const filepath = `${tmpdir.name}/Kitties.sol`;
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

    // Should have the right inheritance tree.
    result = await cli('inheritance', `${tmpdir.name}/KittyCore.json`);
    expect(result.stdout).toContain(`└─ KittyCore
   └─ KittyMinting
      └─ KittyAuction
         └─ KittyBreeding
            └─ KittyOwnership
               ├─ KittyBase
               │  └─ KittyAccessControl
               └─ ERC721`);

    // Should have the right members.
    result = await cli('members', `${tmpdir.name}/KittyCore.json`, '--inherited');
    expect(result.stdout).toContain(`¬ KittyOwnership
  string public constant name;
  string public constant symbol;
  ERC721Metadata public erc721Metadata;
  bytes4 constant InterfaceSignature_ERC165;
  bytes4 constant InterfaceSignature_ERC721;
  function supportsInterface(bytes4 _interfaceID) external view returns(bool) {...}
  function setMetadataAddress(address _contractAddress) public {...}
  function _owns(address _claimant, uint256 _tokenId) internal view returns(bool) {...}`);
    
    // Should read the right storage.
    // result = await cli('liststorage', 'mainnet', `${tmpdir.name}/KittyCore.json`, CRYPTOKITTIES_MAINNET);
    // expect(result.stdout).toContain(``);
    // TODO
    
    // Others?
    // TODO
  });
});
