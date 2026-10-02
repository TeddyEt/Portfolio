# Tewodros Endalamaw — Software Engineering Portfolio & CMS

A modern, responsive full-stack developer portfolio and dynamic Content Management System (CMS) built with **Next.js (App Router)**, **React**, **Node.js**, and **Tailwind CSS**.

---

## 🌟 Highlights
- **4th-Year Computer Science Senior Profile**: Showcasing full-stack engineering work, systems programming with C++, algorithms, and coursework at Hope Enterprise University College.
- **Dedicated Admin CMS (`/admin`)**: Password/PIN-protected dashboard to edit personal details, add/edit/delete projects, manage technical skills, update timeline milestones, and upload new CV PDFs directly in the browser without touching code.
- **Employer-First Design**: Clean, high-contrast engineering aesthetic with seamless dark/light modes, subtle grid patterns, and zero generic AI bloat.
- **Project Case Studies**: Includes real application screenshots, problem statements, architecture tags, and links to source code and live demos.
- **One-Click Communication**: Quick clipboard copy for email and phone, verified HTTPS links (GitHub, LinkedIn), and a direct message form.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3005](http://localhost:3005) to view the portfolio.

### 3. Access the Admin CMS Portal
Navigate to [http://localhost:3005/admin](http://localhost:3005/admin)
- **Default Admin PIN**: `2027` (can be customized directly in the CMS Security tab).
- You can manage:
  - Personal Information & Bio
  - Projects, Tags, and Screenshots
  - CV / Resume PDF Uploads
  - Technical Skills & Journey Milestones
  - Offline JSON data export

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 📁 Project Structure
```text
portfolio/
├── app/
│   ├── admin/            # Admin CMS Dashboard (/admin)
│   ├── api/
│   │   ├── portfolio/    # GET / POST handlers for portfolio data
│   │   └── upload/       # Multipart file upload handler (CV & images)
│   ├── globals.css       # Global styles & Tailwind directives
│   ├── layout.js         # Root layout with SEO & OpenGraph tags
│   └── page.js           # Server component rendering public portfolio
├── components/           # Modular React UI components (Hero, Projects, Skills, etc.)
├── data/
│   └── portfolio.json    # Persistent JSON store for profile and projects
├── public/
│   ├── projects/         # Project screenshot assets
│   ├── uploads/          # Uploaded CV and images
│   └── favicon.svg       # SVG favicon
└── tailwind.config.js    # Design system configuration
```

---

## 🌿 Git & Deployment Workflow

This project is linked to [TeddyEt/Portfolio](https://github.com/TeddyEt/Portfolio.git) on the `v2-modern-cms` branch.

To push changes to GitHub:
```bash
git add .
git commit -m "feat: upgrade portfolio to Next.js + React + CMS dashboard"
git push -u origin v2-modern-cms
```
