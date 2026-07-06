import { NextRequest, NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: { code: "MISSING_FILE", message: "Image file is required" } },
        { status: 400 },
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_FILE",
            message: "Only image files are allowed",
          },
        },
        { status: 422 },
      );
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        {
          error: {
            code: "FILE_TOO_LARGE",
            message: "Image must be 5MB or smaller",
          },
        },
        { status: 422 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary under the "games" folder
    const uploadResult = await uploadImage(buffer, "games");

    return NextResponse.json(
      {
        data: {
          url: uploadResult.url,
          publicId: uploadResult.publicId,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Cloudinary upload route error:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Image upload failed" } },
      { status: 500 },
    );
  }
}
