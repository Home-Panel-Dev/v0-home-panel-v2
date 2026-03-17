"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface FeatureCardProps {
  title: string
  description: string
  icon: LucideIcon
  index?: number
  className?: string
}

export function FeatureCard({ title, description, icon: Icon, index = 0, className }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={cn(
        "group p-8 rounded-2xl bg-card border border-border hover:border-foreground/20 transition-colors",
        className
      )}
    >
      <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center mb-6">
        <Icon className="h-6 w-6 text-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  )
}
