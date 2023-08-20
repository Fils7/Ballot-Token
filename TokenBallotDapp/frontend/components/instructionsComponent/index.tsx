import styles from "./instructionsComponent.module.css";
import { useAccount, useBalance, useContractRead, useNetwork, useSignMessage } from "wagmi";
import { useState } from "react";

export default function InstructionsComponent() {
  return (
    <div className={styles.container}>
      <header className={styles.header_container}>
        <div className={styles.header}>
          <h1>Ballot Token Group 3!</h1>
        </div>
      </header>
      <p className={styles.get_started}>
        <PageBody></PageBody>
      </p>
    </div>
  );
}

function PageBody() {
  return (
    <div>
      <WalletInfo></WalletInfo>
    </div>
  );
}

function WalletInfo() {
  const { address, isConnecting, isDisconnected } = useAccount()
  const { chain } = useNetwork();
  if (address)
    return (
      <div>
        <p>Your account address is {address}</p>
        <p>Connected to the network {chain?.name}</p>
        <WalletAction></WalletAction>
        <WalletBalance address={address}></WalletBalance>
        <App></App>
      </div>
    );
  if (isConnecting)
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  if (isDisconnected)
    return (
      <div>
        <p>Wallet disconnected. Connect wallet to continue</p>
      </div>
    );
  return (
    <div>
      <p>Connect wallet to continue</p>
    </div>
  );
}

function WalletAction() {
  const [signatureMessage, setSignatureMessage] = useState("My Input:");

  const { data, isError, isLoading, isSuccess, signMessage } = useSignMessage();
  return (
    <div>
      <form>
        <label>
          Enter the message to be signed:
          <input
            type="text"
            value={signatureMessage}
            onChange={(e) => setSignatureMessage(e.target.value)}
          />
        </label>
      </form>
      <button
        disabled={isLoading}
        onClick={() =>
          signMessage({
            message: signatureMessage,
          })
        }
      >
        Sign message
      </button>
      {isSuccess && <div>Signature: {data}</div>}
      {isError && <div>Error signing message</div>}
    </div>
  );
}

function WalletBalance(params: { address: `0x${string}` }) {
  const { data, isError, isLoading } = useBalance({
    address: params.address,
  });

  if (isLoading) return <div>Fetching balance…</div>;
  if (isError) return <div>Error fetching balance</div>;
  return (
    <div>
      Balance: {data?.formatted} {data?.symbol}
    </div>
  );
}

// tokenName \ tokenBalance \ randomProfile
function randomProfile(){
  const [data,setData] = useState<any>(null);
  const [isLoading,setLoading] = useState(true);
  useEffect(() =>{
    fetch('httpL//randomuser.me/api')
    .then((res) => res.json())
    .then((data) => {
      setData(data.results[0]);
      setLoading(false);
    });
  }, []);

  if (isLoading) return <p>Loading profile info...</p>;
  if (!data) return <p>no profile data</p>;

  return <div>
    <h1>
      Name: {data.name.tile}{data.name.first}{data.name.last}
    </h1>
    <p>email: {data.email</p>
  </div>
}
function App() {
  const { data, isError, isLoading } = useContractRead({
    address: '',
    abi: [
      {
        "inputs": [
          {
            "internalType": "bytes32[]",
            "name": "proposalNames",
            "type": "bytes32[]"
          },
          {
            "internalType": "address",
            "name": "_tokenContract",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "_targetBlockNumber",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "_endVoting",
            "type": "uint256"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [],
        "name": "endDate",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "gameEnded",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "hasEnded",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "proposals",
        "outputs": [
          {
            "internalType": "bytes32",
            "name": "name",
            "type": "bytes32"
          },
          {
            "internalType": "uint256",
            "name": "voteCount",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "targetBlockNumber",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "proposal",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "vote",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "votingPower",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "winnerName",
        "outputs": [
          {
            "internalType": "bytes32",
            "name": "winnerName_",
            "type": "bytes32"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "winningProposal",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "winningProposal_",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    functionName: "gameEnded",
  })
  const gameEnded = typeof data == "boolean" ? data : 0;
  if (isLoading) return <div>Fetching data...</div>;
  if (isError) return <div> Error fetching data.</div>
  return <div>Vote as ended: {gameEnded}</div>
}