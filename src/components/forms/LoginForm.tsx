"use client";
import React from "react";
import Link from "next/link";

interface LoginFormProps {
  loginUserForm: {
    email: string;
    password: string;
  };
  setLoginUserForm: React.Dispatch<
    React.SetStateAction<{ email: string; password: string }>
  >;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  loading: boolean;
  error: string | null;
}

const LoginForm = ({
  loginUserForm,
  setLoginUserForm,
  onSubmit,
  loading,
  error,
}: LoginFormProps) => {
  return (
    <form className="max-w-md space-y-4" onSubmit={onSubmit}>
      <div>
        <label>Email</label>
        <input
          type="email"
          className="w-full border px-4 py-2 rounded"
          placeholder="Enter your email"
          value={loginUserForm.email}
          onChange={(e) =>
            setLoginUserForm({ ...loginUserForm, email: e.target.value })
          }
        />
      </div>
      <div>
        <label>Password</label>
        <input
          type="password"
          className="w-full border px-4 py-2 rounded"
          placeholder="Enter your password"
          value={loginUserForm.password}
          onChange={(e) =>
            setLoginUserForm({ ...loginUserForm, password: e.target.value })
          }
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-orange text-white px-6 py-2 rounded hover:opacity-90"
      >
        {loading ? "Logging in..." : "Login"}
      </button>
      <p className="mt-6">
        Do not have an account?
        <Link href="/register" className="text-orange hover:underline">
          Register
        </Link>
      </p>
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
};

export default LoginForm;
