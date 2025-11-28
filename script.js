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
const POSTER_HEIGHT = 800;
posterCanvas.width = POSTER_WIDTH;
posterCanvas.height = POSTER_HEIGHT;

// =======================================================
// === ⚠️ 1. GOOGLE FORMS DATA COLLECTION CONFIG ⚠️ ===
// -------------------------------------------------------
// REPLACE these values with your actual Google Form details (Entry IDs and URL)
const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLScBgiUAmxaQD03NKGhu7W2K9ZhXOPaTYyoLaBdlp_0h6vEvNA/viewform?usp=dialog"; 
const NAME_FIELD = "entry.1741974273";
const PHONE_FIELD = "entry.729256729";
//const FORM_URL = "https://docs.google.com/forms/d/e/YOUR_UNIQUE_FORM_ID/formResponse";
//const NAME_FIELD = "entry.YOUR_NAME_ENTRY_ID"; 
//const PHONE_FIELD = "entry.YOUR_PHONE_ENTRY_ID";
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


// --- C. Capture and Poster Composition ---
function captureAndCompose() {
    if (!nameInput.value) {
        alert("Please enter your name before capturing the photo.");
        return;
    }

    // Stop video stream and switch sections
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
    }
    captureSection.style.display = 'none';
    resultSection.style.display = 'block';

    const frameImg = new Image();
    frameImg.onerror = () => {
    // This alert will pop up if the image file is not found or corrupted
    alert("CRITICAL ERROR: 'Soma_Yagna_Transparent.png' failed to load. Check file name and path.");
    console.error("Image loading failed.");
    };
    frameImg.onload = () => {
        // 1. Draw the captured photo (adjust coordinates as needed)
        const photoWidth = 550; 
        const photoHeight = 450;
        const photoX = 25;
        const photoY = 320;
        //ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, photoX, photoY, photoWidth, photoHeight);

        // 2. Draw the PNG Frame OVER the photo
        ctx.drawImage(frameImg, 0, 0, POSTER_WIDTH, POSTER_HEIGHT);

        // 3. Draw the Text Details
        const name = nameInput.value;
        const phone = phoneInput.value;

        ctx.fillStyle = '#000000'; // Black text
        ctx.textAlign = 'center';
        
        // Name Styling
        ctx.font = 'bold 36px sans-serif';
        ctx.fillText(name, POSTER_WIDTH / 2, 750); 

        // Phone Styling (smaller, optional)
        if (phone) {
            ctx.font = '24px sans-serif';
            ctx.fillText(phone, POSTER_WIDTH / 2, 780); 
        }
    };
    // **IMPORTANT: Must be in the same folder as index.html**
    frameImg.src = 'Soma_Yagna_Transparent.png'; 
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






