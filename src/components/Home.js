import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

import close from '../assets/close.svg';

const Home = ({ home, provider, account, escrow, togglePop }) => {
    const [hasBought, setHasBought] = useState(false)
    const [hasLended, setHasLended] = useState(false)
    const [hasInspected, setHasInspected] = useState(false)
    const [hasSold, setHasSold] = useState(false)

    const [buyer, setBuyer] = useState(null)
    const [lender, setLender] = useState(null)
    const [inspector, setInspector] = useState(null)
    const [seller, setSeller] = useState(null)

    const [owner, setOwner] = useState(null)
    const [loading, setLoading] = useState(false)

    // Debug logging
    useEffect(() => {
        console.log("Home component props:", {
            home: home?.id,
            provider: !!provider,
            account,
            escrow: !!escrow,
            escrowAddress: escrow?.address
        })
    }, [home, provider, account, escrow])

    const fetchDetails = async () => {
        if (!escrow || !home.id) return;
        
        try {
            // -- Buyer
            const buyer = await escrow.buyer(home.id)
            setBuyer(buyer)

            const hasBought = await escrow.approval(home.id, buyer)
            setHasBought(hasBought)

            // -- Seller
            const seller = await escrow.seller()
            setSeller(seller)

            const hasSold = await escrow.approval(home.id, seller)
            setHasSold(hasSold)

            // -- Lender
            const lender = await escrow.lender()
            setLender(lender)

            const hasLended = await escrow.approval(home.id, lender)
            setHasLended(hasLended)

            // -- Inspector
            const inspector = await escrow.inspector()
            setInspector(inspector)

            const hasInspected = await escrow.inspection(home.id)
            setHasInspected(hasInspected)
        } catch (error) {
            console.error("Error fetching details:", error)
        }
    }

    const fetchOwner = async () => {
        if (!escrow || !home.id) return;
        
        try {
            const isListed = await escrow.isListed(home.id)
            if (isListed) return

            const owner = await escrow.buyer(home.id)
            setOwner(owner)
        } catch (error) {
            console.error("Error fetching owner:", error)
        }
    }

    const buyHandler = async () => {
        setLoading(true)
        try {
            // Validate inputs
            if (!escrow) {
                throw new Error("Escrow contract not loaded. Please refresh the page.")
            }
            if (!provider) {
                throw new Error("Provider not available. Please connect MetaMask.")
            }
            if (!home.id) {
                throw new Error("Property ID not available.")
            }

            console.log("Starting buy process for property", home.id)
            
            const escrowAmount = await escrow.escrowAmount(home.id)
            console.log("Escrow amount:", ethers.utils.formatEther(escrowAmount), "ETH")
            
            const signer = await provider.getSigner()

            // Buyer deposit earnest
            console.log("Depositing earnest money...")
            let transaction = await escrow.connect(signer).depositEarnest(home.id, { 
                value: escrowAmount,
                gasLimit: 300000 
            })
            await transaction.wait()
            console.log("Earnest money deposited!")

            // Buyer approves...
            console.log("Approving sale...")
            transaction = await escrow.connect(signer).approveSale(home.id)
            await transaction.wait()
            console.log("Sale approved!")

            setHasBought(true)
            alert("Purchase successful! Earnest money deposited and sale approved.")
        } catch (error) {
            console.error("Buy failed:", error)
            alert("Purchase failed: " + error.message)
        }
        setLoading(false)
    }

    const inspectHandler = async () => {
        setLoading(true)
        try {
            // Validate inputs
            if (!escrow) {
                throw new Error("Escrow contract not loaded. Please refresh the page.")
            }
            if (!provider) {
                throw new Error("Provider not available. Please connect MetaMask.")
            }
            if (!home.id) {
                throw new Error("Property ID not available.")
            }

            console.log("Starting inspection approval for property", home.id)
            
            const signer = await provider.getSigner()

            // Inspector updates status
            console.log("Updating inspection status...")
            const transaction = await escrow.connect(signer).updateInspectionStatus(home.id, true)
            await transaction.wait()
            console.log("Inspection approved!")

            setHasInspected(true)
            alert("Inspection approved successfully!")
        } catch (error) {
            console.error("Inspection approval failed:", error)
            alert("Inspection approval failed: " + error.message)
        }
        setLoading(false)
    }

    const lendHandler = async () => {
        try {
            console.log("Starting lending process for property", home.id)
            
            const signer = await provider.getSigner()

            // Lender approves...
            console.log("Approving sale as lender...")
            const transaction = await escrow.connect(signer).approveSale(home.id)
            await transaction.wait()

            // Lender sends funds to contract...
            const purchasePrice = await escrow.purchasePrice(home.id)
            const escrowAmount = await escrow.escrowAmount(home.id)
            const lendAmount = purchasePrice.sub(escrowAmount)
            
            console.log("Sending lending amount:", ethers.utils.formatEther(lendAmount), "ETH")
            await signer.sendTransaction({ 
                to: escrow.address, 
                value: lendAmount.toString(), 
                gasLimit: 300000 
            })

            setHasLended(true)
            alert("Lending approved and funds sent successfully!")
        } catch (error) {
            console.error("Lending failed:", error)
            alert("Lending failed: " + error.message)
        }
    }

    const sellHandler = async () => {
        try {
            console.log("Starting sell process for property", home.id)
            
            const signer = await provider.getSigner()

            // Seller approves...
            console.log("Approving sale as seller...")
            let transaction = await escrow.connect(signer).approveSale(home.id)
            await transaction.wait()

            // Seller finalize...
            console.log("Finalizing sale...")
            transaction = await escrow.connect(signer).finalizeSale(home.id)
            await transaction.wait()

            setHasSold(true)
            alert("Sale finalized successfully! Property ownership transferred.")
        } catch (error) {
            console.error("Sale finalization failed:", error)
            alert("Sale finalization failed: " + error.message)
        }
    }

    useEffect(() => {
        if (escrow && home.id) {
            fetchDetails()
            fetchOwner()
        }
    }, [escrow, home.id, hasSold, hasBought, hasInspected, hasLended])

    // Don't render if essential props are missing
    if (!home || !provider) {
        return (
            <div className="home">
                <div className='home__details'>
                    <div style={{ padding: '50px', textAlign: 'center' }}>
                        <p>Loading property details...</p>
                    </div>
                    <button onClick={togglePop} className="home__close">
                        <img src={close} alt="Close" />
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="home">
            <div className='home__details'>
                <div className="home__image">
                    <img src={home.image} alt="Home" />
                </div>
                <div className="home__overview">
                    <h1>{home.name}</h1>
                    <p>
                        <strong>{home.attributes && home.attributes[2] ? home.attributes[2].value : 'N/A'}</strong> bds |
                        <strong>{home.attributes && home.attributes[3] ? home.attributes[3].value : 'N/A'}</strong> ba |
                        <strong>{home.attributes && home.attributes[4] ? home.attributes[4].value : 'N/A'}</strong> sqft
                    </p>
                    <p>{home.address}</p>

                    <h2>{home.attributes && home.attributes[0] ? home.attributes[0].value : 'N/A'} ETH</h2>

                    {/* Transaction Status */}
                    <div style={{ margin: '10px 0', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
                        <h4>Transaction Status:</h4>
                        <p>✅ Listed: Yes</p>
                        <p>{hasBought ? '✅' : '⏳'} Buyer Approved: {hasBought ? 'Yes' : 'No'}</p>
                        <p>{hasInspected ? '✅' : '⏳'} Inspection: {hasInspected ? 'Passed' : 'Pending'}</p>
                        <p>{hasLended ? '✅' : '⏳'} Lender Approved: {hasLended ? 'Yes' : 'No'}</p>
                        <p>{hasSold ? '✅' : '⏳'} Seller Approved: {hasSold ? 'Yes' : 'No'}</p>
                    </div>

                    {owner ? (
                        <div className='home__owned'>
                            Owned by {owner.slice(0, 6) + '...' + owner.slice(38, 42)}
                        </div>
                    ) : (
                        <div>
                            {!escrow ? (
                                <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
                                    <p>⚠️ Contract not loaded. Please ensure MetaMask is connected and contracts are deployed.</p>
                                    <p>Try refreshing the page or check the console for errors.</p>
                                </div>
                            ) : !account ? (
                                <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
                                    <p>🔗 Please connect your MetaMask wallet to interact with this property.</p>
                                </div>
                            ) : (
                                <>
                                    {(account === inspector) ? (
                                        <button 
                                            className='home__buy' 
                                            onClick={inspectHandler} 
                                            disabled={hasInspected || loading}
                                        >
                                            {loading ? 'Processing...' : hasInspected ? 'Inspection Approved' : 'Approve Inspection'}
                                        </button>
                                    ) : (account === lender) ? (
                                        <button 
                                            className='home__buy' 
                                            onClick={lendHandler} 
                                            disabled={hasLended || loading}
                                        >
                                            {loading ? 'Processing...' : hasLended ? 'Loan Approved' : 'Approve & Lend'}
                                        </button>
                                    ) : (account === seller) ? (
                                        <button 
                                            className='home__buy' 
                                            onClick={sellHandler} 
                                            disabled={hasSold || loading}
                                        >
                                            {loading ? 'Processing...' : hasSold ? 'Sale Completed' : 'Approve & Sell'}
                                        </button>
                                    ) : (
                                        <button 
                                            className='home__buy' 
                                            onClick={buyHandler} 
                                            disabled={hasBought || loading}
                                        >
                                            {loading ? 'Processing...' : hasBought ? 'Purchase Complete' : 'Buy'}
                                        </button>
                                    )}

                                    <button className='home__contact'>
                                        Contact agent
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    <hr />

                    <h2>Overview</h2>

                    <p>
                        {home.description}
                    </p>

                    <hr />

                    <h2>Facts and features</h2>

                    <ul>
                        {home.attributes.map((attribute, index) => (
                            <li key={index}><strong>{attribute.trait_type}</strong> : {attribute.value}</li>
                        ))}
                    </ul>
                </div>


                <button onClick={togglePop} className="home__close">
                    <img src={close} alt="Close" />
                </button>
            </div>
        </div>
    );
}

export default Home;
