"use client";
import { useState } from "react";
import { Loader2, Camera, Save, CheckCircle, AlertCircle } from "lucide-react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { saveRecipe } from "@/store/slices/recipeSlice";
import { toast } from "react-toastify";
interface Recipe {
  title: string;
  ingredients: string;
  steps: string;
}

const ImageUploader = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [aiResponse, setAiResponse] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [savedRecipe, setSavedRecipe] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setError("");
        setRecipe(null);
        setAiResponse("");
        analyzeImageFile(file);
      } else {
        setError("Please select an image file.");
      }
    }
  };
  const analyzeImageFile = async (file: File) => {
    setIsAnalyzing(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/ai", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response from server:", errorText);
      }

      const data = await response.json();

      const recipeText = data.text;

      setAiResponse(recipeText);
      if (isRecipeContent(recipeText)) {
        const parsedRecipe = parseRecipeText(recipeText);
        setRecipe(parsedRecipe);
      } else {
        console.log("Not detected as recipe content");
      }
    } catch (error) {
      setError(`Failed to analyze image: ${error}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const isRecipeContent = (text: string): boolean => {
    return (
      text.includes("TITLE:") &&
      text.includes("INGREDIENTS:") &&
      text.includes("STEPS:")
    );
  };
  const parseRecipeText = (text: string): Recipe => {
    const cleanData = text.replace(/^AI response:\s*/i, "");
    const parts = cleanData
      .split(/(?:\n)?(?:TITLE:|INGREDIENTS:|STEPS:)/)
      .map((s) => s.trim());
    const [_, title, ingredients, steps] = parts;
    return {
      title,
      ingredients,
      steps,
    };
  };

  const resetUploader = () => {
    setSelectedFile(null);
    setSavedRecipe(null);
    setPreviewUrl(null);
    setRecipe(null);
    setAiResponse("");
    setError("");
  };

  const saveRecipeHandler = async () => {
    if (!recipe || !selectedFile) return;
    setIsSaving(true);
    setError("");
    try {
      const resultAction: any = await dispatch(
        saveRecipe({
          title: recipe.title,
          ingredients: recipe.ingredients,
          steps: recipe.steps,
        })
      ).unwrap();
      toast.success(resultAction.message);
      setSavedRecipe(resultAction.recipe);
      resetUploader();
    } catch (error) {
      toast.error(error as string);
      setError(error as string);
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <div className="w-full mx-auto shadow-lg overflow-hidden bg-white rounded-xl p-6">
      <div>
        <label htmlFor="image-upload" className="block">
          <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300">
            {previewUrl ? (
              <div className="space-y-4">
                <Image
                  src={previewUrl}
                  alt="uploaded food"
                  className="mx-auto rounded-lg object-cover shadow-md"
                  width={250}
                  height={250}
                />
                {!isAnalyzing && (
                  <p className="text-sm text-gray-600">
                    Click to upload a different image
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <Camera size={64} className="mx-auto text-primary" />
                <div>
                  <p className="text-xl font-medium text-gray-900">
                    Upload Any Food Image
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Our AI will analyze it and create a recipe for you
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF up to 10 MB
                  </p>
                </div>
              </div>
            )}
          </div>
        </label>
        <input
          type="file"
          id="image-upload"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>
      {isAnalyzing && (
        <div className="px-6 pb-6 mt-2">
          <div className="bg-blue-50 rounded-lg p-6 text-center">
            <Loader2
              className="animate-spin mx-auto mb-4 text-primary"
              size={32}
            />
            <p className="">Analyzing your image...</p>
            <p className="">
              Our AI is identifying the dish and creating a recipe
            </p>
          </div>
        </div>
      )}
      {error && (
        <div className="px-6 pb-6 mt-2 max-w-md mx-auto">
          <div className="bg-red-50 border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="text-red-600 font-medium">Error occurred:</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* AI response */}
      {aiResponse && !isAnalyzing && (
        <div className="bg-gray-50 mt-2">
          {recipe ? (
            <div className="p-6 space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {recipe.title}
                </h2>
                <p className="text-gray-600">
                  A delicious recipe idea for you.
                </p>
              </div>
              <div className="grid lg:grid-cols-2 gap-8">
                <details className="bg-white rounded-lg p-6 shadow-sm">
                  <summary className="p-2 text-xl font-semibold text-gray-800 mb-4 flex items-center bg-green-50 cursor-pointer">
                    Ingredients
                  </summary>
                  <div className="max-w-none border-gray-200 border p-2">
                    <pre className="whitespace-pre-wrap text-gray-700 text-sm font-sans leading-relaxed">
                      {recipe.ingredients}
                    </pre>
                  </div>
                </details>
                <details className="bg-white rounded-lg p-6 shadow-sm">
                  <summary className="p-2 text-xl font-semibold text-gray-800 mb-4 flex items-center bg-green-50 cursor-pointer">
                    Steps
                  </summary>
                  <div className="max-w-none border-gray-200 border p-2">
                    <pre className="whitespace-pre-wrap text-gray-700 text-sm font-sans leading-relaxed">
                      {recipe.steps}
                    </pre>
                  </div>
                </details>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {!savedRecipe ? (
                  <button
                    onClick={saveRecipeHandler}
                    disabled={isSaving}
                    className="flex-1 bg-orange text-white py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center hover:bg-orange/90 space-x-4 cursor-pointer transition-colors"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="" size={20} />
                        <span>Save Recipe</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-center space-x-2">
                    <CheckCircle className="text-green-600" size={20} />
                    <span className="text-green-800 font-medium">
                      Recipe Saved!
                    </span>
                  </div>
                )}
                <button
                  onClick={resetUploader}
                  className="flex-1 bg-gray-400 hover:bg-gray-300 text-gray-800 py-3 px-6 rounded-lg transition-colors cursor-pointer"
                >
                  Try Another Image
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="bg-yellow-50 border-yellow-200 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle
                    className="text-yellow-600 shrink-0 mt-1"
                    size={20}
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-yellow-800 mb-2">
                      AI Analysis Result
                    </h3>
                    <div className="text-yellow-700 max-w-none">
                      <pre className="whitespace-pre-wrap font-sans">
                        {aiResponse}
                      </pre>
                    </div>
                    <button
                      onClick={resetUploader}
                      className="mt-4 bg-orange text-white py-2 px-4 rounded-lg hover:bg-orange/80 transition-colors duration-300"
                    >
                      Try a Food Image
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
