import { Resend } from 'npm:resend@3.2.0';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import { addDays, isWithinInterval, startOfDay, endOfDay } from 'npm:date-fns@3.3.1';

const resendApiKey = Deno.env.get('RESEND_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!resendApiKey) {
  console.error('RESEND_API_KEY is not set');
  throw new Error('RESEND_API_KEY is not set');
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  throw new Error('Missing Supabase environment variables');
}

const resend = new Resend(resendApiKey);
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

async function sendEventCreationEmail(event: any, creatorEmail: string) {
  try {
    const response = await resend.emails.send({
      from: 'Szar Community <notifications@szar.ca>',
      to: [creatorEmail],
      subject: 'Event Created Successfully',
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #2563eb;">Your event has been created!</h1>
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px;">
                <h2 style="color: #1f2937;">${event.title}</h2>
                <p style="margin-bottom: 16px;">${event.description}</p>
                <div style="margin-bottom: 8px;">
                  <strong>Date:</strong> ${new Date(event.start_date).toLocaleDateString()}
                </div>
                <div style="margin-bottom: 8px;">
                  <strong>Time:</strong> ${new Date(event.start_date).toLocaleTimeString()}
                </div>
                <div style="margin-bottom: 8px;">
                  <strong>Location:</strong> ${event.location_address}
                </div>
              </div>
              <p style="margin-top: 20px; color: #666;">
                You'll receive reminder emails as the event date approaches.
              </p>
            </div>
          </body>
        </html>
      `
    });

    return response;
  } catch (error) {
    console.error('Error sending event creation email:', error);
    throw error;
  }
}

async function sendReminderEmail(event: any, recipientEmail: string, recipientName: string, role: 'volunteer' | 'participant') {
  try {
    const response = await resend.emails.send({
      from: 'Szar Community <notifications@szar.ca>',
      to: [recipientEmail],
      subject: `Reminder: ${event.title} Tomorrow`,
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #2563eb;">Event Reminder</h1>
              <p>Hello ${recipientName || 'there'},</p>
              <p>This is a reminder that you are registered as a ${role} for the following event tomorrow:</p>
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px;">
                <h2 style="color: #1f2937;">${event.title}</h2>
                <p style="margin-bottom: 16px;">${event.description}</p>
                <div style="margin-bottom: 8px;">
                  <strong>Date:</strong> ${new Date(event.start_date).toLocaleDateString()}
                </div>
                <div style="margin-bottom: 8px;">
                  <strong>Time:</strong> ${new Date(event.start_date).toLocaleTimeString()}
                </div>
                <div style="margin-bottom: 8px;">
                  <strong>Location:</strong> ${event.location_address}
                </div>
                ${event.location_details ? `
                <div style="margin-bottom: 8px;">
                  <strong>Location Details:</strong> ${event.location_details}
                </div>
                ` : ''}
              </div>
              <p style="margin-top: 20px; color: #666;">
                If you can no longer attend, please update your registration status in the platform.
              </p>
            </div>
          </body>
        </html>
      `
    });

    return response;
  } catch (error) {
    console.error('Error sending reminder email:', error);
    throw error;
  }
}

async function processReminders() {
  const tomorrow = addDays(new Date(), 1);
  
  // Fetch all events happening tomorrow
  const { data: events, error: eventsError } = await supabase
    .from('services')
    .select(`
      *,
      volunteer_applications (
        volunteer_id,
        status
      ),
      participant_registrations (
        participant_id,
        status
      )
    `)
    .gte('start_date', startOfDay(tomorrow).toISOString())
    .lte('start_date', endOfDay(tomorrow).toISOString());

  if (eventsError) {
    console.error('Error fetching events:', eventsError);
    throw eventsError;
  }

  for (const event of events || []) {
    // Process volunteers
    for (const application of event.volunteer_applications || []) {
      if (application.status === 'approved') {
        const { data: volunteerData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', application.volunteer_id)
          .single();

        const { data: userData } = await supabase.auth.admin.getUserById(application.volunteer_id);
        
        if (userData?.user?.email && volunteerData) {
          await sendReminderEmail(
            event,
            userData.user.email,
            volunteerData.full_name,
            'volunteer'
          );
        }
      }
    }

    // Process participants
    for (const registration of event.participant_registrations || []) {
      if (registration.status === 'approved') {
        const { data: participantData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', registration.participant_id)
          .single();

        const { data: userData } = await supabase.auth.admin.getUserById(registration.participant_id);
        
        if (userData?.user?.email && participantData) {
          await sendReminderEmail(
            event,
            userData.user.email,
            participantData.full_name,
            'participant'
          );
        }
      }
    }
  }
}

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const { type, event } = body;

      if (type === 'EVENT_CREATED' && event) {
        const { data: userData } = await supabase.auth.admin.getUserById(event.created_by);
        
        if (!userData?.user?.email) {
          throw new Error('No email found for event creator');
        }

        await sendEventCreationEmail(event, userData.user.email);
        return new Response(
          JSON.stringify({ success: true, message: 'Confirmation email sent successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else if (type === 'PROCESS_REMINDERS') {
        await processReminders();
        return new Response(
          JSON.stringify({ success: true, message: 'Reminders processed successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Invalid event type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});