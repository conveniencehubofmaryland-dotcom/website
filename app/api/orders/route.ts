export async function POST(request: Request) {
  try {
    const body = await request.json()
    const orderId = `ORD-${Date.now()}`
    return Response.json({ success: true, orderId })
  } catch (error) {
    return Response.json({ error: 'Error' }, { status: 500 })
  }
}
