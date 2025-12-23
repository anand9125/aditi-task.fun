import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 🔗 Assign roles to a user
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const { roleIds } = await req.json(); // array of role ids

    if (!Array.isArray(roleIds)) {
      return NextResponse.json(
        { message: "roleIds must be an array" },
        { status: 400 }
      );
    }

    // Remove old roles
    await prisma.userRole.deleteMany({
      where: { userId },
    });

    // Assign new roles
    await prisma.userRole.createMany({
      data: roleIds.map((rid: string) => ({
        userId,
        roleId: rid,
      })),
    });

    return NextResponse.json({ message: "Roles assigned to user" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Failed to assign roles" },
      { status: 500 }
    );
  }
}

// 📄 Get roles of a user
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const roles = user.roles.map((ur) => ur.role);

    return NextResponse.json({
      id: user.id,
      email: user.email,
      roles,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Failed to fetch user roles" },
      { status: 500 }
    );
  }
}
