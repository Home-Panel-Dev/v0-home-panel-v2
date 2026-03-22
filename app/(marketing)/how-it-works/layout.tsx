import { Metadata } from "next"

export const metadata: Metadata = {
  title: "How It Works | HomePanel",
  description: "Learn how HomePanel simplifies your home moving process with our guided conveyancing onboarding.",
}

export default function HowItWorksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
