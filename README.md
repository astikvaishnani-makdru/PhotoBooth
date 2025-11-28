# PhotoBooth
# 📸 Event Photo Poster Booth

This is a **client-side web application** designed for use at religious or community events. It acts as a digital photo booth, allowing users to quickly take a picture, overlay event branding (a poster frame), capture their name and contact info, and download the resulting branded poster.

**Crucially, this solution uses only free, client-side technologies and leverages Google Forms for secure, serverless data logging.**

## ✨ Features

* **Camera Access:** Accesses the device's camera (front or back) directly through the browser.
* **Form Integration:** Collects user's Name and Phone Number.
* **Poster Generation:** Uses the **JavaScript Canvas API** to merge the photo, a custom PNG frame (`poster_frame.png`), and the user's details into a single final image.
* **Data Logging:** Submits Name and Phone Number silently to a **Google Sheet** (via Google Forms) upon download, acting as a free backend database.
* **Instant Download:** Allows the user to save the final branded poster as a PNG file.
* **Zero Server Cost:** Hosted entirely for free using GitHub Pages (or any static host).

## 🛠️ Project Structure

This project requires only a handful of files in the repository root:

| File / Asset | Purpose | Configuration Required? |
| `index.html` | The main webpage structure, form, and display elements. | No |
| `style.css` | Styling and layout for responsiveness. | No |
| `script.js` | The core JavaScript logic (camera, canvas, and data fetch). | **YES** |
| `poster_frame.png` | **Your custom frame/branding image (must be 600x800 transparent PNG).** | No |

## ⚙️ Setup and Configuration (Crucial Steps)

To make the application functional, you must update the three configuration constants in **`script.js`**.

### 1. Configure Data Collection (Google Forms)

Before deployment, you must set up your free data collector:

1.  **Create a Google Form:** Create a form with two "Short answer" questions: **Name** and **Phone Number**.
2.  **Get the Submission Details:** Use the **`Get pre-filled link`** feature in the Google Forms editor ($\htmlentity{⋮}$) to generate a pre-filled URL.
3.  **Extract the Three Values:** From the generated URL, extract the following:
    * **FORM\_URL:** The base URL ending in `/formResponse`.
    * **NAME\_FIELD:** The unique `entry.XXX` ID for the Name field.
    * **PHONE\_FIELD:** The unique `entry.YYY` ID for the Phone field.

### 2. Update `script.js`

Open `script.js` and replace the placeholder values at the top of the file:

```javascript
// =======================================================
// === ⚠️ GOOGLE FORMS DATA COLLECTION CONFIG ⚠️ ===
// =======================================================
const FORM_URL = "YOUR_COPIED_FORM_RESPONSE_URL"; 
const NAME_FIELD = "entry.YOUR_NAME_ENTRY_ID"; 
const PHONE_FIELD = "entry.YOUR_PHONE_ENTRY_ID";
// =======================================================
