// src/App.js
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import TokenSwapAbi from "./TokenSwapAbi.json"; // 스마트 컨트랙트 ABI
import ERC20Abi from "./ERC20Abi.json"; // 스마트 컨트랙트 ABI
import logo from "./logo.png"; // 이미지 파일 import

const App = () => {
  const [account, setAccount] = useState(null);
  const [maticAmount, setAmountOfMatic] = useState("");
  const [wrappedMaticAmount, setAmountOfWrappedMatic] = useState("");
  const [maticBalance, setMaticBalance] = useState("0");
  const [tokenBalance, setTokenBalance] = useState("0");

  const tokenAddress = "0x72817c4c2ad1235a48ed7b13a5a3910734b5bc41";
  const contractAddress = "0x7F1c1820b68b648FC52535F4d458332314d8eD47";

  useEffect(() => {
    fetchBalances();
  }, []);

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

  const fetchBalances = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const tokenContract = new ethers.Contract(tokenAddress, ERC20Abi, provider);

    try {
      const matic = await provider.getBalance(contractAddress);
      const token = await tokenContract.balanceOf(contractAddress);
      setMaticBalance(ethers.formatEther(matic));
      setTokenBalance(ethers.formatEther(token));
    } catch (error) {
      console.error(error);
    }
  };

  const handleSwapToMatic = async () => {
    if (!account) return alert("MetaMask에 연결하세요.");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, TokenSwapAbi, signer);
    const tokenContract = new ethers.Contract(tokenAddress, ERC20Abi, signer);

    try {
      // todo 트랜잭션 보내기 전에 ERC20에서 approve를 받아야함.
      const amount = ethers.parseUnits(wrappedMaticAmount, "ether");
      const signerAdderess = signer.address;
      const allowance = await tokenContract.allowance(
        signerAdderess,
        contractAddress
      );

      if (allowance < amount) {
        const approveTx = await tokenContract.approve(
          contractAddress,
          ethers.parseEther("10", "ether")
        );
        await approveTx.wait();
      }

      const tx = await contract.swapToMatic(amount);
      await tx.wait();
      alert("스왑 완료!");
      fetchBalances();
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
    const contract = new ethers.Contract(contractAddress, TokenSwapAbi, signer);

    try {
      const tx = await contract.swapToToken({
        value: ethers.parseUnits(maticAmount, "ether"),
      });
      await tx.wait();
      alert("스왑 완료!");
      fetchBalances();
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
        <h2 className="text-xs mb-2">
          WMATIC 주소 : 0x72817C4C2ad1235a48Ed7B13a5a3910734B5Bc41
        </h2>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4 text-xs"
          onClick={handleConnect}
        >
          {account ? `연결된 계정: ${account}` : "MetaMask 연결"}
        </button>
        <div className="mb-4">
          <h2 className="text-xs">
            컨트랙트 잔액 (컨트랙트 주소 :
            0x7F1c1820b68b648FC52535F4d458332314d8eD47)
          </h2>
          <p className="text-gray-700">MATIC: {maticBalance}</p>
          <p className="text-gray-700">WMATIC: {tokenBalance}</p>
          <button
            className="bg-gray-500 text-xs text-white px-4 py-2 rounded mt-2"
            onClick={fetchBalances}
          >
            새로고침
          </button>
        </div>
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
          <p className="text-xs">
            matic으로 전환할 경우, approve 요청이 선요청됩니다.<br></br> 그 후
            기다리면 스왑 요청도 진행됩니다.
          </p>
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
