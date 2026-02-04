"use client"

import { useEffect, useMemo, useState } from "react"

type SessionSummary = {
  name: string
  reserved: number
  remaining: number
  isFull: boolean
}

type Entry = {
  timestamp: string
  email: string
  name: string
  count: number
  sessions: string[]
}

type ApiResponse = {
  capacityPerSession: number
  sessions: SessionSummary[]
  fullSessions: string[]
  entries: Entry[]
  totalEntries: number
}

const formatNumber = (value: number) =>
  new Intl.NumberFormat("ja-JP").format(value)

export default function TestRoundtablesClient() {
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch("/api/roundtables")
        if (!res.ok) throw new Error("Failed to fetch roundtables.")
        const json = (await res.json()) as ApiResponse
        if (active) setData(json)
      } catch (fetchError) {
        if (!active) return
        const message =
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to fetch roundtables."
        setError(message)
      } finally {
        if (active) setLoading(false)
      }
    }

    load()

    return () => {
      active = false
    }
  }, [])

  const fullMessage = useMemo(() => {
    if (!data || data.fullSessions.length === 0) return null
    return `満員のため予約できませんでした: ${data.fullSessions.join("、")}`
  }, [data])

  if (loading) {
    return <p className="text-sm text-zinc-500">読み込み中...</p>
  }

  if (error) {
    return <p className="text-sm text-rose-600">{error}</p>
  }

  if (!data) {
    return <p className="text-sm text-zinc-500">データがありません。</p>
  }

  return (
    <section className="flex flex-col gap-8">
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5">
        <h2 className="text-lg font-semibold">座談会の空き状況</h2>
        <p className="mt-2 text-sm text-zinc-600">
          定員は各座談会{formatNumber(data.capacityPerSession)}人です。
        </p>
        {fullMessage ? (
          <p className="mt-3 text-sm text-rose-600">{fullMessage}</p>
        ) : (
          <p className="mt-3 text-sm text-emerald-600">
            すべての座談会に空きがあります。
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {data.sessions.map((session) => (
          <article
            key={session.name}
            className="rounded-xl border border-zinc-200 p-5"
          >
            <h3 className="text-base font-semibold">{session.name}</h3>
            <p className="mt-2 text-sm text-zinc-600">
              応募人数: {formatNumber(session.reserved)} /{
              formatNumber(data.capacityPerSession)}
            </p>
            <p
              className={`mt-2 text-sm ${
                session.isFull ? "text-rose-600" : "text-emerald-600"
              }`}
            >
              {session.isFull
                ? "満員です"
                : `あと${formatNumber(session.remaining)}人応募できます`}
            </p>
          </article>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-200 p-5">
        <h2 className="text-lg font-semibold">応募一覧</h2>
        <p className="mt-2 text-sm text-zinc-600">
          {formatNumber(data.totalEntries)}件の応募があります。
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b border-zinc-200 text-zinc-500">
              <tr>
                <th className="py-2 pr-4 font-medium">タイムスタンプ</th>
                <th className="py-2 pr-4 font-medium">氏名</th>
                <th className="py-2 pr-4 font-medium">メール</th>
                <th className="py-2 pr-4 font-medium">人数</th>
                <th className="py-2 pr-4 font-medium">参加座談会</th>
              </tr>
            </thead>
            <tbody className="text-zinc-700">
              {data.entries.map((entry, index) => (
                <tr key={`${entry.timestamp}-${index}`}>
                  <td className="py-2 pr-4 align-top">{entry.timestamp}</td>
                  <td className="py-2 pr-4 align-top">{entry.name}</td>
                  <td className="py-2 pr-4 align-top">{entry.email}</td>
                  <td className="py-2 pr-4 align-top">
                    {formatNumber(entry.count)}
                  </td>
                  <td className="py-2 pr-4 align-top">
                    {entry.sessions.join("、")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
