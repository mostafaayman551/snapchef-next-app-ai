"use client";
import { useCallback, useState } from "react";
import { Loader2, Camera, Save, CheckCircle, AlertCircle, ChefHat, UtensilsCrossed, ListOrdered, Clock, AlertTriangle } from "lucide-react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { saveRecipe } from "@/store/slices/recipeSlice";
import { toast } from "react-toastify";
import RecipeTextRenderer from "@/components/RecipeTextRenderer";

// --- Pure helpers (module-level, stable, no re-creation on render) ---
const FILLER_WORDS = new Set([
  "classic","traditional","easy","quick","simple","best","perfect","original",
  "homemade","authentic","style","recipe","dish","the","a","an","and","with",
  "italian","french","american","chinese","indian","mexican","thai","japanese",
  "greek","spanish","mediterranean","asian","middle","eastern","western","rich",
  "creamy","crispy","roasted","baked","fried","grilled","slow","cooked","fresh",
]);

const getKeywords = (title: string): Set<string> =>
  new Set(
    title.toLowerCase().trim().split(/\s+/)
      .filter((w) => w.length > 2 && !FILLER_WORDS.has(w))
  );

const isSimilarTitle = (a_title: string, b_title: string): boolean => {
  const a = getKeywords(a_title);
  const b = getKeywords(b_title);
  if (a.size === 0 || b.size === 0) {
    return a_title.toLowerCase().includes(b_title.toLowerCase()) ||
           b_title.toLowerCase().includes(a_title.toLowerCase());
  }
  let overlap = 0;
  for (const word of a) { if (b.has(word)) overlap++; }
  return (overlap / Math.min(a.size, b.size)) >= 0.6;
};
// -------------------------------------------------------------------

interface Recipe {
  title: string;
  cookingTime: string;
  ingredients: string;
  steps: string;
}

const ImageUploader = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { savedRecipes } = useSelector((state: RootState) => state.recipes);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [aiResponse, setAiResponse] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [savedRecipe, setSavedRecipe] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [duplicateTitle, setDuplicateTitle] = useState<string>("");

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
  const analyzeImageFile = useCallback(async (file: File) => {
    setIsAnalyzing(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/ai", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Error response from server:", data);
        throw new Error(data.message || "Server error");
      }

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
  }, []);

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
      .split(/(?:\n)?(?:TITLE:|COOKING_TIME:|INGREDIENTS:|STEPS:)/)
      .map((s) => s.trim());

    // Handle both old format (no COOKING_TIME) and new format
    if (text.includes("COOKING_TIME:")) {
      const [, title, cookingTime, ingredients, steps] = parts;
      return { title, cookingTime, ingredients, steps };
    }
    const [, title, ingredients, steps] = parts;
    return { title, cookingTime: "", ingredients, steps };
  };

  const resetUploader = useCallback(() => {
    setSelectedFile(null);
    setSavedRecipe(null);
    setPreviewUrl(null);
    setRecipe(null);
    setAiResponse("");
    setError("");
    setShowDuplicateWarning(false);
    setDuplicateTitle("");
  }, []);

  const doSave = useCallback(async () => {
    if (!recipe || !selectedFile) return;
    setIsSaving(true);
    setError("");
    setShowDuplicateWarning(false);
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
  }, [dispatch, recipe, selectedFile, resetUploader]);

  // Words to ignore when comparing titles (cuisine styles, common adjectives, stopwords)
  const saveRecipeHandler = useCallback(() => {
    if (!recipe) return;
    const duplicate = (savedRecipes as any[]).find(
      (r) => isSimilarTitle(recipe.title, r.title)
    );
    if (duplicate) {
      setDuplicateTitle(duplicate.title);
      setShowDuplicateWarning(true);
      return;
    }
    doSave();
  }, [recipe, savedRecipes, doSave]);


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
        <div className="mt-4">
          {recipe ? (
            <div className="space-y-5">
              {/* Recipe Title */}
              <div className="bg-gradient-to-r from-orange/10 to-primary/20 rounded-xl p-5 text-center border border-orange/20">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <ChefHat size={22} className="text-orange" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-orange">AI Recipe Result</span>
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 leading-tight">
                  {recipe.title}
                </h2>
                <p className="text-gray-500 text-sm mt-1">A delicious recipe crafted just for you</p>
              </div>

              {/* Ingredients + Steps Grid */}
              <div className="grid lg:grid-cols-2 gap-4">
                {/* Ingredients */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="flex items-center gap-2 bg-green-50 border-b border-green-100 px-4 py-3">
                    <UtensilsCrossed size={16} className="text-green-600" />
                    <h3 className="font-semibold text-green-800 text-sm">Ingredients</h3>
                  </div>
                  <div className="p-4 max-h-72 overflow-y-auto">
                    <RecipeTextRenderer text={recipe.ingredients} />
                  </div>
                </div>

                {/* Steps */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="flex items-center gap-2 bg-blue-50 border-b border-blue-100 px-4 py-3">
                    <ListOrdered size={16} className="text-blue-600" />
                    <h3 className="font-semibold text-blue-800 text-sm">Steps</h3>
                  </div>
                  <div className="p-4 max-h-72 overflow-y-auto">
                    <RecipeTextRenderer text={recipe.steps} />
                  </div>
                </div>
              </div>

              {/* Cooking Time Badge */}
              {recipe.cookingTime && (
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <Clock size={14} className="text-orange" />
                  <span className="text-sm text-orange font-semibold">{recipe.cookingTime}</span>
                </div>
              )}

              {/* Duplicate Warning */}
              {showDuplicateWarning && (
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-amber-800 text-sm">Already saved!</p>
                      <p className="text-amber-700 text-sm mt-1">
                        You already have &quot;<span className="font-semibold">{duplicateTitle}</span>&quot; in your recipes. Save this version too?
                      </p>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={doSave}
                          disabled={isSaving}
                          className="bg-orange text-white text-sm px-4 py-1.5 rounded-lg font-semibold hover:bg-orange/90 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isSaving ? "Saving..." : "Save Anyway"}
                        </button>
                        <button
                          onClick={() => setShowDuplicateWarning(false)}
                          className="bg-white border border-gray-200 text-gray-600 text-sm px-4 py-1.5 rounded-lg font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {!savedRecipe ? (
                  <button
                    onClick={saveRecipeHandler}
                    disabled={isSaving}
                    className="flex-1 bg-orange text-white py-3 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-orange/90 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    {isSaving ? (
                      <><Loader2 className="animate-spin" size={18} /><span>Saving...</span></>
                    ) : (
                      <><Save size={18} /><span>Save Recipe</span></>
                    )}
                  </button>
                ) : (
                  <div className="flex-1 bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-center gap-2">
                    <CheckCircle className="text-green-600" size={20} />
                    <span className="text-green-800 font-semibold">Recipe Saved!</span>
                  </div>
                )}
                <button
                  onClick={resetUploader}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200 cursor-pointer"
                >
                  Try Another Image
                </button>
              </div>
            </div>
          ) : (
            /* Non-food image result */
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-800 mb-2">AI Analysis Result</h3>
                  <p className="text-amber-700 text-sm leading-relaxed">{aiResponse}</p>
                  <button
                    onClick={resetUploader}
                    className="mt-4 bg-orange text-white py-2 px-5 rounded-lg text-sm font-semibold hover:bg-orange/80 transition-colors duration-200 cursor-pointer"
                  >
                    Try a Food Image
                  </button>
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
