"use client"

import { Facebook, Github, Instagram, Linkedin, Twitter } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full bg-black pt-12 pb-32 relative overflow-hidden">
      {/* Gradient background text */}
      <span className="hidden md:block absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-0 text-[7vw] font-extrabold uppercase bg-gradient-to-r from-white via-white/70 to-white/30 bg-clip-text text-transparent opacity-50 select-none pointer-events-none z-0 whitespace-nowrap">
        INTELLISUPPLY
      </span>
      <div className="relative z-10 max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-start gap-12">
        {/* Brand and copyright */}
        <div className="flex-1 min-w-[220px]">
          <h2 className="text-2xl font-bold text-white mb-4">IntelliSupply</h2>
          <p className="text-base text-gray-300 mb-8">© copyright IntelliSupply 2025. All rights reserved.</p>
        </div>
        {/* Pages */}
        <div className="flex-1 min-w-[180px]">
          <h3 className="font-semibold text-white mb-4">Pages</h3>
          <ul className="space-y-3 text-lg">
            <li><Link href="/" className="text-gray-200 hover:text-white">Home</Link></li>
            <li><Link href="#features" className="text-gray-200 hover:text-white">Features</Link></li>
            <li><Link href="#benefits" className="text-gray-200 hover:text-white">Benefits</Link></li>
            <li><Link href="#contact" className="text-gray-200 hover:text-white">Contact</Link></li>
          </ul>
        </div>
        {/* Socials */}
        <div className="flex-1 min-w-[180px]">
          <h3 className="font-semibold text-white mb-4">Socials</h3>
          <ul className="space-y-3 text-lg">
            <li><a href="#" className="text-gray-200 hover:text-white">Facebook</a></li>
            <li><a href="#" className="text-gray-200 hover:text-white">Instagram</a></li>
            <li><a href="#" className="text-gray-200 hover:text-white">LinkedIn</a></li>
          </ul>
        </div>
      </div>
    </footer>
  )
}