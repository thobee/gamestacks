import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type CsvGameRow = {
  title: string;
  description: string;
  category: string;
  price_naira: number;
  image_url?: string;
  download_url?: string;
  system_requirements?: string;
  is_published?: boolean;
};

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === "," && !inQuotes) {
      out.push(cur.trim());
      cur = "";
      continue;
    }

    cur += ch;
  }

  out.push(cur.trim());
  return out;
}

function toBool(v: string | undefined): boolean {
  if (!v) return false;
  return ["1", "true", "yes", "y"].includes(v.toLowerCase());
}

function normalizeRow(headers: string[], values: string[]): CsvGameRow | null {
  const rec: Record<string, string> = {};
  headers.forEach((h, idx) => {
    rec[h] = values[idx] ?? "";
  });

  const title = (rec.title || "").trim();
  const description = (rec.description || "").trim();
  const category = (rec.category || "").trim();
  const priceRaw = (rec.price_naira || "").trim();
  const price = Number(priceRaw);

  if (
    !title ||
    !description ||
    !category ||
    !Number.isFinite(price) ||
    price < 0
  ) {
    return null;
  }

  return {
    title,
    description,
    category,
    price_naira: price,
    image_url: rec.image_url?.trim() || undefined,
    download_url: rec.download_url?.trim() || undefined,
    system_requirements: rec.system_requirements?.trim() || undefined,
    is_published: toBool(rec.is_published),
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: { code: "MISSING_FILE", message: "CSV file is required" } },
        { status: 400 },
      );
    }

    if (!file.name.toLowerCase().endsWith(".csv") && file.type !== "text/csv") {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_FILE",
            message: "Only CSV files are allowed",
          },
        },
        { status: 422 },
      );
    }

    const text = await file.text();
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_CSV",
            message: "CSV must include header and at least one data row",
          },
        },
        { status: 422 },
      );
    }

    const headers = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
    const required = ["title", "description", "category", "price_naira"];
    const missingHeaders = required.filter((h) => !headers.includes(h));

    if (missingHeaders.length) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_CSV_HEADERS",
            message: `Missing required headers: ${missingHeaders.join(", ")}`,
          },
        },
        { status: 422 },
      );
    }

    let inserted = 0;
    let skipped = 0;
    const errors: Array<{ row: number; message: string }> = [];

    for (let i = 1; i < lines.length; i += 1) {
      const rowNum = i + 1;
      const values = parseCsvLine(lines[i]);
      const row = normalizeRow(headers, values);

      if (!row) {
        skipped += 1;
        errors.push({
          row: rowNum,
          message: "Invalid required fields or price",
        });
        continue;
      }

      try {
        // Check if game already exists in MongoDB
        const existing = await prisma.game.findFirst({
          where: {
            title: {
              equals: row.title,
              mode: "insensitive",
            },
            OR: [ { deletedAt: null }, { deletedAt: { isSet: false } } ],
          },
        });

        if (existing) {
          skipped += 1;
          continue;
        }

        // Insert game using Prisma
        await prisma.game.create({
          data: {
            title: row.title,
            description: row.description,
            category: row.category,
            priceNaira: row.price_naira,
            coverImageUrl: row.image_url || null,
            downloadLink: row.download_url || null,
            systemRequirementsCpu: row.system_requirements || null,
            isPublished: !!row.is_published,
          },
        });

        inserted += 1;
      } catch (err: any) {
        skipped += 1;
        errors.push({ row: rowNum, message: err.message || "Failed to insert" });
      }
    }

    return NextResponse.json({
      data: {
        totalRows: lines.length - 1,
        inserted,
        skipped,
        errors,
      },
    });
  } catch (error) {
    console.error("CSV import API error:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "CSV import failed" } },
      { status: 500 },
    );
  }
}
