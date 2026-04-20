"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface PageHeroProps {
  title: string
  subtitle: string
  ctaText?: string
  ctaHref?: string
  secondaryCtaText?: string
  secondaryCtaHref?: string
  image?: string
}

export function PageHero({
  title,
  subtitle,
  ctaText,
  ctaHref = "/start",
  secondaryCtaText,
  secondaryCtaHref,
  image = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80&fit=crop",
}: PageHeroProps) {
  return (
    <section className="relative overflow-hidden min-h-[60vh] flex items-center">
      <img
        src={image}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "grayscale(30%) brightness(0.45)" }}
      />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.4) 100%)" }} />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 py-28 lg:py-36">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-[1.05] mb-6">
            {title}
          </h1>
          <p className="text-lg lg:text-xl text-white/75 leading-relaxed mb-10 max-w-2xl">
            {subtitle}
          </p>
          {(ctaText || secondaryCtaText) && (
            <div className="flex flex-col sm:flex-row gap-3">
              {ctaText && (
                <Button
                  asChild
                  size="lg"
                  className="rounded-full px-8 h-12 text-base bg-white hover:bg-white/90 text-black font-medium"
                >
                  <Link href={ctaHref}>
                    {ctaText}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
              {secondaryCtaText && secondaryCtaHref && (
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8 h-12 text-base border-white/40 text-white hover:bg-white/10 hover:text-white bg-transparent"
                >
                  <Link href={secondaryCtaHref}>{secondaryCtaText}</Link>
                </Button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
