import QrScanner from "https://unpkg.com/qr-scanner@1.4.2/qr-scanner.min.js";

/* -----------------------------------------------------
   CLEAR SESSION ON PAGE REFRESH
----------------------------------------------------- */
if (performance.getEntriesByType("navigation")[0].type === "reload") {
  sessionStorage.clear();
}

/* -----------------------------------------------------
   AUTO-EXPIRY CHECK (5 minutes)
----------------------------------------------------- */
function isExpired(time) {
  return Date.now() - time > 300000;  // 5 minutes in ms
}

/* -----------------------------------------------------
   SAVE STATE FOR PAGE NAVIGATION
----------------------------------------------------- */
function saveState() {
  const state = {
    plaintext: plaintext.value,
    shift: shift.value,
    encrypted: encrypted.value,
    key: cryptoKey.value,
    qr: qrImage.src,
    time: Date.now()
  };

  sessionStorage.setItem("enc_state", JSON.stringify(state));
}

/* -----------------------------------------------------
   LOAD STATE (ONLY IF NOT EXPIRED)
----------------------------------------------------- */
function loadState() {
  const raw = sessionStorage.getItem("enc_state");
  if (!raw) return;

  const state = JSON.parse(raw);

  // If saved more than 5 minutes ago → delete it
  if (isExpired(state.time)) {
    sessionStorage.removeItem("enc_state");
    return;
  }

  // Restore data
  plaintext.value = state.plaintext || "";
  shift.value = state.shift || 3;
  encrypted.value = state.encrypted || "";
  cryptoKey.value = state.key || "";

  if (state.qr) {
    qrImage.src = state.qr;
    downloadQR.classList.remove("hidden");
  }
}

// Load saved data on page open
loadState();

/* -----------------------------------------------------
   MAPPING → KEY STRING
----------------------------------------------------- */
function mappingToKeyString(map) {
  return "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    .split("")
    .map(c => map[c])
    .join("");
}

/* -----------------------------------------------------
   ENCRYPT BUTTON
----------------------------------------------------- */
encryptBtn.onclick = async () => {
  const res = await fetch("/encrypt", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      text: plaintext.value,
      shift: Number(shift.value)
    })
  });

  const data = await res.json();

  const keyString = mappingToKeyString(data.mapping);

  encrypted.value = data.encrypted;
  cryptoKey.value = `SHIFT=${shift.value}\nMAP=${keyString}`;
  qrImage.src = data.qr;

  downloadQR.classList.remove("hidden");

  saveState(); // Save after encrypt
};

/* -----------------------------------------------------
   DOWNLOAD QR
----------------------------------------------------- */
downloadQR.onclick = () => {
  const a = document.createElement("a");
  a.href = qrImage.src;
  a.download = "encrypted_qr.png";
  a.click();
};
window.addEventListener("beforeunload", () => {
    sessionStorage.clear();
  });
  
