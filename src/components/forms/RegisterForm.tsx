"use client";
import React from "react";
import Link from "next/link";

interface RegisterFormProps {
  registerUserForm: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  };
  setRegisterUserForm: React.Dispatch<
    React.SetStateAction<{
      name: string;
      email: string;
      password: string;
      confirmPassword: string;
    }>
  >;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  loading: boolean;
  error: string | null;
}
const RegisterForm = ({
  registerUserForm,
  setRegisterUserForm,
  onSubmit,
  loading,
  error,
}: RegisterFormProps) => {
  return (
    <form className="max-w-md space-y-4" onSubmit={onSubmit}>
      <div>
        <label>Name</label>
        <input
          type="text"
          className="w-full border px-4 py-2 rounded"
          placeholder="Enter your username"
          value={registerUserForm.name}
          onChange={(e) =>
            setRegisterUserForm({ ...registerUserForm, name: e.target.value })
          }
        />
      </div>
      <div>
        <label>Email</label>
        <input
          type="email"
          className="w-full border px-4 py-2 rounded"
          placeholder="Enter your email"
          value={registerUserForm.email}
          onChange={(e) =>
            setRegisterUserForm({ ...registerUserForm, email: e.target.value })
          }
        />
      </div>
      <div>
        <label>Password</label>
        <input
          type="password"
          className="w-full border px-4 py-2 rounded"
          placeholder="Enter your password"
          value={registerUserForm.password}
          onChange={(e) =>
            setRegisterUserForm({
              ...registerUserForm,
              password: e.target.value,
            })
          }
        />
      </div>
      <div>
        <label>Confirm Password</label>
        <input
          type="password"
          className="w-full border px-4 py-2 rounded"
          placeholder="Enter your password"
          value={registerUserForm.confirmPassword}
          onChange={(e) =>
            setRegisterUserForm({
              ...registerUserForm,
              confirmPassword: e.target.value,
            })
          }
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-orange text-white px-6 py-2 rounded hover:opacity-90"
      >
        {loading ? "Registering..." : "Register"}
      </button>
      <p className="mt-6">
        Already have an account?
        <Link href="/login" className="text-orange hover:underline">
          Login
        </Link>
      </p>
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
};

export default RegisterForm;
