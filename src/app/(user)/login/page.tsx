"use client";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { loginUser } from "@/store/slices/userSlice";
import { AppDispatch } from "@/store/store";
import { useState } from "react";
import LoginForm from "@/components/forms/LoginForm";
const LoginPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [loginUserForm, setLoginUserForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { email, password } = loginUserForm;
      if (!email || !password) {
        toast.error("Please enter email and password");
        return;
      }
      const response = await dispatch(loginUser({ email, password })).unwrap();
      toast.success(response.message);
      router.push("/");
    } catch (error: any) {
      toast.error(error|| "Something went wrong");
      setError(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="bg-beige py-28 px-4 w-full">
      <div className="container mx-auto w-full">
        <h1 className="text-3xl font-bold mb-6">Login</h1>
        <LoginForm
          loginUserForm={loginUserForm}
          onSubmit={onSubmit}
          loading={loading}
          error={error}
          setLoginUserForm={setLoginUserForm}
        />
      </div>
    </main>
  );
};

export default LoginPage;
