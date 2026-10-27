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

  // --- EDIT TEAM STATES ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [editTeamName, setEditTeamName] = useState('');
  const [editTeamLogo, setEditTeamLogo] = useState(null);

  // --- EDIT PLAYER STATES ---
  const [isEditPlayerModalOpen, setIsEditPlayerModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [editPlayerName, setEditPlayerName] = useState('');
  const [editPlayerPhoto, setEditPlayerPhoto] = useState(null);

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
          { method: "POST", body: formData }
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

  const openEditModal = (team) => {
    setEditingTeam(team);
    setEditTeamName(team.name || '');
    setEditTeamLogo(null);
    setIsEditModalOpen(true);
  };

  const handleUpdateTeam = async (e) => {
    e.preventDefault();
    if (!editTeamName.trim() || !editingTeam) return;

    try {
      let logoUrl = editingTeam.logoUrl || "";
      if (editTeamLogo) {
        const formData = new FormData();
        formData.append("file", editTeamLogo);
        formData.append("upload_preset", "okcrick");

        const response = await fetch(
          "https://api.cloudinary.com/v1_1/m4xdhjiq/image/upload",
          { method: "POST", body: formData }
        );

        const data = await response.json();
        logoUrl = data.secure_url;
      }

      await updateDoc(doc(db, "tournaments", id, "teams", editingTeam.id), {
        name: editTeamName.trim().toUpperCase(),
        logoUrl: logoUrl,
      });

      setIsEditModalOpen(false);
      setEditingTeam(null);
      setEditTeamName('');
      setEditTeamLogo(null);
    } catch (e) {
      console.error("Failed to update team:", e);
    }
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
          { method: "POST", body: formData }
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

  const openEditPlayerModal = (player) => {
    setEditingPlayer(player);
    setEditPlayerName(player.name || '');
    setEditPlayerPhoto(null);
    setIsEditPlayerModalOpen(true);
  };

  const handleUpdatePlayer = async (e) => {
    e.preventDefault();
    if (!editPlayerName.trim() || !editingPlayer || !activeTeam?.id || !id) return;

    try {
      let photoUrl = editingPlayer.photoUrl || "";
      if (editPlayerPhoto) {
        const formData = new FormData();
        formData.append("file", editPlayerPhoto);
        formData.append("upload_preset", "okcrick");

        const response = await fetch(
          "https://api.cloudinary.com/v1_1/m4xdhjiq/image/upload",
          { method: "POST", body: formData }
        );

        const data = await response.json();
        photoUrl = data.secure_url;
      }

      await updateDoc(doc(db, "tournaments", id, "teams", activeTeam.id, "players", editingPlayer.id), {
        name: editPlayerName.trim().toUpperCase(),
        photoUrl: photoUrl,
      });

      setIsEditPlayerModalOpen(false);
      setEditingPlayer(null);
      setEditPlayerName('');
      setEditPlayerPhoto(null);
    } catch (e) {
      console.error("Failed to update player:", e);
    }
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
    handleDeleteTeam,
    handleAddPlayer,
    handleDeletePlayer,
    isEditModalOpen,
    setIsEditModalOpen,
    editingTeam,
    editTeamName,
    setEditTeamName,
    setEditTeamLogo,
    openEditModal,
    handleUpdateTeam,
    isEditPlayerModalOpen,
    setIsEditPlayerModalOpen,
    editingPlayer,
    editPlayerName,
    setEditPlayerName,
    setEditPlayerPhoto,
    openEditPlayerModal,
    handleUpdatePlayer,
  };
}
