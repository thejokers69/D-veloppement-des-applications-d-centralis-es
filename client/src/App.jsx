import { useEffect, useState } from "react";
import { ethers } from "ethers";
import VotingAbi from "./Voting.json";
import { create } from 'ipfs-http-client';
import './index.css';
const ipfs = create({ url: 'http://localhost:5001' });

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

function App() {
  const [account, setAccount] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [voteId, setVoteId] = useState(0);
  const [newCandidate, setNewCandidate] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const getContract = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum); // se connecter a metamask
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, VotingAbi.abi, signer);
  };

  async function connectWallet() {
  if (!window.ethereum) return alert("Veuillez installer MetaMask");
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  setAccount(address);

  const contract = await getContract();
  const owner = await contract.owner();
  setIsOwner(address.toLowerCase() === owner.toLowerCase());
}

async function loadCandidates() {
  const contract = await getContract();

  console.log("loadCandidates: Adresse du contrat utilisée:", contract.target || contract.address);

  const count = await contract.candidateCount();

  console.log("loadCandidates: Nombre de candidats (du contrat):", count);

  const list = [];
  for (let i = 0; i < count; i++) {

    console.log(`loadCandidates: Récupération du candidat à l'index ${i}`);

    const c = await contract.candidates(i);

    console.log(`Candidat ${i} - Valeurs brutes:`);
    console.log("c[0] (name):", c[0]);

    console.log(`loadCandidates: Candidat ${i} brut:`, c);
    console.log(`loadCandidates: Candidat ${i} Nom:`, c.name);
    console.log(`loadCandidates: Candidat ${i} ImageCID:`, c.imageCID);
    console.log(`loadCandidates: Candidat ${i} VoteCount:`, )

    list.push({ id: i, name: c.name, voteCount: c.voteCount.toString(),imageCID: c.imageCID });
  }
  setCandidates(list);
}

async function vote() {
  const contract = await getContract();
  const tx = await contract.vote(voteId);
  await tx.wait();
  loadCandidates();
}

// async function addCandidate() {
//   if (!newCandidate.trim()) return;
//   const contract = await getContract();
//   const tx = await contract.addCandidate(newCandidate.trim());
//   await tx.wait();
//   setNewCandidate("");
//   loadCandidates();
// }

const addCandidate = async () => {
  if (!newCandidate.trim() || !imageFile) return;
  const reader = new FileReader();
  reader.onloadend = async () => {
    const buffer = new Uint8Array(reader.result);
  const result = await ipfs.add(buffer);
  const imageCID = result.path;

  const contract = await getContract();
  const tx = await contract.addCandidate(newCandidate.trim(), imageCID);
  await tx.wait();
  setNewCandidate("");
  setImageFile(null);
  loadCandidates();
  };
  reader.readAsArrayBuffer(imageFile);
  };

useEffect(() => {
  connectWallet();
  loadCandidates();
}, []);

return (
  <div className="min-h-screen bg-gradient-to-r from-blue-100 to-purple-100 p-8">
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <h1 className="text-4xl font-bold text-center text-blue-700 mb-6"> Système de Vote Décentralisé</h1>
      <div className="bg-blue-50 p-4 rounded-lg mb-6 flex items-center justify-between">
        <p className="text-gray-700">Connecté en tant que : <span className="font-mono text-sm bg-gray-100 p-1 rounded">{account}</span></p>
        <span className={`px-3 py-1 rounded-full text-sm ${isOwner ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
          {isOwner ? "Administrateur" : "Électeur"}
        </span>
      </div>

      {isOwner && (
        <div className="bg-green-50 p-6 rounded-lg mb-8 border border-green-200">
          <h3 className="text-xl font-bold text-green-800 mb-4">Ajouter un candidat</h3>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={newCandidate}
              onChange={(e) => setNewCandidate(e.target.value)}
              placeholder="Nom du candidat"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button 
              onClick={addCandidate}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Ajouter
            </button>
          </div>
        </div>
      )}

    <div className="mb-8">
      <h3 className="text-xl font-bold text-blue-800 mb-4">Voter pour un candidat</h3>
      <div className="flex flex-col md:flex-row items-end gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Choisissez un candidat</label>
          <select 
            onChange={(e) => setVoteId(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">-- Sélectionnez --</option>
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.voteCount} vote{c.voteCount !== 1 ? "s" : ""})
              </option>
            ))}
          </select>
        </div>
        
        <button 
          onClick={vote}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Voter
        </button>
      </div>
      
      {isOwner && (
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Image du candidat</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => setImageFile(e.target.files[0])} 
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>
      )}
    </div>

    <div className="mt-10">
      <h3 className="text-xl font-bold text-blue-800 mb-4">Résultats actuels</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {candidates.map((c) => (
          <div key={c.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <h4 className="font-bold text-lg mb-2">{c.name}</h4>
            <p className="text-blue-600 font-semibold mb-3">{c.voteCount} vote{c.voteCount !== 1 ? "s" : ""}</p>
            {c.imageCID && (
              <div className="mt-2">
                <img
                  src={`http://localhost:8080/ipfs/${c.imageCID}`}
                  alt={`Image de ${c.name}`}
                  className="w-full h-auto max-h-40 object-cover rounded-md"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
</div>
);
}


export default App;