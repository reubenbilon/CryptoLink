/* ================================
   app-decrypt.js
   FULL WORKING VERSION WITH:
   - NEGATIVE SHIFT SUPPORT
   - MAP=26-letter support
   - JSON key support
   - SHIFT/MAP multi-line support
   - Works with QR image upload
================================= */

const $ = id => document.getElementById(id);

// Elements
const decryptBtn = $("decryptBtn");
const cipherText = $("cipherText");
const cryptoKey = $("cryptoKey");
const decrypted = $("decrypted");

/* =====================================================
   Convert 26-letter map string → { A: 'X', B:'F', ... }
===================================================== */
function keyStringToMapping(str26) {
  const ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const map = {};
  for (let i = 0; i < 26; i++) {
    map[ABC[i]] = str26[i];
  }
  return map;
}

/* =====================================================
   Parse Crypto Key (supports ALL formats)
===================================================== */
function parseCryptoKey(keyStr) {
  if (!keyStr || !keyStr.trim()) return null;
  const s = keyStr.trim();

  /* -------------------------------
     1) JSON format
     { "shift": -3, "mapping": "XFND..." }
  -------------------------------- */
  try {
    const maybe = JSON.parse(s);
    if (typeof maybe === "object") {
      let shift = maybe.shift ?? maybe.SHIFT ?? null;
      let mapping = maybe.mapping ?? maybe.MAP ?? null;

      if (typeof mapping === "string" && mapping.length === 26) {
        mapping = keyStringToMapping(mapping.toUpperCase());
      }

      if (shift != null && mapping != null)
        return { shift: Number(shift), mapping };
    }
  } catch (e) {
    // Not JSON → Continue parsing
  }

  /* -------------------------------
     2) SHIFT=...  MAP=...
     Supports Negative SHIFT
  -------------------------------- */
  const lines = s.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  let shift = null;
  let mapStr = null;

  for (const l of lines) {

    // FIXED: supports SHIFT = -3
    const m = l.match(/^SHIFT\s*=\s*(-?\d+)$/i);
    if (m) {
      shift = Number(m[1]);
      continue;
    }

    const m2 = l.match(/^MAP\s*=\s*([A-Za-z]{26})$/i);
    if (m2) {
      mapStr = m2[1].toUpperCase();
      continue;
    }
  }

  if (mapStr && shift != null)
    return { shift, mapping: keyStringToMapping(mapStr) };

  /* -------------------------------
     3) Single 26-letter map string
  -------------------------------- */
  if (/^[A-Za-z]{26}$/.test(s)) {
    return {
      shift: 0, // shift missing → user may enter it manually
      mapping: keyStringToMapping(s.toUpperCase())
    };
  }

  /* -------------------------------
     4) SHIFT: -3  MAP: ABC...
  -------------------------------- */
  const shiftMatch = s.match(/SHIFT\s*[:=]\s*(-?\d+)/i);
  const mapMatch = s.match(/MAP\s*[:=]\s*([A-Za-z]{26})/i);

  if (shiftMatch || mapMatch) {
    const sh = shiftMatch ? Number(shiftMatch[1]) : null;
    const mp = mapMatch
      ? keyStringToMapping(mapMatch[1].toUpperCase())
      : null;

    if (sh != null && mp != null)
      return { shift: sh, mapping: mp };
  }

  return null;
}

/* =====================================================
   Show user-friendly alert
===================================================== */
function showError(msg) {
  alert(msg);
}

/* =====================================================
   DECRYPT BUTTON CLICK
===================================================== */
decryptBtn.addEventListener("click", async () => {

  const encrypted = cipherText.value.trim();
  const keyText = cryptoKey.value.trim();

  if (!encrypted) {
    return showError("Encrypted text is missing.\nPaste text or upload QR first.");
  }
  if (!keyText) {
    return showError("Crypto Key missing.\nPaste the key provided by the sender.");
  }

  // Attempt to parse key
  const parsed = parseCryptoKey(keyText);

  if (!parsed) {
    return showError(
      "Couldn't parse the Crypto Key.\nExpected formats:\n\n" +
      "- SHIFT=3\\nMAP=QWERTY... (26 letters)\n" +
      "- SHIFT=-3\\nMAP=QWERTY...\n" +
      "- A single 26-letter map string (QWERTY...)\n" +
      "- JSON: { \"shift\":3, \"mapping\":\"QWERTY...\" }\n\n" +
      "If MAP is given without SHIFT, include SHIFT=value."
    );
  }

  // If shift missing (only map provided), ask user
  if (parsed.shift == null || Number.isNaN(parsed.shift)) {
    const s = prompt("SHIFT missing in key.\nEnter Caesar shift used by sender:");
    if (!s) return showError("Shift value required.");
    parsed.shift = Number(s);
  }

  /* -----------------------------------
     SEND POST REQUEST TO SERVER
  ----------------------------------- */
  try {
    const res = await fetch("/decrypt", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        encrypted,
        shift: parsed.shift,
        mapping: parsed.mapping
      })
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error("Server error: " + txt);
    }

    const data = await res.json();

    if (typeof data.text === "string") {
      decrypted.value = data.text;
    } else {
      showError("Unexpected server response.");
    }

  } catch (err) {
    console.error(err);
    showError("Failed to decrypt:\n" + err.message);
  }

});
