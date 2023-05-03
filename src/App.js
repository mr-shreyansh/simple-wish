import React, { useEffect, useState } from "react";
import "./App.css";
import { ethers } from "ethers";
import abi from "./utils/WishPortal.json";

const getEthereumObject = () => window.ethereum;

/*
 * This function returns the first linked account found.
 * If there is no account linked, it will return null.
 */
const findMetaMaskAccount = async () => {
  try {
    const ethereum = getEthereumObject();

    /*
     * First make sure we have access to the Ethereum object.
     */
    if (!ethereum) {
      console.error("Make sure you have Metamask!");
      return null;
    }

    console.log("We have the Ethereum object", ethereum);
    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      return account;
    } else {
      console.error("No authorized account found");
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [allWishes, setAllWishes] = useState([]);
  const [message, setMessage] = useState('');
  const contractAddress = "0x0454d5062Cf159544C15974E1c671AE707F9e181"
  const contractABI = abi.abi;

  const wish = async (message) => {
    try {
      const { ethereum } = window;
       
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wishPortalContract = new ethers.Contract(contractAddress, contractABI, signer);
                 
  
        let count = await wishPortalContract.getTotalWishes();
        console.log("Retrieved total wish count...", count.toNumber());

        // // /*
        // // * Execute the actual wish from your smart contract
        // // */
        const wishTxn = await wishPortalContract.wish(message);
        console.log("Mining...", wishTxn.hash);

        await wishTxn.wait();
        console.log("Mined -- ", wishTxn.hash);

        count = await wishPortalContract.getTotalWishes();
        console.log("Retrieved total wish count...", count.toNumber());

        getAllWishes();
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }


  const connectWallet = async () => {
    try {
      const ethereum = getEthereumObject();
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.error(error);
    }
  };

  const getAllWishes = async () => {
    try{
      const {ethereum} = window;
      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wishPortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const wishes = await wishPortalContract.getAllWishes();

        let wishesCleaned = [];
 
        wishes.forEach(wish => {
          wishesCleaned.unshift({
            address:wish.wisher,
            message:wish.message,
            timestamp: new Date(wish.timestamp * 1000)
          })
        })

        setAllWishes(wishesCleaned);
        

      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  /*
   * This runs our function when the page loads.
   * More technically, when the App component "mounts".
   */
  useEffect( () => {
      const waitingfunction = async () => {
    const account = await findMetaMaskAccount();
    if (account !== null) {
      setCurrentAccount(account);
    }
  };
  waitingfunction();
  getAllWishes();
  }, []);

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          👋 Hey there!
        </div>
       <div className="containt">

        <div className="bio">
          I am Shreyansh and I will grant you a wish!
          This process will be randomly done by the smart contract.
          And you will recieve some <strong>ETH</strong> in return!!!!
        </div>
        <div className="wish-container">
       <h1>Make a Wish</h1>
        <input type="text" placeholder="make a wish" value={message} onChange={(e)=>{setMessage(e.target.value)}}></input>

        <button className="wishButton" onClick={()=>wish(message)}>
         Make a Wish
        </button>
        </div>
       </div>

        {/*
         * If there is no currentAccount render this button
         */}
        {!currentAccount && (
          <div>
          <button className="wishButton" onClick={connectWallet}>
            Connect Wallet
          </button>
          </div>
        )}
      </div>

      {
         allWishes && allWishes.map((wish,index)=>{
            return (
             <div key={index} className="wish-box">
                <div className="wish-data">
                  <strong>Address: </strong>{wish.address}
                  </div>
                  <div className="wish-data">
                    <strong>Message: </strong> {wish.message}
                  </div>
                  <div className="wish-data">
                    <strong>Time: </strong>{wish.timestamp.toString()}
                  </div>
              </div>
            )
          })
      }

    </div>
  );
};

export default App;