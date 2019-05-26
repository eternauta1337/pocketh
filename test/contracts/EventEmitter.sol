pragma solidity ^0.5.0;

contract EventEmitter {

  uint256 value;

  event Log(uint256 value);

  function emitEventWithValue(uint256 _value) public {
    value = _value;
    emit Log(_value);
  }

  function anotherMethod() public {
    value = 0;
  }
}
