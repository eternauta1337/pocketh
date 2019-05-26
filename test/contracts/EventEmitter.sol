pragma solidity ^0.5.0;

contract EventEmitter {
  event Log(uint256 value);
  function emitEventWithValue(uint256 value) public {
    emit Log(value);
  }
}
