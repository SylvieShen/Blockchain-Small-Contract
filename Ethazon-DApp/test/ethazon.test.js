const Ethazon = artifacts.require("Ethazon");
require('chai')
    .use(require('chai-as-promised'))
    .should();

contract(Ethazon, ([owner, buyer, buyer2]) => {
    let ethazon;
    before(async() => {
        // let orderPrice;
        // orderPrice = web3.utils.toWei('2', 'Ether');
        // orderPrice = new web3.utils.BN(orderPrice);
        // ethazon = await Ethazon.deployed(web3.utils.toWei('2', 'Ether'));
        ethazon = await Ethazon.deployed();
    })

    describe('Making an order unsuccessfully', async() => {
        it('A customer cannot make the order if either the customerName or shipmentAddress is empty', async() => {
            await ethazon.makeOrder('', '37th Avenue', { from: buyer, value: web3.utils.toWei('2', 'Ether') }).should.be.rejected;
            await ethazon.makeOrder('Shen Yue', '', { from: buyer, value: web3.utils.toWei('2', 'Ether') }).should.be.rejected;
        })
        it('A customer cannot make the order if she/he does not send enough ether to the smart contract', async() => {
            await ethazon.makeOrder('Shen Yue', '37th Avenue', { from: buyer, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected;
        })
    })

    describe('Making an order', async() => {
        let result;
        before(async() => {
            result = await ethazon.makeOrder('Shen Yue', '37th Avenue', { from: buyer, value: web3.utils.toWei('2', 'Ether') });
        })

        it('If everything is OK, a customer should create an order successfully', async() => {
            const event = result.logs[1].args;
            assert.equal(event.isValidEthazonOrder, true, 'Order is valid');
            assert.equal(event.customerName, 'Shen Yue', 'customerName is correct');
            assert.equal(event.shipmentAddress, '37th Avenue', 'shipmentAddress is correct');
            assert.equal(event.hasConfirmed, false, 'Order has not been confirmed');
        })

        it('A customer cannot make another order before she/he has confirmed or canceled the existing order', async() => {
            await ethazon.makeOrder('Shen Yue', '41th Avenue', { from: buyer, value: web3.utils.toWei('2', 'Ether') }).should.be.rejected;
        })

        it('A customer can confirm the order is everything is good', async() => {
            result = await ethazon.confirmOrder('Shen Yue', '37th Avenue', { from: buyer })
            const event = result.logs[0].args;
            assert.equal(event.isValidEthazonOrder, true, 'Order is valid');
            assert.equal(event.customerName, 'Shen Yue', 'customerName is correct');
            assert.equal(event.shipmentAddress, '37th Avenue', 'shipmentAddress is correct');
            assert.equal(event.hasConfirmed, true, 'Order has been confirmed');
        })



        it('A customer cannot cancel the order if the customer has confirmed the order', async() => {
            await ethazon.cancelOrder('Shen Yue', '37th Avenue', { from: buyer }).should.be.rejected;
        })

        it('A customer should receive the money when she/he cancel the order successfully', async() => {
            let buyerOldBalance;
            buyerOldBalance = await web3.eth.getBalance(buyer2);
            buyerOldBalance = new web3.utils.BN(buyerOldBalance);
            result = await ethazon.makeOrder('Li hua', '41th Avenue', { from: buyer2, value: web3.utils.toWei('2', 'Ether') });
            result = await ethazon.cancelOrder('Li hua', '41th Avenue', { from: buyer2 });
            const event = result.logs[1].args;
            assert.equal(event.isValidEthazonOrder, false, 'Order has been canceled');

            let buyerNewBalance;
            buyerNewBalance = await web3.eth.getBalance(buyer);
            buyerNewBalance = new web3.utils.BN(buyerNewBalance);

            let refund;
            refund = web3.utils.toWei('2', 'Ether');
            refund = new web3.utils.BN(refund);

            const expectedBalacne = buyerOldBalance.add(refund);
            assert.equal(expectedBalacne.toString(), buyerNewBalance.toString());
        })

        it('A customer cannot confirm if the order is not valid', async() => {
            await ethazon.confirmOrder('Shen Yue', '37th Avenue', { from: buyer }).should.be.rejected;
        })


    })

});