export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  return new Response(JSON.stringify({ message: 'API is working' }), {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export async function POST() {
  return new Response(JSON.stringify({ message: 'API is working' }), {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}