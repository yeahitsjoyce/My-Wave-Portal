import React, { useEffect, useState} from "react";
import { ethers } from "ethers";
import './App.css';
//import { set } from "lodash";
import contractJson from "./utils/WavePortal.json";
//import  './App.html';

export default function App() {

    const [currentAccount, setCurrentAccount] = useState("");
    const [waves,setAllWaves]= useState([]);
    const contractABI = contractJson.abi;
    const contractAddress = "0xBDBF525Ca61BE85BE5A69C2ab5E298e7798Af72D";
    //0x41196a3F00FA7b8016d4C7F797317BC52b63BeE7
    const  checkIfWalletIsConnected = async ()=> {
      try{
      const{ethereum} = window;
      if (!ethereum){
        console.log("Metamask is not installed!");
        return;
      }
      else{
        console.log("We have the ethereum object!", ethereum);
        getAllWaves();
      }

      const accounts = await ethereum.request({method: "eth_accounts"});
      if (accounts.length !== 0){
        const account = accounts[0];
        console.log("Found an authorized account: " + account);
        setCurrentAccount(account);
      }else{
        console.log("No authorized accountsfound!");
      }
    
  }
  catch(error){
    console.log(error);
  }
}
  const connectWallet = async ()=>{
    try{
      const {ethereum} = window;
      if (!ethereum){
        alert("Get Metamask!")
        return;
      }

      const accounts = await ethereum.request({method: "eth_requestAccounts"});

      console.log("Connected to account", accounts[0]);
      setCurrentAccount(accounts[0]);
    }catch(error){
      console.log(error);
    }

  }
  useEffect(() =>{
    checkIfWalletIsConnected();
  })

  const wave =  async () => {
   try{
    const {ethereum} = window;

    if (ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const waveTxn = await wavePortalContract.wave("Hey!Thanks for signing your wave!");
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Transaction was mined ", waveTxn.hash);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
    }
   }catch(error){
    console.log("Error found", error);
  }
}

const getAllWaves = async () => {
  const { ethereum } = window;

  try {
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      const waves = await wavePortalContract.getAllWaves();

      const wavesCleaned = waves.map(wave => {
        return {
          address: wave.sender,
          timestamp: new Date(wave.timestamp * 1000),
          message: wave.message,
        };
      });

      setAllWaves(wavesCleaned);
    } else {
      console.log("Ethereum object doesn't exist!");
    }
  } catch (error) {
    console.log(error);
  }
};

/**
 * Listen in for emitter events!
 */
useEffect(() => {
  let wavePortalContract;

  const onNewWave = (from, timestamp, message) => {
    console.log("NewWave", from, timestamp, message);
    setAllWaves(prevState => [
      ...prevState,
      {
        address: from,
        timestamp: new Date(timestamp * 1000),
        message: message,
      },
    ]);
  };

  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
    wavePortalContract.on("NewWave", onNewWave);
  }

  return () => {
    if (wavePortalContract) {
      wavePortalContract.off("NewWave", onNewWave);
    }
  };
},);

  return (
    <html>
      
    <div className="mainContainer">
    <div className="dataContainer">
    <div className="header">
        <span role="img" aria-label="wave">👋 </span> Hey there!<span role="img" aria-label="wave">👋 </span>
    </div>

    <div className="bio">
        I'm Joycelyne and I love coding and crypto. Connect your <strong>Ethereum</strong> wallet and wave at me!
    </div>
        {!currentAccount &&
        <button className = "waveButton" onClick={connectWallet}>
          Connect Wallet
        </button>
        }
        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>      
          {waves.map((wave, index) => {
            return (
    <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
    <div>Address: {wave.address}</div>
    <div>Time: {wave.timestamp.toString()}</div>
    <div>Message: {wave.message}</div>
    </div>)
    })}
    </div>
    </div>
    </html>
    
  );
}
