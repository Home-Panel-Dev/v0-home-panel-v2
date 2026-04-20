"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface CTASectionProps {
  title: string
  subtitle?: string
  ctaText?: string
  ctaHref?: string
}

export function CTASection({
  title,
  subtitle,
  ctaText = "Start your move",
  ctaHref = "/start",
}: CTASectionProps) {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl overflow-hidden p-12 lg:p-20 text-center"
          style={{
            background: "linear-gradient(135deg, #0A0A0A 0%, #1a1a1a 40%, #2C2C2A 100%)"
          }}
        >
          {/* Subtle gradient accent */}
          <div className="absolute inset-0 opacity-30"
            style={{ background: "radial-gradient(ellipse at top right, rgba(255,255,255,0.08) 0%, transparent 60%)" }} />

          <div className="relative z-10">
            <h2 className="text-3xl lg:text-5xl font-semibold tracking-tight text-white text-balance max-w-2xl mx-auto leading-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-4 text-lg text-white/50 max-w-xl mx-auto leading-relaxed">
                {subtitle}
              </p>
            )}
            <div className="mt-10">
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
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
