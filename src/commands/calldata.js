const validateUtil = require('../utils/validateUtil');
const etherscanApi = require('../utils/etherscanApi');
const chalk = require('chalk');
const { sha3 } = require('web3-utils')
const ethers = require('ethers')

const signature = 'calldata <contractAddress> <calldata>';
const description = 'Decodes calldata in calls to contracts';
const help = chalk`
The command takes an address of a deployed contract and the calldata used for the call. It retrieves the contract's ABI from Etherscan, decodes de calldata against it, and prints out information about the call that can be understood in human terms.

{red Eg:}

{blue > pocketh calldata 0x818E6FECD516Ecc3849DAf6845e3EC868087B755 0x29589f61000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee000000000000000000000000000000000000000000000000002386f26fc100000000000000000000000000006b175474e89094c44da98b954eedeac495271d0f0000000000000000000000008e0bbf33b07f0a6aa6ceea07bb8f0734e57201cb800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a38af210bdf2cc479000000000000000000000000440bbd6a888a36de6e2f6a25f65bc4e16874faa9000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000045045524d00000000000000000000000000000000000000000000000000000000}
Address: 0x818E6FECD516Ecc3849DAf6845e3EC868087B755
Contract name: KyberNetworkProxy
Function call:
  tradeWithHint(
    src: address = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE
    srcAmount: uint256 = 10000000000000000
    dest: address = 0x6B175474E89094C44Da98b954EedeAC495271d0F
    destAddress: address = 0x8E0Bbf33B07f0A6aa6CEeA07BB8f0734e57201Cb
    maxDestAmount: uint256 = 57896044618658097711785492504343953926634992332820282019728792003956564819968
    minConversionRate: uint256 = 188551960459016455289
    walletId: address = 0x440bBd6a888a36DE6e2F6A25f65bc4e16874faa9
    hint: bytes = 0x5045524d
  )
Contract code: https://etherscan.io/address/0x818E6FECD516Ecc3849DAf6845e3EC868087B755#code
`;

module.exports = {
  signature,
  description,
  register: (program) => {
    program
      .command(signature, {noHelp: true})
      .description(description)
      .on('--help', () => console.log(help))
      .action(async (contractAddress, calldata) => {
        // Retrieve source code (with abi) from Etherscan.
        // Note: could fetch ABI directly, but this brings in additional data.
        const result = await etherscanApi.getSourceCodeFull(contractAddress)
        const data = result[0]
        const contractName = data.ContractName
        const abi = JSON.parse(data.ABI)

        // Extract function selector from calldata.
        const selector = calldata.slice(2, 10)

        // Sweep ABI items of type 'function' and find a match with the selector.
        let matchingAbiItem = abi.find(abiItem => {
          if (abiItem.type === 'function') {
            const signature = `${abiItem.name}(${abiItem.inputs.map(input => input.type).join(',')})`
            const signatureHash = sha3(signature).slice(2, 10)
            return signatureHash === selector
          }
        })
        if (!matchingAbiItem) {
          throw new Error(`Unable to find a matching function call for selector ${selector} in the retrieve ABI.`)
        }

        // Decode calldata.
        const payload = `0x${calldata.slice(10, calldata.length)}`
        const types = matchingAbiItem.inputs.map(input => input.type)
        const decoded = ethers.utils.defaultAbiCoder.decode(types, payload)

        // Print output.
        console.log(`Address: ${contractAddress}`)
        console.log(`Contract name: ${contractName}`)
        console.log(`Function call:`)
        console.log(`  ${matchingAbiItem.name}(`)
        let idx = 0
        matchingAbiItem.inputs.map(input => {
          console.log(`    ${input.name}: ${input.type} = ${
            decoded[idx]
          }`)
          idx++
        })
        console.log('  )')
        console.log(`Contract code: https://etherscan.io/address/${contractAddress}#code`)
      });
  }
};
