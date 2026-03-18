"use client"

import { motion } from "framer-motion"
import { 
  CheckCircle2, 
  FileText, 
  Search, 
  ClipboardCheck, 
  UserCheck 
} from "lucide-react"

const iconMap = {
  FileText,
  Search,
  ClipboardCheck,
  UserCheck,
} as const

type IconName = keyof typeof iconMap

interface ProcessStepProps {
  step: number
  title: string
  description: string
  details: string[]
  iconName: IconName
  index: number
  isLast?: boolean
}

export function ProcessStep({ 
  step, 
  title, 
  description, 
  details, 
  iconName, 
  index,
  isLast = false 
}: ProcessStepProps) {
  const Icon = iconMap[iconName]
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="relative"
    >
      <div className="grid lg:grid-cols-12 gap-6 lg:gap-12">
        <div className="lg:col-span-1 flex lg:flex-col items-center lg:items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-foreground text-background flex items-center justify-center shrink-0">
            <span className="text-lg font-semibold">{step}</span>
          </div>
          {!isLast && (
            <div className="hidden lg:block w-0.5 h-full min-h-[120px] bg-border ml-6 -mt-2" />
          )}
        </div>
        
        <div className="lg:col-span-5">
          <div className="flex items-center gap-3 mb-3">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-xl font-semibold">{title}</h3>
          </div>
          <p className="text-muted-foreground leading-relaxed">{description}</p>
        </div>

        <div className="lg:col-span-6">
          <div className="p-6 rounded-2xl bg-secondary border border-border">
            <ul className="space-y-3">
              {details.map((detail) => (
                <li key={detail} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-foreground shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
