import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Solicitors | HomePanel",
  description: "Receive pre-qualified, well-prepared clients ready to progress through conveyancing with complete documentation.",
}

export default function SolicitorsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
