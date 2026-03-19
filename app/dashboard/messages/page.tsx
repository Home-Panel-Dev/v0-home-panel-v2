"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Send, MessageSquare } from "lucide-react"

interface Message {
  id: string
  content: string
  sender_id: string
  is_read: boolean
  created_at: string
  profiles?: {
    first_name: string | null
    last_name: string | null
    role: string
  }
}

export default function MessagesPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [caseId, setCaseId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/auth/login")
      return
    }
    setUserId(user.id)

    // Get active case
    const { data: cases } = await supabase
      .from("cases")
      .select("id")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)

    if (cases && cases.length > 0) {
      setCaseId(cases[0].id)
      
      // Get messages for this case
      const { data: msgs } = await supabase
        .from("messages")
        .select(`
          *,
          profiles (first_name, last_name, role)
        `)
        .eq("case_id", cases[0].id)
        .order("created_at", { ascending: true })

      setMessages(msgs || [])

      // Mark messages as read
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("case_id", cases[0].id)
        .neq("sender_id", user.id)
    }
    setLoading(false)
  }

  const handleSend = async () => {
    if (!newMessage.trim() || !caseId || !userId) return

    setSending(true)
    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          case_id: caseId,
          sender_id: userId,
          content: newMessage.trim(),
        })
        .select(`
          *,
          profiles (first_name, last_name, role)
        `)
        .single()

      if (error) throw error

      setMessages([...messages, data])
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    } else if (days === 1) {
      return "Yesterday"
    } else if (days < 7) {
      return date.toLocaleDateString("en-GB", { weekday: "short" })
    } else {
      return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (!caseId) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <h3 className="text-lg font-medium mb-2">No active case</h3>
          <p className="text-slate-600 mb-4">
            Start a quote to communicate with your solicitor.
          </p>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <a href="/start">Get a Quote</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
        <p className="text-slate-600">
          Communicate with your conveyancing team.
        </p>
      </div>

      {/* Messages */}
      <Card className="flex flex-col h-[calc(100vh-300px)] min-h-[400px]">
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Conversation</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4">
          {messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((message) => {
                const isOwn = message.sender_id === userId
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        isOwn
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-900"
                      }`}
                    >
                      {!isOwn && (
                        <p className="text-xs font-medium mb-1 opacity-70">
                          {message.profiles?.first_name} {message.profiles?.last_name}
                          {message.profiles?.role === "admin" && " (Team)"}
                        </p>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-xs mt-1 ${isOwn ? "text-emerald-100" : "text-slate-500"}`}>
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageSquare className="h-12 w-12 text-slate-300 mb-4" />
              <h3 className="font-medium text-slate-900 mb-1">No messages yet</h3>
              <p className="text-sm text-slate-600">
                Send a message to start a conversation with your team.
              </p>
            </div>
          )}
        </CardContent>

        {/* Message input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Textarea
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              className="resize-none"
              rows={2}
            />
            <Button
              onClick={handleSend}
              disabled={!newMessage.trim() || sending}
              className="bg-emerald-600 hover:bg-emerald-700 px-4"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
