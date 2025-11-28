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
const POSTER_HEIGHT = 300; // Matches index.html
posterCanvas.width = POSTER_WIDTH;
posterCanvas.height = POSTER_HEIGHT;

// =======================================================
// === ⚠️ 1. GOOGLE FORMS DATA COLLECTION CONFIG ⚠️ ===
// -------------------------------------------------------
// CRITICAL FIX: Changed /viewform?usp=dialog to /formResponse for submission to work.
const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLScBgiUAmxaQD03NKGhu7W2K9ZhXOPaTYyoLaBdlp_0h6vEvNA/formResponse"; 
const NAME_FIELD = "entry.1741974273";
const PHONE_FIELD = "entry.729256729"; 
// =======================================================


// --- A. Camera Initialization ---
async function setupCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
        });
        video.srcObject = stream;
        video.play();
    } catch (err) {
        console.error("Camera access failed:", err);
        alert("Camera access denied or failed. Please ensure you are on a deployed HTTPS link.");
    }
}

// --- B. Data Submission to Google Sheets ---
function sendDataToSheets(name, phone) {
    const formData = new FormData();
    formData.append(NAME_FIELD, name);
    formData.append(PHONE_FIELD, phone);

    // Send data silently in the background
    fetch(FORM_URL, {
        method: 'POST',
        body: formData,
        mode: 'no-cors' 
    }).then(() => console.log("Data submitted successfully")).catch(err => console.error("Data submission failed:", err));
}

function getFrameFromVideo() {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Draw the current frame of the live video onto the temporary canvas
    tempCtx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    
    // Create an Image element from the canvas data
    const capturedImage = new Image();
    capturedImage.src = tempCanvas.toDataURL('image/jpeg');
    
    return capturedImage; 
}

// --- C. Capture and Poster Composition (FINAL ALIGNMENT FIX) ---
// --- C. Capture and Poster Composition (FINAL ALIGNMENT FIX) ---
function captureAndCompose() {
    if (!nameInput.value) {
        alert("Please enter your name before capturing the photo.");
        return;
    }
    
    // 1. CAPTURE FRAME IMMEDIATELY
    const capturedImage = getFrameFromVideo();
    
    // 2. Stop video stream and switch sections
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
    }
    captureSection.style.display = 'none';
    resultSection.style.display = 'block';

    // 3. LOAD FRAME IMAGE
    const frameImg = new Image();
    frameImg.src = 'Yagna.png'; 
    
    // Add error handler for the frame image
    frameImg.onerror = () => {
        alert("CRITICAL ERROR: 'Soma_Yagna_Transparent.png' failed to load. Check file name and path.");
        console.error("Image loading failed.");
    };

    // 4. WAIT FOR BOTH IMAGES TO LOAD BEFORE DRAWING
    frameImg.onload = () => {
        
        capturedImage.onload = () => {

            // 5. START DRAWING

            // --- PHOTO DRAWING (CIRCULAR CLIP) ---
            // Y-Center adjusted for optimal vertical placement in your template.
            const circleCenterY = 190; 
            // X-Center adjusted to align with the circular cutout on the right side of the poster.
            const circleCenterX = 400; 
            // Radius adjusted for a tighter fit inside the black circle cutout (Diameter 210px).
            const circleRadius = 105; 
            
            ctx.save(); // Save the canvas state before clipping
            
            // Begin the circular clipping path
            ctx.beginPath();
            ctx.arc(circleCenterX, circleCenterY, circleRadius, 0, Math.PI * 2);
            ctx.clip(); // Apply the clip mask

            // Draw the captured image within the circular mask
            ctx.drawImage(
                capturedImage, 
                // Draw starting X: Center X minus radius
                circleCenterX - circleRadius, 
                // Draw starting Y: Center Y minus radius
                circleCenterY - circleRadius, 
                circleRadius * 2, 
                circleRadius * 2  
            );

            ctx.restore(); // Restore the canvas state (turns clipping off)

            // --- FRAME DRAWING (Must be drawn OVER the photo) ---
            ctx.drawImage(frameImg, 0, 0, POSTER_WIDTH, POSTER_HEIGHT);

            // --- TEXT DRAWING (Below the circle) ---
            const name = nameInput.value;

            ctx.fillStyle = '#000000'; 
            ctx.textAlign = 'center';
            
            // Name Styling: Smaller font and adjusted coordinates to fit inside the name box
            ctx.font = 'bold 24px sans-serif'; 
            // X-coordinate matches the photo center X (435)
            // Y-coordinate (275) is vertically centered in the name box
            ctx.fillText(name, circleCenterX, 275); 
            
            // NOTE: Phone number drawing is intentionally removed.
        }; 
        
        // If the captured image is already loaded (it often is), this triggers the onload immediately.
        if (capturedImage.complete) {
            capturedImage.onload();
        }
    };
}

// --- D. Download ---
function downloadPoster() {
    // 1. Log the data to Google Sheets
    sendDataToSheets(nameInput.value, phoneInput.value); 
    
    // 2. Trigger the file download
    const dataURL = posterCanvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = `EventPoster_${nameInput.value.replace(/\s/g, '_')}.png`; 
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// --- E. Reset ---
function resetApp() {
    ctx.clearRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT);
    resultSection.style.display = 'none';
    captureSection.style.display = 'block';
    setupCamera(); 
}

// --- Event Listeners ---
captureBtn.addEventListener('click', captureAndCompose);
downloadBtn.addEventListener('click', downloadPoster);
resetBtn.addEventListener('click', resetApp);

// Start the app on load
window.onload = setupCamera;



