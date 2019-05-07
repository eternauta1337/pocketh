# selector_list

Prints function selectors for the abi of a contract.
E.g. `0x095ea7b3 approve(address,uint256)`

## Usage:
```
npm run list <contractPath>
```

## Parameters:
- contractPath: The compiled json artifacts of a contract.

## Example:
```
npm run list ~/cryptokitties/build/contracts/KittyCore.json
```

## Sample output:
```
KittyCore

HASH:      SIGNATURE:
0x01ffc9a7 supportsInterface(bytes4)
0x0519ce79 cfoAddress()
0x0560ff44 tokenMetadata(uint256,string)
0x05e45546 promoCreatedCount()
0x06fdde03 name()
0x095ea7b3 approve(address,uint256)
0x0a0f8168 ceoAddress()
0x0e583df0 GEN0_STARTING_PRICE()
0x14001f4c setSiringAuctionAddress(address)
0x18160ddd totalSupply()
0x183a7947 pregnantKitties()
0x1940a936 isPregnant(uint256)
0x19c2f201 GEN0_AUCTION_DURATION()
0x21717ebf siringAuction()
0x23b872dd transferFrom(address,address,uint256)
0x24e7a38a setGeneScienceAddress(address)
0x27d7874c setCEO(address)
0x2ba73c15 setCOO(address)
0x3d7d3f5a createSaleAuction(uint256,uint256,uint256,uint256)
0x46116e6f sireAllowedToAddress(uint256)
0x46d22c70 canBreedWith(uint256,uint256)
0x481af3d3 kittyIndexToApproved(uint256)
0x4ad8c938 createSiringAuction(uint256,uint256,uint256,uint256)
0x4b85fd55 setAutoBirthFee(uint256)
0x4dfff04f approveSiring(address,uint256)
0x4e0a3379 setCFO(address)
0x56129134 createPromoKitty(uint256,address)
0x5663896e setSecondsPerBlock(uint256)
0x5c975abb paused()
0x6352211e ownerOf(uint256)
0x680eba27 GEN0_CREATION_LIMIT()
0x6af04a57 newContractAddress()
0x6fbde40d setSaleAuctionAddress(address)
0x70a08231 balanceOf(address)
0x7a7d4937 secondsPerBlock()
0x8456cb59 pause()
0x8462151c tokensOfOwner(address)
0x88c2a0bf giveBirth(uint256)
0x91876e57 withdrawAuctionBalances()
0x95d89b41 symbol()
0x9d6fac6f cooldowns(uint256)
0xa45f4bfc kittyIndexToOwner(uint256)
0xa9059cbb transfer(address,uint256)
0xb047fb50 cooAddress()
0xb0c35c05 autoBirthFee()
0xbc4006f5 erc721Metadata()
0xc3bea9af createGen0Auction(uint256)
0xd3e6f49f isReadyToBreed(uint256)
0xdefb9584 PROMO_CREATION_LIMIT()
0xe17b25af setMetadataAddress(address)
0xe6cbe351 saleAuction()
0xed60ade6 bidOnSiringAuction(uint256,uint256)
0xf1ca9410 gen0CreatedCount()
0xf2b47d52 geneScience()
0xf7d8c883 breedWithAuto(uint256,uint256)
0x71587988 setNewAddress(address)
0xe98b7f4d getKitty(uint256)
0x3f4ba83a unpause()
0x5fd8c710 withdrawBalance()
```
