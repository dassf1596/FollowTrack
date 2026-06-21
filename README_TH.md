# FollowTrack

FollowTrack เป็นเว็บแอปพลิเคชันระดับ Production-Ready (SaaS) สำหรับบริหารจัดการและติดตามข้อมูลประวัติผู้ติดตาม (Follower Snapshot) โดยมีฟังก์ชันการบันทึกรายชื่อผู้ติดตามแบบเป็นส่วนตัว การดูประวัติย้อนหลัง การเปรียบเทียบความแตกต่างระหว่างสองช่วงเวลา (ดูคนกดติดตามเพิ่ม/เลิกติดตาม) ระบบค้นหาชื่อผู้ใช้จากทุกประวัติ การจัดการข้อมูลส่วนตัว และการส่งออกข้อมูลเป็น CSV/JSON

แพลตฟอร์มนี้ **ไม่มีการทำ Web Scraping หรือเชื่อมต่อ API อัตโนมัติไปยัง Instagram หรือโซเชียลมีเดียภายนอกใด ๆ** ผู้ใช้งานจะเป็นผู้สแกนหรือนำเข้าข้อมูลผู้ติดตามแบบกำหนดเอง (Manual Import) โดยการวางข้อความรายชื่อ หรืออัปโหลดไฟล์ (.txt หรือ .csv) ที่ได้มาจากการสำรองข้อมูลของบัญชีตนเองอย่างปลอดภัย

---

## เทคโนโลยีหลัก (Tech Stack)

- **Framework**: Next.js 15 (App Router, Edge Runtime)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 และส่วนประกอบดีไซน์สไตล์ Glassmorphism
- **Database / Auth / Storage**: Supabase (PostgreSQL, SSR Cookies Auth, Storage Bucket สำหรับเก็บรูปโปรไฟล์)
- **Client State Querying**: TanStack React Query (React Query)
- **Validation**: Zod และตัวตรวจสอบรูปแบบข้อมูลที่เขียนขึ้นมาเฉพาะ
- **Hosting Compatibility**: รองรับการติดตั้งบน Cloudflare Pages (ผ่าน `@cloudflare/next-on-pages`)

---

## โครงสร้างโฟลเดอร์ (Folder Structure)

```text
├── supabase/
│   └── migrations/
│       └── 20260612000000_init_schema.sql  # ไฟล์ SQL ตั้งค่าตารางดึงข้อมูล ดัชนี (Indexes) และ RLS
├── src/
│   ├── app/
│   │   ├── api/                            # เส้นทาง API (หากจำเป็นต้องใช้)
│   │   ├── dashboard/                      # หน้าแดชบอร์ดหลักของระบบ (Protected Route)
│   │   ├── forgot-password/                # หน้าขอรีเซ็ตรหัสผ่าน
│   │   ├── login/                          # หน้าเข้าสู่ระบบ
│   │   ├── register/                       # หน้าลงทะเบียนสมาชิก
│   │   ├── reset-password/                 # หน้าตั้งรหัสผ่านใหม่
│   │   ├── layout.tsx                      # Layout หลักของแอปพลิเคชัน
│   │   ├── page.tsx                        # หน้าแรกสำหรับบุคคลทั่วไป (Landing Page)
│   │   └── middleware.ts                   # ระบบจัดการ Session และเส้นทางเข้าใช้งาน (Auth Middleware)
│   ├── components/
│   │   ├── ui/                             # คอมโพเนนต์ UI พื้นฐาน (Button, Card, Dialog, Toast)
│   │   ├── ActivityTimeline.tsx            # ส่วนแสดงลำดับกิจกรรมการใช้งาน
│   │   ├── CompareClient.tsx               # ส่วนควบคุมหน้าเปรียบเทียบ Snapshot
│   │   ├── ComparisonDetailsClient.tsx     # ตัวแสดงผลลัพธ์การเปลี่ยนและส่งออกข้อมูล (Export CSV/JSON)
│   │   ├── DashboardShell.tsx              # ตัวครอบหน้าแดชบอร์ด (Sidebar Container)
│   │   ├── DashboardNavbar.tsx             # แถบเมนูด้านบน (Header Dropdown)
│   │   ├── DashboardSidebar.tsx            # แถบเมนูด้านข้าง (Navigation Drawer)
│   │   ├── LandingFaq.tsx                  # หน้าตอบคำถามพบบ่อย (Landing FAQ Accordion)
│   │   ├── providers.tsx                   # ตัวลงทะเบียน React Query และระบบแจ้งเตือน Toast
│   │   ├── SearchClient.tsx                # ตัวค้นหาประวัติผู้ติดตามของแต่ละบัญชี
│   │   ├── SettingsClient.tsx              # หน้าตั้งค่า เปลี่ยนรหัสผ่าน และลบบัญชีผู้ใช้
│   │   └── SnapshotsClient.tsx             # ระบบอัปโหลด คัดกรอง และบันทึกประวัติผู้ติดตาม
│   ├── lib/
│   │   ├── supabase/                       # ตั้งค่าระบบเชื่อมต่อ Supabase ผ่านคุกกี้ (SSR Auth)
│   │   ├── parser.ts                       # ระบบตรวจสอบและคลีนข้อมูลรายชื่อผู้ติดตาม
│   │   └── utils.ts                        # ฟังก์ชันรวมคลาสสไตล์ลิ่ง (tailwind-merge)
├── env.local.example                       # เทมเพลตตัวแปรสภาพแวดล้อม (.env)
├── wrangler.toml                           # ไฟล์ตั้งค่าสำหรับอัปโหลดขึ้น Cloudflare Pages
└── README.md                               # คู่มือการติดตั้งภาษาอังกฤษ
```

