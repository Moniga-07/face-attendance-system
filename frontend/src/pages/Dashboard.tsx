import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, UserCheck, UserX, Percent } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalStudents: 0,
        presentToday: 0,
        absentToday: 0,
        attendancePercentage: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const { data } = await axios.get('http://localhost:5000/api/dashboard/stats', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(data);
            } catch (error) {
                toast.error('Failed to load dashboard stats');
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        { title: 'Total Students', value: stats.totalStudents, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { title: 'Present Today', value: stats.presentToday, icon: UserCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { title: 'Absent Today', value: stats.absentToday, icon: UserX, color: 'text-red-500', bg: 'bg-red-500/10' },
        { title: 'Attendance %', value: `${stats.attendancePercentage}%`, icon: Percent, color: 'text-violet-500', bg: 'bg-violet-500/10' },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-100">Overview</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="glass p-6 rounded-2xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-400">{stat.title}</p>
                                    <h3 className="text-3xl font-bold text-slate-100 mt-2">{stat.value}</h3>
                                </div>
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bg}`}>
                                    <Icon size={24} className={stat.color} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="glass p-6 rounded-2xl mt-8">
                <h2 className="text-lg font-medium text-slate-200 mb-4">Welcome to FaceAuth Admin</h2>
                <div className="flex flex-col space-y-2">
                     <p className="text-slate-400 text-sm">Select an action from the sidebar to manage students, start live attendance, or view detailed reports.</p>
                     <p className="text-slate-400 text-sm">When running Live Attendance, ensure the environment is well-lit for accurate facial recognition.</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
