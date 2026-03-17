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
          className="rounded-3xl bg-foreground text-background p-12 lg:p-20 text-center"
        >
          <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-balance max-w-2xl mx-auto">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-4 text-lg text-background/70 max-w-xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          )}
          <div className="mt-10">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="rounded-full px-8 h-12 text-base"
            >
              <Link href={ctaHref}>
                {ctaText}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
