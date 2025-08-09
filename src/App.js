import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

// Components
import Navigation from './components/Navigation';
import Search from './components/Search';
import Home from './components/Home';

// ABIs
import RealEstate from './abis/RealEstate.json'
import Escrow from './abis/Escrow.json'

// Config
import config from './config.json';

// Fallback data
import { properties as fallbackProperties } from './data/properties';

function App() {
  const [provider, setProvider] = useState(null)
  const [escrow, setEscrow] = useState(null)
  const [account, setAccount] = useState(null)
  const [homes, setHomes] = useState([])
  const [home, setHome] = useState({})
  const [toggle, setToggle] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadBlockchainData = async () => {
    setLoading(true)
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      setProvider(provider)
      
      const network = await provider.getNetwork()
      console.log("Connected to network:", network.chainId)
      
      // Check if we have config for this network
      if (!config[network.chainId]) {
        console.warn("No config found for network", network.chainId, "using fallback data")
        setHomes(fallbackProperties)
        setLoading(false)
        return
      }
      
      const realEstate = new ethers.Contract(config[network.chainId].realEstate.address, RealEstate, provider)
      const totalSupply = await realEstate.totalSupply()
      const homes = []

      console.log("Loading", totalSupply.toString(), "properties...")

      for (var i = 1; i <= totalSupply; i++) {
        try {
          const uri = await realEstate.tokenURI(i)
          console.log(`Loading metadata from: ${uri}`)
          
          const response = await fetch(uri)
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          
          const metadata = await response.json()
          metadata.id = i // Ensure ID is set
          homes.push(metadata)
        } catch (error) {
          console.warn(`Failed to load metadata for property ${i}:`, error)
          // Use fallback data for this property
          if (fallbackProperties[i-1]) {
            const fallbackProperty = {...fallbackProperties[i-1]}
            fallbackProperty.id = i
            homes.push(fallbackProperty)
          }
        }
      }

      console.log("Loaded homes:", homes)
      setHomes(homes)

      const escrow = new ethers.Contract(config[network.chainId].escrow.address, Escrow, provider)
      console.log("Escrow contract loaded:", escrow.address)
      setEscrow(escrow)

      window.ethereum.on('accountsChanged', async () => {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = ethers.utils.getAddress(accounts[0])
        setAccount(account);
      })
    } catch (error) {
      console.error("Error loading blockchain data:", error)
      // Use fallback data if everything fails
      console.log("Using fallback property data")
      setHomes(fallbackProperties)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadBlockchainData()
  }, [])

  const togglePop = (home) => {
    setHome(home)
    toggle ? setToggle(false) : setToggle(true);
  }

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />
      <Search />

      <div className='cards__section'>
        <h3>Homes For You</h3>

        <hr />

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <p>Loading properties...</p>
          </div>
        ) : homes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <p>No properties available. Make sure MetaMask is connected and contracts are deployed.</p>
          </div>
        ) : (
          <div className='cards'>
            {homes.map((home, index) => (
              <div className='card' key={index} onClick={() => togglePop(home)}>
                <div className='card__image'>
                  <img 
                    src={home.image} 
                    alt="Home" 
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/350x200?text=Property+Image'
                    }}
                  />
                </div>
                <div className='card__info'>
                  <h4>{home.attributes && home.attributes[0] ? home.attributes[0].value : 'N/A'} ETH</h4>
                  <p>
                    <strong>{home.attributes && home.attributes[2] ? home.attributes[2].value : 'N/A'}</strong> bds |
                    <strong>{home.attributes && home.attributes[3] ? home.attributes[3].value : 'N/A'}</strong> ba |
                    <strong>{home.attributes && home.attributes[4] ? home.attributes[4].value : 'N/A'}</strong> sqft
                  </p>
                  <p>{home.address || 'Address not available'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {toggle && (
        <Home home={home} provider={provider} account={account} escrow={escrow} togglePop={togglePop} />
      )}
    </div>
  );
}

export default App;
