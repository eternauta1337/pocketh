const cli = require('../../src/utils/cli.js');

describe('compile command', () => {

  test('Should compile a contract without specifying a solc version', async () => {
    const result = await cli('compile', 'test/contracts/Test.sol', '/tmp/');
    expect(result.stdout).toContain('Compiled Test.sol succesfully');
  });

  test('Should compile a contract when specifying a valid solc version', async () => {
    const result = await cli('compile', 'test/contracts/Test.sol', '/tmp/', '0.5.7');
    expect(result.stdout).toContain('Compiled Test.sol succesfully');
  });

  test('Should not compile a contract when specifying an invalid solc version', async () => {
    const result = await cli('compile', 'test/contracts/Test.sol', '/tmp/', '0.4.24');
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('is not compatible with the version specified');
  });

  test('Should not compile when the specified output directory does not exist', async () => {
    const result = await cli('compile', 'test/contracts/Test.sol', '/tmp-spongi/', '0.4.24');
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('Cannot find');
  });
  
  test('Should not compile when the specified output directory is not a valid directory', async () => {
    const result = await cli('compile', 'test/contracts/Test.sol', 'test/setup.js', '0.4.24');
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('must be a directory path');
  });

  test('Should not compile when the specified source file does not have a .sol extension', async () => {
    const result = await cli('compile', 'test/contracts/Test.txt', '/spongi', '0.4.24');
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('Invalid source file');
  });

  test('Should not compile when the specified source file does not exist', async () => {
    const result = await cli('compile', 'test/contracts/Test1.sol', '/tmp/', '0.4.24');
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('Cannot find');
  });
  
  test('Should auto-detect semver ranges in source', async () => {
    const result = await cli('compile', 'test/contracts/Ranges.sol', '/tmp/');
    expect(result.stdout).toContain('Using compiler 0.4.22+commit.4cb486ee.Emscripten.clang');
  });

  test('Should understand semver ranges in required version', async () => {
    const result = await cli('compile', 'test/contracts/Test.sol', '/tmp/', `'>=0.5.7 <0.5.8'`);
    expect(result.stdout).toContain('Using compiler 0.5.7+commit.6da8b019.Emscripten.clang');
  });

  test('Additional search paths should be specifiable', async () => {
    const result = await cli('compile', 'test/contracts/SearchPaths.sol', '/tmp/', `--searchPaths`, 'searchpath/');
    expect(result.code).toBe(0);
  });

  test('Should be able to resolve dependencies in node_modules', async () => {
    let result = await cli('compile', 'test/contracts/NodeModules.sol', '/tmp/');
    expect(result.code).toBe(0);
    result = await cli('compile', 'test/contracts/subdir/subsubdir/NodeModules.sol', '/tmp/');
    expect(result.code).toBe(0);
  });

  test.todo('Should cache and reuse downloaded compilers');
  test.todo('Should retrieve a list of available compiler versions');
  test.todo('Should be able to use a list of already downloaded compilers if one cannot be retrieved from solcjs/bin');
});
