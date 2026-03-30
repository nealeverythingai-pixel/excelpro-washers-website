/**
 * Send an SMS via Twilio to a client or contractor.
 */
export async function sendSMS(to: string, body: string): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_PHONE_NUMBER

  if (!accountSid || !authToken || !from) {
    console.warn('⚠️ Twilio not configured — SMS not sent')
    return
  }

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ To: to, From: from, Body: body }),
      }
    )
    if (!res.ok) {
      console.error('❌ SMS failed:', await res.text())
    } else {
      console.log(`✅ SMS sent to ${to}`)
    }
  } catch (error) {
    console.error('Failed to send SMS:', error)
  }
}
