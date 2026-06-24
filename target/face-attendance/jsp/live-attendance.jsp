<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Live Multi-Face Classroom Scanner - Attendance System">
    <title>Live Scanner — Face Attendance System</title>
    <link rel="stylesheet" href="../css/style.css">
    <!-- face-api.js for AI face detection -->
    <script src="https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js"></script>
</head>
<body>
    <a href="dashboard.jsp" class="back-btn" id="back-to-dashboard">
        ← Back to Dashboard
    </a>

    <div class="scanner-container">
        <div class="scanner-card glass">
            <h1 class="scanner-title">Multi-Face Classroom Scanner</h1>
            <p class="scanner-subtitle">Camera scans ALL faces simultaneously — faster than fingerprint biometric</p>

            <!-- Loading State -->
            <div class="loading-overlay" id="scanner-loading">
                <div class="spinner"></div>
                <p id="loading-text">Initializing AI Models...</p>
            </div>

            <!-- Video Container -->
            <div class="video-container" id="video-container" style="display: none;">
                <video id="scanner-video" autoplay muted playsinline></video>
                <canvas id="scanner-canvas"></canvas>
            </div>

            <!-- Live Counter -->
            <div class="live-counter" id="live-counter">
                <div class="count">
                    <span id="recognized-count">0</span> / <span id="total-faces">0</span> faces recognized
                </div>
                <div class="label">
                    Total marked today: <strong id="marked-count">0</strong>
                </div>
                <div class="label">
                    Class Engagement Score: <strong id="engagement-score" style="color: #60a5fa;">0%</strong>
                </div>
                <div class="blink-prompt" id="scanner-message" style="color: #fbbf24; font-weight: 500; margin-top: 10px; font-size: 1.1rem;">
                    <!-- Action messages go here -->
                </div>
            </div>

            <!-- Status Indicators -->
            <div class="scanner-status">
                <div class="status-indicator">
                    <div class="status-dot green"></div>
                    <span>Recognized</span>
                </div>
                <div class="status-indicator">
                    <div class="status-dot red"></div>
                    <span>Unknown</span>
                </div>
                <div class="status-indicator">
                    <div class="status-dot blue"></div>
                    <span>Scanning</span>
                </div>
            </div>
        </div>
    </div>

    <script src="../js/dom-utils.js"></script>
    <script src="../js/face-detection.js"></script>
    <script src="../js/attendance.js"></script>
</body>
</html>
