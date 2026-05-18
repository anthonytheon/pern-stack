// ============================================================
// NORMAL DASHBOARD - Regular work computers
// ============================================================

import { useState } from "react";
import ListTodos from "./components/ListTodos";
import InputTodo from "./components/InputTodo";
import NetworkBar from "./components/NetworkBar";

import './App.css';

function App() {
  const [currentView, setCurrentView] = useState("ALL");

  return (
    <main>
      {/* Network Address Bar - shows URL for employees */}
      <NetworkBar />
      
      <h1>GST Job Order System</h1>
      
      {/* Navigation Tabs */}
      <ul className="navbar">
        <li className={currentView === 'ALL' ? 'active' : ''} onClick={() => setCurrentView('ALL')}>
          ALL Dashboard
        </li>
        <li className={currentView === 'EXPORT' ? 'active' : ''} onClick={() => setCurrentView('EXPORT')}>
          Export
        </li>
        <li className={currentView === 'IMPORT' ? 'active' : ''} onClick={() => setCurrentView('IMPORT')}>
          Import
        </li>
        <li className={currentView === 'DOMESTIC' ? 'active' : ''} onClick={() => setCurrentView('DOMESTIC')}>
          Domestic
        </li>
      </ul>

      {/* Create Job Order Form */}
      <InputTodo />
      
      {/* List/Dashboard View */}
      <ListTodos type={currentView} />
    </main>
  );
}

export default App;