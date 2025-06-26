"use client"

import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full bg-black py-12">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr] md:justify-items-center gap-y-12">
          {/* Brand and Copyright */}
          <div className="justify-self-start">
            <h2 className="text-2xl font-medium text-white mb-2">IntelliSupply</h2>
            <p className="text-sm text-gray-500">© copyright IntelliSupply 2025. All rights reserved.</p>
          </div>

          {/* Pages */}
          <div>
            <h3 className="text-base font-medium text-white mb-6">Pages</h3>
            <ul className="space-y-4">
              <li><Link href="/" className="text-base text-gray-300 hover:text-white transition-colors">Home</Link></li>
              <li><Link href="#features" className="text-base text-gray-300 hover:text-white transition-colors">Features</Link></li>
              <li><Link href="#benefits" className="text-base text-gray-300 hover:text-white transition-colors">Benefits</Link></li>
              <li><Link href="#contact" className="text-base text-gray-300 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Socials */}
          <div>
            <h3 className="text-base font-medium text-white mb-6">Socials</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-base text-gray-300 hover:text-white transition-colors">Facebook</a></li>
              <li><a href="#" className="text-base text-gray-300 hover:text-white transition-colors">Instagram</a></li>
              <li><a href="#" className="text-base text-gray-300 hover:text-white transition-colors">LinkedIn</a></li>
            </ul>
          </div>
        </div>

        {/* Brand Text */}
        <div className="mt-32 text-center">
          <p className="text-[40px] font-bold bg-gradient-to-b from-[#1A1A1A] via-[#4A4A4A] to-white bg-clip-text text-transparent uppercase tracking-wider">INTELLISUPPLY</p>
          <p className="text-gray-500 text-sm mt-4">
            Developed by <span className="text-white">IntelliSupply Team</span>
          </p>
        </div>
      </div>
    </footer>
  )
}