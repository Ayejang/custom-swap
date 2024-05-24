// src/App.js
import React, { useState } from "react";
import { ethers } from "ethers";
import ERC20Abi from "./ERC20Abi.json"; // 스마트 컨트랙트 ABI
import logo from "./logo.png"; // 이미지 파일 import

const App = () => {
  const [account, setAccount] = useState(null);
  const [maticAmount, setAmountOfMatic] = useState("");
  const [wrappedMaticAmount, setAmountOfWrappedMatic] = useState("");

  const tokenAddress = "0x72817c4c2ad1235a48ed7b13a5a3910734b5bc41";

  const handleConnect = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);
    } else {
      alert("MetaMask를 설치하세요!");
    }
  };

  const handleSwapToMatic = async () => {
    if (!account) return alert("MetaMask에 연결하세요.");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const tokenContract = new ethers.Contract(tokenAddress, ERC20Abi, signer);

    try {
      const amount = ethers.parseUnits(wrappedMaticAmount, "ether");

      const tx = await tokenContract.withdraw(amount);
      await tx.wait();
      alert("스왑 완료!");
    } catch (error) {
      if (error.message.includes("user rejected action ")) {
        alert("스왑 취소!");
      } else {
        alert(`스왑 실패:  ${error}`);
      }
    }
  };

  const handleSwapToWrappedMatic = async () => {
    if (!account) return alert("MetaMask에 연결하세요.");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const tokenContract = new ethers.Contract(tokenAddress, ERC20Abi, signer);

    try {
      const tx = await tokenContract.deposit({
        value: ethers.parseUnits(maticAmount, "ether"),
      });
      await tx.wait();
      alert("스왑 완료!");
    } catch (error) {
      if (error.message.includes("user rejected action ")) {
        alert("스왑 취소!");
      } else {
        alert(`스왑 실패:  ${error}`);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <img src={logo} alt="Logo" className="mx-auto mb-4" />
        <h2 className="text-lg mb-2">MAITC-WMATIC 스왑 페이지입니다</h2>
        <h4 className="text-xs text-red-500 mb-2 font-semibold">
          !!Amoy 테스트넷을 쓰는 개발 환경에서만 사용 가능합니다!!
        </h4>
        <h2 className="text-xs mb-2">WMATIC 주소 : {tokenAddress}</h2>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4 text-xs"
          onClick={handleConnect}
        >
          {account ? `연결된 계정: ${account}` : "MetaMask 연결"}
        </button>
        <div className="mb-4">
          <input
            type="number"
            value={maticAmount}
            onChange={(e) => setAmountOfMatic(e.target.value)}
            placeholder="스왑할 양을 입력하세요"
            className="border border-gray-300 rounded px-3 py-2 w-full mb-2"
          />
          <button
            className="bg-green-500 text-white px-4 py-2 rounded w-full"
            onClick={handleSwapToWrappedMatic}
          >
            MATIC → WMATIC
          </button>
        </div>
        <div>
          <input
            type="number"
            value={wrappedMaticAmount}
            onChange={(e) => setAmountOfWrappedMatic(e.target.value)}
            placeholder="스왑할 양을 입력하세요"
            className="border border-gray-300 rounded px-3 py-2 w-full mb-2"
          />
          <button
            className="bg-green-500 text-white px-4 py-2 rounded w-full"
            onClick={handleSwapToMatic}
          >
            WMATIC → MATIC
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
