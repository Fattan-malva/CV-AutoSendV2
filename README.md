# CV-AutoSend

Kirim CV otomatis ke setiap lowongan kerja — upload brosur, AI analisis, kirim CV + email dalam 1 klik.

## Fitur

| Fitur | Keterangan |
|-------|------------|
| Upload Brosur | Upload foto/PDF brosur lowongan kerja |
| AI Analisis | Gemini AI ekstrak perusahaan, posisi, & buat email lamaran otomatis |
| Review & Kirim | Cek hasil, edit, kirim CV + email via SMTP |
| Dashboard | Kelola pengiriman, riwayat, & pemakaian |
| Google Login | Login via Google Firebase |
| Firestore Storage | Simpan CV & konfigurasi |
| Mode Gratis / Pro | Paket gratis (3x) atau unlimited (Pro $5/bln) |

## Tech Stack

- [Next.js 16](https://nextjs.org) — React framework
- [Firebase](https://firebase.google.com) — Auth, Firestore, Storage
- [Gemini AI](https://aistudio.google.com) — AI analisis brosur
- [Nodemailer](https://nodemailer.com) — Kirim email via SMTP
- [Tailwind CSS 4](https://tailwindcss.com) — Styling
- [LemonSqueezy](https://lemonsqueezy.com) — Payment gateway

## Struktur Project

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Landing page
│   ├── dashboard/          # Dashboard page
│   ├── login/              # Login page
│   ├── signup/             # Signup page
│   └── api/                # API routes (thin — delegasi ke services)
│       ├── analyze/        # POST — analisis brosur via Gemini
│       ├── send-email/     # POST — kirim email + test
│       ├── upload-cv/      # POST — validasi & upload CV
│       ├── save-settings/  # POST — simpan konfigurasi user
│       └── payment/        # LemonSqueezy checkout & webhook
│
├── components/             # React UI components
│   ├── dashboard/          # Dashboard components
│   ├── landing/            # Landing page components
│   └── ui/                 # Shared UI components
│
├── services/               # Business logic (server-side)
│   ├── auth.service.ts     # Firebase token verification
│   ├── analyze.service.ts  # Gemini AI analysis
│   ├── email.service.ts    # Nodemailer email sending
│   ├── settings.service.ts # User settings CRUD
│   ├── cv.service.ts       # CV upload validation
│   └── payment.service.ts  # LemonSqueezy integration
│
├── lib/                    # Configs & utilities
│   ├── firebase.ts         # Firebase client SDK
│   ├── firebase-admin.ts   # Firebase admin SDK
│   ├── crypto.ts           # Client-side encryption
│   ├── smtp-encrypt.ts     # Server-side SMTP encryption
│   ├── auth-context.tsx    # Auth context
│   ├── i18n-context.tsx    # Internationalization context
│   ├── theme-context.tsx   # Theme context
│   ├── providers.tsx       # Combined providers
│   └── rate-limit.ts       # Usage rate limiting
│
├── i18n/                   # Translations (id.ts, en.ts)
└── types/                  # TypeScript type definitions
```

## Mulai

```bash
npm install
cp .env.local.example .env.local
# isi environment variables (lihat panduan setup)
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Setup Lengkap

Lihat [SETUP.md](./SETUP.md) untuk panduan konfigurasi Firebase, Gemini AI, dan LemonSqueezy.
