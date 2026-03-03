import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { ContractorApplication } from '@/lib/types';

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
    const data = await readDb();
    const existingUser = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists. Please log in instead.' }, { status: 409 });
    }

    const existingApp = (data.contractorApplications || []).find(
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

    if (!data.contractorApplications) {
      data.contractorApplications = [];
    }
    data.contractorApplications.push(application);
    await writeDb(data);

    console.log(`📋 New contractor application from ${firstName} ${lastName} (${email})`);

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
