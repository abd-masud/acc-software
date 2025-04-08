import { NextRequest, NextResponse } from "next/server";
import { connectionToDatabase } from "@/util/db";
import nodemailer from "nodemailer";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    // Extract email from the request body
    const { email } = await req.json();

    // Check if the email is provided
    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const db = await connectionToDatabase();

    // Check if the user exists in the database
    const [rows] = await db.query("SELECT * FROM user WHERE email = ?", [email]);
    if (!Array.isArray(rows) || rows.length == 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Generate a 6-digit OTP and set its expiration time (2 minutes)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 2 * 60 * 1000);
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    // Store the OTP and expiration in the database
    await db.query("UPDATE user SET otp = ?, otp_expires_at = ? WHERE email = ?", [
      otpHash,
      otpExpiresAt,
      email,
    ]);

    // Set up the email transporter using nodemailer
    const transporter = nodemailer.createTransport({
      host: 'premium900.web-hosting.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send the OTP email to the user
    await transporter.sendMail({
      from: `Copa Accounting <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      html: `
        <h1>Hi, Welcome to Copa Accounting!</h1>
        <p><b>OTP:</b> Dear User, your OTP code is <b>${otp}</b>. Please do not share this PIN with anyone.
        <br>It is valid for 2 minutes.</p>
        <p>Best Regards,<br>Copa Accounting</p>
      `,
    });

    // Return success message after sending OTP
    return NextResponse.json({ message: "OTP sent successfully" }, { status: 200 });
  } catch {
    // Return error message if something goes wrong
    return NextResponse.json({ message: "Error sending OTP. Please try again." }, { status: 500 });
  }
}
