'use client';
import { ChevronRight } from "lucide-react";
import LinkItem from "../components/LinkItem";
import { IconGithub, IconArrowRight } from "../icons";
import HeroAnimated from "../components/HeroAnimated";
import BgGradient from "../components/BgGradient";
import {
  VideoPlayer,
  VideoPlayerContent,
  VideoPlayerControlBar,
  VideoPlayerMuteButton,
  VideoPlayerPlayButton,
  VideoPlayerSeekBackwardButton,
  VideoPlayerSeekForwardButton,
  VideoPlayerTimeDisplay,
  VideoPlayerTimeRange,
  VideoPlayerVolumeRange,
  VideoPlayerFullscreenButton,
} from '../components/video-player';

const FUIHeroWithGridSimple = () => {
  return (
    <>
      <section className="min-h-[800px] w-full mt-0 relative overflow-hidden bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-purple-50/80 dark:from-slate-900 dark:via-blue-900/50 dark:to-indigo-900/50">
        
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0">
          {/* Primary Background Gradient */}
          <div className="absolute -top-0 inset-x-0 opacity-40 dark:opacity-45">
            <BgGradient variant="blue" />
          </div>
          
          {/* Additional Light Mode Background Layers */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-100/30 via-blue-100/40 to-indigo-100/30 dark:opacity-0 animate-pulse [animation-duration:8s]" />
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-100/20 via-transparent to-pink-100/20 dark:opacity-0" />
        </div>

        {/* Floating Orbs for Light Mode */}
        <div className="absolute inset-0 dark:opacity-0">
          {/* Large floating orb - top left */}
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-blue-200/40 to-cyan-300/40 rounded-full blur-3xl animate-pulse [animation-duration:6s] [animation-delay:0s]" />
          
          {/* Medium floating orb - top right */}
          <div className="absolute top-32 right-32 w-48 h-48 bg-gradient-to-br from-purple-200/50 to-indigo-300/50 rounded-full blur-2xl animate-pulse [animation-duration:8s] [animation-delay:2s]" />
          
          {/* Small floating orb - bottom left */}
          <div className="absolute bottom-40 left-40 w-32 h-32 bg-gradient-to-br from-pink-200/60 to-rose-300/60 rounded-full blur-xl animate-pulse [animation-duration:10s] [animation-delay:4s]" />
          
          {/* Tiny floating orb - center right */}
          <div className="absolute top-1/2 right-20 w-24 h-24 bg-gradient-to-br from-teal-200/50 to-cyan-300/50 rounded-full blur-lg animate-pulse [animation-duration:7s] [animation-delay:1s]" />
        </div>

        {/* Enhanced Grid Pattern */}
        <svg
          className="absolute inset-0 z-1 h-full w-full stroke-gray-400/70 dark:stroke-white/5 [mask-image:radial-gradient(100%_100%_at_top_left,white,transparent)]"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="983e3e4c-de6d-4c3f-8d64-b9761d1534cc"
              width={200}
              height={200}
              x="50%"
              y={-1}
              patternUnits="userSpaceOnUse"
            >
              <path d="M.5 200V.5H200" fill="none" />
            </pattern>
          </defs>
          <svg x="50%" y={-1} className="overflow-visible fill-gray-300/40 dark:fill-gray-800/20">
            <path
              d="M-200 0h201v201h-201Z M600 0h201v201h-201Z M-400 600h201v201h-201Z M200 800h201v201h-201Z"
              strokeWidth={0}
            />
          </svg>
          <rect
            width="100%"
            height="100%"
            strokeWidth={0}
            fill="url(#983e3e4c-de6d-4c3f-8d64-b9761d1534cc)"
          />
        </svg>
        
        {/* Enhanced Floating Gradient Blob */}
        <div
          className="absolute left-[calc(50%-4rem)] top-10 -z-10 transform-gpu blur-3xl sm:left-[calc(50%-18rem)] lg:left-48 lg:top-[calc(50%-30rem)] xl:left-[calc(50%-24rem)]"
          aria-hidden="true"
        >
          <div
            className="aspect-[1108/632] w-[69.25rem] bg-gradient-to-r from-blue-400/60 via-purple-400/60 to-pink-400/60 dark:from-[#9c80ff] dark:via-purple-500 dark:to-[#e546d5] opacity-40 dark:opacity-20 animate-pulse [animation-duration:12s]"
            style={{
              clipPath:
                "polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)",
            }}
          />
        </div>

        {/* Additional Decorative Elements for Light Mode */}
        <div className="absolute inset-0 dark:opacity-0">
          {/* Geometric shapes */}
          <div className="absolute top-40 left-1/4 w-8 h-8 border-2 border-blue-300/40 rotate-45 animate-spin [animation-duration:20s]" />
          <div className="absolute bottom-60 right-1/4 w-6 h-6 border-2 border-purple-300/40 rotate-12 animate-bounce [animation-duration:4s]" />
          <div className="absolute top-1/3 right-1/3 w-4 h-4 bg-indigo-300/40 rounded-full animate-pulse [animation-duration:5s]" />
          
          {/* Subtle connecting lines */}
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgb(147 197 253)" stopOpacity="0.1" />
                <stop offset="50%" stopColor="rgb(139 92 246)" stopOpacity="0.2" />
                <stop offset="100%" stopColor="rgb(219 39 119)" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <path
              d="M200,150 Q400,250 600,200 T1000,180"
              stroke="url(#lineGradient)"
              strokeWidth="2"
              fill="none"
              className="animate-pulse [animation-duration:6s]"
            />
            <path
              d="M100,300 Q350,400 700,350 T1100,320"
              stroke="url(#lineGradient)"
              strokeWidth="1.5"
              fill="none"
              className="animate-pulse [animation-duration:8s] [animation-delay:2s]"
            />
          </svg>
        </div>

        {/* Main Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-3 md:px-6 pt-16 lg:pt-24">
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-center">
            
            {/* Left Column - Text Content */}
            <div className="space-y-6 lg:col-span-2">
              <h1 className="text-sm text-gray-700 dark:text-gray-400 group font-inter px-5 py-2 bg-gradient-to-tr from-white/90 via-blue-50/90 to-indigo-50/80 dark:from-zinc-300/5 dark:via-gray-400/5 dark:to-transparent border-[2px] border-gray-300/60 dark:border-white/5 rounded-3xl w-fit backdrop-blur-sm shadow-lg dark:shadow-none">
                <pre className="tracking-tight uppercase">
                  AI-Powered Supply Chain Intelligence
                  <ChevronRight className="inline w-4 h-4 ml-2 group-hover:translate-x-1 duration-300" />
                </pre>
              </h1>
              
              <HeroAnimated
                header="Transform Your Supply Chain with Intelligent Resilience"
                headerClassName="text-left tracking-tight text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold font-inter text-transparent bg-clip-text bg-gradient-to-r from-gray-800 via-blue-700 to-indigo-700 dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)] leading-tight drop-shadow-sm"
                description=""
                descriptionClassName=""
              >
                <div className="text-[0.84rem] text-gray-700 dark:text-zinc-400 text-left md:text-lg max-w-xl py-4 drop-shadow-sm">
                  <pre className="tracking-tight uppercase text-wrap">
                    Build resilient supply chains with AI-driven insights, 
                    real-time monitoring, and predictive analytics that adapt to disruptions.
                  </pre>
                </div>
              </HeroAnimated>
              
              <div className="flex flex-wrap gap-4 items-start">
                <LinkItem
                  href="/dashboard"
                  className="inline-flex rounded-lg uppercase font-mono text-center group items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 transition-all duration-200 py-4 px-10 shadow-xl hover:shadow-2xl hover:scale-105"
                >
                  Start Free Trial
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 duration-300" />
                </LinkItem>
                <LinkItem
                  href="/digital-twin"
                  variant="outline"
                  className="inline-flex font-mono uppercase tracking-tight rounded-lg justify-center items-center gap-x-3 border-2 border-gray-400/60 dark:border-zinc-800 hover:border-gray-500 dark:hover:border-zinc-600 bg-white/90 dark:bg-zinc-950 hover:bg-gray-50 dark:hover:text-zinc-100 text-gray-700 dark:text-white duration-200 py-4 px-10 backdrop-blur-sm shadow-lg hover:shadow-xl"
                >
                  <IconGithub className="w-5 h-5" />
                  View Demo
                </LinkItem>
              </div>
            </div>

            {/* Right Column - Video Player */}
            <div className="relative lg:pl-6 lg:col-span-3">
              <div className="relative">
                <VideoPlayer className="aspect-video w-full max-w-3xl mx-auto lg:mx-0">
                  <VideoPlayerContent
                    src="https://stream.mux.com/DS00Spx1CV902MCtPj5WknGlR102V5HFkDe/high.mp4"
                    slot="media"
                    muted
                    preload="auto"
                    autoPlay
                    loop
                    crossOrigin="anonymous"
                  />
                  <VideoPlayerControlBar>
                    <VideoPlayerPlayButton />
                    <VideoPlayerSeekBackwardButton />
                    <VideoPlayerSeekForwardButton />
                    <VideoPlayerTimeRange />
                    <VideoPlayerTimeDisplay showDuration />
                    <VideoPlayerMuteButton />
                    <VideoPlayerVolumeRange />
                    <VideoPlayerFullscreenButton />
                  </VideoPlayerControlBar>
                </VideoPlayer>
                
                {/* Enhanced Video Effects - Light/Dark Mode Aware */}
                <div className="absolute -inset-6 bg-gradient-to-r from-blue-300/40 via-indigo-300/40 to-purple-300/40 dark:from-blue-500/20 dark:to-purple-500/20 rounded-2xl blur-2xl -z-10 animate-pulse [animation-duration:8s]" />
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br from-purple-300/60 to-pink-300/60 dark:from-purple-500/30 dark:to-pink-500/30 rounded-full blur-3xl -z-10 animate-pulse [animation-duration:10s] [animation-delay:2s]" />
                <div className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-br from-blue-300/50 to-cyan-300/50 dark:from-blue-500/20 dark:to-cyan-500/20 rounded-full blur-3xl -z-10 animate-pulse [animation-duration:12s] [animation-delay:1s]" />
                {/* Additional decorative elements around video */}
                <div className="absolute -top-4 -right-4 w-6 h-6 border-2 border-indigo-400/50 dark:border-indigo-400/30 rounded-full animate-spin [animation-duration:15s]" />
                <div className="absolute -bottom-4 -left-4 w-4 h-4 bg-purple-400/60 dark:bg-purple-400/30 rounded-full animate-bounce [animation-duration:3s] [animation-delay:1s]" />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </section>
    </>
  );
};

export default FUIHeroWithGridSimple;

