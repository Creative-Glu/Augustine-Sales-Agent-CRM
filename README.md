# Augustine Sales Agent Pilot

A comprehensive CRM and sales automation platform built for the Augustine Sales Agent Pilot project.

## 🎯 Project Overview

Augustine is a modern, full-featured sales CRM system designed to streamline lead management, product tracking, and sales analytics. Built with cutting-edge web technologies, it provides a responsive, real-time interface for sales teams.

## 🚀 Quick Start

### For Frontend Application

## Clone the Repository

git clone https://github.com/Creative-Glu/Augustine---Sales-Agent-Pilot.git
cd Augustine---Sales-Agent-Pilot

Navigate to the client directory and follow the setup:

```bash
cd augustine-crm-client

# Copy environment template
cp env.template .env.local

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

## 📖 Documentation

### Main Documentation

- **[README.md](./augustine-crm-client/README.md)** - Comprehensive project guide
  - Features overview
  - Tech stack details
  - Installation instructions
  - Project structure
  - Troubleshooting guide
  - Contributing guidelines

### Configuration

- **[env.template](./augustine-crm-client/env.template)** - Environment variables
  - Supabase configuration
  - Required credentials
  - Setup instructions

## ✨ Key Features

- 👥 **User Authentication** - Secure login with Supabase
- 📊 **Dashboard** - Real-time analytics and KPI tracking
- 👤 **Lead Management** - Comprehensive lead tracking system
- 📦 **Product Management** - Product catalog management
- 📈 **Analytics** - Journey funnel visualization
- 🎨 **Responsive UI** - Mobile-first design with Tailwind CSS
- ⚡ **Real-time Updates** - Powered by React Query
- 🔒 **Type-Safe** - Full TypeScript support

## 🛠 Tech Stack

### Core Technologies

- **Next.js** 16.0.1 - React framework
- **React** 19.2.0 - UI library
- **TypeScript** 5 - Type safety
- **Tailwind CSS** 4.1.17 - Styling

### Backend & Data

- **Supabase** - Authentication & database
- **React Query** - Data fetching & caching
- **Chart.js** - Data visualization

### UI Components

- **Radix UI** - Accessible components
- **Headless UI** - Unstyled components
- **Lucide React** - Icons

## 📋 Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **Supabase Account** (free tier available)

## 🔐 Environment Setup

1. Copy the environment template:

   ```bash
   cp augustine-crm-client/env.template augustine-crm-client/.env.local
   ```

2. Get Supabase credentials:
   - Visit [supabase.com](https://supabase.com)
   - Create or login to a project
   - Copy credentials from Settings > API

3. Add credentials to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```

## 📝 Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot-reload

# Production
npm run build            # Build for production
npm start               # Start production server

# Code Quality
npm run format          # Format code with Prettier
npm run format:check    # Check formatting
```

## 📚 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Supabase Guide](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [React Query](https://tanstack.com/query/latest)

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/feature-name`
2. Make changes and test locally
3. Format code: `npm run format`
4. Commit: `git commit -m "Description"`
5. Push and create a Pull Request

See [Contributing Guidelines](./augustine-crm-client/README.md#-contributing) for details.

## 📄 License

This project is part of the Augustine Sales Agent Pilot. All rights reserved.

## 🆘 Support & Issues

For help:

1. Check the troubleshooting sections in documentation
2. Review issue templates
3. Contact the development team

---

## 📊 Documentation Summary

| Document  | Purpose                    | Location                |
| --------- | -------------------------- | ----------------------- |
| README.md | Complete project reference | `augustine-crm-client/` |

| env.template | Environment template | `augustine-crm-client/` |

---

**Last Updated**: November 2025  
**Version**: 1.0  
**Status**: ✅ Production Ready

🎉 Augustine is ready for development and deployment!
