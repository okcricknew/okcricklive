import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import {
  collection,
  addDoc,
  query,
  onSnapshot,
  doc,
  serverTimestamp,
  orderBy,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';

export function useTournamentDetails(id, initialTeams = []) {
  const [teams, setTeams] = useState(initialTeams);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTeam, setActiveTeam] = useState(null);
  const [teamPlayers, setTeamPlayers] = useState([]); 
  const [playerName, setPlayerName] = useState('');
  const [playerPhoto, setPlayerPhoto] = useState(null);
  const [teamName, setTeamName] = useState('');
  const [teamLogo, setTeamLogo] = useState(null);

  useEffect(() => {
    if (!id) return;

    const qTeams = query(
      collection(db, "tournaments", id, "teams"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      qTeams,
      (snapshot) => {
        setTeams(
          snapshot.docs.map((teamDoc) => ({
            id: teamDoc.id,
            ...teamDoc.data(),
          }))
        );
      },
      (error) => {
        console.error("Teams live update failed:", error);
      }
    );

    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    if (!activeTeam || !id || !isModalOpen) return;
    const qPlayers = query(collection(db, "tournaments", id, "teams", activeTeam.id, "players"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(qPlayers, (snapshot) => {
      setTeamPlayers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [activeTeam, id, isModalOpen]);

  // --- LOGIC HANDLERS ---
  const handleAddTeam = async (e) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    const tempId = "temp_" + Date.now();
    setTeams(prev => [
      {
        id: tempId,
        name: teamName.trim().toUpperCase(),
        logoUrl: teamLogo ? URL.createObjectURL(teamLogo) : "",
        createdAt: new Date(),
        temp: true
      },
      ...prev
    ]);

    try {
      let logoUrl = "";
      if (teamLogo) {
        const formData = new FormData();
        formData.append("file", teamLogo);
        formData.append("upload_preset", "okcrick");

        const response = await fetch(
          "https://api.cloudinary.com/v1_1/m4xdhjiq/image/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();
        logoUrl = data.secure_url;
      }

      await addDoc(collection(db, "tournaments", id, "teams"), { 
        name: teamName.trim().toUpperCase(), 
        logoUrl: logoUrl,
        createdAt: serverTimestamp()
      });
      setTeamName(''); 
      setTeamLogo(null);
    } catch (e) { console.error(e); }
  };

  const handleEditTeam = async (team) => {
    const newName = prompt("Update Team Name:", team.name);
    if (!newName || newName.trim() === "" || newName === team.name) return;
    try {
      await updateDoc(doc(db, "tournaments", id, "teams", team.id), {
        name: newName.trim().toUpperCase()
      });
    } catch (e) { console.error(e); }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!confirm("Are you sure? This team and its players will be removed.")) return;
    try {
      await deleteDoc(doc(db, "tournaments", id, "teams", teamId));
    } catch (e) { console.error(e); }
  };

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    if (!playerName.trim() || !activeTeam?.id || !id) return;

    const tempId = "temp_" + Date.now();
    setTeamPlayers(prev => [
      {
        id: tempId,
        name: playerName.trim().toUpperCase(),
        photoUrl: playerPhoto ? URL.createObjectURL(playerPhoto) : "",
        temp: true
      },
      ...prev
    ]);
    
    try {
      let photoUrl = "";
      if (playerPhoto) {
        const formData = new FormData();
        formData.append("file", playerPhoto);
        formData.append("upload_preset", "okcrick");

        const response = await fetch(
          "https://api.cloudinary.com/v1_1/m4xdhjiq/image/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();
        photoUrl = data.secure_url;
      }

      await addDoc(collection(db, "tournaments", id, "teams", activeTeam.id, "players"), {
        name: playerName.trim().toUpperCase(),
        photoUrl: photoUrl,
        runs: 0, balls: 0, wickets: 0, role: 'Batsman',
        createdAt: serverTimestamp()
      });
      setPlayerName('');
      setPlayerPhoto(null);
    } catch (e) { console.error(e); }
  };

  const handleDeletePlayer = async (playerId) => {
    if(!confirm("Remove player?")) return;
    try {
      await deleteDoc(doc(db, "tournaments", id, "teams", activeTeam.id, "players", playerId));
    } catch (e) { console.error(e); }
  };

  return {
    teams,
    isModalOpen,
    setIsModalOpen,
    activeTeam,
    setActiveTeam,
    teamPlayers,
    playerName,
    setPlayerName,
    setPlayerPhoto,
    teamName,
    setTeamName,
    setTeamLogo,
    handleAddTeam,
    handleEditTeam,
    handleDeleteTeam,
    handleAddPlayer,
    handleDeletePlayer,
  };
        }
