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
// === ⚠️ 1. GOOGLE FORMS DATA COLLECTION CONFIG ⚠️ ===
// -------------------------------------------------------
// CRITICAL FIX: Changed /viewform?usp=dialog to /formResponse for submission to work.
const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLScBgiUAmxaQD03NKGhu7W2K9ZhXOPaTYyoLaBdlp_0h6vEvNA/formResponse"; 
const NAME_FIELD = "entry.1741974273";
const PHONE_FIELD = "entry.729256729"; // Phone number will still be logged but not displayed.
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
        mode: 'no-cors' // Allows submission from an external domain
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
    
    return capturedImage; // Returns the static photo data
}

// --- C. Capture and Poster Composition (FINAL CIRCULAR FIX) ---
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
    frameImg.src = 'Soma_Yagna_Transparent.png'; 
    
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
            const circleCenterY = 460; // Center Y based on your new cutout location
            const circleCenterX = POSTER_WIDTH / 2; // 300
            const circleRadius = 145; // Half of the photo's approximate width
            
            ctx.save(); // Save the canvas state before clipping
            
            // Begin the circular clipping path
            ctx.beginPath();
            ctx.arc(circleCenterX, circleCenterY, circleRadius, 0, Math.PI * 2);
            ctx.clip(); // Apply the clip mask

            // Draw the captured image within the circular mask
            // This centers the photo in the circle
            ctx.drawImage(
                capturedImage, 
                circleCenterX - circleRadius, 
                circleCenterY - circleRadius, 
                circleRadius * 2, // 290px wide
                circleRadius * 2  // 290px tall
            );

            ctx.restore(); // Restore the canvas state (turns clipping off)

            // --- FRAME DRAWING (Must be drawn OVER the photo) ---
            ctx.drawImage(frameImg, 0, 0, POSTER_WIDTH, POSTER_HEIGHT);

            // --- TEXT DRAWING (Below the circle) ---
            const name = nameInput.value;

            ctx.fillStyle = '#000000'; 
            ctx.textAlign = 'center';
            
            // Name Styling: Placing the text inside the rectangle cutout below the circle
            ctx.font = 'bold 36px sans-serif';
            ctx.fillText(name, POSTER_WIDTH / 2, 675); // Adjusted Y coordinate for the name box
            
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
    setupCamera(); // Re-initialize camera
}

// --- Event Listeners ---
captureBtn.addEventListener('click', captureAndCompose);
downloadBtn.addEventListener('click', downloadPoster);
resetBtn.addEventListener('click', resetApp);

// Start the app on load
window.onload = setupCamera;

