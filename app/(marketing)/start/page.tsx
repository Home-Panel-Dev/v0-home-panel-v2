import { Metadata } from "next"
import { MultiStepForm } from "@/components/multi-step-form"

export const metadata: Metadata = {
  title: "Get a Quote | The Home Panel",
  description: "Get your instant fixed-fee conveyancing quote in under 3 minutes.",
}

export default function StartPage() {
  return <MultiStepForm />
}
