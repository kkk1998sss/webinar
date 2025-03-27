import Twilio from 'twilio';

const twilioClient = Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendOTP(phoneNumber: string, otp: string) {
  // Ensure phone number is in E.164 format
  if (!phoneNumber.startsWith('+')) {
    throw new Error('Phone number must be in E.164 format, e.g., +1234567890');
  }

  try {
    return await twilioClient.messages.create({
      body: `Your OTP code is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new Error('Failed to send OTP. Please check the phone number.');
  }
}

// import Twilio from 'twilio';

// const twilioClient = Twilio(
//   process.env.TWILIO_ACCOUNT_SID,
//   process.env.TWILIO_AUTH_TOKEN
// );
// const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID || ""; // Twilio Verify Service SID

// // ✅ Send OTP function
// export async function sendOTP(phoneNumber: string, otp: string) {
//   if (!phoneNumber.startsWith('+')) {
//     throw new Error(
//       'Phone number must be in E.164 format, e.g., +919876543210'
//     );
//   }

//   try {
//     const verification = await twilioClient.verify.v2
//       .services(serviceSid)
//       .verifications.create({ to: phoneNumber, channel: 'sms' });

//     return verification.status; // "pending" if OTP was sent
//   } catch (error: any) {
//     console.error('Error sending OTP:', error?.message || error);
//     throw new Error('Failed to send OTP. Please check the phone number.');
//   }
// }

// // ✅ Verify OTP function
// export async function verifyOTP(phoneNumber: string, code: string) {
//   if (!phoneNumber.startsWith('+')) {
//     throw new Error(
//       'Phone number must be in E.164 format, e.g., +919876543210'
//     );
//   }

//   try {
//     const verificationCheck = await twilioClient.verify.v2
//       .services(serviceSid)
//       .verificationChecks.create({ to: phoneNumber, code });

//     return verificationCheck.status; // "approved" if OTP is correct
//   } catch (error: any) {
//     console.error('Error verifying OTP:', error?.message || error);
//     throw new Error('Invalid OTP. Please try again.');
//   }
// }
