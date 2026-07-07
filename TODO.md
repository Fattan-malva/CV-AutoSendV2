## CVbuilder tidak update Firestore + Email pakai CV terbaru dari Firestore

### Step 1
- Edit `src/components/dashboard/CvBuilderPage.tsx`
  - Hapus pemanggilan `saveCvData` dari `handleSave` (tombol Save)
  - Hapus auto-save debounce yang memanggil `saveCvData` di `useEffect`
  - Pastikan “Save” tidak melakukan Firestore write (preview/state saja)

### Step 2
- Edit `src/services/email.service.ts`
  - Lampiran CV: ambil dari `userData.cvPath` (Firestore)
  - Abaikan `mailData.fileUrl` sebagai sumber CV
  - Log `cvPath` yang dipakai = `userData.cvPath`

### Step 3
- Jalankan `npm run lint` dan/atau `npm run build` untuk validasi TypeScript/build

### Step 4
- Validasi alur secara manual:
  - Upload CV di Settings -> `cvPath` tersimpan di Firestore
  - Edit CV di CVbuilder -> tidak ada perubahan Firestore
  - Send email -> attach CV dari `cvPath` terbaru di Firestore
