// src/pages/DashboardLayout.js

import React, { useState, useEffect, useMemo } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { auth, db } from '../firebase';
import Sidebar from '../components/Sidebar';
import '../styles/DashboardLayout.css';

const DashboardLayout = () => {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]); // All analysis items
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Handle Authentication State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        // If no user, redirect to login
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Fetch all user analyses once
  useEffect(() => {
    if (!user) return;

    const colRef = collection(db, 'users', user.uid, 'results');
    const q = query(colRef, orderBy('created_at', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(data);
      setLoading(false);
    }, (error) => {
      console.error("Failed to fetch items:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // NEW: Calculate the highest score
  const highestScore = useMemo(() => {
    if (items.length === 0) return 0;
    const scores = items.map(it => it.match_percentage ?? it.score ?? 0);
    return Math.round(Math.max(...scores));
  }, [items]);

  if (loading) {
    return <center><div>Loading Dashboard...</div></center>; // Or a spinner component
  }

  return (
    <div className="layout-container">
      <Sidebar userEmail={user?.email || ''} highestScore={highestScore} />
      <main className="layout-content">
        {/* The Outlet will render the child route, e.g., DashboardResultsPage */}
        <Outlet context={{ items, uid: user?.uid }} />
      </main>
    </div>
  );
};

export default DashboardLayout;