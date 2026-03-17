"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface PartnerCardProps {
  title: string
  description: string
  href: string
  icon: LucideIcon
  index?: number
}

export function PartnerCard({ title, description, href, icon: Icon, index = 0 }: PartnerCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link
        href={href}
        className="group block p-8 rounded-2xl bg-card border border-border hover:border-foreground/20 transition-all hover:shadow-lg"
      >
        <div className="h-12 w-12 rounded-xl bg-foreground flex items-center justify-center mb-6">
          <Icon className="h-6 w-6 text-background" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground leading-relaxed mb-4">{description}</p>
        <span className="inline-flex items-center text-sm font-medium text-foreground group-hover:gap-2 transition-all">
          Learn more
          <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </Link>
    </motion.div>
  )
}
