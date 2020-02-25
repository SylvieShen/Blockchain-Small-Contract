pragma solidity ^0.5.0;

contract Ethbay{
string public storeName;
uint public totalNumber = 0;
struct Item{
    uint itemId;
    string itemName;
    uint itemPrice;  
    address payable itemOwner;
    bool isItemSold;
}
mapping (uint=> Item) public items;

event ItemReady(
    uint itemId,
    string itemName,
    uint itemPrice,
    address payable itemOwner,
    bool isItemSold
);
event ItemSold(
    uint itemId,
    string itemName,
    uint itemPrice,
    address payable itemOwner,
    bool isItemSold 
);
constructor() public{
    storeName = "shenyue ETHBAY.COM";
}
function createItem(string memory _itemName, uint _itemPrice) public{
    require(bytes(_itemName).length > 0, "Item's name is required!");
    require(_itemPrice > 0, "Item's price is required!");
    totalNumber++;
    items[totalNumber] = Item(totalNumber, _itemName, _itemPrice, msg.sender, false);
    emit ItemReady(totalNumber, _itemName, _itemPrice, msg.sender, false);
}

function buyItem(uint _itemId) public payable{
    //string length cannot be detemined, so we use "memory"
    Item memory _item = items[_itemId];
    address payable _seller = _item.itemOwner;
    require(_item.itemId > 0 && _item.itemId <= totalNumber, "Item should be ready to sell!");
    require(msg.value >= _item.itemPrice, "Payment should be enough!");
    require(!_item.isItemSold, "Item should not been sold yet!");
    require(msg.sender != _seller, "Cannot buy himself/herself");
    _item.itemOwner = msg.sender;
    _item.isItemSold = true;
    //Save the item to the blockchain
    items[_itemId] = _item;
    address(_seller).transfer(msg.value);
    //_seller.transfer(msg.value)
    emit ItemSold(_item.itemId, _item.itemName, _item.itemPrice, msg.sender, true);
}

}