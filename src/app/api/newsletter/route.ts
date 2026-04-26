import { NextRequest, NextResponse } from "next/server"

// POST /api/newsletter - Subscribe to newsletter (mock implementation)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      )
    }

    // Mock implementation - in production this would integrate with an email service
    // e.g., Mailchimp, SendGrid, ConvertKit, etc.
    console.log(`Newsletter subscription: ${email}`)

    return NextResponse.json(
      { message: "Successfully subscribed to newsletter" },
      { status: 201 }
    )
  } catch (error) {
    console.error("Newsletter subscription error:", error)
    return NextResponse.json(
      { error: "Subscription failed" },
      { status: 500 }
    )
  }
}
