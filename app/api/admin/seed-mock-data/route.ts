import { NextResponse } from "next/server";
import { prisma, mapGameToResponse } from "@/lib/prisma";

type SeedGame = {
  title: string;
  description: string;
  category: string;
  price_naira: number;
  image_url: string;
  download_url: string;
  system_requirements: string;
  rating: number;
  is_published: boolean;
};

const SEED_GAMES: SeedGame[] = [
  {
    title: "EA FC 25",
    description: "Latest football simulation with updated squads and leagues.",
    category: "Sports",
    price_naira: 18500,
    image_url: "https://images.unsplash.com/photo-1517466787929-bc90951d0974",
    download_url: "https://example.com/download/fc25",
    system_requirements: "Intel i5, 8GB RAM, GTX 1050, 80GB storage",
    rating: 4.7,
    is_published: true,
  },
  {
    title: "Mortal Kombat 1",
    description: "Story-driven fighting game with online ranked matches.",
    category: "Action",
    price_naira: 22000,
    image_url: "https://images.unsplash.com/photo-1542751371-adc38448a05e",
    download_url: "https://example.com/download/mk1",
    system_requirements: "Intel i7, 16GB RAM, RTX 2060, 100GB storage",
    rating: 4.5,
    is_published: true,
  },
  {
    title: "Need for Speed Heat",
    description:
      "Open-world street racing with daytime events and night pursuits.",
    category: "Racing",
    price_naira: 14000,
    image_url: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8",
    download_url: "https://example.com/download/nfs-heat",
    system_requirements: "Intel i5, 8GB RAM, GTX 1060, 60GB storage",
    rating: 4.3,
    is_published: true,
  },
  {
    title: "WWE 2K24",
    description: "Pro wrestling sim featuring major arenas and roster updates.",
    category: "Sports",
    price_naira: 17000,
    image_url: "https://images.unsplash.com/photo-1598550476439-6847785fcea6",
    download_url: "https://example.com/download/wwe2k24",
    system_requirements: "Intel i5, 8GB RAM, GTX 1650, 90GB storage",
    rating: 4.4,
    is_published: true,
  },
  {
    title: "Cyberpunk 2077",
    description: "Open-world RPG set in Night City with deep progression.",
    category: "RPG",
    price_naira: 21000,
    image_url: "https://images.unsplash.com/photo-1486572788966-cfd3df1f5b42",
    download_url: "https://example.com/download/cyberpunk",
    system_requirements: "Intel i7, 16GB RAM, RTX 3060, 120GB storage",
    rating: 4.6,
    is_published: true,
  },
];

export async function POST() {
  try {
    let inserted = 0;
    let skipped = 0;

    for (const game of SEED_GAMES) {
      const existing = await prisma.game.findFirst({
        where: {
          title: {
            equals: game.title,
            mode: "insensitive",
          },
          OR: [ { deletedAt: null }, { deletedAt: { isSet: false } } ],
        },
      });

      if (existing) {
        skipped += 1;
        continue;
      }

      await prisma.game.create({
        data: {
          title: game.title,
          description: game.description,
          category: game.category,
          priceNaira: game.price_naira,
          coverImageUrl: game.image_url,
          downloadLink: game.download_url,
          systemRequirementsCpu: game.system_requirements,
          rating: game.rating,
          isPublished: game.is_published,
        },
      });

      inserted += 1;
    }

    return NextResponse.json({
      data: {
        total: SEED_GAMES.length,
        inserted,
        skipped,
      },
    });
  } catch (error) {
    console.error("Mock data seeding error:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Mock data seeding failed" } },
      { status: 500 },
    );
  }
}
