"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppDispatch, RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import { deleteRecipe, getAllRecipes, updateRecipe } from "@/store/slices/recipeSlice";
import Link from "next/link";
import { Trash2, Search, ChefHat, UtensilsCrossed, ListOrdered, ChevronLeft, ChevronRight, BookOpen, Pencil, X } from "lucide-react";
import { toast } from "react-toastify";
import RecipeTextRenderer from "@/components/RecipeTextRenderer";

const ITEMS_PER_PAGE = 6;

// Moved outside component to avoid re-creation on every render
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center py-20 gap-4">
    <div className="w-10 h-10 border-4 border-orange/30 border-t-orange rounded-full animate-spin" />
    <p className="text-gray-500 text-sm">Loading your recipes...</p>
  </div>
);

const MyRecipesPage = () => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editRecipe, setEditRecipe] = useState<null | { id: string; title: string; ingredients: string; steps: string }>(null);
  const [editForm, setEditForm] = useState({ title: "", ingredients: "", steps: "" });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { savedRecipes, isLoading, error } = useSelector(
    (state: RootState) => state.recipes
  );
  const { user } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (user) dispatch(getAllRecipes());
  }, [dispatch, user]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredRecipes = useMemo(() => {
    if (!searchQuery.trim()) return savedRecipes;
    const q = searchQuery.toLowerCase();
    return savedRecipes.filter(
      (r: any) =>
        r.title?.toLowerCase().includes(q) ||
        r.ingredients?.toLowerCase().includes(q) ||
        r.steps?.toLowerCase().includes(q)
    );
  }, [savedRecipes, searchQuery]);

  const totalPages = Math.ceil(filteredRecipes.length / ITEMS_PER_PAGE);

  const paginatedRecipes = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRecipes.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRecipes, currentPage]);

  const deleteRecipeHandler = useCallback(
    (id: string) => {
      const confirmed = window.confirm("Are you sure you want to delete this recipe?");
      if (!confirmed) return;
      setDeletingId(id);
      dispatch(deleteRecipe(id))
        .unwrap()
        .then(() => toast.success("Recipe deleted successfully"))
        .catch((err) => toast.error(err || "Failed to delete recipe"))
        .finally(() => setDeletingId(null));
    },
    [dispatch]
  );

  const openEditModal = useCallback((recipe: any) => {
    setEditRecipe({ id: recipe.id, title: recipe.title, ingredients: recipe.ingredients, steps: recipe.steps });
    setEditForm({ title: recipe.title, ingredients: recipe.ingredients, steps: recipe.steps });
  }, []);

  const closeEditModal = useCallback(() => {
    setEditRecipe(null);
  }, []);

  const submitEdit = useCallback(async () => {
    if (!editRecipe) return;
    setIsSavingEdit(true);
    try {
      await dispatch(updateRecipe({ id: editRecipe.id, ...editForm })).unwrap();
      toast.success("Recipe updated!");
      closeEditModal();
    } catch (err: any) {
      toast.error(err || "Update failed");
    } finally {
      setIsSavingEdit(false);
    }
  }, [dispatch, editRecipe, editForm, closeEditModal]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const renderContent = () => {
    if (isLoading) return <LoadingSpinner />;

    if (error) {
      return (
        <div className="text-center py-16">
          <p className="text-red-500 font-medium text-lg">{error}</p>
        </div>
      );
    }

    if (savedRecipes.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <ChefHat size={48} className="text-orange/40" />
          <p className="text-gray-500 text-lg font-medium">No recipes saved yet.</p>
          <p className="text-gray-400 text-sm">Upload a food image on the home page to get started!</p>
          <Link
            href="/"
            className="mt-2 bg-orange text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-orange/90 transition-colors"
          >
            Go Snap a Recipe
          </Link>
        </div>
      );
    }

    if (filteredRecipes.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Search size={40} className="text-gray-300" />
          <p className="text-gray-500 font-medium">No recipes match &quot;{searchQuery}&quot;</p>
          <p className="text-gray-400 text-sm">Try searching by dish name or ingredient</p>
        </div>
      );
    }

    return (
      <>
        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {paginatedRecipes.map((recipe: any) => {
            const isExpanded = expandedId === recipe.id;
            const isDeleting = deletingId === recipe.id;
            // Count ingredients lines for quick badge
            const ingredientCount = recipe.ingredients
              ?.split("\n")
              .filter((l: string) => l.trim().startsWith("* ") || l.trim().startsWith("- ")).length || 0;

            return (
              <li
                key={recipe.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-orange/10 to-primary/20 px-5 py-4 border-b border-orange/10">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-bold text-gray-900 leading-snug line-clamp-2 flex-1">
                      {recipe.title}
                    </h2>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                        onClick={() => openEditModal(recipe)}
                        title="Edit recipe"
                      >
                        <Pencil size={15} className="text-blue-500" />
                      </button>
                      <button
                        className="p-2 rounded-xl bg-red-50 hover:bg-red-100 transition-colors cursor-pointer flex-shrink-0"
                        disabled={isDeleting}
                        onClick={() => deleteRecipeHandler(recipe.id)}
                        title="Delete recipe"
                      >
                        {isDeleting ? (
                          <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 size={16} className="text-red-400 hover:text-red-600 transition-colors" />
                        )}
                      </button>
                    </div>
                  </div>
                  {ingredientCount > 0 && (
                    <span className="inline-block mt-2 text-xs bg-white/70 text-orange font-semibold px-2.5 py-1 rounded-full border border-orange/20">
                      {ingredientCount} ingredients
                    </span>
                  )}
                </div>

                {/* Collapsible content */}
                <div className="flex-1">
                  {isExpanded ? (
                    <div className="p-4 space-y-4">
                      {/* Ingredients */}
                      <div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <UtensilsCrossed size={13} className="text-green-600" />
                          <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Ingredients</span>
                        </div>
                        <div className="bg-green-50/60 rounded-lg p-3 max-h-48 overflow-y-auto">
                          <RecipeTextRenderer text={recipe.ingredients} />
                        </div>
                      </div>

                      {/* Steps */}
                      <div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <ListOrdered size={13} className="text-blue-600" />
                          <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Steps</span>
                        </div>
                        <div className="bg-blue-50/60 rounded-lg p-3 max-h-48 overflow-y-auto">
                          <RecipeTextRenderer text={recipe.steps} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="px-5 py-3">
                      <p className="text-gray-400 text-sm line-clamp-2">
                        {recipe.ingredients?.replace(/\*\*/g, "").replace(/^\* /gm, "").trim()}
                      </p>
                    </div>
                  )}
                </div>

                {/* Toggle Button */}
                <button
                  onClick={() => toggleExpand(recipe.id)}
                  className="w-full py-2.5 px-5 text-sm font-semibold text-orange hover:bg-orange/5 transition-colors border-t border-gray-100 cursor-pointer"
                >
                  {isExpanded ? "Show Less ↑" : "View Full Recipe ↓"}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 hover:border-orange disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronLeft size={18} className="text-gray-600" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                  page === currentPage
                    ? "bg-orange text-white shadow-sm"
                    : "border border-gray-200 text-gray-600 hover:border-orange hover:text-orange"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 hover:border-orange disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronRight size={18} className="text-gray-600" />
            </button>
          </div>
        )}
      </>
    );
  };

  return (
    <main className="bg-beige min-h-screen py-28 px-4 w-full">
      <div className="container mx-auto w-full max-w-6xl">
        {user ? (
          <>
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen size={20} className="text-orange" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-orange">Your Collection</span>
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900">My Saved Recipes</h1>
                {!isLoading && savedRecipes.length > 0 && (
                  <p className="text-gray-500 text-sm mt-1">
                    {filteredRecipes.length} of {savedRecipes.length} recipe{savedRecipes.length !== 1 ? "s" : ""}
                    {searchQuery && ` matching "${searchQuery}"`}
                  </p>
                )}
              </div>

              {/* Search Bar */}
              {!isLoading && savedRecipes.length > 0 && (
                <div className="relative w-full sm:w-72">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <input
                    type="text"
                    placeholder="Search by dish or ingredient..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition-all"
                  />
                </div>
              )}
            </div>

            {renderContent()}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
            <ChefHat size={56} className="text-orange/40" />
            <p className="text-xl font-semibold text-gray-700">
              You must be logged in to view your recipes
            </p>
            <Link
              href="/login"
              className="mt-2 inline-block bg-orange text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-orange/90 transition-colors"
            >
              Go to Login
            </Link>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editRecipe && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={closeEditModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Edit Recipe</h2>
              <button
                onClick={closeEditModal}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition-all"
                  placeholder="Recipe title"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ingredients</label>
                <textarea
                  value={editForm.ingredients}
                  onChange={(e) => setEditForm((f) => ({ ...f, ingredients: e.target.value }))}
                  rows={8}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition-all resize-y"
                  placeholder="List ingredients..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Steps</label>
                <textarea
                  value={editForm.steps}
                  onChange={(e) => setEditForm((f) => ({ ...f, steps: e.target.value }))}
                  rows={10}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition-all resize-y"
                  placeholder="List cooking steps..."
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={submitEdit}
                disabled={isSavingEdit}
                className="flex-1 bg-orange text-white py-2.5 rounded-xl font-semibold hover:bg-orange/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingEdit ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={closeEditModal}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default MyRecipesPage;
