"use client";
import { ChefHat, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Logo from "@/assets/logo.png";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "@/store/slices/userSlice";
import type { AppDispatch, RootState } from "@/store/store";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const Header = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dropDownRef = useRef<HTMLDivElement>(null);
  const { user } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        dropDownRef.current &&
        !dropDownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);
  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Logout successful");
      router.push("/");
    } catch (error) {
      toast.error("Logout failed");
    }
  };
  return (
    <header className="fixed top-0 z-50 w-full bg-white shadow-md px-6 py-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center text-xl text-primary gap-1">
          <ChefHat size={30} />
          <span className="font-bold text-2xl">SnapChef</span>
        </Link>
        <nav>
          <ul className="flex items-center gap-4">
            <li>
              <Link
                href={"/my-recipes"}
                className="text-md hover:text-orange transition-all duration-300"
              >
                My Recipes
              </Link>
            </li>
            <li className="relative">
              {user ? (
                <>
                  <button
                    className="rounded-full overflow-hidden cursor-pointer animate-bounce transition-all duration-300"
                    onClick={() => setOpen(true)}
                  >
                    <Image
                      src={Logo.src}
                      alt="avatar"
                      height={45}
                      width={45}
                      className="object-cover rounded-full"
                    />
                  </button>
                  {open && (
                    <div
                      className="absolute right-0 w-40 bg-white shadow-md p-4 rounded"
                      ref={dropDownRef}
                    >
                      <ul className="flex flex-col gap-2">
                        <li>
                          <Link
                            href={"/profile"}
                            className="text-md hover:text-orange transition-all duration-300"
                          >
                            Profile
                          </Link>
                        </li>
                        <li>
                          <button
                            className="flex items-center text-md gap-2 hover:text-orange transition-all duration-300 cursor-pointer"
                            onClick={handleLogout}
                          >
                            Logout <LogOut size={18} />
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <Link
                    href={"/login"}
                    className="text-md transition-all duration-300 border bg-orange text-white px-4 py-2 rounded-md cursor-pointer hover:bg-orange/90"
                  >
                    Login
                  </Link>
                </>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
