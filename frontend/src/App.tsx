import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LiveAttendance from './pages/LiveAttendance';
import Students from './pages/Students';
import RegisterStudent from './pages/RegisterStudent';
import Reports from './pages/Reports';

import React from 'react';

// Auth Guard
const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
    return children;
};

function App() {
    return (
        <Router>
            <Toaster position="top-right" toastOptions={{
                style: {
                    background: '#1e293b',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.1)'
                },
            }} />
            <Routes>
                <Route path="/login" element={<Login />} />
                
                {/* Unprotected Route for kiosk mode live attendance */}
                <Route path="/live" element={<LiveAttendance />} />

                <Route path="/" element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="students" element={<Students />} />
                    <Route path="students/register" element={<RegisterStudent />} />
                    <Route path="reports" element={<Reports />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
