"use client";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { registerUser } from "@/store/slices/userSlice";
import { useEffect, useState } from "react";
import RegisterForm from "@/components/forms/RegisterForm";
const RegisterPage = () => {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();
  const [registerUserForm, setRegisterUserForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { name, email, password, confirmPassword } = registerUserForm;
      if (!name || !email || !password || !confirmPassword) {
        toast.error("Please fill all the fields");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      const response = await dispatch(
        registerUser({ name, email, password, confirmPassword })
      ).unwrap();
      toast.success(response.message);
    } catch (error: any) {
      toast.error(error || "Something went wrong");
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [user, router]);
  return (
    <main className="bg-beige py-28 px-4 w-full">
      <div className="container mx-auto min-h-screen w-full">
        <h1 className="text-3xl font-bold mb-6">Register</h1>
        <RegisterForm
          registerUserForm={registerUserForm}
          setRegisterUserForm={setRegisterUserForm}
          onSubmit={onSubmit}
          loading={loading}
          error={error}
        />
      </div>
    </main>
  );
};

export default RegisterPage;
