import OpenAI from 'npm:openai@4.28.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

// Ensure OpenAI API key is available
const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
if (!openaiApiKey) {
  throw new Error('OPENAI_API_KEY is not set in the environment');
}

const openai = new OpenAI({
  apiKey: openaiApiKey,
});

const systemPrompt = `You are a helpful assistant for a community services platform called Szar. 
Your role is to help users with questions about:
- Volunteering opportunities
- Community services
- Language exchange programs
- Educational support
- Professional development
- Safety and trust
- Platform usage
- Technical support

Always be friendly, professional, and empathetic. If you don't know something specific about the platform, 
provide general guidance and suggest contacting support for detailed information.

Key features of the platform:
- Users can volunteer for services
- Users can request services
- Services include language exchange, tutoring, and professional support
- Safety measures include background checks and secure meeting locations
- Volunteer hours are tracked and rewarded
- Organizations can apply for sponsorship

For technical issues, always recommend:
1. Checking FAQ
2. Clearing browser cache
3. Using a different browser
4. Contacting support@szar.ca

For safety concerns, emphasize:
- Background checks for volunteers
- Secure meeting locations
- Emergency contact system
- Reporting system for issues`;

Deno.serve(async (req) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { 
        status: 204,
        headers: corsHeaders
      });
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }), 
        { 
          status: 405,
          headers: { ...corsHeaders }
        }
      );
    }

    // Parse and validate request body
    const requestData = await req.json().catch(() => null);
    if (!requestData || !requestData.message) {
      return new Response(
        JSON.stringify({ error: 'Invalid request body. Message is required.' }),
        { 
          status: 400,
          headers: { ...corsHeaders }
        }
      );
    }

    const { message, conversationHistory = [] } = requestData;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0].message.content;

    return new Response(
      JSON.stringify({ message: response }),
      { 
        status: 200,
        headers: { ...corsHeaders }
      }
    );
  } catch (error) {
    console.error('Error processing request:', error);

    // Return a more detailed error response
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders }
      }
    );
  }
});