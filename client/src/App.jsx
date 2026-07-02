import { useEffect, useState } from "react";
import { Link, Routes, Route } from "react-router-dom";
import ListTodos from "./components/ListTodos";
import Login from "./components/Login";
import DeletedJobs from "./components/DeletedJobs";
import CreateJobOrder from "./components/CreateJobOrder";
import "./App.css";

function App() {
  const [currentView, setCurrentView] = useState("ALL");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = sessionStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setUser(null);
    setCurrentView("ALL");
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Routes>
      <Route path="/create" element={<CreateJobOrder />} />
      <Route path="/" element={
        <main>
          <div className="app-header">
            <div>
              <h1>GST Job Order System</h1>
              <p className="logged-in-user">
                Logged in as {user.full_name || user.username}
              </p>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>

          <ul className="navbar">
            <li className={currentView === "ALL" ? "active" : ""} onClick={() => setCurrentView("ALL")}>
              ALL Dashboard
            </li>
            <li className={currentView === "EXPORT" ? "active" : ""} onClick={() => setCurrentView("EXPORT")}>
              Export
            </li>
            <li className={currentView === "IMPORT" ? "active" : ""} onClick={() => setCurrentView("IMPORT")}>
              Import
            </li>
            <li className={currentView === "DOMESTIC" ? "active" : ""} onClick={() => setCurrentView("DOMESTIC")}>
              Domestic
            </li>
            {user.role === "admin" && (
              <li className={currentView === "DELETED" ? "active" : ""} onClick={() => setCurrentView("DELETED")}>
                Deleted Jobs
              </li>
            )}
            <li>
              <Link to="/create" className="create-link">
                + Create JO
              </Link>
            </li>
          </ul>

          {currentView === "DELETED" ? (
            <DeletedJobs />
          ) : (
            <ListTodos type={currentView} />
          )}
        </main>
      } />
    </Routes>
  );
}

export default App;