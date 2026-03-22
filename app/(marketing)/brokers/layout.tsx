import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Mortgage Brokers | HomePanel",
  description: "Enhance your client journey with integrated conveyancing that complements your mortgage service and drives better outcomes.",
}

export default function BrokersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
