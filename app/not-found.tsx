"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900 text-slate-800 dark:text-white">
          <div className="text-center max-w-lg px-6">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                <AlertTriangle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              The page you are looking for does not exist. It might have been moved or deleted.
            </p>
            <Link
              href="/"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md shadow-lg transition-all duration-300"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}