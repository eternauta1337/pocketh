const signature = 'docyul [keyword]';
const description = 'Gets yul documentation.';
const chalk = require('chalk');
const help = chalk`
Gets yul documentation for a given keyword. If no keyword is provided, all available keywords are listed

{red Eg:}

{blue > pocketh docyul sstore}
sstore(p:u256, v:u256)
"storage[p] := v"

{blue > pocketh docyul}
not(x:bool) ‑> z:bool
and(x:bool, y:bool) ‑> z:bool
or(x:bool, y:bool) ‑> z:bool
xor(x:bool, y:bool) ‑> z:bool
addu256(x:u256, y:u256) ‑> z:u256
subu256(x:u256, y:u256) ‑> z:u256
mulu256(x:u256, y:u256) ‑> z:u256
divu256(x:u256, y:u256) ‑> z:u256
divs256(x:s256, y:s256) ‑> z:s256
modu256(x:u256, y:u256) ‑> z:u256
mods256(x:s256, y:s256) ‑> z:s256
...

`;

module.exports = {
  signature,
  description,
  register: (program) => {
    program
      .command(signature, {noHelp: true})
      .description(description)
      .on('--help', () => console.log(help))
      .action((keyword) => {

        const keys = Object.keys(docs);

        if(!keyword) {
          let str = '';
          keys.forEach(key => str += `${key}\n`);
          console.log(str);
        }
        else {
          const matches = keys.filter(key => key.includes(keyword));
          if(matches.length === 0) {
            return console.log(`No Yul documentation found for '${keyword}'`);
          }
          matches.forEach(match => {
            console.log(`${match}\n"${docs[match]}"\n`);
          });
        }
      });
  }
};

