// ===========================
// DOM ELEMENTS
// ===========================
const video = document.getElementById('video');
const captureBtn = document.getElementById('capture-btn');
const downloadBtn = document.getElementById('download-btn');
const resetBtn = document.getElementById('reset-btn');
const nameInput = document.getElementById('name');
const phoneInput = document.getElementById('phone');
const posterCanvas = document.getElementById('poster-canvas');
const captureSection = document.getElementById('capture-section');
const resultSection = document.getElementById('result-section');
const ctx = posterCanvas.getContext('2d');

const POSTER_WIDTH = 600;
const POSTER_HEIGHT = 300;
posterCanvas.width = POSTER_WIDTH;
posterCanvas.height = POSTER_HEIGHT;

// ===========================
// GOOGLE FORM CONFIG
// ===========================
const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLScBgiUAmxaQD03NKGhu7W2K9ZhXOPaTYyoLaBdlp_0h6vEvNA/formResponse";
const NAME_FIELD = "entry.1741974273";
const PHONE_FIELD = "entry.729256729";

// ===========================
// CAMERA INITIALIZATION (iOS & MOBILE SAFE)
// ===========================
let currentStream = null;
let currentFacingMode = "user"; // default selfie

async function setupCamera() {
    if (!video) return;

    // Stop old stream
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    try {
        // Try front camera first (iOS safe)
        const constraints = {
            video: { facingMode: { exact: currentFacingMode } },
            audio: false
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        currentStream = stream;
        video.srcObject = stream;
        video.muted = true;
        video.playsInline = true;

        video.onloadedmetadata = () => {
            video.play().catch(err => console.error(err));
            if (video) video.style.transform = "scaleX(-1)"; // mirror selfie
        };

    } catch (err) {
        console.warn("Front camera failed, using default camera", err);
        // fallback for older Safari / devices
        try {
            const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            currentStream = fallbackStream;
            video.srcObject = fallbackStream;
            video.muted = true;
            video.playsInline = true;
            video.onloadedmetadata = () => video.play().catch(err => console.error(err));
        } catch (err2) {
            console.error("Camera access failed", err2);
            alert("Camera access failed. Please allow camera permissions.");
        }
    }
}

// Optional: camera switch button
function switchCamera() {
    currentFacingMode = currentFacingMode === "user" ? "environment" : "user";
    setupCamera();
}

// ===========================
// GOOGLE FORM DATA SUBMISSION
// ===========================
function sendDataToSheets(name, phone) {
    const formData = new FormData();
    formData.append(NAME_FIELD, name);
    formData.append(PHONE_FIELD, phone);

    fetch(FORM_URL, {
        method: 'POST',
        body: formData,
        mode: 'no-cors'
    }).catch(() => {});
}

// ===========================
// CAPTURE FRAME FROM VIDEO
// ===========================
function getFrameFromVideo() {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    const tempCtx = tempCanvas.getContext('2d');

    // Mirror selfie preview for output
    if (currentFacingMode === "user") {
        tempCtx.translate(tempCanvas.width, 0);
        tempCtx.scale(-1, 1);
    }

    tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);

    const img = new Image();
    img.src = tempCanvas.toDataURL('image/jpeg');
    return img;
}

// ===========================
// CAPTURE AND COMPOSE POSTER
// ===========================
function captureAndCompose() {
    if (!nameInput.value) {
        alert("Please enter your name.");
        return;
    }

    const capturedImage = getFrameFromVideo();

    // Stop camera
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    captureSection.style.display = 'none';
    resultSection.style.display = 'block';

    const frameImg = new Image();
    frameImg.src = 'Yagna.png';
    frameImg.onerror = () => {
        alert("Frame image failed to load. Check file path.");
    };

    frameImg.onload = () => {
        capturedImage.onload = () => {
            const cx = 435;
            const cy = 190;
            const r = 105;

            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.clip();

            ctx.drawImage(capturedImage, cx - r, cy - r, r * 2, r * 2);
            ctx.restore();

            ctx.drawImage(frameImg, 0, 0, POSTER_WIDTH, POSTER_HEIGHT);

            ctx.fillStyle = '#000';
            ctx.font = 'bold 20px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(nameInput.value, cx, 240);
        };

        if (capturedImage.complete) capturedImage.onload();
    };
}

// ===========================
// DOWNLOAD AND RESET
// ===========================
function downloadPoster() {
    sendDataToSheets(nameInput.value, phoneInput.value);

    const a = document.createElement('a');
    a.href = posterCanvas.toDataURL('image/png');
    a.download = `EventPoster_${nameInput.value.replace(/\s/g, '_')}.png`;
    a.click();
}

function resetApp() {
    ctx.clearRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT);
    resultSection.style.display = 'none';
    captureSection.style.display = 'block';
    setupCamera();
}

// ===========================
// EVENT LISTENERS
// ===========================
captureBtn.addEventListener('click', captureAndCompose);
downloadBtn.addEventListener('click', downloadPoster);
resetBtn.addEventListener('click', resetApp);

// Start camera on window load
window.onload = setupCamera;
