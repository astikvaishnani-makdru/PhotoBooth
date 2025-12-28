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

// =======================================================
// === GOOGLE FORMS DATA COLLECTION CONFIG ===
const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLScBgiUAmxaQD03NKGhu7W2K9ZhXOPaTYyoLaBdlp_0h6vEvNA/formResponse";
const NAME_FIELD = "entry.1741974273";
const PHONE_FIELD = "entry.729256729";
// =======================================================


// =======================================================
// === A. CAMERA INITIALIZATION (MOBILE-SAFE + SWITCHING) ===
// =======================================================

let currentFacingMode = "user"; // ✅ front camera default
let currentStream = null;

async function setupCamera() {
    try {
        // Stop old stream if exists
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
        }

        const constraints = {
            video: {
                facingMode: { ideal: currentFacingMode }
            },
            audio: false
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        currentStream = stream;

        video.srcObject = stream;
        video.setAttribute("playsinline", true); // ✅ iOS fix
        video.play();

        // ✅ Mirror preview only for selfie camera
        video.style.transform =
            currentFacingMode === "user" ? "scaleX(-1)" : "none";

    } catch (err) {
        console.error("Camera access failed:", err);
        alert("Camera access denied or failed. Please ensure HTTPS is used.");
    }
}

// OPTIONAL: Camera switch support (if you add a button later)
function switchCamera() {
    currentFacingMode =
        currentFacingMode === "user" ? "environment" : "user";
    setupCamera();
}


// =======================================================
// === B. DATA SUBMISSION TO GOOGLE SHEETS ===
// =======================================================

function sendDataToSheets(name, phone) {
    const formData = new FormData();
    formData.append(NAME_FIELD, name);
    formData.append(PHONE_FIELD, phone);

    fetch(FORM_URL, {
        method: 'POST',
        body: formData,
        mode: 'no-cors'
    })
    .then(() => console.log("Data submitted successfully"))
    .catch(err => console.error("Data submission failed:", err));
}


// =======================================================
// === C. FRAME CAPTURE (UN-MIRRORED FOR POSTER) ===
// =======================================================

function getFrameFromVideo() {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    const tempCtx = tempCanvas.getContext('2d');

    // ❗️Un-mirror the captured image (poster should NOT be mirrored)
    if (currentFacingMode === "user") {
        tempCtx.translate(tempCanvas.width, 0);
        tempCtx.scale(-1, 1);
    }

    tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);

    const capturedImage = new Image();
    capturedImage.src = tempCanvas.toDataURL('image/jpeg');

    re
