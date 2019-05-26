const cli = require('../../src/utils/cli.js');

describe('members command', () => {

  test('Should properly identify the members of Test.sol', async () => {
    const result = await cli('members', './test/artifacts/Test.json', '--disable-colors');
    expect(result.stdout).toContain(`uint256 public value`);
    expect(result.stdout).toContain(`uint256 public constant CONS`);
    expect(result.stdout).toContain(`constructor() public {...}`);
    expect(result.stdout).toContain(`function test(uint256 newValue) public {...`);
  });

  test('Should properly identify the members of Test.sol and its ancestors', async () => {
    const result = await cli('members', '--inherited', './test/artifacts/Test.json', '--disable-colors');
    expect(result.stdout).toContain(`uint256 public granparent_value`);
    expect(result.stdout).toContain(`uint256 public parent1_value`);
    expect(result.stdout).toContain(`uint256 public parent2_value`);
    expect(result.stdout).toContain(`uint256 public value`);
    expect(result.stdout).toContain(`uint256 public constant CONS`);
    expect(result.stdout).toContain(`constructor() public {...}`);
    expect(result.stdout).toContain(`function test(uint256 newValue) public {...`);
  });

  test('Should properly identify the members of KittyCore.sol and its ancestors', async () => {
    const result = await cli('members', '--inherited', './test/contracts/KittyCore.sol', '--disable-colors');
    expect(result.stdout).toContain(`GeneScienceInterface public geneScience;`);
    expect(result.stdout).toContain(`function tokensOfOwner(address _owner) external view returns(uint256[] ownerTokens) {...}`);
    expect(result.stdout).toContain(`mapping(uint256 => address) public kittyIndexToOwner;`);
    expect(result.stdout).toContain(`event ContractUpgrade(address newContract);`);
    expect(result.stdout).toContain(`function tokenMetadata(uint256 _tokenId, string _preferredTransport) external view returns(string infoUrl) {...}`);
    expect(result.stdout).toContain(`address public newContractAddress;`);
    expect(result.stdout).toContain(`function getKitty(uint256 _id) external view returns(bool isGestating, bool isReady, uint256 cooldownIndex, uint256 nextActionAt, uint256 siringWithId, uint256 birthTime, uint256 matronId, uint256 sireId, uint256 generation, uint256 genes) {...}`);
    expect(result.stdout).toContain(`¬ KittyBreeding`);
    expect(result.stdout).toContain(`function balanceOf(address _owner) public view returns(uint256 count) {...}`);
  });

  test('Should be able to sort members', async () => {
    const result = await cli('members', '--sort', 'test/artifacts/KittyBreeding.json', '--disable-colors');
    expect(result.stdout).toContain(`GeneScienceInterface public geneScience;
  uint256 public pregnantKitties;
  uint256 public autoBirthFee;
  event Pregnant(address owner, uint256 matronId, uint256 sireId, uint256 cooldownEndBlock);`);
  });
});
