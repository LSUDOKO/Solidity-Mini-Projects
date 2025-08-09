const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Escrow', () => {
    let buyer, seller,inspector,lender
    let realEstate,escrow;
    beforeEach(async () => {
        //Setup accounts
        [buyer, seller,inspector,lender] = await ethers.getSigners();
        
        //Deploy RealEstate contract 
        const RealEstate=await ethers.getContractFactory('RealEstate')
        realEstate=await RealEstate.deploy()
        console.log(realEstate.address)
        //Mint
        let transaction=await realEstate.connect(seller).mint("https://ipfs.io/ipfs/QmQVcpsjrA6cr1i1jJZAodwmpPekyGbnXGo4DFubJiLc2EB/1.json")
        await transaction.wait()

        //Deploy Escrow contract
        const Escrow=await ethers.getContractFactory('Escrow')
        escrow=await Escrow.deploy(realEstate.address,seller.address,lender.address,inspector.address)
        // console.log(escrow.address)
        transaction=await realEstate.connect(seller).approve(escrow.address,1)
        await transaction.wait()
        //List the property
        transaction=await escrow.connect(seller).list(1,buyer.address,tokens(10),tokens(5))
        await transaction.wait()
        

    })


    describe('Deployment', () => {
        it('returns nft address', async () => {
            const result=await escrow.nftAddress()
            expect(result).to.equal(realEstate.address)


    })
    it ('sets the buyer', async () => {
        const result2=await escrow.seller()
        expect(result2).to.equal(seller.address)

    })
    it('sets the inspector', async () => {
        const result2=await escrow.inspector()
        expect(result2).to.equal(inspector.address)

    })    
    it('sets the lender', async () => {
        const result2=await escrow.lender()
        expect(result2).to.equal(lender.address)

    })



    }) 
     describe('Listing', () => {
        it ('Updates as listed',async()=>{
            const result=await escrow.isListed(1)
            expect(result).to.be.equal(true);
        })

        it('Update ownership ', async () => {
           expect(await realEstate.ownerOf(1)).to.equal(escrow.address)
        })

        it ('Return buyer',async() =>{
            const result =await escrow.buyer(1);
            expect(result).to.be.equal(buyer.address)
        })

        it ('Return Purchase Price',async() =>{
            const result =await escrow.purchasePrice(1);
            expect(result).to.be.equal(tokens(10))
        })

        it ('Return escrow amount',async() =>{
            const result =await escrow.escrowAmount(1);
            expect(result).to.be.equal(tokens(5))
        })
    })

    describe('Deposits', () => {
        beforeEach(async () => {
            const transaction = await escrow.connect(buyer).depositEarnest(1, { value: tokens(5) })
            await transaction.wait()
        })

        it('Updates contract balance', async () => {
            const result = await escrow.getBalance()
            expect(result).to.be.equal(tokens(5))
        })
    })

    describe('Inspection', () => {
        it('Updates inspection status', async () => {
            const transaction = await escrow.connect(inspector).updateInspectionStatus(1, true)
            await transaction.wait()

            const result = await escrow.inspection(1)
            expect(result).to.be.equal(true)
        })
    })

    describe('Approval', () => {
        it('Updates approval status', async () => {
            let transaction = await escrow.connect(buyer).approveSale(1)
            await transaction.wait()

            let transaction=await escrow.connect(seller).approveSale(1)
            await transaction.wait()

            let transaction=await escrow.connect(lender).approveSale(1)
            await transaction.wait()

            const result = await escrow.approval(1, buyer.address)
            expect(result).to.be.equal(true)
            expect(await escrow.approval(1,seller.address)).to.be.equal(true);
            expect(await escrow.approval(1,lender.address)).to.be.equal(true);
            
        })
    })

    describe('Sale', () => {
        beforeEach(async () => {
            let transaction = await escrow.connect(buyer).depositEarnest(1, { value: tokens(5) })
            await transaction.wait()

            transaction = await escrow.connect(inspector).updateInspectionStatus(1, true)
            await transaction.wait()

            transaction = await escrow.connect(buyer).approveSale(1)
            await transaction.wait()

            transaction = await escrow.connect(seller).approveSale(1)
            await transaction.wait()

            transaction = await escrow.connect(lender).approveSale(1)
            await transaction.wait()

            await lender.sendTransaction({ to: escrow.address, value: tokens(5) })

            transaction = await escrow.connect(seller).finalizeSale(1)
            await transaction.wait()
        })

        it('Updates ownership', async () => {
            expect(await realEstate.ownerOf(1)).to.be.equal(buyer.address)
        })

        it('Updates balance', async () => {
            expect(await escrow.getBalance()).to.be.equal(0)
        })
    })
    
   
    }) 
    

