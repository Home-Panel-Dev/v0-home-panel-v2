import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Estate Agents | HomePanel",
  description: "Partner with HomePanel to offer your clients a seamless conveyancing experience that reflects your commitment to exceptional service.",
}

export default function EstateAgentsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
