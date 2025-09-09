import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  fullName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName }: WelcomeEmailRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "Choir Hymn Harmony <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to our Choir! Your membership has been approved",
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #faf8f5;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #b8860b, #daa520); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 32px; color: white;">🎵</span>
            </div>
            <h1 style="color: #2c1810; font-family: 'Playfair Display', serif; font-size: 28px; margin: 0;">Welcome to Our Choir Family!</h1>
          </div>
          
          <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 20px rgba(184, 134, 11, 0.15);">
            <h2 style="color: #2c1810; font-family: 'Playfair Display', serif; font-size: 24px; margin-top: 0;">Hello ${fullName}!</h2>
            
            <p style="color: #666; line-height: 1.6; font-size: 16px;">
              Congratulations! Your choir membership request has been approved. We're thrilled to welcome you to our community of worship and music.
            </p>
            
            <div style="background: #f8f5f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #b8860b; margin-top: 0; font-size: 18px;">🎉 You can now:</h3>
              <ul style="color: #666; line-height: 1.6;">
                <li>Sign in to your account with your email and password</li>
                <li>Access our complete hymn and song library</li>
                <li>View sheet music and audio recordings</li>
                <li>Join our choir community</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://7e67bb3d-e4d1-440d-b455-bd3cbab73081.lovableproject.com/auth" 
                 style="background: linear-gradient(135deg, #b8860b, #daa520); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; display: inline-block; font-size: 16px; box-shadow: 0 4px 15px rgba(184, 134, 11, 0.3); transform: translateY(0); transition: all 0.3s ease;"
                 onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(184, 134, 11, 0.4)';"
                 onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(184, 134, 11, 0.3)';">
                🎵 Sign In to Your Account
              </a>
            </div>
            
            <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
              If you have any questions, please don't hesitate to reach out to our admin team.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <p style="color: #999; font-size: 12px;">
              Blessings and harmony,<br>
              <strong>The Choir Hymn Harmony Team</strong>
            </p>
          </div>
        </div>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);