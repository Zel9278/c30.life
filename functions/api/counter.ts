interface Env {
  COUNTER: KVNamespace
}

interface CounterData {
  count: number
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { COUNTER } = context.env

  // Get current count
  const data = await COUNTER.get<CounterData>("site_counter", "json")
  const currentCount = data?.count ?? 0
  const newCount = currentCount + 1

  // Update count
  await COUNTER.put("site_counter", JSON.stringify({ count: newCount }))

  return new Response(JSON.stringify({ count: newCount }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  })
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { COUNTER } = context.env

  // Get current count without incrementing
  const data = await COUNTER.get<CounterData>("site_counter", "json")
  const count = data?.count ?? 0

  return new Response(JSON.stringify({ count }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  })
}

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
