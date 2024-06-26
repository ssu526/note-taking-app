import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom"; // Import using ES module syntax
import "./App.css";
import NoteProvider from "./context/NoteProvider";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import { ReactFlowProvider } from "reactflow";

function App() {
  return (
    <BrowserRouter>
      <NoteProvider>
        <Routes>
          <Route
            path="/"
            element={
              <ReactFlowProvider>
                <Home />
              </ReactFlowProvider>
            }
          />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </NoteProvider>
    </BrowserRouter>
  );
}

export default App;
