import React, { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Camera, CheckCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RegisterStudent = () => {
    const navigate = useNavigate();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [capturing, setCapturing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [faceDescriptor, setFaceDescriptor] = useState<Float32Array | null>(null);
    
    const [formData, setFormData] = useState({
        roll_no: '',
        name: '',
        department: '',
        year: '',
        course: ''
    });

    useEffect(() => {
        const loadModels = async () => {
            try {
                await Promise.all([
                    faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
                    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
                    faceapi.nets.faceRecognitionNet.loadFromUri('/models')
                ]);
                setModelsLoaded(true);
            } catch (error) {
                console.error('Failed to load models:', error);
                toast.error('Failed to load face recognition models.');
            }
        };
        loadModels();
    }, []);

    const startVideo = () => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((currentStream) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = currentStream;
                }
            })
            .catch((err) => {
                console.error(err);
                toast.error('Could not access webcam.');
            });
    };

    const stopVideo = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    };

    useEffect(() => {
        if (modelsLoaded) {
            startVideo();
        }
        return () => stopVideo();
    }, [modelsLoaded]);

    const captureFaceData = async () => {
        if (!videoRef.current) return;
        setCapturing(true);
        setProgress(0);
        
        let descriptors: Float32Array[] = [];
        let samples = 10;
        
        for (let i = 0; i < samples; i++) {
            const detection = await faceapi.detectSingleFace(videoRef.current)
                .withFaceLandmarks()
                .withFaceDescriptor();
                
            if (detection) {
                descriptors.push(detection.descriptor);
                setProgress(((i + 1) / samples) * 100);
            } else {
                toast.error('No face detected. Please ensure your face is clearly visible.');
                setCapturing(false);
                setProgress(0);
                return;
            }
            
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        if (descriptors.length > 0) {
            const avgDescriptor = new Float32Array(128);
            for (let i = 0; i < 128; i++) {
                let sum = 0;
                for (let j = 0; j < descriptors.length; j++) {
                    sum += descriptors[j][i];
                }
                avgDescriptor[i] = sum / descriptors.length;
            }
            setFaceDescriptor(avgDescriptor);
            toast.success('Face data captured successfully!');
        }
        
        setCapturing(false);
        stopVideo();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!faceDescriptor) {
            toast.error('Please capture face data first.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const descriptorArray = Array.from(faceDescriptor);
            
            await axios.post('http://localhost:5000/api/students', {
                ...formData,
                face_descriptor: descriptorArray
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            toast.success('Student registered successfully!');
            navigate('/students');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to register student');
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-100 mb-6">Register New Student</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Form Section */}
                <div className="glass p-6 rounded-2xl">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Roll Number</label>
                            <input
                                type="text"
                                required
                                value={formData.roll_no}
                                onChange={e => setFormData({...formData, roll_no: e.target.value})}
                                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-200"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-200"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Department</label>
                            <input
                                type="text"
                                required
                                value={formData.department}
                                onChange={e => setFormData({...formData, department: e.target.value})}
                                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-200"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Year</label>
                            <select
                                required
                                value={formData.year}
                                onChange={e => setFormData({...formData, year: e.target.value})}
                                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-200"
                            >
                                <option value="">Select Year</option>
                                <option value="1st Year">1st Year</option>
                                <option value="2nd Year">2nd Year</option>
                                <option value="3rd Year">3rd Year</option>
                                <option value="4th Year">4th Year</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Course</label>
                            <select
                                required
                                value={formData.course}
                                onChange={e => setFormData({...formData, course: e.target.value})}
                                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-200"
                            >
                                <option value="">Select Course</option>
                                <option value="ITA0218 - Web technology">ITA0218 - Web technology</option>
                                <option value="CSE1001 - Programming">CSE1001 - Programming</option>
                                <option value="ECE2002 - Digital Logic">ECE2002 - Digital Logic</option>
                                <option value="MGT101 - Management">MGT101 - Management</option>
                                <option value="ENG101 - English">ENG101 - English</option>
                            </select>
                        </div>
                        
                        <button
                            type="submit"
                            disabled={!faceDescriptor}
                            className="w-full mt-6 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 flex justify-center items-center"
                        >
                            Complete Registration
                        </button>
                    </form>
                </div>

                {/* Webcam Section */}
                <div className="glass p-6 rounded-2xl flex flex-col items-center justify-center">
                    {!modelsLoaded ? (
                        <div className="flex flex-col items-center text-slate-400">
                            <Loader2 className="animate-spin mb-2" size={32} />
                            <p>Loading facial recognition models...</p>
                        </div>
                    ) : faceDescriptor ? (
                        <div className="flex flex-col items-center text-emerald-400">
                            <CheckCircle size={64} className="mb-4" />
                            <p className="text-lg font-medium">Face Data Captured</p>
                            <button 
                                onClick={() => { setFaceDescriptor(null); startVideo(); }}
                                className="mt-4 text-sm text-slate-400 hover:text-slate-200 underline"
                            >
                                Retake
                            </button>
                        </div>
                    ) : (
                        <div className="w-full flex flex-col items-center">
                            <div className="relative w-full aspect-video bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
                                <video 
                                    ref={videoRef} 
                                    autoPlay 
                                    muted 
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                                {capturing && (
                                    <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center flex-col">
                                        <div className="w-3/4 bg-slate-700 h-2 rounded-full overflow-hidden mb-2">
                                            <div 
                                                className="bg-blue-500 h-full transition-all duration-300"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <p className="text-sm text-slate-200">Analyzing face... {Math.round(progress)}%</p>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={captureFaceData}
                                disabled={capturing}
                                className="mt-6 flex items-center space-x-2 py-2 px-6 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl transition-all disabled:opacity-50"
                            >
                                <Camera size={20} />
                                <span>{capturing ? 'Capturing...' : 'Capture Face Data'}</span>
                            </button>
                            <p className="text-xs text-slate-400 mt-4 text-center">
                                Look directly at the camera. The system will take 10 samples to create an accurate facial profile.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RegisterStudent;
