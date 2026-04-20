export async function handler() {
  const start = Date.now()
  console.log(`[sen-filter] request received at ${new Date().toISOString()}`)

  try {
    const res = await fetch('https://www.transelectrica.ro/sen-filter', {
      headers: {
        Referer: 'https://www.transelectrica.ro/',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
    })

    console.log(`[sen-filter] upstream responded ${res.status} in ${Date.now() - start}ms`)

    if (!res.ok) {
      console.error(`[sen-filter] upstream error: ${res.status} ${res.statusText}`)
      return { statusCode: res.status, body: `Upstream error: ${res.status}` }
    }

    const body = await res.text()

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=30',
        'Access-Control-Allow-Origin': '*',
      },
      body,
    }
  } catch (err) {
    console.error(`[sen-filter] fetch failed after ${Date.now() - start}ms:`, err.message)
    return { statusCode: 502, body: `Fetch failed: ${err.message}` }
  }
}
