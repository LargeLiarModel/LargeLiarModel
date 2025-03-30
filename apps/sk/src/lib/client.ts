import { hcWithType, type AppType } from '@largeliarmodel/hono-api';
import { hc } from 'hono/client'

// Handle client side and server side conditions
const base = typeof window === 'undefined'
  ? 'http://localhost:3000' // Direct connection on server side
  : '/api' // Use the proxy on client side

// Create the client with pre-computed types
const client = hcWithType(base)

// Helper function to check if the client is working
export const checkApiConnection = async () => {
  try {
    const response = await client.quotes.$get()
    return { success: true, data: response }
  } catch (error) {
    console.error("API connection error:", error)
    return { success: false, error }
  }
}

export default client
