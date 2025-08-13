"use client";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { updateUser } from "@/store/slices/userSlice";
import React, { useState } from "react";

interface Props {
  user: Record<string, any>;
  updateModal: boolean;
  onClose: () => void;
}
const UpdateProfileModal: React.FC<Props> = ({
  user,
  updateModal,
  onClose,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [updateUserForm, setUpdateUserForm] = useState({
    name: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const handleUpdateForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { name, password, confirmPassword } = updateUserForm;
      if (!name && !password && !confirmPassword) {
        toast.error("No changes made");
        return;
      }
      if (password && password !== confirmPassword) {
        toast.error("Passwords do not match, please confirm password");
        return;
      }
      const payload = {
        id: (user as any).id,
        ...(name ? { name: name } : {}),
        ...(password ? { password: password } : {}),
      };
      await dispatch(updateUser(payload)).unwrap();
      toast.success("Profile updated successfully");
      onClose();
    } catch (error: any) {
      toast.error(error || "Something went wrong");
      setError(error);
    } finally {
      setLoading(false);
    }
  };
  if (!updateModal) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 min-w-[320px] max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h1 className="text-xl text-orange font-bold mb-4 text-center">
          Update user profile
        </h1>
        <form className="max-w-md space-y-4" onSubmit={handleUpdateForm}>
          <div>
            <input
              type="text"
              className="w-full border px-4 py-2 rounded"
              placeholder="Enter your name"
              value={updateUserForm.name}
              onChange={(e) =>
                setUpdateUserForm({ ...updateUserForm, name: e.target.value })
              }
            />
          </div>
          <div>
            <input
              type="password"
              className="w-full border px-4 py-2 rounded"
              placeholder="Enter your password"
              value={updateUserForm.password}
              onChange={(e) =>
                setUpdateUserForm({
                  ...updateUserForm,
                  password: e.target.value,
                })
              }
            />
          </div>
          <div>
            <input
              type="password"
              className="w-full border px-4 py-2 rounded"
              placeholder="Re-enter your password"
              value={updateUserForm.confirmPassword}
              onChange={(e) =>
                setUpdateUserForm({
                  ...updateUserForm,
                  confirmPassword: e.target.value,
                })
              }
            />
          </div>
          <div className="flex justify-end items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-orange text-white px-4 py-2 rounded hover:opacity-90 cursor-pointer"
            >
              {loading ? "Updating..." : "Update"}
            </button>
            <button
              type="button"
              className="cursor-pointer border border-orange px-4 py-2 rounded"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
          {error && <p className="text-red-500">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default UpdateProfileModal;
