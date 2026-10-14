<div align="center">

# ◈ CryptoLink

### Transform text. Encode secrets. Share through QR.

A lightweight text transformation web application that combines classical cipher techniques with QR-code generation in a clean, interactive experience.

<p>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Express-111111?style=for-the-badge&logo=express&logoColor=white" alt="Express"/>
  <img src="https://img.shields.io/badge/QR_Code-6C63FF?style=for-the-badge" alt="QR Code"/>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript"/>
</p>

</div>

---

## ◈ Overview

CryptoLink is a web application for experimenting with text encryption and QR-based sharing. It combines a Caesar cipher with a monoalphabetic substitution cipher and generates a QR code from the transformed text.

The project demonstrates frontend/backend integration, Express API development, text processing, and QR-code generation.

## ✦ Features

- **Caesar Cipher** — shifts alphabetic characters by a configurable amount.
- **Substitution Cipher** — transforms letters using a generated substitution mapping.
- **QR Code Generation** — converts the transformed text into a QR code.
- **Encryption and Decryption APIs** — separate endpoints for transforming and restoring text.
- **Case Preservation** — the cipher functions preserve letter case and leave non-alphabetic characters unchanged.

## ⚙️ Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | Backend API |
| QRCode | QR-code generation |
| HTML, CSS and JavaScript | Frontend, if implemented in `public/` |

## 🔄 How It Works

```text
Original Text
     │
     ▼
Caesar Cipher
     │
     ▼
Substitution Cipher
     │
     ├────────► Transformed Text
     │
     └────────► QR Code
     
Transformed Text + Shift + Mapping
                 │
                 ▼
             Decryption
                 │
                 ▼
            Original Text
```

## 🚀 Getting Started

### Prerequisites

- Node.js and npm
- A modern web browser

### Installation

Clone the repository:

```bash
git clone https://github.com/reubenbilon/CryptoLink.git
cd CryptoLink
```

Install dependencies:

```bash
npm install
```

Start the backend:

```bash
npm start
```

The backend listens on port `3000` by default.

Open the frontend through the running application or the appropriate local URL for the files in `public/`.

## 🔌 API Endpoints

### `POST /encrypt`

Transforms the supplied text and generates a QR code.

Example request:

```json
{
  "text": "Hello World",
  "shift": 3
}
```

The backend expects `text` and `shift` in the JSON body.

The response includes the transformed text, substitution mapping, and QR-code data URL.

### `POST /decrypt`

Restores the original text using the transformed text, the same shift, and the substitution mapping returned by the encryption endpoint.

Example request:

```json
{
  "encrypted": "transformed_text",
  "shift": 3,
  "mapping": {}
}
```

Replace the example values with the actual values returned by `/encrypt`.

## 🗂️ Project Structure

```text
CryptoLink/
├── public/          # Frontend assets
├── server.js        # Express server and cipher APIs
├── package.json     # Dependencies and scripts
├── package-lock.json
└── README.md
```

## 🔐 Security Note

CryptoLink currently uses classical substitution-based ciphers for educational purposes. Caesar and monoalphabetic substitution ciphers are not suitable for protecting sensitive information against modern cryptanalysis.

Do not use this implementation to protect passwords, financial information, or confidential messages.

## 👨‍💻 Author

**Reuben Bilon**

[GitHub](https://github.com/reubenbilon) · [LinkedIn](https://linkedin.com/in/reuben-bilon)

