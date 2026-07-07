# ceefy — Setup Guide

## 1. Firebase Console

Buka https://console.firebase.google.com → Buat project baru.

### Firebase Authentication
- **Authentication** → **Sign-in method** → Enable **Google**
- Isi **Support email** (wajib)

### Firebase Firestore
- **Firestore Database** → **Create database**
- Pilih mode **test** (atau production nanti)
- Region bebas (pilih yang terdekat)

### Firebase Storage
- **Storage** → **Get started** → **Next** → **Done**
- Rules sementara: `allow read, write: if true;` (untuk development)

### Web App
- **Project Overview** → **Web** (icon `</>`)
- Register app (nama bebas)
- Copy semua nilai `firebaseConfig`:
  - `apiKey` → `NEXT_PUBLIC_FIREBASE_API_KEY`
  - `authDomain` → `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `projectId` → `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - `storageBucket` → `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - `messagingSenderId` → `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - `appId` → `NEXT_PUBLIC_FIREBASE_APP_ID`

### Firebase Admin (Service Account)
- **Project Settings** → **Service accounts** → **Firebase Admin SDK**
- Klik **Generate new private key**
- File JSON akan terdownload. Copy:
  - `project_id` → `FIREBASE_PROJECT_ID`
  - `client_email` → `FIREBASE_CLIENT_EMAIL`
  - `private_key` → `FIREBASE_PRIVATE_KEY`

  **⚠️ Windows/PowerShell**: `private_key` biasanya multiline. Copy semua termasuk `-----BEGIN PRIVATE KEY-----` dan `-----END PRIVATE KEY-----`. Simpan dalam 1 baris dengan `\n` di setiap line break, atau kutip dengan double quote.

  Contoh:
  ```
  FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0B...\n-----END PRIVATE KEY-----\n"
  ```

---

## 2. Google AI Studio (Gemini)

Buka https://aistudio.google.com/apikey

- Klik **Create API Key**
- Copy key → `GOOGLE_AI_STUDIO_API_KEY`
- `GOOGLE_AI_STUDIO_MODEL` biarkan default (`gemini-2.5-flash`)

---

## 3. LemonSqueezy (Opsional — untuk payment)

Buka https://app.lemonsqueezy.com

### Store
- **Settings** → **Store** → Copy **Store ID** (angka) → `LEMONSQUEEZY_STORE_ID`

### Product & Variants

Buat **1 produk** dengan **3 varian** (Basic, Starter, Pro):

1. **Products** → **Create a product**
   - Nama: `ceefy`
   - Isi detail lainnya sesuai keinginan
   - Klik **Save**

2. Setelah produk jadi, buka tab **Variants** → **Create first variant**
   - Buat 3 varian satu per satu:

     | Nama Variant | Price (IDR) | Mapping ke |
     |-------------|-------------|------------|
     | `Basic Monthly` | Rp 75.000 | `LEMONSQUEEZY_VARIANT_BASIC_ID` |
     | `Starter Monthly` | Rp 150.000 | `LEMONSQUEEZY_VARIANT_STARTER_ID` |
     | `Pro Monthly` | Rp 300.000 | `LEMONSQUEEZY_VARIANT_PRO_ID` |

   - Setiap varian bisa diisi **isi** sesuka Anda (deskripsi, fitur, dll)
   - Interval: **Monthly**
   - Klik **Save**

3. Copy **Product ID** (ada di URL atau halaman produk) → `LEMONSQUEEZY_PRODUCT_ID`

4. Copy masing-masing **Variant ID**:
   - Buka tab **Variants** di produk → klik setiap variant
   - **Variant ID** ada di URL: `https://app.lemonsqueezy.com/variants/123456` → angka `123456`
   - Basic → `LEMONSQUEEZY_VARIANT_BASIC_ID`
   - Starter → `LEMONSQUEEZY_VARIANT_STARTER_ID`
   - Pro → `LEMONSQUEEZY_VARIANT_PRO_ID`

### API Key
- **Settings** → **API** → Generate API Key → `LEMONSQUEEZY_API_KEY`

### Webhook
- **Settings** → **Webhooks** → **Create webhook**
- URL: `https://your-domain.com/api/payment/webhook`
  - Untuk development/local bisa pakai **ngrok** atau **Vercel tunnel**
- Events: centang **`order_created`** dan **`subscription_created`**
- Copy **Secret** (klik **Generate**, lalu copy) → `LEMONSQUEEZY_WEBHOOK_SECRET`
- **Test webhook**: setelah setup, kirim test event dari dashboard LemonSqueezy untuk verifikasi

> **⚠️ Tips**: Semua ID adalah angka. Contoh: Store ID = `12345`, Product ID = `67890`, Variant ID = `111213`. Pastikan tidak ada spasi atau karakter tambahan saat copy ke `.env.local`.

---

## 4. File .env.local

Buat file `.env.local` di root project:

```env
# ── Firebase Client ─────────────────────────
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc

# ── Firebase Admin ──────────────────────────
FIREBASE_PROJECT_ID=xxx
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@xxx.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# ── Gemini AI ───────────────────────────────
GOOGLE_AI_STUDIO_API_KEY=AIzaSy...
GOOGLE_AI_STUDIO_MODEL=gemini-2.5-flash

# ── LemonSqueezy ────────────────────────────
LEMONSQUEEZY_API_KEY=ls_api_...
LEMONSQUEEZY_STORE_ID=12345
LEMONSQUEEZY_PRODUCT_ID=67890
LEMONSQUEEZY_VARIANT_BASIC_ID=111213
LEMONSQUEEZY_VARIANT_STARTER_ID=141516
LEMONSQUEEZY_VARIANT_PRO_ID=171819
LEMONSQUEEZY_WEBHOOK_SECRET=whsec_...

# ── Encryption ──────────────────────────────
ENCRYPTION_SECRET=<generate via: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
NEXT_PUBLIC_ENCRYPTION_SECRET=<generate via: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">

# ── App ─────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## 5. Verifikasi

```bash
npm install
npm run dev
```

Buka `http://localhost:3000` → landing page muncul ✅

Test flow:
1. Landing → upload brosur → analyze demo
2. Login Google
3. Isi SMTP + CV → finish
4. Dashboard → upload + analyze + send
