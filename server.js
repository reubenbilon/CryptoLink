const express = require('express');
const cors = require('cors');
const QRCode = require('qrcode');

const app = express();   // ✅ MUST COME BEFORE USING app.use()

// ⛔ Disable browser caching (stops Back button from restoring deleted data)
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

// Normal middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const PORT = 3000;

// Generate random substitution mapping
function generateMapping() {
  const abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const shuffled = [...abc].sort(() => Math.random() - 0.5);
  const map = {};
  abc.forEach((a, i) => map[a] = shuffled[i]);
  return map;
}

function invertMapping(map) {
  const out = {};
  Object.keys(map).forEach(k => out[map[k]] = k);
  return out;
}

function caesar(text, shift) {
  return text.replace(/[A-Za-z]/g, ch => {
    const base = ch >= 'a' ? 97 : 65;
    return String.fromCharCode((ch.charCodeAt(0) - base + shift + 26) % 26 + base);
  });
}

function substEncrypt(text, map) {
  return text.replace(/[A-Za-z]/g, ch => {
    const up = ch.toUpperCase();
    const m = map[up] || up;
    return ch === ch.toLowerCase() ? m.toLowerCase() : m;
  });
}

function substDecrypt(text, map) {
  const im = invertMapping(map);
  return text.replace(/[A-Za-z]/g, ch => {
    const up = ch.toUpperCase();
    const m = im[up] || up;
    return ch === ch.toLowerCase() ? m.toLowerCase() : m;
  });
}

app.post("/encrypt", async (req, res) => {
  const { text, shift } = req.body;

  const mapping = generateMapping();
  const caesared = caesar(text, shift);
  const encrypted = substEncrypt(caesared, mapping);

  const qr = await QRCode.toDataURL(encrypted);

  res.json({ encrypted, mapping, qr });
});

app.post("/decrypt", (req, res) => {
  const { encrypted, shift, mapping } = req.body;

  const unSub = substDecrypt(encrypted, mapping);
  const final = caesar(unSub, -shift);

  res.json({ text: final });
});

// ***** IMPORTANT FOR RENDER *****
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});


