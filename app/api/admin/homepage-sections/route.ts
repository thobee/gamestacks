import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all sections (for admin page)
export async function GET() {
  try {
    const sections = await prisma.homepageSection.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ data: sections });
  } catch (error) {
    console.error("Admin homepage sections GET error:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Internal server error" } },
      { status: 500 },
    );
  }
}

// PUT — bulk update section visibility and order
// Body: { sections: Array<{ id, isVisible, order }> }
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sections } = body as {
      sections: Array<{ id: string; isVisible: boolean; order: number }>;
    };

    if (!Array.isArray(sections)) {
      return NextResponse.json(
        { error: { code: "INVALID_BODY", message: "sections must be an array" } },
        { status: 400 },
      );
    }

    // Run all updates in parallel
    await Promise.all(
      sections.map((s) =>
        prisma.homepageSection.update({
          where: { id: s.id },
          data: { isVisible: s.isVisible, order: s.order },
        }),
      ),
    );

    const updated = await prisma.homepageSection.findMany({
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ data: updated, message: "Sections updated successfully" });
  } catch (error) {
    console.error("Admin homepage sections PUT error:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Internal server error" } },
      { status: 500 },
    );
  }
}
