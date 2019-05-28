pragma solidity ^0.5.0;

// This comment should be part of SplitMe1.
contract SplitMe1 {/* This should not cause SplitMe1 to contract SplitMe3 */}

// This comment about SplitMe3, should not cause an import of SplitMe3 in SplitMe2.
/*
 * This comment about SplitMe3, should not cause an import of SplitMe3 in SplitMe2.
 This comment about SplitMe3, should not cause an import of SplitMe3 in SplitMe2.
 */
contract SplitMe2 is SplitMe1 {
  function test() public pure {
    {{{{{{{{{{{}}}}}}}}}}}
  }
  function anotherTest() {
    {
      {
        {
          {
            {
              {
                {
                  {
                    {
                      {
                        {}
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

contract SplitMe3 is SplitMe2 {
  SplitMe1 splitMe1; // Should cause an import.
}
