/**
 * Face Detection Engine - Multi-face classroom scanning.
 * Uses face-api.js for AI-powered face detection and recognition.
 * 
 * KEY INNOVATION: Uses detectAllFaces() to scan ALL faces simultaneously,
 * making this system significantly faster than fingerprint biometric.
 * 
 * Fingerprint: 60 students × 3s = 3 minutes (sequential)
 * This system: All faces at once = 5-10 seconds (parallel)
 */

const FaceEngine = {
    modelsLoaded: false,
    faceMatcher: null,
    studentMap: new Map(),

    /**
     * Load face-api.js neural network models
     */
    async loadModels(modelPath = 'models') {
        try {
            await Promise.all([
                faceapi.nets.ssdMobilenetv1.loadFromUri(modelPath),
                faceapi.nets.faceLandmark68Net.loadFromUri(modelPath),
                faceapi.nets.faceRecognitionNet.loadFromUri(modelPath),
                faceapi.nets.faceExpressionNet.loadFromUri(modelPath)
            ]);
            this.modelsLoaded = true;
            console.log('[FaceEngine] Models loaded successfully');
            return true;
        } catch (error) {
            console.error('[FaceEngine] Failed to load models:', error);
            return false;
        }
    },

    /**
     * Load registered student face descriptors from the server
     */
    async loadStudentData() {
        try {
            const data = await API.get('/api/students/all-descriptors');

            if (data.length > 0) {
                this.studentMap.clear();
                const labeledDescriptors = data.map(student => {
                    this.studentMap.set(student.id.toString(), student);
                    const descriptorArray = new Float32Array(student.face_descriptor);
                    return new faceapi.LabeledFaceDescriptors(
                        student.id.toString(),
                        [descriptorArray]
                    );
                });

                this.faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.45);
                console.log(`[FaceEngine] Loaded ${data.length} student face profiles`);
            }
            return data.length;
        } catch (error) {
            console.error('[FaceEngine] Failed to load student data:', error);
            return 0;
        }
    },

    /**
     * Detect ALL faces in the video frame simultaneously.
     * This is the key method that makes our system faster than fingerprint.
     * Returns array of { student, confidence, box } for each detected face.
     */
    async detectAllFacesInFrame(videoElement) {
        if (!this.modelsLoaded || !this.faceMatcher) return [];

        // detectAllFaces — scans for EVERY face in the frame at once
        const detections = await faceapi.detectAllFaces(videoElement)
            .withFaceLandmarks()
            .withFaceExpressions()
            .withFaceDescriptors();

        if (!detections || detections.length === 0) return [];

        const results = [];

        for (const detection of detections) {
            const match = this.faceMatcher.findBestMatch(detection.descriptor);
            const confidence = Math.max(0, 100 - (match.distance * 100));
            
            // Calculate Eye Aspect Ratio (EAR) for liveness detection
            const leftEye = detection.landmarks.getLeftEye();
            const rightEye = detection.landmarks.getRightEye();
            const ear = this.calculateEAR(leftEye, rightEye);
            
            // Get dominant expression for engagement score
            const expressions = detection.expressions;
            const dominantExpression = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);

            if (match.label !== 'unknown') {
                const student = this.studentMap.get(match.label);
                results.push({
                    student: student,
                    studentId: match.label,
                    confidence: confidence.toFixed(1),
                    box: detection.detection.box,
                    recognized: true,
                    ear: ear,
                    expression: dominantExpression
                });
            } else {
                results.push({
                    student: null,
                    studentId: null,
                    confidence: confidence.toFixed(1),
                    box: detection.detection.box,
                    recognized: false,
                    ear: ear,
                    expression: dominantExpression
                });
            }
        }

        return results;
    },

    /**
     * Detect a single face (for registration)
     */
    async detectSingleFace(videoElement) {
        if (!this.modelsLoaded) return null;

        const detection = await faceapi.detectSingleFace(videoElement)
            .withFaceLandmarks()
            .withFaceDescriptor();

        return detection || null;
    },

    /**
     * Draw detection results on a canvas overlay
     */
    drawDetections(canvas, detections, displaySize) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        faceapi.matchDimensions(canvas, displaySize);

        for (const det of detections) {
            const resizedBox = faceapi.resizeResults(det.box, displaySize);

            const color = det.recognized ? '#22c55e' : '#ef4444';
            const label = det.recognized
                ? `${det.student.name} (${det.confidence}%)`
                : `Unknown (${det.confidence}%)`;

            // Draw box
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.strokeRect(resizedBox.x, resizedBox.y, resizedBox.width, resizedBox.height);

            // Draw label background
            const textWidth = ctx.measureText(label).width;
            ctx.fillStyle = color;
            ctx.fillRect(resizedBox.x, resizedBox.y - 28, textWidth + 16, 28);

            // Draw label text
            ctx.fillStyle = '#ffffff';
            ctx.font = '13px Inter, sans-serif';
            ctx.fillText(label, resizedBox.x + 8, resizedBox.y - 8);
        }
    },

    /**
     * Get student info by ID
     */
    getStudent(id) {
        return this.studentMap.get(id.toString());
    },

    /**
     * Calculate Eye Aspect Ratio (EAR)
     */
    calculateEAR(leftEye, rightEye) {
        const dist = (p1, p2) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
        const eyeEAR = (eye) => {
            const v1 = dist(eye[1], eye[5]);
            const v2 = dist(eye[2], eye[4]);
            const h = dist(eye[0], eye[3]);
            return (v1 + v2) / (2.0 * h);
        };
        return (eyeEAR(leftEye) + eyeEAR(rightEye)) / 2.0;
    }
};
