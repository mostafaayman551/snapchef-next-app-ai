import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";


/**
 * @method POST
 * @route ~/api/ai
 * @description analyze image
 * @summary accepts an image file, analyzes it using AI, and returns a recipe or description
 * @access public
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File;
    if (!imageFile) {
      return NextResponse.json(
        { message: "Image file is required" },
        { status: 400 }
      );
    }
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");
    const mimeType = imageFile.type;

    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image. If it shows food, a meal, ingredients, or anything cookable, provide a detailed recipe using EXACTLY this format:\nTITLE:\n [Recipe name here]\nCOOKING_TIME:\n [Estimated total time, e.g. '30 minutes', '1 hour 15 minutes'. Include prep and cook time.]\nINGREDIENTS:\n [List ingredients with quantities]\nSTEPS:\n [List numbered cooking steps]\nIf the image is not food-related, simply describe what you see and suggest uploading a food image instead.",
            },
            {
              type: "image",
              image: `data:${mimeType};base64,${base64Image}`,
            },
          ],
        },
      ],
    });
    return NextResponse.json({ text }, { status: 200 });
  } catch (error) {
    console.error("AI route error:", error);
    return NextResponse.json(
      { message: "internal server error" },
      { status: 500 }
    );
  }
}
