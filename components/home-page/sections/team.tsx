"use client"

import { motion } from "framer-motion"
import { Github, Linkedin, Mail } from "lucide-react"
import Image from "next/image"

const teamMembers = [
  {
    name: "Arnab Mondal",
    role: "Full Stack Developer",
    image: "/team/arnab-mondal.jpeg",
    social: {
      linkedin: "https://www.linkedin.com/in/codewarnab/",
      github: "https://github.com/codewarnab"
    }
  },
  {
    name: "Suman Jana",
    role: "AI Agent Developer",
    image: "/team/suman-jana.jpg", 
    social: {
      linkedin: "https://www.linkedin.com/in/suman-jana-dev/",
      github: "https://github.com/rocker1166"
    }
  },
  {
    name: "Anirban Majumder",
    role: "Full Stack Developer",
    image: "/team/anirban-majumder.jpg",
    social: {
      linkedin: "https://www.linkedin.com/in/anirban-majumder-/",
      github: "https://github.com/Anirban-Majumder"
    }
  },
  {
    name: "Sutanuka Chakraborty",
    role: "Frontend Developer",
    image: "/team/sutanuka-chakraborty.jpg",
    social: {
      linkedin: "https://www.linkedin.com/in/sutanuka-chakraborty-148744275/",
      github: "https://github.com/sutanukaa"
    }
  }
]

export function TeamSection() {
  return (
    <section className="relative w-full min-h-screen py-20 bg-background overflow-hidden">
      {/* Enhanced Grid Pattern - Extended to Footer */}
      <svg
        className="fixed inset-0 z-0 w-full h-full stroke-gray-400/70 dark:stroke-gray-600/30 [mask-image:linear-gradient(to_bottom,white_0%,white_90%,transparent_100%)]"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="team-grid-pattern"
            width={200}
            height={200}
            x="50%"
            y={-1}
            patternUnits="userSpaceOnUse"
          >
            <path d="M.5 200V.5H200" fill="none" />
          </pattern>
        </defs>
        <svg x="50%" y={-1} className="overflow-visible fill-gray-300/40 dark:fill-gray-700/20">
          <path
            d="M-200 0h201v201h-201Z M600 0h201v201h-201Z M-400 600h201v201h-201Z M200 800h201v201h-201Z M-600 1200h201v201h-201Z M400 1400h201v201h-201Z M-200 1800h201v201h-201Z M800 2000h201v201h-201Z"
            strokeWidth={0}
          />
        </svg>
        <rect
          width="100%"
          height="100%"
          strokeWidth={0}
          fill="url(#team-grid-pattern)"
        />
      </svg>

      {/* Background Glow Effects - Extended */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Light mode orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-blue-200/30 to-indigo-300/20 rounded-full blur-3xl dark:opacity-0 opacity-100 animate-pulse" 
             style={{ animationDuration: '4s' }} />
        <div className="absolute top-40 right-32 w-96 h-96 bg-gradient-to-br from-purple-200/25 to-pink-300/20 rounded-full blur-3xl dark:opacity-0 opacity-100 animate-pulse" 
             style={{ animationDuration: '5s', animationDelay: '1s' }} />
        <div className="absolute bottom-32 left-1/4 w-80 h-80 bg-gradient-to-br from-emerald-200/20 to-teal-300/15 rounded-full blur-3xl dark:opacity-0 opacity-100 animate-pulse" 
             style={{ animationDuration: '6s', animationDelay: '2s' }} />
        
        {/* Dark mode orbs */}
        <div className="absolute top-32 right-20 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-indigo-600/5 rounded-full blur-3xl dark:opacity-100 opacity-0 animate-pulse" 
             style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-40 right-1/3 w-72 h-72 bg-gradient-to-br from-purple-500/8 to-pink-600/4 rounded-full blur-3xl dark:opacity-100 opacity-0 animate-pulse" 
             style={{ animationDuration: '5s', animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-16 w-56 h-56 bg-gradient-to-br from-emerald-500/6 to-teal-600/3 rounded-full blur-3xl dark:opacity-100 opacity-0 animate-pulse" 
             style={{ animationDuration: '7s', animationDelay: '3s' }} />
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 dark:from-primary/3 dark:to-secondary/3" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-background/30" />
      </div>

      <div className="relative z-20 container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent mb-6"
          >
            Meet Our Team
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
          >
            Our diverse team of experts combines decades of experience in supply chain management, 
            artificial intelligence, and enterprise software to revolutionize how businesses manage risk.
          </motion.p>
        </motion.div>

        {/* Team Grid */}
        <div className="grid grid-cols-2 gap-8 max-w-4xl mx-auto">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1 + 0.3,
                ease: "easeOut"
              }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="relative bg-white/95 dark:bg-card/80 backdrop-blur-sm border border-gray-200/80 dark:border-border/40 rounded-2xl p-6 group hover:border-primary/50 dark:hover:border-primary/30 transition-all duration-500 overflow-hidden shadow-lg shadow-gray-200/50 dark:shadow-none hover:shadow-xl hover:shadow-gray-300/60 dark:hover:shadow-none"
            >
              {/* Glow effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-primary/12 dark:from-primary/5 dark:to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/25 via-transparent to-transparent dark:from-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Subtle glow ring */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-primary/15 to-primary/30 dark:from-primary/20 dark:via-primary/10 dark:to-primary/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm -z-10" />
              
              {/* Content */}
              <div className="relative z-10">
              {/* Profile Image */}
              <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden ring-2 ring-primary/30 dark:ring-primary/20 group-hover:ring-primary/60 dark:group-hover:ring-primary/50 group-hover:shadow-lg group-hover:shadow-primary/30 dark:group-hover:shadow-primary/25 transition-all duration-500">
                {/* Image glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Name & Role */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                <p className="text-primary font-medium">{member.role}</p>
              </div>

              {/* Social Links */}
              <div className="flex justify-center gap-3">
                {member.social.linkedin && (
                  <motion.a
                    href={member.social.linkedin}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 bg-gray-100/80 dark:bg-muted/50 rounded-lg hover:bg-primary/15 hover:text-primary transition-all duration-200 border border-gray-200/50 dark:border-transparent"
                  >
                    <Linkedin className="w-4 h-4" />
                    <span className="sr-only">LinkedIn</span>
                  </motion.a>
                )}
                {member.social.github && (
                  <motion.a
                    href={member.social.github}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 bg-gray-100/80 dark:bg-muted/50 rounded-lg hover:bg-primary/15 hover:text-primary transition-all duration-200 border border-gray-200/50 dark:border-transparent"
                  >
                    <Github className="w-4 h-4" />
                    <span className="sr-only">GitHub</span>
                  </motion.a>
                )}
              </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
