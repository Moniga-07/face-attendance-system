import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { UserCircle } from 'lucide-react';

const UserProfile = () => {
    const [formData, setFormData] = useState({
        faculty_name: '',
        faculty_id: '',
        course_name: '',
        course_code: '',
        period_slot: '',
        room_number: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const { data } = await axios.get('http://localhost:5000/api/users/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (data) {
                    setFormData({
                        faculty_name: data.faculty_name || '',
                        faculty_id: data.faculty_id || '',
                        course_name: data.course_name || '',
                        course_code: data.course_code || '',
                        period_slot: data.period_slot || '',
                        room_number: data.room_number || ''
                    });
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5000/api/users/profile', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Profile updated successfully!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        }
    };

    if (loading) {
        return <div className="text-slate-400">Loading profile...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                    <UserCircle size={32} />
                </div>
                <h1 className="text-2xl font-bold text-slate-800">User Profile</h1>
            </div>

            <div className="glass p-8 rounded-3xl border border-slate-200/50">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Faculty Name</label>
                            <input 
                                className="w-full p-3 border rounded-xl outline-none focus:border-blue-500" 
                                value={formData.faculty_name} 
                                onChange={e => setFormData({...formData, faculty_name: e.target.value})} 
                                placeholder="E.g. Dr. John Doe" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Faculty ID</label>
                            <input 
                                className="w-full p-3 border rounded-xl outline-none focus:border-blue-500" 
                                value={formData.faculty_id} 
                                onChange={e => setFormData({...formData, faculty_id: e.target.value})} 
                                placeholder="E.g. FAC1029" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Default Course Name</label>
                            <input 
                                className="w-full p-3 border rounded-xl outline-none focus:border-blue-500" 
                                value={formData.course_name} 
                                onChange={e => setFormData({...formData, course_name: e.target.value})} 
                                placeholder="E.g. Web Technology" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Default Course Code</label>
                            <input 
                                className="w-full p-3 border rounded-xl outline-none focus:border-blue-500" 
                                value={formData.course_code} 
                                onChange={e => setFormData({...formData, course_code: e.target.value})} 
                                placeholder="E.g. ITA0218" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Period / Slot</label>
                            <input 
                                className="w-full p-3 border rounded-xl outline-none focus:border-blue-500" 
                                value={formData.period_slot} 
                                onChange={e => setFormData({...formData, period_slot: e.target.value})} 
                                placeholder="E.g. Morning / Slot A1" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Room Number</label>
                            <input 
                                className="w-full p-3 border rounded-xl outline-none focus:border-blue-500" 
                                value={formData.room_number} 
                                onChange={e => setFormData({...formData, room_number: e.target.value})} 
                                placeholder="E.g. Room 405" 
                            />
                        </div>
                    </div>
                    
                    <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors">
                        Save Profile Settings
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UserProfile;
