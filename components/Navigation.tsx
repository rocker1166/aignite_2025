"use client"

import React, { createContext, useContext, useState, useRef, useEffect, ReactNode, ElementType, useCallback } from "react"
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion"

interface NavigationContextType {
  ready: boolean
  size: string
  position: string
  duration: string
  activeIndex: number
  setActiveIndex: (index: number) => void
  isAnimating: boolean
}

const NavigationContext = createContext<NavigationContextType | null>(null)

interface NavigationProps {
  children: (context: NavigationContextType) => ReactNode
  as?: ElementType
  fluid?: boolean
  duration?: number
  className?: string
}

interface NavigationItemProps {
  children: (props: { setActive: () => void; isActive: boolean }) => ReactNode
  as?: ElementType
  onActivated?: () => void
}

interface NavigationListProps {
  children: ReactNode
  as?: ElementType
  className?: string
}

export function Navigation({ children, as: Component = "div", fluid = false, duration = 300, className }: NavigationProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [ready, setReady] = useState(false)
  const [size, setSize] = useState("0px")
  const [position, setPosition] = useState("0px")
  const [isAnimating, setIsAnimating] = useState(false)
  const containerRef = useRef<HTMLElement>(null)

  // Motion values for smooth physics-based animations
  const motionX = useMotionValue(0)
  const motionWidth = useMotionValue(0)
  
  // Spring physics for smooth, natural movement
  const springX = useSpring(motionX, { 
    stiffness: 300, 
    damping: 30,
    mass: 0.8
  })
  const springWidth = useSpring(motionWidth, { 
    stiffness: 400, 
    damping: 35,
    mass: 0.6
  })

  const updateIndicator = useCallback(() => {
    if (!containerRef.current) return
    
    // Find the navigation list (ul element)
    const navList = containerRef.current.querySelector('ul')
    if (!navList) return
    
    const items = navList.children
    const activeItem = items[activeIndex] as HTMLElement
    
    if (activeItem && navList) {
      const listRect = navList.getBoundingClientRect()
      const itemRect = activeItem.getBoundingClientRect()
      
      // Calculate size and position for the pill
      const newSize = `${itemRect.width}px`
      const newPosition = `${itemRect.left - listRect.left}px`
      
      console.log('Updating indicator:', { activeIndex, newSize, newPosition, ready })
      
      setSize(newSize)
      setPosition(newPosition)
      setReady(true)
    }
  }, [activeIndex])

  useEffect(() => {
    // Initial setup with longer delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      updateIndicator()
    }, 200)
    return () => clearTimeout(timer)
  }, [updateIndicator])

  useEffect(() => {
    // Update indicator when activeIndex changes
    const timer = setTimeout(() => {
      updateIndicator()
    }, 10)
    return () => clearTimeout(timer)
  }, [activeIndex, updateIndicator])

  useEffect(() => {
    const handleResize = () => updateIndicator()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [updateIndicator])

  const contextValue: NavigationContextType = {
    ready,
    size,
    position,
    duration: `${duration}ms`,
    activeIndex,
    setActiveIndex: (index: number) => {
      setActiveIndex(index)
      // Update indicator after state change
      setTimeout(updateIndicator, 10)
    },
  }

  return (
    <NavigationContext.Provider value={contextValue}>
      <Component ref={containerRef} className={className}>
        {children(contextValue)}
      </Component>
    </NavigationContext.Provider>
  )
}

function NavigationList({ children, as: Component = "div", className }: NavigationListProps) {
  return <Component className={className}>{children}</Component>
}

function NavigationItem({ children, as: Component = "div", onActivated }: NavigationItemProps) {
  const context = useContext(NavigationContext)
  const elementRef = useRef<HTMLElement>(null)

  if (!context) {
    throw new Error("NavigationItem must be used within Navigation")
  }

  const { activeIndex, setActiveIndex } = context

  const setActive = () => {
    if (elementRef.current?.parentElement) {
      const index = Array.from(elementRef.current.parentElement.children).indexOf(elementRef.current)
      setActiveIndex(index)
      onActivated?.()
    }
  }

  const isActive = elementRef.current?.parentElement ? 
    Array.from(elementRef.current.parentElement.children).indexOf(elementRef.current) === activeIndex : 
    false

  return (
    <Component ref={elementRef}>
      {children({ setActive, isActive })}
    </Component>
  )
}

Navigation.List = NavigationList
Navigation.Item = NavigationItem
