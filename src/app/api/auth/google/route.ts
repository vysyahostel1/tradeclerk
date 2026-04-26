import { NextRequest, NextResponse } from "next/server";
import { generateToken } from "@/lib/auth";

// Mock Google login - returns a demo user
export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // For demo purposes, find or create user
    const { db } = await import("@/lib/db");
    let user = await db.user.findUnique({ where: { email: email.toLowerCase() } });

    if (!user) {
      user = await db.user.create({
        data: {
          email: email.toLowerCase(),
          name: name || email.split("@")[0],
          isVerified: true,
          image: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=059669&color=fff`,
        },
      });
    }

    const token = await generateToken({ userId: user.id, email: user.email, role: user.role });

    return NextResponse.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, image: user.image },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    return NextResponse.json({ error: "Google authentication failed" }, { status: 500 });
  }
}
