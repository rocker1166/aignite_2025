# Intellisupply: AI-Powered Supply Chain Resilience Platform

Intellisupply is an advanced AI-powered platform designed to enhance supply chain resilience, risk management, and operational efficiency. It leverages cutting-edge technologies like AI, data visualization, and real-time analytics to provide actionable insights for supply chain optimization.

---
Live Demo : https://drive.google.com/file/d/1aQ1ng3_-7mzZ0SvPzQKsxalNSy7PDqSN/view?pli=1

## Table of Contents

- [Getting Started](#getting-started)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Environment Variables](#environment-variables)
- [Folder Structure](#folder-structure)
- [Scripts](#scripts)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Getting Started

### Prerequisites

Ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/) (preferred package manager)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/intellisupply.git
   cd intellisupply
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:

   Create a `.env.local` file in the root directory and populate it with the required environment variables. Refer to the [Environment Variables](#environment-variables) section for details.

4. Start the development server:

   ```bash
   pnpm dev
   ```

5. Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

---

## Features

- **AI-Powered Insights**: Leverage AI to analyze supply chain risks and recommend strategies.
- **Digital Twin Visualization**: Interactive digital twin of your supply chain for real-time monitoring.
- **Scenario Simulations**: Run Monte Carlo simulations to predict outcomes of various scenarios.
- **Impact Assessment**: Evaluate the impact of disruptions on supply chain nodes.
- **Strategy Recommendations**: Get actionable strategies to mitigate risks and optimize operations.
- **Real-Time Data Integration**: Integrate with APIs for weather, news, and other data sources.
- **Customizable Dashboards**: Tailored metrics and visualizations for your supply chain.

---

## Tech Stack

### Frontend
- [Next.js](https://nextjs.org/) (App Router)
- [React](https://reactjs.org/) (v19)
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Recharts](https://recharts.org/) for data visualization
- [Lucide Icons](https://lucide.dev/) for modern icons

### Backend
- [Supabase](https://supabase.com/) for database and authentication
- [Zod](https://zod.dev/) for schema validation
- [Google Generative AI](https://ai.google/tools/) for AI-powered insights

### Tools
- [pnpm](https://pnpm.io/) for package management
- [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/) for code quality
- [Vercel](https://vercel.com/) for deployment

---

## Scripts

Here are the available scripts in the `package.json` file:

- **`pnpm dev`**: Start the development server.
- **`pnpm build`**: Build the application for production.
- **`pnpm start`**: Start the production server.
- **`pnpm lint`**: Run ESLint to check for code quality issues.
- **`pnpm format`**: Format code using Prettier.

---
## Known Issues

### Simulation Function Timeout

The simulation function is currently not working on the deployed link due to Vercel's 10-second execution time limit for serverless functions. This issue occurs because the simulation process exceeds the allowed time limit.

For more details, refer to the [Vercel Serverless Function Timeout Documentation](https://vercel.com/docs/concepts/functions/serverless-functions#timeouts).

---

## Login Credentials

Use the following credentials to log in:

- **Username**: `demo@intellisupply.com`
- **Password**: `rocker@123`

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
