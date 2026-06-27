import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, UserCheck, UserX, Percent, Search, ShieldCheck, Clock, Fingerprint } from 'lucide-react';
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
                const { data } = await axios.get('http://localhost:9090/face-attendance/api/dashboard/stats', {
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
        <div className="relative space-y-6 z-0">
            {/* 3D Floating Icons Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                <ShieldCheck className="absolute top-10 right-10 text-blue-300/50 floating-icon" size={140} />
                <Clock className="absolute top-40 left-10 text-emerald-300/50 floating-icon-delay-1" size={100} />
                <Fingerprint className="absolute bottom-10 right-40 text-violet-300/50 floating-icon-delay-2" size={120} />
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between glass p-8 rounded-3xl bg-gradient-to-r from-blue-500/10 to-violet-500/10 border border-blue-200/50 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome to FaceAuth</h1>
                    <p className="text-slate-600 text-lg">Your automated facial recognition attendance system.</p>
                </div>
                <div className="mt-4 md:mt-0 p-2 bg-white rounded-3xl shadow-xl transform rotate-2 hover:rotate-0 transition-transform duration-300">
                    <img src="/face_recognition_icon.png" alt="Face Recognition Technology" className="w-24 h-24 rounded-2xl object-cover" />
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="glass p-6 rounded-2xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                                    <h3 className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</h3>
                                </div>
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bg}`}>
                                    <Icon size={24} className={stat.color} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>


        </div>
    );
};

export default Dashboard;
