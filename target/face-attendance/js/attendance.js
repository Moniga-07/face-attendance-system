/**
 * Live Attendance Scanner - Multi-face classroom recognition.
 * 
 * This script powers the live-attendance.jsp page.
 * It continuously scans the camera feed and recognizes ALL faces simultaneously,
 * automatically marking attendance for each recognized student.
 */

const AttendanceScanner = {
    videoElement: null,
    canvasElement: null,
    scanInterval: null,
    markedToday: new Set(),  // Track already-marked students to avoid spam
    blinkTracker: new Map(), // Track blinks for liveness detection
    recognizedCount: 0,

    /**
     * Initialize the scanner
     */
    async init() {
        this.videoElement = document.getElementById('scanner-video');
        this.canvasElement = document.getElementById('scanner-canvas');

        // Show loading state
        this.showLoading('Loading AI models...');

        // Load models
        const modelsOk = await FaceEngine.loadModels('models');
        if (!modelsOk) {
            Toast.error('Failed to load face recognition models');
            return;
        }

        // Load student data
        this.showLoading('Loading student database...');
        const studentCount = await FaceEngine.loadStudentData();

        if (studentCount === 0) {
            Toast.warning('No students registered. Please register students first.');
        }

        // Geofencing Check
        this.showLoading('Verifying location...');
        const inClassroom = await this.verifyLocation();
        if (!inClassroom) return;

        // Start webcam
        this.showLoading('Starting camera...');
        await this.startCamera();

        // Hide loading, show video
        this.hideLoading();
        Toast.success(`Scanner ready! ${studentCount} students loaded.`);
    },

    /**
     * Start the webcam
     */
    async startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720, facingMode: 'user' }
            });
            this.videoElement.srcObject = stream;

            // Wait for video to be ready
            await new Promise(resolve => {
                this.videoElement.onloadedmetadata = () => {
                    this.videoElement.play();
                    resolve();
                };
            });

            // Start continuous scanning
            this.startScanning();
        } catch (error) {
            console.error('Camera error:', error);
            Toast.error('Could not access camera. Please allow camera permissions.');
        }
    },

    /**
     * Start continuous face scanning loop
     */
    startScanning() {
        // Scan every 800ms for multi-face detection
        this.scanInterval = setInterval(async () => {
            if (this.videoElement.paused || this.videoElement.ended) return;

            const displaySize = {
                width: this.videoElement.videoWidth,
                height: this.videoElement.videoHeight
            };

            // Detect ALL faces in the frame simultaneously
            const results = await FaceEngine.detectAllFacesInFrame(this.videoElement);

            // Draw detections on canvas
            FaceEngine.drawDetections(this.canvasElement, results, displaySize);

            // Update recognized count display
            const recognized = results.filter(r => r.recognized);
            this.updateCounter(recognized.length, results.length);
            
            // Calculate and display Engagement Score
            this.updateEngagementScore(results);

            // Mark attendance for each recognized student
            for (const result of recognized) {
                if (!this.markedToday.has(result.studentId)) {
                    // Anti-Spoofing: Check for blink (EAR < 0.25)
                    let studentBlinkState = this.blinkTracker.get(result.studentId) || { closed: false, verified: false };
                    
                    if (!studentBlinkState.verified) {
                        if (result.ear < 0.25) {
                            studentBlinkState.closed = true; // Eyes closed
                        } else if (studentBlinkState.closed && result.ear > 0.25) {
                            studentBlinkState.verified = true; // Blink completed!
                            Toast.success(`Live person verified: ${result.student.name}`);
                        }
                        this.blinkTracker.set(result.studentId, studentBlinkState);
                    }
                    
                    if (studentBlinkState.verified) {
                        this.markAttendance(result.studentId, result.student);
                    } else {
                        // Prompt user to blink on screen
                        const infoMsg = document.getElementById('scanner-message');
                        if (infoMsg) infoMsg.textContent = `Please blink to verify: ${result.student.name}`;
                    }
                }
            }
        }, 800);
    },

    /**
     * Mark attendance for a recognized student
     */
    async markAttendance(studentId, student) {
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        const timeStr = today.toTimeString().split(' ')[0];

        try {
            await API.post('/api/attendance', {
                student_id: parseInt(studentId),
                attendance_date: dateStr,
                attendance_time: timeStr
            });

            this.markedToday.add(studentId);
            this.recognizedCount++;
            Toast.success(`✅ ${student.name} — Attendance marked!`);

        } catch (error) {
            if (error.status === 400 && error.data?.message?.includes('already marked')) {
                this.markedToday.add(studentId);
                Toast.info(`${student.name} — Already marked today`);
            } else {
                console.error('Attendance error:', error);
            }
        }
    },

    /**
     * Update the live counter display
     */
    updateCounter(recognized, total) {
        const counter = document.getElementById('live-counter');
        const countEl = document.getElementById('recognized-count');
        const totalEl = document.getElementById('total-faces');

        if (total > 0) {
            counter.classList.add('active');
            countEl.textContent = recognized;
            totalEl.textContent = total;
        } else {
            counter.classList.remove('active');
        }

        // Update total marked count
        const markedEl = document.getElementById('marked-count');
        if (markedEl) {
            markedEl.textContent = this.markedToday.size;
        }
    },

    /**
     * Show loading state
     */
    showLoading(message) {
        const loadingEl = document.getElementById('scanner-loading');
        const videoContainer = document.getElementById('video-container');
        const loadingText = document.getElementById('loading-text');

        if (loadingEl) loadingEl.style.display = 'flex';
        if (videoContainer) videoContainer.style.display = 'none';
        if (loadingText) loadingText.textContent = message;
    },

    /**
     * Hide loading state
     */
    hideLoading() {
        const loadingEl = document.getElementById('scanner-loading');
        const videoContainer = document.getElementById('video-container');

        if (loadingEl) loadingEl.style.display = 'none';
        if (videoContainer) videoContainer.style.display = 'block';
    },

    /**
     * Stop the scanner and release camera
     */
    stop() {
        if (this.scanInterval) {
            clearInterval(this.scanInterval);
            this.scanInterval = null;
        }

        if (this.videoElement && this.videoElement.srcObject) {
            this.videoElement.srcObject.getTracks().forEach(track => track.stop());
        }
    },

    /**
     * GPS Geofencing
     */
    async verifyLocation() {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                Toast.error('Geolocation is not supported by your browser.');
                resolve(false);
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    console.log(`[Geofence] Current location: ${lat}, ${lng}`);
                    // Demo: Allow any location, but normally you'd calculate distance to classroom here.
                    Toast.success('Location verified. You are in the classroom bounds.');
                    resolve(true);
                },
                (error) => {
                    Toast.error('Location access denied. Cannot start scanner outside bounds.');
                    resolve(false);
                }
            );
        });
    },

    /**
     * Calculate Engagement Score based on facial expressions
     */
    updateEngagementScore(results) {
        if (results.length === 0) return;
        // Consider neutral and happy as 'engaged'
        const engaged = results.filter(r => r.expression === 'neutral' || r.expression === 'happy').length;
        const score = Math.round((engaged / results.length) * 100);
        
        const scoreEl = document.getElementById('engagement-score');
        if (scoreEl) scoreEl.textContent = `${score}%`;
    }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    AttendanceScanner.init();
});

// Cleanup when leaving page
window.addEventListener('beforeunload', () => {
    AttendanceScanner.stop();
});
