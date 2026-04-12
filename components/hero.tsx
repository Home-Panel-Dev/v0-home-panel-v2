"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden min-h-screen flex flex-col">

      {/* Video background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "grayscale(40%) brightness(0.5)" }}
      >
        <source src="/hero.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1 mx-auto max-w-7xl px-6 lg:px-8 w-full">

        {/* Main hero text */}
        <div className="flex-1 flex flex-col items-center justify-center text-center py-32">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm text-sm text-white/70 mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            SRA Regulated · Fixed Fees · No Hidden Costs
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-semibold tracking-tight text-white leading-[1.0] mb-6"
          >
            Moving home,
            <br />
            <span className="text-white/40">made simple.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="text-lg lg:text-xl text-white/60 max-w-xl leading-relaxed mb-10"
          >
            Fixed-fee conveyancing handled by experts. Get your instant quote in under 3 minutes.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-3 items-center"
          >
            <Button
              asChild
              size="lg"
              className="rounded-full px-8 h-12 text-base bg-white hover:bg-white/90 text-black font-medium"
            >
              <Link href="/start">
                Get your instant quote
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full px-8 h-12 text-base border-white/30 text-white hover:bg-white/10 hover:text-white bg-transparent"
            >
              <Link href="/how-it-works">How it works</Link>
            </Button>
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="border-t border-white/10 grid grid-cols-2 sm:grid-cols-4"
        >
          {[
            { value: "2×", label: "Faster than average" },
            { value: "30,000+", label: "Transactions handled" },
            { value: "98%", label: "Client satisfaction" },
            { value: "Fixed", label: "Fee guarantee" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="py-6 px-6 text-center border-r border-white/10 last:border-r-0"
            >
              <p className="text-2xl font-semibold text-white tracking-tight">{stat.value}</p>
              <p className="text-xs text-white/40 mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

    </section>
  )
}
