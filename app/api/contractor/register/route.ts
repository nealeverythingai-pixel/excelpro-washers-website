import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ContractorApplication } from '@/lib/types';
import { EmailService } from '@/lib/email/EmailService';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract fields
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;
    const city = formData.get('city') as string;
    const postalCode = formData.get('postalCode') as string;
    const emergencyContact = formData.get('emergencyContact') as string;
    const emergencyPhone = formData.get('emergencyPhone') as string;
    const skills = JSON.parse(formData.get('skills') as string || '[]');
    const experience = formData.get('experience') as string || '';
    const hasOwnEquipment = formData.get('hasOwnEquipment') === 'true';
    const vehicleType = formData.get('vehicleType') as string || '';
    const insuranceProvider = formData.get('insuranceProvider') as string;
    const policyNumber = formData.get('policyNumber') as string;
    const insuranceExpiry = formData.get('insuranceExpiry') as string;
    const signature = formData.get('signature') as string;
    const agreedToTermsAt = formData.get('agreedToTermsAt') as string;
    const insuranceFile = formData.get('insuranceFile') as File | null;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !address || !city || !postalCode) {
      return NextResponse.json({ error: 'All personal information fields are required' }, { status: 400 });
    }
    if (!emergencyContact || !emergencyPhone) {
      return NextResponse.json({ error: 'Emergency contact information is required' }, { status: 400 });
    }
    if (!skills || skills.length === 0) {
      return NextResponse.json({ error: 'At least one service skill is required' }, { status: 400 });
    }
    if (!insuranceProvider || !policyNumber || !insuranceExpiry) {
      return NextResponse.json({ error: 'Insurance information is required' }, { status: 400 });
    }
    if (!insuranceFile) {
      return NextResponse.json({ error: 'Insurance proof document is required' }, { status: 400 });
    }
    if (!signature) {
      return NextResponse.json({ error: 'Digital signature is required' }, { status: 400 });
    }
    if (!agreedToTermsAt) {
      return NextResponse.json({ error: 'Terms & Conditions acceptance is required' }, { status: 400 });
    }

    // Validate email format
    if (!email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Validate insurance not expired
    if (new Date(insuranceExpiry) < new Date()) {
      return NextResponse.json({ error: 'Insurance must not be expired' }, { status: 400 });
    }

    // Validate file size (10MB)
    if (insuranceFile.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Insurance file must be under 10MB' }, { status: 400 });
    }

    // Check for existing application or user with same email
    const allUsers = await db.users.getAll();
    const existingUser = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists. Please log in instead.' }, { status: 409 });
    }

    const allApps = await db.contractorApplications.getAll();
    const existingApp = allApps.find(
      a => a.email.toLowerCase() === email.toLowerCase() && a.status === 'pending'
    );
    if (existingApp) {
      return NextResponse.json({ error: 'You already have a pending application. We will review it within 1-2 business days.' }, { status: 409 });
    }

    // Convert insurance file to base64
    const fileBuffer = await insuranceFile.arrayBuffer();
    const base64File = Buffer.from(fileBuffer).toString('base64');

    // Create application record
    const application: ContractorApplication = {
      id: Math.random().toString(36).substr(2, 9),
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      postalCode,
      emergencyContact,
      emergencyPhone,
      skills,
      experience,
      hasOwnEquipment,
      vehicleType,
      insuranceProvider,
      policyNumber,
      insuranceExpiry,
      insuranceFileName: insuranceFile.name,
      insuranceFileData: base64File,
      agreedToTermsAt,
      signature,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    await db.contractorApplications.create(application);

    console.log(`📋 New contractor application from ${firstName} ${lastName} (${email})`);

    // Send confirmation email to the contractor (non-blocking)
    const skillsList = (skills as string[]).map((s: string) => `• ${s}`).join('\n');
    EmailService.send({
      to: email,
      subject: 'Application Received – ExcelPro Washers',
      html: `
        <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
          <div style="background:linear-gradient(135deg,#1e40af,#3b82f6);padding:32px;text-align:center">
            <h1 style="color:#ffffff;margin:0;font-size:24px">Welcome to ExcelPro Washers</h1>
            <p style="color:#bfdbfe;margin:8px 0 0;font-size:14px">Contractor Application Confirmation</p>
          </div>
          <div style="padding:32px">
            <p style="color:#111827;font-size:16px;margin:0 0 16px">Hi ${firstName},</p>
            <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px">
              Thank you for applying to join the <strong>ExcelPro Washers</strong> contractor team! We've received your application and it is currently under review.
            </p>
            <div style="background:#f0f9ff;border-left:4px solid #3b82f6;padding:16px;border-radius:0 8px 8px 0;margin:0 0 20px">
              <p style="color:#1e40af;font-weight:600;margin:0 0 8px;font-size:14px">APPLICATION DETAILS</p>
              <p style="color:#374151;font-size:14px;margin:0;line-height:1.8">
                <strong>Name:</strong> ${firstName} ${lastName}<br/>
                <strong>Email:</strong> ${email}<br/>
                <strong>Phone:</strong> ${phone}<br/>
                <strong>City:</strong> ${city}<br/>
                <strong>Experience:</strong> ${experience}<br/>
                <strong>Application ID:</strong> ${application.id}
              </p>
            </div>
            <div style="background:#f9fafb;padding:16px;border-radius:8px;margin:0 0 20px">
              <p style="color:#1e40af;font-weight:600;margin:0 0 4px;font-size:14px">YOUR SKILLS</p>
              <p style="color:#374151;font-size:14px;margin:0;white-space:pre-line">${skillsList}</p>
            </div>
            <h3 style="color:#111827;font-size:16px;margin:0 0 12px">What happens next?</h3>
            <ol style="color:#374151;font-size:14px;line-height:1.8;margin:0 0 20px;padding-left:20px">
              <li>Our team will review your application within <strong>1–2 business days</strong>.</li>
              <li>If approved, you'll receive login credentials for your contractor dashboard.</li>
              <li>You'll be able to view and accept jobs in your area right away.</li>
            </ol>
            <p style="color:#374151;font-size:14px;line-height:1.6;margin:0">
              If you have any questions in the meantime, reply to this email or call us at <strong>${process.env.OWNER_PHONE_NUMBER || '(613) 900-9525'}</strong>.
            </p>
          </div>
          <div style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb">
            <p style="color:#6b7280;font-size:12px;margin:0">© ${new Date().getFullYear()} ExcelPro Washers · Ottawa, ON</p>
          </div>
        </div>
      `,
    }).catch((err) => console.error('Failed to send contractor confirmation email:', err));

    // Notify admin of new application (non-blocking)
    const adminEmail = process.env.ADMIN_EMAIL || 'neal.everything.ai@gmail.com';
    EmailService.send({
      to: adminEmail,
      subject: `New Contractor Application – ${firstName} ${lastName}`,
      html: `
        <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#1e40af">New Contractor Application</h2>
          <p><strong>${firstName} ${lastName}</strong> just submitted a contractor application.</p>
          <ul style="line-height:1.8;color:#374151">
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Phone:</strong> ${phone}</li>
            <li><strong>City:</strong> ${city}</li>
            <li><strong>Experience:</strong> ${experience}</li>
            <li><strong>Skills:</strong> ${(skills as string[]).join(', ')}</li>
            <li><strong>Has Insurance:</strong> ${insuranceFile ? 'Yes (file attached)' : 'No'}</li>
            <li><strong>Application ID:</strong> ${application.id}</li>
          </ul>
          <p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.excelprowashers.com'}/admin/dashboard/requests"
               style="display:inline-block;background:#1e40af;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600">
              Review Application →
            </a>
          </p>
        </div>
      `,
    }).catch((err) => console.error('Failed to send admin notification email:', err));

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully. We will review it within 1-2 business days.',
      applicationId: application.id,
    });
  } catch (error) {
    console.error('Contractor registration error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
