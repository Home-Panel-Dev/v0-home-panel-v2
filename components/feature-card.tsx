"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  Users,
  Clock,
  TrendingUp,
  Shield,
  Handshake,
  FileCheck,
  Zap,
  BarChart3,
  UserCheck,
  FileStack,
  Timer,
  Briefcase,
  Home,
  FileText,
  HeartHandshake,
  Sparkles,
} from "lucide-react"

const iconMap = {
  Users,
  Clock,
  TrendingUp,
  Shield,
  Handshake,
  FileCheck,
  Zap,
  BarChart3,
  UserCheck,
  FileStack,
  Timer,
  Briefcase,
  Home,
  FileText,
  HeartHandshake,
  Sparkles,
} as const

type IconName = keyof typeof iconMap

interface FeatureCardProps {
  title: string
  description: string
  iconName: IconName
  index?: number
  className?: string
}

export function FeatureCard({ title, description, iconName, index = 0, className }: FeatureCardProps) {
  const Icon = iconMap[iconName]
  
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
