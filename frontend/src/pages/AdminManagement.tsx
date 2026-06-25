import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { UserPlus, BookOpen, Link as LinkIcon } from 'lucide-react';

const AdminManagement = () => {
    const [faculties, setFaculties] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);

    // Forms
    const [facultyForm, setFacultyForm] = useState({ username: '', password: '', name: '', department: '' });
    const [subjectForm, setSubjectForm] = useState({ subject_code: '', name: '', department: '', year: '' });
    const [assignForm, setAssignForm] = useState({ faculty_id: '', subject_id: '' });

    const token = localStorage.getItem('token');
    const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

    const fetchData = async () => {
        try {
            const [facRes, subRes] = await Promise.all([
                axios.get('http://localhost:9090/face-attendance/api/faculties', axiosConfig),
                axios.get('http://localhost:9090/face-attendance/api/subjects', axiosConfig)
            ]);
            setFaculties(facRes.data);
            setSubjects(subRes.data);
        } catch (error) {
            toast.error('Failed to fetch data');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateFaculty = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:9090/face-attendance/api/faculties', facultyForm, axiosConfig);
            toast.success('Faculty created');
            setFacultyForm({ username: '', password: '', name: '', department: '' });
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error creating faculty');
        }
    };

    const handleCreateSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:9090/face-attendance/api/subjects', subjectForm, axiosConfig);
            toast.success('Subject created');
            setSubjectForm({ subject_code: '', name: '', department: '', year: '' });
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error creating subject');
        }
    };

    const handleAssign = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!assignForm.faculty_id || !assignForm.subject_id) {
            return toast.error('Select both faculty and subject');
        }
        try {
            await axios.post('http://localhost:9090/face-attendance/api/subjects/assign', assignForm, axiosConfig);
            toast.success('Subject assigned to faculty');
            setAssignForm({ faculty_id: '', subject_id: '' });
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error assigning subject');
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">Admin Management</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Create Faculty */}
                <div className="glass rounded-2xl p-6 border border-slate-200/50">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <UserPlus size={20} />
                        </div>
                        <h2 className="text-xl font-semibold">Add Faculty</h2>
                    </div>
                    <form onSubmit={handleCreateFaculty} className="space-y-4">
                        <input className="w-full p-3 border rounded-xl" placeholder="Name" value={facultyForm.name} onChange={e => setFacultyForm({...facultyForm, name: e.target.value})} required />
                        <input className="w-full p-3 border rounded-xl" placeholder="Username" value={facultyForm.username} onChange={e => setFacultyForm({...facultyForm, username: e.target.value})} required />
                        <input className="w-full p-3 border rounded-xl" placeholder="Password" type="password" value={facultyForm.password} onChange={e => setFacultyForm({...facultyForm, password: e.target.value})} required />
                        <input className="w-full p-3 border rounded-xl" placeholder="Department" value={facultyForm.department} onChange={e => setFacultyForm({...facultyForm, department: e.target.value})} required />
                        <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700">Create Faculty</button>
                    </form>
                </div>

                {/* Create Subject */}
                <div className="glass rounded-2xl p-6 border border-slate-200/50">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-violet-100 text-violet-600 rounded-lg">
                            <BookOpen size={20} />
                        </div>
                        <h2 className="text-xl font-semibold">Add Subject</h2>
                    </div>
                    <form onSubmit={handleCreateSubject} className="space-y-4">
                        <input className="w-full p-3 border rounded-xl" placeholder="Subject Name" value={subjectForm.name} onChange={e => setSubjectForm({...subjectForm, name: e.target.value})} required />
                        <input className="w-full p-3 border rounded-xl" placeholder="Subject Code (e.g. CS101)" value={subjectForm.subject_code} onChange={e => setSubjectForm({...subjectForm, subject_code: e.target.value})} required />
                        <input className="w-full p-3 border rounded-xl" placeholder="Department" value={subjectForm.department} onChange={e => setSubjectForm({...subjectForm, department: e.target.value})} required />
                        <input className="w-full p-3 border rounded-xl" placeholder="Year" value={subjectForm.year} onChange={e => setSubjectForm({...subjectForm, year: e.target.value})} required />
                        <button type="submit" className="w-full py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700">Create Subject</button>
                    </form>
                </div>

                {/* Assign Subject */}
                <div className="glass rounded-2xl p-6 border border-slate-200/50 md:col-span-2">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                            <LinkIcon size={20} />
                        </div>
                        <h2 className="text-xl font-semibold">Assign Subject to Faculty</h2>
                    </div>
                    <form onSubmit={handleAssign} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <select className="p-3 border rounded-xl" value={assignForm.faculty_id} onChange={e => setAssignForm({...assignForm, faculty_id: e.target.value})} required>
                            <option value="">Select Faculty...</option>
                            {faculties.map(f => (
                                <option key={f.id} value={f.id}>{f.name} ({f.department})</option>
                            ))}
                        </select>
                        <select className="p-3 border rounded-xl" value={assignForm.subject_id} onChange={e => setAssignForm({...assignForm, subject_id: e.target.value})} required>
                            <option value="">Select Subject...</option>
                            {subjects.map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.subject_code})</option>
                            ))}
                        </select>
                        <button type="submit" className="py-3 bg-green-600 text-white rounded-xl hover:bg-green-700">Assign Subject</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminManagement;
