import ImageUploader from "@/components/uploads/ImageUploader";
import { Sparkles } from "lucide-react";
export default function HomePage() {
  return (
    <main className="bg-beige min-h-screen text-text py-28 px-4">
      <div className="mx-auto text-center mb-10">
        <Sparkles className="mx-auto mb-4 text-primary" size={50} />
        <h1 className="text-3xl font-bold text-text mb-4">
          Snap a Pic, Get a Recipe
        </h1>
        <p className="mt-2 max-w-md mx-auto">
          Do not know what to cook? Let our AI chef turn your ingredients into
          delicious meals. Upload a photo of what you have, and get instant
          recipe ideas.
        </p>
      </div>
      <ImageUploader />
    </main>
  );
}
