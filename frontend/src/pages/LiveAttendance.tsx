import { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const LiveAttendance = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [studentsLoaded, setStudentsLoaded] = useState(false);
    const [faceMatcher, setFaceMatcher] = useState<faceapi.FaceMatcher | null>(null);
    const [studentMap, setStudentMap] = useState<Map<string, any>>(new Map());
    const [subjects, setSubjects] = useState<any[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [profile, setProfile] = useState<any>(null);
    
    // Cooldown to prevent spamming backend for the same person
    const lastRecognizedRef = useRef<{ id: string, time: number } | null>(null);
    const recognitionLoopRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const loadModelsAndData = async () => {
            try {
                // Load Models
                await Promise.all([
                    faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
                    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
                    faceapi.nets.faceRecognitionNet.loadFromUri('/models')
                ]);
                setModelsLoaded(true);

                // Fetch Students
                const { data } = await axios.get('http://localhost:9090/face-attendance/api/students/all-descriptors');
                
                if (data.length > 0) {
                    const map = new Map();
                    const labeledDescriptors = data.map((student: any) => {
                        map.set(student.id.toString(), student);
                        const descriptorArray = new Float32Array(student.face_descriptor);
                        return new faceapi.LabeledFaceDescriptors(student.id.toString(), [descriptorArray]);
                    });
                    
                    setStudentMap(map);
                    setFaceMatcher(new faceapi.FaceMatcher(labeledDescriptors, 0.45));
                }
                setStudentsLoaded(true);

                // Fetch Subjects
                const token = localStorage.getItem('token');
                if (token) {
                    const subRes = await axios.get('http://localhost:9090/face-attendance/api/subjects/my-subjects', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setSubjects(subRes.data);
                }
                // Fetch Profile Defaults
                if (token) {
                    try {
                        const profRes = await axios.get('http://localhost:9090/face-attendance/api/users/profile', {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        setProfile(profRes.data);
                        if (profRes.data && profRes.data.course_code) {
                            setSelectedSubject(profRes.data.course_code);
                        }
                    } catch (e) {
                        console.log('No profile defaults found or error fetching profile');
                    }
                }
            } catch (error) {
                console.error(error);
                toast.error('Failed to initialize attendance system');
            }
        };

        loadModelsAndData();
    }, []);

    useEffect(() => {
        let stream: MediaStream | null = null;
        if (modelsLoaded && studentsLoaded && selectedSubject) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then((currentStream) => {
                    stream = currentStream;
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                })
                .catch(err => {
                    console.error(err);
                    toast.error('Webcam access denied or unavailable');
                });
        }

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (recognitionLoopRef.current) {
                clearInterval(recognitionLoopRef.current);
            }
        };
    }, [modelsLoaded, studentsLoaded, selectedSubject]);

    const handleVideoPlay = () => {
        if (!videoRef.current || !canvasRef.current || !faceMatcher) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        // Wait a brief moment for video dimensions to be available
        setTimeout(() => {
            if (video.videoWidth === 0) return;
            const displaySize = { width: video.videoWidth, height: video.videoHeight };
            faceapi.matchDimensions(canvas, displaySize);

            recognitionLoopRef.current = setInterval(async () => {
                if (video.paused || video.ended) return;

                const detection = await faceapi.detectSingleFace(video)
                    .withFaceLandmarks()
                    .withFaceDescriptor();

                const ctx = canvas.getContext('2d');
                ctx?.clearRect(0, 0, canvas.width, canvas.height);

                if (detection) {
                    const resizedDetections = faceapi.resizeResults(detection, displaySize);
                    
                    const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
                    const confidence = Math.max(0, 100 - (bestMatch.distance * 100)).toFixed(1);

                    let labelText = 'Unknown Person';
                    let boxColor = '#ef4444'; // red

                    if (bestMatch.label !== 'unknown') {
                        const student = studentMap.get(bestMatch.label);
                        labelText = `${student?.name} (${confidence}%)`;
                        boxColor = '#22c55e'; // green
                        
                        const now = Date.now();
                        const lastRecog = lastRecognizedRef.current;
                        
                        if (!lastRecog || lastRecog.id !== bestMatch.label || (now - lastRecog.time) > 4000) {
                            lastRecognizedRef.current = { id: bestMatch.label, time: now };
                            
                            const today = new Date();
                            // Handle local timezone carefully
                            const attendance_date = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                            const attendance_time = today.toTimeString().split(' ')[0];

                            try {
                                await axios.post('http://localhost:9090/face-attendance/api/attendance', {
                                    student_id: bestMatch.label,
                                    subject_id: selectedSubject,
                                    attendance_date,
                                    attendance_time
                                });
                                toast.success(
                                    <div className="flex flex-col">
                                        <span className="font-bold">Attendance marked successfully</span>
                                        <span>{student.name}</span>
                                        <span className="text-xs opacity-80">{attendance_time}</span>
                                    </div>,
                                    { duration: 4000 }
                                );
                            } catch (error: any) {
                                if (error.response?.status === 400 && error.response?.data?.message.includes('already marked')) {
                                    toast.success(
                                        <div className="flex flex-col">
                                            <span className="font-bold text-green-400">Attendance already marked for today</span>
                                            <span>{student.name}</span>
                                        </div>,
                                        { 
                                            duration: 3000,
                                            icon: '✅'
                                        }
                                    );
                                } else {
                                    console.error(error);
                                }
                            }
                        }
                    } else {
                        const now = Date.now();
                        const lastRecog = lastRecognizedRef.current;
                        if (!lastRecog || lastRecog.id !== 'unknown' || (now - lastRecog.time) > 4000) {
                            lastRecognizedRef.current = { id: 'unknown', time: now };
                            toast.error('Unknown Person', { duration: 2000 });
                        }
                    }

                    const box = resizedDetections.detection.box;
                    const drawBox = new faceapi.draw.DrawBox(box, { label: labelText, boxColor, lineWidth: 3 });
                    drawBox.draw(canvas);
                }
            }, 500);
        }, 500);
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center relative">
            <Link to="/dashboard" className="absolute top-6 left-6 text-slate-400 hover:text-white flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-xl transition-all hover:bg-slate-700 z-10">
                <ArrowLeft size={18} />
                <span>Back to Dashboard</span>
            </Link>

            <div className="w-full max-w-4xl p-6 glass rounded-3xl flex flex-col items-center border border-slate-700/50 shadow-2xl">
                <h1 className="text-3xl font-bold text-slate-100 mb-2">Live Attendance Scanner</h1>
                <p className="text-slate-400 mb-6">Please look directly at the camera</p>

                {subjects.length > 0 && !profile?.course_code && (
                    <div className="mb-6 w-full max-w-md">
                        <label className="block text-sm font-medium text-slate-300 mb-2 text-center">Select Subject</label>
                        <select 
                            className="w-full p-3 bg-slate-800 text-slate-100 border border-slate-700 rounded-xl outline-none focus:border-blue-500"
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                        >
                            <option value="">-- Choose Subject --</option>
                            {subjects.map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.subject_code})</option>
                            ))}
                        </select>
                    </div>
                )}

                {(!selectedSubject && subjects.length > 0) ? (
                    <div className="w-full aspect-video bg-slate-800/50 rounded-2xl flex flex-col items-center justify-center text-slate-400 border border-slate-700 shadow-inner">
                        <p className="text-lg font-medium text-slate-300">Please select a subject to start camera</p>
                    </div>
                ) : (!modelsLoaded || !studentsLoaded) ? (
                    <div className="w-full aspect-video bg-slate-800/50 rounded-2xl flex flex-col items-center justify-center text-slate-400 border border-slate-700 shadow-inner">
                        <Loader2 className="animate-spin mb-4 text-blue-500" size={48} />
                        <p className="text-lg font-medium text-slate-300">Initializing System...</p>
                        {!modelsLoaded && <p className="text-sm mt-2 text-slate-500">Loading AI Models</p>}
                        {!studentsLoaded && modelsLoaded && <p className="text-sm mt-2 text-slate-500">Loading Student Database</p>}
                    </div>
                ) : (
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-600 shadow-2xl bg-black">
                        <video 
                            ref={videoRef}
                            onPlay={handleVideoPlay}
                            autoPlay 
                            muted 
                            className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
                            style={{ filter: 'brightness(1.05)' }}
                        />
                        <canvas 
                            ref={canvasRef}
                            className="absolute inset-0 w-full h-full transform scale-x-[-1]"
                        />
                    </div>
                )}
                
                <div className="mt-8 flex gap-8 w-full justify-center text-sm font-medium">
                    <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-2 rounded-full border border-slate-700">
                        <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                        <span className="text-slate-300">Recognized</span>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-2 rounded-full border border-slate-700">
                        <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                        <span className="text-slate-300">Unknown Person</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveAttendance;
