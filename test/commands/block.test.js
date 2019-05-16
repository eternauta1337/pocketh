const cli = require('../utils/cli.js');
jest.setTimeout(60000);

describe('transaction command', () => {
  test('Should properly query a known block in mainnet', async () => {
    const result = await cli(
      'block', 
      'mainnet',
      '7743080'
    );
    expect(result.stdout).toContain(`"transactions": [
    "0xac7324486fe934db915d3554281f413b37dc2213ce8592fa971f5c3924963174",
    "0xb85c9ee82d2f14a04ed35fe2629fc1d9c515e1689b95ba786dfa28e615f52cb5",
    "0x23409392117be51722e6953d4526032e12c1a2520a4e5534fa4ba184e2b9701e",
    "0xbb55ad890ddd8b1b6926966a0b48b7035893397b81f54e1bf3b44393ccc1ac75",
    "0xa754af6c51a642454d6376dd7cbaca0ef9d9c578862cc838be4ff60c13c1f9db",
    "0x98c3af322b2adb333186bb5e0fd3ebae888095cfed9268d42bee0d333be1e579",
    "0x6c6d4da7d7dde73d4f842bad768d7c1fffb225fa56228ff71a57db6b456e1584",`);
  });
});
