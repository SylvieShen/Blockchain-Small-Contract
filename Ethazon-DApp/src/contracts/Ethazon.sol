pragma solidity ^0.5.0;

contract Ethazon {
    string public shopName;
    address payable owner;
    uint public orderPrice;
    struct EthazonOrder{
        bool isValidEthazonOrder;
        string customerName;
        string shipmentAddress;
        bool hasConfirmed;
    }
    
   mapping(address => EthazonOrder) public order;

   event orderMade(bool isValidEthazonOrder, string customerName, string shipmentAddress, bool hasConfirmed);
   event orderConfirmed(bool isValidEthazonOrder, string customerName, string shipmentAddress, bool hasConfirmed);
   event orderCancelled(bool isValidEthazonOrder, string customerName, string shipmentAddress, bool hasConfirmed);
   event transfered(address payable to, uint value);



    constructor() public {
        shopName = "shenyue Ethazon.com";
        owner = msg.sender;
        orderPrice = 2000000000000000000;
    }

     function makeOrder(string memory _customerName, string memory _shipmentAddress) public payable{
        require(bytes(_customerName).length > 0, "Customer's name shouldn't be empty!");
        require(bytes(_shipmentAddress).length > 0, "Shipment Address shouldn't be empty!");
        require(msg.value >= orderPrice, "Payment should be enough!" );
        EthazonOrder memory _order = order[msg.sender];
       // require(!_order.isValidEthazonOrder && _order.hasConfirmed, "Customer can make an order only when she/he has confirmed or cancelled the existing order");
        order[msg.sender] = EthazonOrder(true, _customerName, _shipmentAddress, false);

        transferMoney(owner);

        emit orderMade(true, _customerName, _shipmentAddress, false);
        
    }

    function confirmOrder(string memory _customerName, string memory _shipmentAddress) public{
        
        EthazonOrder memory _order = order[msg.sender];
        require(_order.isValidEthazonOrder, "The order to be confirmed should be valid!");
        

        _order.hasConfirmed = true;
        order[msg.sender] = _order;

        emit orderConfirmed(true, _customerName, _shipmentAddress, true);
        
    }

    function cancelOrder(string memory _customerName, string memory _shipmentAddress) public payable{
        
        EthazonOrder memory _order = order[msg.sender];
        require(!_order.hasConfirmed, "The order to be canceled should not be confirmed");

        _order.isValidEthazonOrder = false;
        order[msg.sender] = _order;
        transferMoney(msg.sender);

        emit orderConfirmed(false, _customerName, _shipmentAddress, false);
        
    }

    

    function transferMoney(address payable _to) public payable{
         require(msg.value >= orderPrice, "Payment should be enough!" );
        _to.transfer(orderPrice);

         emit transfered(_to, orderPrice);
    }


}