<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Register New Student - Face Attendance System">
    <title>Register Student — Face Attendance System</title>
    <link rel="stylesheet" href="../css/style.css">
    <script src="https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js"></script>
</head>
<body>
    <div class="app-layout">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="sidebar-logo">
                <div class="logo-icon">👁️</div>
                <div>
                    <span class="logo-text">FaceAttend</span>
                    <span class="logo-sub">Multi-Face Scanner</span>
                </div>
            </div>
            <ul class="sidebar-nav">
                <li><a href="dashboard.jsp"><span class="nav-icon">📊</span><span>Dashboard</span></a></li>
                <li><a href="live-attendance.jsp"><span class="nav-icon">📸</span><span>Live Scanner</span></a></li>
                <li><a href="register-student.jsp" class="active"><span class="nav-icon">➕</span><span>Register Student</span></a></li>
                <li><a href="students.jsp"><span class="nav-icon">👨‍🎓</span><span>Students</span></a></li>
                <li><a href="reports.jsp"><span class="nav-icon">📋</span><span>Reports</span></a></li>
                <li style="margin-top:auto;"><button onclick="Auth.logout()"><span class="nav-icon">🚪</span><span>Logout</span></button></li>
            </ul>
        </aside>

        <main class="main-content">
            <div class="page-header">
                <h1>Register New Student</h1>
                <p>Fill in student details and capture face data for recognition</p>
            </div>

            <div class="register-grid">
                <!-- Form Section -->
                <div class="card">
                    <h2 style="font-size: 18px; margin-bottom: 20px;">Student Information</h2>
                    <form id="register-form">
                        <div class="form-group">
                            <label class="form-label" for="roll_no">Roll Number</label>
                            <input type="text" id="roll_no" class="form-input" placeholder="e.g., CS2024001" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="name">Full Name</label>
                            <input type="text" id="name" class="form-input" placeholder="Enter student name" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="department">Department</label>
                            <input type="text" id="department" class="form-input" placeholder="e.g., Computer Science" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="year">Year</label>
                            <select id="year" class="form-select" required>
                                <option value="">Select Year</option>
                                <option value="1st Year">1st Year</option>
                                <option value="2nd Year">2nd Year</option>
                                <option value="3rd Year">3rd Year</option>
                                <option value="4th Year">4th Year</option>
                            </select>
                        </div>

                        <button type="submit" id="submit-btn" class="btn btn-primary btn-lg w-full mt-4" disabled>
                            Complete Registration
                        </button>
                    </form>
                </div>

                <!-- Webcam Section -->
                <div class="card">
                    <h2 style="font-size: 18px; margin-bottom: 20px;">Face Capture</h2>

                    <div id="model-loading" class="loading-overlay" style="padding: 40px;">
                        <div class="spinner"></div>
                        <p>Loading face recognition models...</p>
                    </div>

                    <div id="webcam-section" class="webcam-section hidden">
                        <div class="webcam-preview" id="webcam-preview">
                            <video id="register-video" autoplay muted></video>
                            <div class="capture-progress hidden" id="capture-progress">
                                <div class="progress-bar">
                                    <div class="fill" id="progress-fill" style="width: 0%"></div>
                                </div>
                                <p style="font-size: 13px; color: var(--text-primary);" id="progress-text">
                                    Analyzing face... 0%
                                </p>
                            </div>
                        </div>

                        <button id="capture-btn" class="btn btn-ghost mt-4" onclick="captureFaceData()">
                            📷 Capture Face Data
                        </button>
                        <p class="text-xs text-muted mt-2 text-center">
                            Look directly at the camera. The system takes 10 samples for accuracy.
                        </p>
                    </div>

                    <div id="face-captured" class="face-captured hidden">
                        <div class="check-icon">✅</div>
                        <p style="font-size: 18px; font-weight: 600;">Face Data Captured</p>
                        <button class="btn btn-ghost mt-4" onclick="retakeCapture()">
                            🔄 Retake
                        </button>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <script src="../js/dom-utils.js"></script>
    <script src="../js/face-detection.js"></script>
    <script>
        Auth.requireAuth();

        let faceDescriptor = null;
        let videoElement;

        // Initialize
        async function init() {
            const loaded = await FaceEngine.loadModels('../models');
            DOM.hide(document.getElementById('model-loading'));

            if (loaded) {
                DOM.show(document.getElementById('webcam-section'));
                videoElement = document.getElementById('register-video');
                startVideo();
            } else {
                Toast.error('Failed to load face recognition models');
            }
        }

        function startVideo() {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    videoElement.srcObject = stream;
                })
                .catch(err => {
                    Toast.error('Could not access webcam');
                    console.error(err);
                });
        }

        function stopVideo() {
            if (videoElement && videoElement.srcObject) {
                videoElement.srcObject.getTracks().forEach(t => t.stop());
            }
        }

        async function captureFaceData() {
            const captureBtn = document.getElementById('capture-btn');
            const progressOverlay = document.getElementById('capture-progress');
            const progressFill = document.getElementById('progress-fill');
            const progressText = document.getElementById('progress-text');

            captureBtn.disabled = true;
            DOM.show(progressOverlay);

            let descriptors = [];
            const samples = 10;

            for (let i = 0; i < samples; i++) {
                const detection = await FaceEngine.detectSingleFace(videoElement);

                if (detection) {
                    descriptors.push(detection.descriptor);
                    const pct = Math.round(((i + 1) / samples) * 100);
                    progressFill.style.width = pct + '%';
                    progressText.textContent = `Analyzing face... ${pct}%`;
                } else {
                    Toast.error('No face detected. Please look at the camera.');
                    captureBtn.disabled = false;
                    DOM.hide(progressOverlay);
                    progressFill.style.width = '0%';
                    return;
                }

                await new Promise(r => setTimeout(r, 500));
            }

            // Average the descriptors for better accuracy
            if (descriptors.length > 0) {
                const avg = new Float32Array(128);
                for (let i = 0; i < 128; i++) {
                    let sum = 0;
                    for (let j = 0; j < descriptors.length; j++) {
                        sum += descriptors[j][i];
                    }
                    avg[i] = sum / descriptors.length;
                }
                faceDescriptor = avg;

                stopVideo();
                DOM.hide(document.getElementById('webcam-section'));
                DOM.show(document.getElementById('face-captured'));
                document.getElementById('submit-btn').disabled = false;
                Toast.success('Face data captured successfully!');
            }
        }

        function retakeCapture() {
            faceDescriptor = null;
            document.getElementById('submit-btn').disabled = true;
            DOM.show(document.getElementById('webcam-section'));
            DOM.hide(document.getElementById('face-captured'));

            const progressOverlay = document.getElementById('capture-progress');
            DOM.hide(progressOverlay);
            document.getElementById('progress-fill').style.width = '0%';
            document.getElementById('capture-btn').disabled = false;

            startVideo();
        }

        // Form submission
        document.getElementById('register-form').addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!faceDescriptor) {
                Toast.error('Please capture face data first');
                return;
            }

            const btn = document.getElementById('submit-btn');
            btn.disabled = true;
            btn.textContent = 'Registering...';

            try {
                await API.post('/api/students', {
                    roll_no: document.getElementById('roll_no').value,
                    name: document.getElementById('name').value,
                    department: document.getElementById('department').value,
                    year: document.getElementById('year').value,
                    face_descriptor: Array.from(faceDescriptor)
                });

                Toast.success('Student registered successfully!');
                setTimeout(() => {
                    window.location.href = 'students.jsp';
                }, 1000);
            } catch (error) {
                Toast.error(error.message || 'Registration failed');
                btn.disabled = false;
                btn.textContent = 'Complete Registration';
            }
        });

        init();
    </script>
</body>
</html>
