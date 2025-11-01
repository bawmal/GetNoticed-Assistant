// Supabase Edge Function to poll MindStudio thread status
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const MINDSTUDIO_KEY = Deno.env.get('MINDSTUDIO_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  try {
    const { threadId, appId } = await req.json()

    if (!MINDSTUDIO_KEY) {
      throw new Error('MindStudio API key not configured')
    }

    // Load thread status from MindStudio
    const apiUrl = `https://api.mindstudio.ai/developer/v2/apps/load?threadId=${threadId}&appId=${appId}`
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${MINDSTUDIO_KEY}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`MindStudio API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()

    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Poll error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
})
