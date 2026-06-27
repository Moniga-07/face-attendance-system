import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Search, Trash2, Edit2, X } from 'lucide-react';

const Students = () => {
    const [students, setStudents] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [editingStudent, setEditingStudent] = useState<any>(null);
    const [editFormData, setEditFormData] = useState({
        roll_no: '',
        name: '',
        department: '',
        year: '',
        course: ''
    });

    const handleSaveEdit = async () => {
        if (!editingStudent) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/students/${editingStudent.id}`, editFormData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Student updated successfully');
            setEditingStudent(null);
            fetchStudents();
        } catch (error) {
            toast.error('Failed to update student');
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get('http://localhost:9090/face-attendance/api/students', {
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
            await axios.delete(`http://localhost:9090/face-attendance/api/students/${id}`, {
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
                        <tr className="bg-white/40 border-b border-slate-300">
                            <th className="px-6 py-4 text-sm font-bold text-slate-900">Roll No</th>
                            <th className="px-6 py-4 text-sm font-bold text-slate-900">Name</th>
                            <th className="px-6 py-4 text-sm font-bold text-slate-900">Department</th>
                            <th className="px-6 py-4 text-sm font-bold text-slate-900">Course</th>
                            <th className="px-6 py-4 text-sm font-bold text-slate-900">Year</th>
                            <th className="px-6 py-4 text-sm font-bold text-slate-900 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map((student) => (
                                <tr key={student.id} className="border-b border-slate-300 hover:bg-white/50 transition-colors">
                                    <td className="px-6 py-4 text-slate-900 font-bold">{student.roll_no}</td>
                                    <td className="px-6 py-4 text-slate-800 font-medium">{student.name}</td>
                                    <td className="px-6 py-4 text-slate-700">{student.department}</td>
                                    <td className="px-6 py-4 text-slate-700">{student.course || '-'}</td>
                                    <td className="px-6 py-4 text-slate-700">{student.year}</td>
                                    <td className="px-6 py-4 flex justify-end gap-3">
                                        <button 
                                            onClick={() => {
                                                setEditingStudent(student);
                                                setEditFormData({
                                                    roll_no: student.roll_no,
                                                    name: student.name,
                                                    department: student.department,
                                                    year: student.year,
                                                    course: student.course || ''
                                                });
                                            }}
                                            className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors" 
                                            title="Edit student"
                                        >
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

            {/* Edit Modal */}
            {editingStudent && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-slate-800 p-6 rounded-2xl w-full max-w-md border border-slate-700 shadow-2xl relative">
                        <button 
                            onClick={() => setEditingStudent(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
                        >
                            <X size={20} />
                        </button>
                        <h2 className="text-xl font-bold text-slate-100 mb-4">Edit Student</h2>
                        <p className="text-slate-400 mb-4">Editing details for {editingStudent.name}</p>
                        
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-100 mb-1">Roll Number</label>
                                <input 
                                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 outline-none focus:border-blue-500"
                                    value={editFormData.roll_no}
                                    onChange={(e) => setEditFormData({...editFormData, roll_no: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-100 mb-1">Name</label>
                                <input 
                                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 outline-none focus:border-blue-500"
                                    value={editFormData.name}
                                    onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-100 mb-1">Department</label>
                                <input 
                                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 outline-none focus:border-blue-500"
                                    value={editFormData.department}
                                    onChange={(e) => setEditFormData({...editFormData, department: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-100 mb-1">Year</label>
                                <select 
                                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 outline-none focus:border-blue-500"
                                    value={editFormData.year}
                                    onChange={(e) => setEditFormData({...editFormData, year: e.target.value})}
                                >
                                    <option value="1st Year">1st Year</option>
                                    <option value="2nd Year">2nd Year</option>
                                    <option value="3rd Year">3rd Year</option>
                                    <option value="4th Year">4th Year</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-100 mb-1">Course</label>
                                <select 
                                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 outline-none focus:border-blue-500"
                                    value={editFormData.course}
                                    onChange={(e) => setEditFormData({...editFormData, course: e.target.value})}
                                >
                                    <option value="ITA0218 - Web technology">ITA0218 - Web technology</option>
                                    <option value="CSE1001 - Programming">CSE1001 - Programming</option>
                                    <option value="ECE2002 - Digital Logic">ECE2002 - Digital Logic</option>
                                    <option value="MGT101 - Management">MGT101 - Management</option>
                                    <option value="ENG101 - English">ENG101 - English</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button 
                                onClick={handleSaveEdit}
                                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors"
                            >
                                Save Changes
                            </button>
                            <button 
                                onClick={() => setEditingStudent(null)}
                                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-medium transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Students;
