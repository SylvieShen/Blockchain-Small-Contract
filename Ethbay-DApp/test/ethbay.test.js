const Ethbay = artifacts.require("Ethbay");
require('chai')
    .use(require('chai-as-promised'))
    .should();

contract(Ethbay, ([deployer, seller, buyer]) => {
    let ethbay;
    before(async() => {
        ethbay = await Ethbay.deployed();

    });

    describe('Deployment', async() => {
        it('The deployment should be done successfully', async() => {
            const address = await ethbay.address;
            assert.notEqual(address, 0x0);
            assert.notEqual(address, '');
            //guaratee the address is not zero;
        })
        it('The deployed smart contract has the correct storeName', async() => {
            const storeName = await ethbay.storeName();
            assert.equal(storeName, "shenyue ETHBAY.COM");
        })

    });

    describe('Creating and selling item', async() => {
        let result, totalNumber;
        before(async() => {
            result = await ethbay.createItem('T-shirt', web3.utils.toWei('1', 'Ether'), { from: seller })
            totalNumber = await ethbay.totalNumber();
        })

        it('Creating an item should be successful if all is correct', async() => {
            assert.equal(totalNumber, 1);
            //console.log(result);
            const event = result.logs[0].args;
            assert.equal(event.itemId.toNumber(), totalNumber.toNumber());
            assert.equal(event.itemName, 'T-shirt');
            assert.equal(event.itemPrice, '1000000000000000000');
            assert.equal(event.itemOwner, seller);
            assert.equal(event.isItemSold, false);

        })
        it('Check the created item', async() => {
            const item = await ethbay.items(totalNumber);
            assert.equal(item.itemId.toNumber(), totalNumber.toNumber());
            assert.equal(item.itemName, 'T-shirt');
            assert.equal(item.itemPrice, '1000000000000000000');
            assert.equal(item.itemOwner, seller);
            assert.equal(item.isItemSold, false);

        })


        it('Selling an item should be successful if all is correct', async() => {
            //Remember the original balance of seller
            let sellerOldBalance;
            sellerOldBalance = await web3.eth.getBalance(seller);
            sellerOldBalance = new web3.utils.BN(sellerOldBalance);

            //Remember the original balance of buyer
            let buyerOldBalance;
            buyerOldBalance = await web3.eth.getBalance(buyer);
            buyerOldBalance = new web3.utils.BN(buyerOldBalance);


            //buyer buy an item
            result = await ethbay.buyItem(totalNumber, { from: buyer, value: web3.utils.toWei('1', 'Ether') });

            //Check the bought item
            const event = result.logs[0].args;
            assert.equal(event.itemId.toNumber(), totalNumber.toNumber());
            assert.equal(event.itemName, 'T-shirt');
            assert.equal(event.itemPrice, '1000000000000000000');
            assert.equal(event.itemOwner, buyer);
            assert.equal(event.isItemSold, true);


            // Check the seller receives the funds
            let sellerNewBalance;
            sellerNewBalance = await web3.eth.getBalance(seller);
            sellerNewBalance = await new web3.utils.BN(sellerNewBalance);

            let price;
            price = web3.utils.toWei('1', 'Ether');
            price = new web3.utils.BN(price);

            const sellerExpectedBalance = sellerOldBalance.add(price);
            assert.equal(sellerExpectedBalance.toString(), sellerNewBalance.toString());

        })

        it('Selling the item twice should be rejected', async() => {
            // FAILURE: Cannot be purchased twice
            await ethbay.buyItem(totalNumber, { from: buyer, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected;
        })
        it('Selling the item with wrong Id should be rejected', async() => {
            // FAILURE: Invalid Item ID
            await ethbay.buyItem(99, { from: buyer, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected;
        })

        it('Adding another testing item should be succefully done', async() => {
            await ethbay.createItem('Something', web3.utils.toWei('1', 'Ether'), { from: seller });
        })

        it('Creating item should be failed if either no name or no price', async() => {
            //Product must have a name
            await ethbay.createItem('', web3.utils.toWei('1', 'Ether'), { from: seller }).should.be.rejected;
            //Price must be greater than 0
            await ethbay.createItem('T-shirt', web3.utils.toWei('0', 'Ether'), { from: seller }).should.be.rejected;
        })

        it('Buying the item with insufficient fund should be failed', async() => {
            // FAILURE: Invalid Value in Payment
            await ethbay.buyItem(totalNumber, { from: buyer, value: web3.utils.toWei('0.5', 'Ether') }).should.be.rejected;
        })

        it('Seller buying item from her/hisself should be rejected', async() => {
            // FAILURE: Invalid Buyer cannot be the Seller
            await ethbay.buyItem(totalNumber, { from: seller, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected;
        })


    });


})