const docs = {
  "not(x:bool) ‑> z:bool": "logical not",
  "and(x:bool, y:bool) ‑> z:bool": "logical and",
  "or(x:bool, y:bool) ‑> z:bool": "logical or",
  "xor(x:bool, y:bool) ‑> z:bool": "xor",
  "addu256(x:u256, y:u256) ‑> z:u256": "x + y",
  "subu256(x:u256, y:u256) ‑> z:u256": "x - y",
  "mulu256(x:u256, y:u256) ‑> z:u256": "x * y",
  "divu256(x:u256, y:u256) ‑> z:u256": "x / y",
  "divs256(x:s256, y:s256) ‑> z:s256": "x / y, for signed numbers in two’s complement",
  "modu256(x:u256, y:u256) ‑> z:u256": "x % y",
  "mods256(x:s256, y:s256) ‑> z:s256": "x % y, for signed numbers in two’s complement",
  "signextendu256(i:u256, x:u256) ‑> z:u256": "sign extend from (i*8+7)th bit counting from least significant",
  "expu256(x:u256, y:u256) ‑> z:u256": "x to the power of y",
  "addmodu256(x:u256, y:u256, m:u256) ‑> z:u256": "(x + y) % m with arbitrary precision arithmetic",
  "mulmodu256(x:u256, y:u256, m:u256) ‑> z:u256": "(x * y) % m with arbitrary precision arithmetic",
  "ltu256(x:u256, y:u256) ‑> z:bool": "true if x < y, false otherwise",
  "gtu256(x:u256, y:u256) ‑> z:bool": "true if x > y, false otherwise",
  "lts256(x:s256, y:s256) ‑> z:bool": "true if x < y, false otherwise (for signed numbers in two’s complement)",
  "gts256(x:s256, y:s256) ‑> z:bool": "true if x > y, false otherwise (for signed numbers in two’s complement)",
  "equ256(x:u256, y:u256) ‑> z:bool": "true if x == y, false otherwise",
  "iszerou256(x:u256) ‑> z:bool": "true if x == 0, false otherwise",
  "notu256(x:u256) ‑> z:u256": "~x, every bit of x is negated",
  "andu256(x:u256, y:u256) ‑> z:u256": "bitwise and of x and y",
  "oru256(x:u256, y:u256) ‑> z:u256": "bitwise or of x and y",
  "xoru256(x:u256, y:u256) ‑> z:u256": "bitwise xor of x and y",
  "shlu256(x:u256, y:u256) ‑> z:u256": "logical left shift of x by y",
  "shru256(x:u256, y:u256) ‑> z:u256": "logical right shift of x by y",
  "sars256(x:s256, y:u256) ‑> z:u256": "arithmetic right shift of x by y",
  "byte(n:u256, x:u256) ‑> v:u256": "nth byte of x, where the most significant byte is the 0th byte Cannot this be just replaced by and256(shr256(n, x), 0xff) and let it be optimised out by the EVM backend?",
  "mload(p:u256) ‑> v:u256": "mem[p..(p+32))",
  "mstore(p:u256, v:u256)": "mem[p..(p+32)) := v",
  "mstore8(p:u256, v:u256)": "mem[p] := v & 0xff - only modifies a single byte",
  "sload(p:u256) ‑> v:u256": "storage[p]",
  "sstore(p:u256, v:u256)": "storage[p] := v",
  "msize() ‑> size:u256": "size of memory, i.e. largest accessed memory index, albeit due due to the memory extension function, which extends by words, this will always be a multiple of 32 bytes",
  "create(v:u256, p:u256, n:u256)": "create new contract with code mem[p..(p+n)) and send v wei and return the new address",
  "create2(v:u256, p:u256, n:u256, s:u256)": "create new contract with code mem[p…(p+n)) at address keccak256(0xff . this . s . keccak256(mem[p…(p+n))) and send v wei and return the new address, where 0xff is a 8 byte value, this is the current contract’s address as a 20 byte value and s is a big-endian 256-bit value",
  "call(g:u256, a:u256, v:u256, in:u256, insize:u256, out:u256, outsize:u256) ‑> r:u256": "call contract at address a with input mem[in..(in+insize)) providing g gas and v wei and output area mem[out..(out+outsize)) returning 0 on error (eg. out of gas) and 1 on success",
  "callcode(g:u256, a:u256, v:u256, in:u256, insize:u256, out:u256, outsize:u256) ‑> r:u256": "identical to call but only use the code from a and stay in the context of the current contract otherwise",
  "delegatecall(g:u256, a:u256, in:u256, insize:u256, out:u256, outsize:u256) ‑> r:u256": "identical to callcode, but also keep caller and callvalue",
  "abort()": "abort (equals to invalid instruction on EVM)",
  "return(p:u256, s:u256)": "end execution, return data mem[p..(p+s))",
  "revert(p:u256, s:u256)": "end execution, revert state changes, return data mem[p..(p+s))",
  "selfdestruct(a:u256)": "end execution, destroy current contract and send funds to a",
  "log0(p:u256, s:u256)": "log without topics and data mem[p..(p+s))",
  "log1(p:u256, s:u256, t1:u256)": "log with topic t1 and data mem[p..(p+s))",
  "log2(p:u256, s:u256, t1:u256, t2:u256)": "log with topics t1, t2 and data mem[p..(p+s))",
  "log3(p:u256, s:u256, t1:u256, t2:u256, t3:u256)": "log with topics t, t2, t3 and data mem[p..(p+s))",
  "log4(p:u256, s:u256, t1:u256, t2:u256, t3:u256, t4:u256)": "log with topics t1, t2, t3, t4 and data mem[p..(p+s))",
  "blockcoinbase() ‑> address:u256": "current mining beneficiary",
  "blockdifficulty() ‑> difficulty:u256": "difficulty of the current block",
  "blockgaslimit() ‑> limit:u256": "block gas limit of the current block",
  "blockhash(b:u256) ‑> hash:u256": "hash of block nr b - only for last 256 blocks excluding current",
  "blocknumber() ‑> block:u256": "current block number",
  "blocktimestamp() ‑> timestamp:u256": "timestamp of the current block in seconds since the epoch",
  "txorigin() ‑> address:u256": "transaction sender",
  "txgasprice() ‑> price:u256": "gas price of the transaction",
  "gasleft() ‑> gas:u256": "gas still available to execution",
  "balance(a:u256) ‑> v:u256": "wei balance at address a",
  "this() ‑> address:u256": "address of the current contract / execution context",
  "caller() ‑> address:u256": "call sender (excluding delegatecall)",
  "callvalue() ‑> v:u256": "wei sent together with the current call",
  "calldataload(p:u256) ‑> v:u256": "call data starting from position p (32 bytes)",
  "calldatasize() ‑> v:u256": "size of call data in bytes",
  "calldatacopy(t:u256, f:u256, s:u256)": "copy s bytes from calldata at position f to mem at position t",
  "codesize() ‑> size:u256": "size of the code of the current contract / execution context",
  "codecopy(t:u256, f:u256, s:u256)": "copy s bytes from code at position f to mem at position t",
  "extcodesize(a:u256) ‑> size:u256": "size of the code at address a",
  "extcodecopy(a:u256, t:u256, f:u256, s:u256)": "like codecopy(t, f, s) but take code at address a",
  "extcodehash(a:u256)": "code hash of address a",
  "discard(unused:bool)": "discard value",
  "discardu256(unused:u256)": "discard value",
  "splitu256tou64(x:u256) ‑> (x1:u64, x2:u64, x3:u64, x4:u64)": "split u256 to four u64’s",
  "combineu64tou256(x1:u64, x2:u64, x3:u64, x4:u64) ‑> (x:u256)": "combine four u64’s into a single u256",
  "keccak256(p:u256, s:u256) ‑> v:u256": "keccak(mem[p…(p+s)))",
  "datasize(name:string) ‑> size:u256": "size of the data object in bytes, name has to be string literal",
  "dataoffset(name:string) ‑> offset:u256": "offset of the data object inside the data area in bytes, name has to be string literal",
  "datacopy(dst:u256, src:u256, len:u256)": "copy len bytes from the data area starting at offset src bytes to memory at position dst"
};
