# 🍃 Organic Harvest | Premium E-Commerce Engine

An ultra-premium, full-stack e-commerce platform engineered for the Pakistani organic market. This project transitions from a blank canvas to a production-ready boutique storefront in a high-intensity 12-hour sprint.

## 🚀 Tech Stack & Architecture
* **Framework:** Next.js 15 (App Router) with Turbopack
* **Language:** TypeScript (Strict Type Safety)
* **Styling:** Tailwind CSS v4 (Custom OKLCH & HEX palette)
* **Database & Auth:** Supabase (PostgreSQL)
* **State Management:** Zustand (Cart persistence with LocalStorage)
* **Animations:** Framer Motion (Staggered cascades and page transitions)
* **Communication:** Resend API & @react-email (Transactional automation)

---

## ✨ Key Engineering Milestones

### 1. Bulletproof PDF Receipt Generation
We solved the "Hydration Mismatch" and "CSSOM Parser" crashes by building a dedicated, Zero-Tailwind rendering layer.
* **Strict HEX rendering:** Uses `#0B1C10` and `#D4AF37` to bypass modern CSS `lab()` crashes in `html2canvas`.
* **Local Asset Mounting:** Standard HTML `<img>` tags bypass CORS exceptions during DOM cloning.

### 2. Professional Checkout & Lead Hardening
* **Pakistani Number Validation:** Rigid algorithmic Regex for `+92` prefixes and 10-11 digit enforcement.
* **WhatsApp Support Funnel:** Dynamic Order ID encoding into `wa.me` nodes for instant customer support.
* **Discount Logic:** Real-time recalculation engine supporting codes like `WELCOME10`.

### 3. Secret Admin Dashboard (`/admin-orders`)
* **Security Shield:** Protected by a React state lock and secret access key.
* **Real-time CRM:** Chronological order tracking with status mutation engine (Pending ➔ Delivered).
* **Granular Vault:** Modal-based access to customer emails, addresses, and JSON-mapped product arrays.

### 4. Technical SEO & Performance
* **JSON-LD Schema:** Injected Organization and Product schemas for Google Knowledge Graph optimization in Pakistan.
* **Dynamic Metadata:** Server-rendered `generateMetadata` for every category and product slug.
* **Skeleton Loaders:** `ImageWithSkeleton.tsx` prevents layout shifts on 4G connections.

---

## 🎨 Brand Identity (Visual System)
* **Dark Forest Green (#0B1C10):** Stability and Organic Trust.
* **Antique Gold (#D4AF37):** Luxury and Premium Quality.
* **Creamy Off-White (#FDFBF7):** Clean, Modern Backdrop.
* **Typography:** Playfair Display (Headings) | Inter (Body Text).

---

## 🛠️ Installation & Deployment

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/engrmaziz/organic-harvest.git](https://github.com/engrmaziz/organic-harvest.git)
