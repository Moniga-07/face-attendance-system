import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Search, Trash2, Edit2 } from 'lucide-react';

const Students = () => {
    const [students, setStudents] = useState<any[]>([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get('http://localhost:5000/api/students', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudents(data);
        } catch (error) {
            toast.error('Failed to fetch students');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this student and their face data?')) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/students/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Student deleted successfully');
            fetchStudents();
        } catch (error) {
            toast.error('Failed to delete student');
        }
    };

    const filteredStudents = students.filter(s => 
        s.name.toLowerCase().includes(search.toLowerCase()) || 
        s.roll_no.toLowerCase().includes(search.toLowerCase()) ||
        s.department.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-100">Student Management</h1>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search students..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>
            </div>

            <div className="glass rounded-2xl overflow-hidden border border-slate-700/50">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-800/50 border-b border-slate-700">
                            <th className="px-6 py-4 text-sm font-medium text-slate-400">Roll No</th>
                            <th className="px-6 py-4 text-sm font-medium text-slate-400">Name</th>
                            <th className="px-6 py-4 text-sm font-medium text-slate-400">Department</th>
                            <th className="px-6 py-4 text-sm font-medium text-slate-400">Course</th>
                            <th className="px-6 py-4 text-sm font-medium text-slate-400">Year</th>
                            <th className="px-6 py-4 text-sm font-medium text-slate-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map((student) => (
                                <tr key={student.id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4 text-slate-300 font-medium">{student.roll_no}</td>
                                    <td className="px-6 py-4 text-slate-200">{student.name}</td>
                                    <td className="px-6 py-4 text-slate-400">{student.department}</td>
                                    <td className="px-6 py-4 text-slate-400">{student.course || '-'}</td>
                                    <td className="px-6 py-4 text-slate-400">{student.year}</td>
                                    <td className="px-6 py-4 flex justify-end gap-3">
                                        <button className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors cursor-not-allowed opacity-50" title="Edit coming soon">
                                            <Edit2 size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(student.id)}
                                            className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                    No students found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Students;
