# keymebaby
Telegram Bot for 2fa TOTP Code Generation  

[![License](https://img.shields.io/github/license/thesushilsharma/keymebaby)](LICENSE) 

---

## 📌 Overview  
**keymebaby** is a lightweight Telegram bot that generates Time-based One-Time Passwords (TOTP) for 2fa authentication. It works seamlessly with popular authenticator apps like:  
- Google Authenticator  
- Authy  
- Microsoft Authenticator  
- Any RFC 6238-compliant app  

Sync with Google Authenticator secrets via:  
✅ QR code scanning  
✅ Manual secret input  
✅ URI import (`otpauth://` URIs)  

---

## 🗣️ Talk to Your Bot in Telegram

Send commands to your bot in your chat:

---

### ➕ Add Account

You can either:

**Add manually:**
```bash
/add github SUSHILSharma
```

**Add via URI:**
```ruby
/add otpauth://totp/GitHub:your@email.com?secret=SUSHILSHARMA&issuer=GitHub
```

> **Note:** The secret must be Base32 encoded.

---

### 📜 List Accounts
```bash
/list
```

---

### 🔐 Show TOTP Codes
```bash
/code
```

You’ll get something like:
```yaml
🔐 TOTP Codes:
GitHub: 123456 (⏳ 28s)
```

---

### 📷 Get QR Code
```bash
/qr 1
```
*Returns the QR image for the 1st account in your list.*

---

## 🧪 Prerequisites

- VS Code or any Code Editor
- Node.js installation on your machine
- npm package manager
- **Telegram Account** Personal or Bot account (Test bot interaction)                     |
- **Telegram Bot Token** From [@BotFather](https://t.me/BotFather) ( Authentication for your Telegram bot )

---

## 📦 Tech Stack 

- TypeScript
- Hono
- Grammy Js

---

## 🛠️ Features  

- 🤖 Telegram bot interface for easy access  
- 🧮 Real-time TOTP code generation (30s/60s intervals)  
- 📱 Compatible with standard authenticator apps  
- 🔒 Secure secret storage (encrypted in memory)  
- 📝 Multi-account support per user  
- 🌐 TypeScript-based architecture for reliability  

---

## 📄 License 

MIT License. See [LICENSE](LICENSE) for full text.  

---
