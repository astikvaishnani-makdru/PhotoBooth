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
// CAMERA INITIALIZATION (SAFE)
// ===========================
let currentStream = null;
let currentFacingMode = "user"; // default selfie

async function setupCamera() {
    if (!video) {
        console.error("Video element not found!");
        return;
    }

    // Stop previous stream if exists
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    try {
        // Use simple, widely compatible constraints
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        });

        currentStream = stream;
        video.srcObject = stream;
        video.muted = true;
        video.playsInline = true;

        video.onloadedmetadata = () => {
            video.play().catch(err => console.error("Video play failed:", err));

            // Mirror preview for se
