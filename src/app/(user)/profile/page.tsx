"use client";
import Image from "next/image";
import Logo from "@/assets/logo.png";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, CookingPot, Pencil } from "lucide-react";
import { deleteUser, getUserProfile } from "@/store/slices/userSlice";
import { toast } from "react-toastify";
import UpdateProfileModal from "@/components/modal/UpdateProfileModal";

const ProfilePage = () => {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const { user, loading, error } = useSelector(
    (state: RootState) => state.user
  );
  const dispatch = useDispatch<AppDispatch>();
  const [updateModal, setUpdateModal] = useState<boolean>(false);
  const router = useRouter();
  useEffect(() => {
    if (user && !user.name) {
      dispatch(getUserProfile(user.id)).unwrap();
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (!user && !loading) {
      router.push("/login");
    }
  }, [loading, user, router]);

  const handleDeleteAccount = async () => {
    const confirm = window.confirm(
      "Are you sure you want to delete your account?"
    );
    if (!user || !confirm) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteUser(user.id)).unwrap();
      toast.success("Account deleted successfully");
      router.push("/login");
    } catch (error: any) {
      console.error("Delete account error:", error);
      toast.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateButton = () => {
    setUpdateModal(true);
  };
  if (loading) return <p className="text-center py-28 text-xl">Loading...</p>;
  if (error && !user) {
    router.push("/login");
    return null;
  }
  if (!user) return null;
  return (
    <>
      {user && (
        <main className="bg-beige w-full">
          <div className="container min-h-screen mx-auto py-28 px-4 w-full">
            <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
            <div className="flex items-center gap-6 w-full bg-white p-6 rounded">
              <div className="">
                <Image
                  src={Logo.src}
                  alt="avatar"
                  width={80}
                  height={80}
                  className="object-cover rounded-full"
                />
              </div>
              <div className="p-4 rounded w-full border-l-orange border-l-2">
                <p className="text-md capitalize">
                  <span className="text-black font-bold">Username:</span>{" "}
                  {user.name}
                </p>
                <p className="text-md mb-2 capitalize">
                  <span className="text-black font-bold">Email:</span>{" "}
                  {user.email}
                </p>
                <div className="flex items-center justify-between">
                  <Link
                    href="/my-recipes"
                    className="text-orange px-4 py-2 rounded border border-orange flex items-center gap-2 hover:bg-orange hover:text-white transition-colors"
                  >
                    <CookingPot size={20} />
                    See My Recipes
                  </Link>
                  <div className="flex items-center gap-4">
                    <button
                      className="flex items-center gap-2 bg-red-50 text-red-500 px-4 py-2 rounded border-red-500 transition-colors hover:bg-red-100 cursor-pointer"
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <>
                          <svg
                            aria-hidden="true"
                            role="status"
                            className="inline w-4 h-4 me-3 text-red-500 animate-spin"
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
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 size={20} />
                          Delete Account
                        </>
                      )}
                    </button>
                    <button
                      className="flex items-center gap-2 bg-green-50 text-green-500 px-4 py-2 rounded border-green-500 transition-colors hover:bg-green-100 cursor-pointer"
                      onClick={handleUpdateButton}
                    >
                      <Pencil size={20} />
                      Update Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <UpdateProfileModal
              user={user}
              updateModal={updateModal}
              onClose={() => setUpdateModal(false)}
            />
          </div>
        </main>
      )}
    </>
  );
};

export default ProfilePage;
