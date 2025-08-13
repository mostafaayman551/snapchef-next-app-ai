"use client";
import { useEffect, useState } from "react";
import { AppDispatch, RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import { deleteRecipe, getAllRecipes } from "@/store/slices/recipeSlice";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { toast } from "react-toastify";

const MyRecipesPage = () => {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const dispatch = useDispatch<AppDispatch>();
  const { savedRecipes, isLoading, error } = useSelector(
    (state: RootState) => state.recipes
  );
  const { user } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (user) {
      dispatch(getAllRecipes());
    }
  }, [dispatch, user]);

  const deleteRecipeHandler = (id: string) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this recipe?"
    );
    if (!confirm) return;
    setIsDeleting(true);
    dispatch(deleteRecipe(id))
      .unwrap()
      .then(() => {
        toast.success("Recipe deleted successfully");
      })
      .catch((err) => {
        toast.error(err.message || "Failed to delete recipe");
      })
      .finally(() => {
        setIsDeleting(false);
      });
  };

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-full">
      <svg
        aria-hidden="true"
        role="status"
        className="w-8 h-8 text-gray-800 animate-spin"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
          className="text-gray-300"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );

  const DeleteButtonSpinner = () => (
    <svg
      aria-hidden="true"
      role="status"
      className="inline w-4 h-4 text-red-500 animate-spin"
      viewBox="0 0 100 101"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
        fill="#E5E7EB"
      />
      <path
        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
        fill="currentColor"
      />
    </svg>
  );

  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }

    if (error) {
      return (
        <p className="text-red-500 font-medium text-center text-lg">{error}</p>
      );
    }

    if (savedRecipes.length === 0) {
      return <p className="text-center text-lg">No recipes found.</p>;
    }

    return (
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {savedRecipes.map((recipe: any) => (
          <li
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 relative"
            key={recipe.id}
          >
            <h2 className="text-2xl font-bold mb-2 text-orange">
              {recipe.title}
            </h2>
            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-1">Ingredients</h3>
              <p className="text-gray-700 whitespace-pre-line">
                {recipe.ingredients}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Steps</h3> 
              <p className="text-gray-700 whitespace-pre-line">
                {recipe.steps}
              </p>
            </div>
            <button
              className="p-3 bg-red-50 rounded-b-xl absolute right-2 top-0 z-10 cursor-pointer flex justify-center items-center text-center"
              disabled={isDeleting}
              onClick={() => deleteRecipeHandler(recipe.id)}
            >
              {isDeleting ? (
                <DeleteButtonSpinner />
              ) : (
                <Trash2
                  size={18}
                  className="text-red-500 hover:text-red-600 hover:transform hover:rotate-[360deg] ease-in-out duration-300 transition-all"
                />
              )}
            </button>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <main className="bg-beige py-28 px-4 w-full">
      <div className="container mx-auto w-full min-h-screen">
        {user ? (
          <>
            <h1 className="text-4xl font-extrabold text-orange mb-8 text-center">
              My Saved Recipes
            </h1>
            {renderContent()}
          </>
        ) : (
          <div className="text-center">
            <p className="text-xl">
              You must be logged in to view your saved recipes
            </p>
            <Link
              href={"/login"}
              className="inline-block mt-4 hover:underline text-md text-orange underline-offset-2"
            >
              Go to Login Page
            </Link>
          </div>
        )}
      </div>
    </main>
  );
};

export default MyRecipesPage;
