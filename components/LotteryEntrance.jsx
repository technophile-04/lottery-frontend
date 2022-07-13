import React, { useEffect, useState } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { contractAddresses, LotteryAbi } from "../contracts";
import { ethers } from "ethers";
import { useNotification } from "web3uikit";
import { MdCelebration } from "react-icons/md";

const LotteryEntrance = () => {
  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
  const [entranceFee, setEntranceFee] = useState("0");
  const [numberOfPlayer, setNumberOfPlayer] = useState("0");
  const [recentWinner, setRecentWinner] = useState("");

  const dispatch = useNotification();

  const chainId = parseInt(chainIdHex);
  const lotteryAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null;

  const { runContractFunction: enterLottery } = useWeb3Contract({
    abi: LotteryAbi.abi,
    functionName: "enterLottery",
    contractAddress: lotteryAddress,
    msgValue: entranceFee,
  });

  const { runContractFunction: getEntranceFee } = useWeb3Contract({
    abi: LotteryAbi.abi,
    contractAddress: lotteryAddress,
    functionName: "getEntranceFee",
  });

  const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
    abi: LotteryAbi.abi,
    contractAddress: lotteryAddress,
    functionName: "getNumberOfPlayers",
  });

  const { runContractFunction: getRecentWinner } = useWeb3Contract({
    abi: LotteryAbi.abi,
    contractAddress: lotteryAddress,
    functionName: "getRecentWinner",
  });

  const updateUI = async () => {
    const fee = await getEntranceFee({
      onError: handleError,
    });

    const players = await getNumberOfPlayers({
      onError: handleError,
    });

    const winner = await getRecentWinner({
      onError: handleError,
    });
    console.log("⚡️ ~ file: LotteryEntrance.jsx ~ line 78 ~ winner", winner);
    console.log("⚡️ ~ file: LotteryEntrance.jsx ~ line 67 ~ players", players);
    console.log("⚡️ ~ file: LotteryEntrance.jsx ~ line 28 ~ useEffect ~ fee", fee);

    if (parseInt(winner) === 0) {
      setRecentWinner("");
    } else {
      setRecentWinner(winner);
    }

    setNumberOfPlayer(players.toString());
    setEntranceFee(fee);
  };

  const handleSuccess = async (tx) => {
    await tx.wait(1);
    handleNotifications(tx);
    updateUI();
  };

  const handleError = (err) => console.log(err.message);

  function handleNotifications(tx) {
    dispatch({
      type: "info",
      title: "Transaction Complete 🚀",
      message: "entered lottery successfully",
      icon: "bell",
      position: "topR",
    });
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const addEventListeners = async () => {
        const filter = {
          address: lotteryAddress,
          topics: [ethers.utils.id("WinnerPicked(address)")],
        };

        provider.on(filter, () => {
          dispatch({
            type: "success",
            title: "Winner Found",
            message: "Winner picked for the lottery",
            icon: "exclamation",
            position: "topR",
          });
          updateUI();
        });
      };

      addEventListeners();

      updateUI();
    }
  }, [isWeb3Enabled]);

  return (
    <div>
      Lottery entrance fee is : {ethers.utils.formatEther(entranceFee)}
      <button
        onClick={async () => {
          await enterLottery({
            onSuccess: handleSuccess,
            onError: (err) => console.log(err),
          });
        }}
      >
        Enter lottery
      </button>
      <p>Number of players entered : {numberOfPlayer}</p>
      {recentWinner ? <p>Recent Winner is : {recentWinner}</p> : null}
    </div>
  );
};

export default LotteryEntrance;
