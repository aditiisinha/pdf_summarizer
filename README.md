# 📄 Summarium – AI-Powered PDF Summarization SaaS

Summarium is a **production-ready AI SaaS platform** that transforms long, complex PDF documents into **clear, structured, and interactive summaries**. Built with a modern full-stack architecture, it emphasizes **performance, scalability, security, and user experience**, enabling users to consume information faster and more efficiently.

🔗 **Live Demo:** [https://pdf-summarizer-gilt.vercel.app/](https://pdf-summarizer-gilt.vercel.app/)

---

## ✨ Key Highlights

* AI-powered, structured summaries with key insights and emojis
* Secure, scalable PDF processing pipeline
* Subscription-based SaaS model with Stripe integration
* Modern UI with real-time feedback and responsive design
* Production-grade architecture suitable for real-world usage

---

## 🚀 Features

### 📄 PDF Summarization

* Clear, structured AI-generated summaries
* Key points, insights, and markdown-formatted output
* SEO-friendly summaries suitable for blogs and documentation

### 🎨 User Experience

* Interactive summary viewer with progress indicators
* Toast notifications for uploads, processing, and errors
* Fully responsive UI for mobile and desktop
* Real-time UI updates and path revalidation

### 🔐 Security & Access Control

* Secure server-side PDF processing
* Role-based protected routes and API endpoints
* Authentication via Passkeys, GitHub, and Google

### 📊 Dashboard & Management

* User dashboard to manage uploaded PDFs and summaries
* Markdown export for blog-ready content

### 💳 Subscriptions & Payments

* Basic and Pro subscription plans
* Stripe Checkout and customer portal
* Webhook-driven subscription lifecycle handling

---

## 🛠️ Tech Stack

### Frontend & Framework

* **Next.js (App Router)** – Server Components, Server Actions, API routes, SSR
* **React 19** – Modern interactive UI components (experimental features used cautiously)
* **TypeScript** – Type-safe, scalable codebase
* **Tailwind CSS v4** – Utility-first responsive styling
* **shadcn/ui** – Accessible and customizable UI components

### AI & Document Processing

* **OpenAI (GPT-4 / GPT-4o)** – Context-aware PDF summarization
* **LangChain** – PDF parsing, chunking, and text extraction

### Authentication & File Uploads

* **Clerk** – Secure authentication with OAuth & Passkeys
* **UploadThing** – Secure PDF uploads (up to 32MB)

### Payments, Database & Infrastructure

* **Stripe** – Subscription billing, cancellations, and webhooks
* **Neon DB** – Serverless PostgreSQL database
* **Vercel** – Production deployment and edge hosting

---

## 🏗️ Installation & Setup

### Prerequisites

* Node.js **18+**
* npm / pnpm / yarn
* Stripe CLI (for webhook testing)

### Clone the Repository

```bash
git clone https://github.com/your-username/summarium.git
cd summarium
```

### Install Dependencies

```bash
npm install
```

---

## 🔐 Environment Variables

Create a `.env.local` file in the root directory and configure the following:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# OpenAI
OPENAI_API_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Database (Neon PostgreSQL)
DATABASE_URL=

# UploadThing
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=
```

---

## ▶️ Running the Application

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

---

## 🪝 Stripe Webhooks (Local Setup)

Summarium relies on Stripe webhooks to manage subscription events.

### Start Stripe Listener

```bash
stripe listen --forward-to localhost:3000/api/webhook
```

### Events Handled

* `checkout.session.completed`
* `customer.subscription.updated`
* `customer.subscription.deleted`
* `invoice.payment_succeeded`

---

## 📦 Subscription Plans

| Plan  | Description                         |
| ----- | ----------------------------------- |
| Basic | Limited PDF uploads & summaries     |
| Pro   | Unlimited PDF uploads and summaries |

### 🧪 Test Card Details (Stripe Test Mode)

* **Card Number:** 4242 4242 4242 4242
* **Expiry Date:** Any future date
* **CVC:** Any 3 digits
* **ZIP Code:** Any valid ZIP

⚠️ No real money is charged. Payments are for testing only.

---

## 🧠 Application Flow (High-Level)

1. User uploads a PDF securely via UploadThing
2. Server extracts and chunks text using LangChain
3. AI generates structured summaries using OpenAI
4. Summaries are stored in PostgreSQL (Neon)
5. UI updates in real time via Server Actions

---

## 🔒 Security Notes

* PDFs are processed server-side only
* Authentication enforced on all protected routes
* Upload size limited to 32MB
* Subscription access validated via Stripe webhooks

---

## 🗺️ Roadmap

* Team workspaces
* Summary highlighting and annotations
* Vector search across uploaded PDFs
* Export to Notion & Google Docs

---

## 📜 License

This project is licensed under the **MIT License**.

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

---

## ⭐ Support

If you find this project helpful, consider giving it a ⭐ on GitHub.