---

## 1. การตั้งค่าระบบฐานข้อมูลและการโอนย้ายข้อมูล (Database Setup)

เพื่อให้ระบบฐานข้อมูล PostgreSQL ทำงานได้อย่างสมบูรณ์ ให้คัดลอกคำสั่ง SQL จากไฟล์ [supabase/migrations/20260612000000_init_schema.sql](file:///c:/Users/kitti/Desktop/ig/supabase/migrations/20260612000000_init_schema.sql) ไปรันในระบบ **SQL Editor** ของ Supabase:

1. เปิด Dashboard ของโปรเจกต์ Supabase
2. ไปที่แท็บ **SQL Editor** ที่แถบเมนูด้านซ้าย
3. คลิกสร้างคิวรีใหม่ (**New Query**) จากนั้นวางคำสั่งทั้งหมดจากไฟล์คิวรีลงไป แล้วกด **Run**
4. การดำเนินการนี้จะทำการสร้าง:
   - ตารางข้อมูลต่างๆ (`profiles`, `snapshots`, `followers`, `comparisons`, `comparison_added`, `comparison_removed`, `activity_logs`)
   - ระบบดัชนี (Indexes) เพื่อเพิ่มความเร็วในการดึงข้อมูลจากช่อง `username`, `user_id`, และ `created_at`
   - นโยบาย Row Level Security (RLS) เพื่อรักษาความปลอดภัยของข้อมูลแยกตามรายผู้ใช้งาน 100%
   - ฟังก์ชันทริกเกอร์สร้างบัญชีโปรไฟล์ของผู้ใช้ในตาราง `profiles` อัตโนมัติเมื่อมีการสมัครสมาชิกใหม่

---

## 2. การตั้งค่าจัดเก็บรูปภาพของ Supabase (สำหรับเก็บรูปโปรไฟล์)

คุณต้องเปิดใช้งาน Storage Bucket เพื่อให้ระบบสามารถจัดเก็บรูปโปรไฟล์ผู้ใช้งานได้:

1. ไปที่เมนู **Storage** ในแดชบอร์ด Supabase
2. คลิก **New Bucket**
3. ตั้งชื่อ Bucket ว่า `avatars` (ต้องเป็นคำนี้เท่านั้น)
4. เลือกเปิดตั้งค่าเป็น **Public** (เพื่อให้เบราว์เซอร์สามารถเรียกแสดงรูปภาพรูปโปรไฟล์ได้)
5. สร้างนโยบายความปลอดภัย RLS สำหรับ `avatars` ดังนี้:
   - **SELECT**: อนุญาตให้เข้าถึงแบบสาธารณะได้ทั้งหมด (`true`)
   - **INSERT/UPDATE**: อนุญาตให้เฉพาะผู้ใช้งานที่ล็อกอินแล้ว และอนุญาตให้อัปโหลดไฟล์ไปยังโฟลเดอร์ของตนเองได้เท่านั้น (เช่น ตรวจสอบ `(role() = 'authenticated')` หรือการเช็กโฟลเดอร์ให้ตรงกับรหัสผู้ใช้)

---

## 3. การรันระบบบนเครื่องคอมพิวเตอร์ของคุณ (Local Development)

1. คัดลอกและสร้างไฟล์ตั้งค่าตัวแปรสภาพแวดล้อม:
   ```bash
   cp env.local.example .env.local
   ```
2. แก้ไขข้อมูลในไฟล์ `.env.local` โดยนำรหัสเชื่อมต่อ (API keys) จากแดชบอร์ด Supabase (แถบตั้งค่า Settings -> API) มาใส่:
   - `NEXT_PUBLIC_SUPABASE_URL`: ที่อยู่ URL ของโปรเจกต์คุณ
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: คีย์สำหรับเข้าถึงข้อมูลทั่วไปในฝั่งไคลเอนต์
   - `SUPABASE_SERVICE_ROLE_KEY`: คีย์ระบบหลังบ้านระดับ Service Role (ใช้เฉพาะเวลาผู้ใช้ต้องการทำลายบัญชีทิ้งถาวร)
3. ติดตั้งแพ็กเกจและรันเซิร์ฟเวอร์จำลอง:
   ```bash
   npm install
   npm run dev
   ```
4. เปิดหน้าเว็บผ่านทางเว็บเบราว์เซอร์ที่: [http://localhost:3000](http://localhost:3000)

---

## 4. คู่มือการอัปโหลดแอปพลิเคชันขึ้น Cloudflare Pages (Deployment Guide)

แอปพลิเคชัน FollowTrack ถูกปรับแต่งมาให้ทำงานบนโครงสร้างแบบ Edge Runtime ของ Cloudflare Pages ได้ทันที

### วิธีที่ A: การอัปโหลดผ่าน Git Repository (แนะนำ)
1. อัปโหลดโปรเจกต์ของคุณขึ้นไปบน GitHub หรือ GitLab
2. เข้าสู่หน้าควบคุม Cloudflare Dashboard แล้วเลือกเมนู **Workers & Pages**
3. เลือก **Create Application** -> แท็บ **Pages** -> กดเชื่อมต่อกับ **Connect to Git**
4. เลือก Repository ที่ต้องการ และเลือกตั้งค่าการ Build เป็นเฟรมเวิร์กพรีเซ็ต **Next.js**
5. ตรวจสอบการตั้งค่า Build Parameters:
   - **Build Command**: `npx @cloudflare/next-on-pages` (หรือใช้คำสั่งอื่นๆ ที่กำหนดไว้ในสคริปต์การทำบิลด์)
   - **Build output directory**: `.vercel/output/static`
6. เพิ่มตัวแปรสภาพแวดล้อม (**Environment Variables**) ในตั้งค่า Cloudflare Pages:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
7. ไปที่ตั้งค่า **Settings** -> **Functions** -> แท็บ **Compatibility flags** แล้วพิมพ์คำสั่งเปิด:
   - `nodejs_compat` (สำหรับทั้งช่วงทดสอบ Preview และติดตั้งจริง Production)
8. กดสั่ง Deploy ระบบ Cloudflare จะทำการดึงข้อมูล บิลด์ และรันเว็บของคุณบนระบบ Edge ทันที

### วิธีที่ B: การสั่ง Deploy ผ่าน Wrangler CLI
หากคุณต้องการอัปโหลดโปรเจกต์ผ่าน Terminal:
1. สั่งรันคำสั่งบิลด์ไฟล์สำหรับ Next-on-Pages:
   ```bash
   npx @cloudflare/next-on-pages
   ```
2. อัปโหลดไฟล์ Static ไปยังระบบ Cloudflare Pages:
   ```bash
   npx wrangler pages deploy .vercel/output/static --project-name=followtrack
   ```
3. ดำเนินการตั้งค่า Environment Variables และเปิดใช้งาน `nodejs_compat` ในตั้งค่า Cloudflare Pages Dashboard ให้ตรงกัน
