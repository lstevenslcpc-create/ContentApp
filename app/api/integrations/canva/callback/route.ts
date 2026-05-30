import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "prepared",
    message: "Canva OAuth callback placeholder is installed. Token exchange should be enabled only after official Canva app credentials and secure token encryption are configured."
  });
}
