// Supabase Edge Function to proxy MindStudio webhook requests
// This avoids CORS issues when calling MindStudio from the browser

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const MINDSTUDIO_URL = Deno.env.get('MINDSTUDIO_API_URL')
const MINDSTUDIO_KEY = Deno.env.get('MINDSTUDIO_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
      status: 200
    })
  }

  try {
    const { pageUrl, userCV, appId, workflow } = await req.json()

    if (!MINDSTUDIO_KEY) {
      throw new Error('MindStudio API key not configured')
    }

    // Use MindStudio's proper API endpoint with async callback
    const apiUrl = 'https://api.mindstudio.ai/developer/v2/apps/run'
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MINDSTUDIO_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        appId: appId,
        workflow: workflow || 'Main',
        variables: {
          webhookParams: {
            pageUrl,
            userCV,
          }
        },
        callbackUrl: 'https://webhook.site/unique-id', // Dummy URL to enable async mode
        includeBillingCost: false
      }),
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
    console.error('Proxy error:', error)
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
