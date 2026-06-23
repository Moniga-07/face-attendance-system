import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Download, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import Papa from 'papaparse';

const Reports = () => {
    const [attendance, setAttendance] = useState<any[]>([]);
    const [filterDate, setFilterDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    useEffect(() => {
        fetchAttendance();
    }, [filterDate]);

    const fetchAttendance = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`http://localhost:5000/api/attendance?date=${filterDate}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAttendance(data);
        } catch (error) {
            toast.error('Failed to fetch attendance records');
        }
    };

    const exportCSV = () => {
        if (attendance.length === 0) return toast.error('No data to export');
        
        const csvData = attendance.map(record => ({
            'Roll Number': record.roll_no,
            'Name': record.name,
            'Department': record.department,
            'Year': record.year,
            'Date': format(new Date(record.attendance_date), 'yyyy-MM-dd'),
            'Time': record.attendance_time,
            'Status': record.status
        }));
        
        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `attendance_${filterDate}.csv`;
        link.click();
    };

    const exportPDF = () => {
        if (attendance.length === 0) return toast.error('No data to export');

        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text(`Attendance Report - ${filterDate}`, 14, 22);
        
        doc.setFontSize(11);
        doc.setTextColor(100);
        
        let y = 35;
        doc.text('Roll No', 14, y);
        doc.text('Name', 50, y);
        doc.text('Department', 110, y);
        doc.text('Time', 160, y);
        
        y += 10;
        doc.setTextColor(0);
        
        attendance.forEach(record => {
            if (y > 280) {
                doc.addPage();
                y = 20;
            }
            doc.text(record.roll_no.toString(), 14, y);
            doc.text(record.name, 50, y);
            doc.text(record.department, 110, y);
            doc.text(record.attendance_time, 160, y);
            y += 10;
        });

        doc.save(`attendance_${filterDate}.pdf`);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-100">Attendance Reports</h1>
                <div className="flex gap-4">
                    <button 
                        onClick={exportCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors border border-slate-700"
                    >
                        <Download size={18} />
                        <span>Export CSV</span>
                    </button>
                    <button 
                        onClick={exportPDF}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors"
                    >
                        <Download size={18} />
                        <span>Export PDF</span>
                    </button>
                </div>
            </div>

            <div className="glass p-6 rounded-2xl flex items-center gap-4 border border-slate-700/50">
                <CalendarIcon className="text-slate-400" />
                <div className="flex flex-col">
                    <label className="text-sm text-slate-400 mb-1">Filter by Date</label>
                    <input 
                        type="date" 
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-blue-500"
                    />
                </div>
            </div>

            <div className="glass rounded-2xl overflow-hidden border border-slate-700/50">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-800/50 border-b border-slate-700">
                            <th className="px-6 py-4 text-sm font-medium text-slate-400">Time</th>
                            <th className="px-6 py-4 text-sm font-medium text-slate-400">Roll No</th>
                            <th className="px-6 py-4 text-sm font-medium text-slate-400">Name</th>
                            <th className="px-6 py-4 text-sm font-medium text-slate-400">Department</th>
                            <th className="px-6 py-4 text-sm font-medium text-slate-400">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attendance.length > 0 ? (
                            attendance.map((record) => (
                                <tr key={record.id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4 text-slate-400">{record.attendance_time}</td>
                                    <td className="px-6 py-4 text-slate-300 font-medium">{record.roll_no}</td>
                                    <td className="px-6 py-4 text-slate-200">{record.name}</td>
                                    <td className="px-6 py-4 text-slate-400">{record.department}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            record.status === 'Present' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                        }`}>
                                            {record.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                    No attendance records found for this date.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Reports;
