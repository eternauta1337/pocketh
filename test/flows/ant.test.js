const cli = require('../../src/utils/cli.js');
const tmp = require('tmp');
const fs = require('fs');

const ANT_MAINNET = ' 0x960b236A07cf122663c4303350609A66A7B288C0';
const CONTRACT_NAME = 'ANT.sol';
const NUM_FILES = 12;

describe('Cryptokitties flow', () => {
  test('Retrieves Cryptokitties\' code from Etherscan, splits it, compiles it, and runs a series of commands on the code', async () => {
    
    // Set up a temp directory to hold the output.
    const tmpdir = tmp.dirSync();
    const filepath = `${tmpdir.name}/${CONTRACT_NAME}`;
    console.log(`Test directory: ${tmpdir.name}`);

    // Retrieve the code.
    let result = await cli(
      'getcode', 
      ANT_MAINNET,
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
    expect(fs.existsSync(`${tmpdir.name}/AbstractSale.sol`));
    expect(fs.existsSync(`${tmpdir.name}/MiniMeToken.sol`));
    expect(fs.existsSync(`${tmpdir.name}/ANT.sol`));

    // Files should have expected content.
    expect(fs.readFileSync(`${tmpdir.name}/SaleWallet.sol`, 'utf8')).toContain('address public multisig');

    // Files should compile.
    result = await cli('compile', `${tmpdir.name}/${CONTRACT_NAME}`, `${tmpdir.name}/`);
    expect(result.code).toBe(0);

    // Compilation output should exist and have content.
    // expect(fs.existsSync(`${tmpdir.name}/KittyCore.json`));
    // expect(fs.readFileSync(`${tmpdir.name}/KittyCore.json`, 'utf8').length).toBeGreaterThan(0);

    // Should have the right inheritance tree.
    // result = await cli('inheritance', `${tmpdir.name}/KittyCore.json`);
    // expect(result.stdout).toContain(`└─ KittyCore
   // └─ KittyMinting
    //   └─ KittyAuction
    //      └─ KittyBreeding
    //         └─ KittyOwnership
    //            ├─ KittyBase
    //            │  └─ KittyAccessControl
    //            └─ ERC721`);

    // Should have the right members.
    // result = await cli('members', `${tmpdir.name}/KittyCore.json`, '--inherited');
    // expect(result.stdout).toContain(`¬ KittyOwnership
  // string public constant name;
  // string public constant symbol;
  // ERC721Metadata public erc721Metadata;
  // bytes4 constant InterfaceSignature_ERC165;
  // bytes4 constant InterfaceSignature_ERC721;
  // function supportsInterface(bytes4 _interfaceID) external view returns(bool) {...}
  // function setMetadataAddress(address _contractAddress) public {...}
  // function _owns(address _claimant, uint256 _tokenId) internal view returns(bool) {...}`);
    
    // Should read the right storage.
    // result = await cli('liststorage', 'mainnet', `${tmpdir.name}/KittyCore.json`, ANT_MAINNET);
    // expect(result.stdout).toContain(``);
    // TODO
    
    // Others?
    // TODO
  });
});
