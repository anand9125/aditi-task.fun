import { NextRequest, NextResponse } from "next/server";
import  prisma  from "@/lib/prisma";

// ASSIGN permissions to a role
export async function POST(req: NextRequest, context: any) {
  try {
    const roleId = context.params.id;

    const { permissionIds } = await req.json();

    if (!Array.isArray(permissionIds)) {
      return NextResponse.json(
        { message: "permissionIds must be an array" },
        { status: 400 }
      );
    }

    await prisma.rolePermission.createMany({
      data: permissionIds.map((pid: string) => ({
        roleId,
        permissionId: pid,
      })),
      skipDuplicates: true,
    });

    return NextResponse.json(
      { message: "Permissions assigned to role" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to assign permissions" },
      { status: 500 }
    );
  }
}

// GET permissions of a role
export async function GET(_req: NextRequest, context: any) {
  try {
    const roleId = context.params.id;

    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      return NextResponse.json(
        { message: "Role not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        id: role.id,
        name: role.name,
        permissions: role.permissions.map((rp) => rp.permission),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch role permissions" },
      { status: 500 }
    );
  }
}
