import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Default sections — seeded on first request if DB is empty
const DEFAULT_SECTIONS = [
  { key: "featured",       label: "Featured Games",       type: "curated",   isVisible: true,  order: 1 },
  { key: "best-sellers",   label: "Hot Right Now",        type: "automatic", isVisible: true,  order: 2 },
  { key: "new-releases",   label: "New Releases",         type: "automatic", isVisible: true,  order: 3 },
  { key: "discounts",      label: "Ongoing Discounts",    type: "automatic", isVisible: true,  order: 4 },
  { key: "editors-choice", label: "Editor's Choice",      type: "curated",   isVisible: true,  order: 5 },
  { key: "under-10000",    label: "Games Under ₦10,000",  type: "automatic", isVisible: true,  order: 6 },
  { key: "under-20000",    label: "Games Under ₦20,000",  type: "automatic", isVisible: true,  order: 7 },
  { key: "staff-picks",    label: "Staff Picks",          type: "curated",   isVisible: false, order: 8 },
  { key: "weekend-deals",  label: "Weekend Deals",        type: "curated",   isVisible: false, order: 9 },
  { key: "coming-soon",    label: "Coming Soon",          type: "curated",   isVisible: false, order: 10 },
  { key: "top-rated",      label: "Top Rated",            type: "automatic", isVisible: false, order: 11 },
  { key: "under-5000",     label: "Games Under ₦5,000",   type: "automatic", isVisible: false, order: 12 },
];

async function seedIfEmpty() {
  const count = await prisma.homepageSection.count();
  if (count > 0) return;

  // createMany with skipDuplicates is PostgreSQL-only.
  // MongoDB requires individual upserts keyed on the unique field.
  await Promise.all(
    DEFAULT_SECTIONS.map((section) =>
      prisma.homepageSection.upsert({
        where: { key: section.key },
        update: {},
        create: section,
      }),
    ),
  );
}

export async function GET() {
  try {
    await seedIfEmpty();

    const sections = await prisma.homepageSection.findMany({
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ data: sections });
  } catch (error) {
    console.error("Homepage sections GET error:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to load homepage sections" } },
      { status: 500 },
    );
  }
}
