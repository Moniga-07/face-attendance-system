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
    
    const [searchQuery, setSearchQuery] = useState('');
    const [students, setStudents] = useState<any[]>([]);

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

        const fetchStudents = async () => {
            try {
                const token = localStorage.getItem('token');
                const { data } = await axios.get('http://localhost:9090/face-attendance/api/students', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStudents(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchStudents();
    }, []);

    const searchResults = searchQuery.trim() === '' ? [] : students.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.roll_no.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

            <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
            
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

            <div className="glass p-6 rounded-2xl mt-8">
                <div className="relative w-full max-w-xl">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search students by Register Number or Name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 transition-all shadow-inner placeholder-slate-400"
                    />
                </div>
                
                {searchQuery.trim() !== '' && (
                    <div className="mt-6">
                        <h3 className="text-sm font-medium text-slate-500 mb-4">Search Results</h3>
                        {searchResults.length > 0 ? (
                            <div className="space-y-3">
                                {searchResults.map(student => (
                                    <div key={student.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors">
                                        <div>
                                            <p className="text-slate-900 font-medium">{student.name}</p>
                                            <p className="text-slate-500 text-sm">Register No: {student.roll_no} • Dept: {student.department}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500 text-sm">No students found matching your search.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
