import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, hashPassword, getTokenFromHeader, verifyToken } from "@/lib/auth";

export async function PUT(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { currentPassword, newPassword, name } = body;

    // Fetch the current user from DB
    const user = await db.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updates: { name?: string; password?: string } = {};
    const changes: string[] = [];

    // Handle name/username change
    if (name !== undefined && name !== null && name.trim() !== "") {
      const trimmedName = name.trim();
      if (trimmedName.length < 2) {
        return NextResponse.json(
          { error: "Name must be at least 2 characters" },
          { status: 400 }
        );
      }
      if (trimmedName.length > 100) {
        return NextResponse.json(
          { error: "Name must be under 100 characters" },
          { status: 400 }
        );
      }
      updates.name = trimmedName;
      changes.push("name");
    }

    // Handle password change
    if (newPassword !== undefined && newPassword !== null && newPassword !== "") {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required to set a new password" },
          { status: 400 }
        );
      }

      if (newPassword.length < 8) {
        return NextResponse.json(
          { error: "New password must be at least 8 characters" },
          { status: 400 }
        );
      }

      if (newPassword.length > 128) {
        return NextResponse.json(
          { error: "New password must be under 128 characters" },
          { status: 400 }
        );
      }

      // Verify current password
      if (!user.password) {
        return NextResponse.json(
          { error: "No password set for this account. Contact support." },
          { status: 400 }
        );
      }

      const isValid = await verifyPassword(currentPassword, user.password);
      if (!isValid) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 401 }
        );
      }

      updates.password = await hashPassword(newPassword);
      changes.push("password");
    }

    // If nothing to update
    if (changes.length === 0) {
      return NextResponse.json(
        { error: "No changes provided" },
        { status: 400 }
      );
    }

    // Apply updates
    await db.user.update({
      where: { id: payload.userId },
      data: updates,
    });

    return NextResponse.json({
      message: `Account updated: ${changes.join(", ")}`,
      updatedFields: changes,
    });
  } catch (error) {
    console.error("Account update error:", error);
    return NextResponse.json(
      { error: "Failed to update account" },
      { status: 500 }
    );
  }
}
