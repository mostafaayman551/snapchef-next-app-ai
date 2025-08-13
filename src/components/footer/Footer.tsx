"use client";
import { ChefHat } from "lucide-react";
import Link from "next/link";
const Footer = () => {
  return (
    <footer className="bg-white py-6 px-4">
      <div className="container mx-auto flex flex-col md:flex-row items-start justify-between gap-6">
        <div className="">
          <Link href="/" className="flex items-center mb-4 text-xl text-primary gap-1">
            <ChefHat size={30}/>
            <span className="font-bold text-2xl">SnapChef</span>
          </Link>
          <p className="text-sm">&copy; 2025 SnapChef, all rights reserved</p>
          <small>made with ❤️ by mostafa ayman</small>
        </div>
        <nav>
          <h3 className="font-bold mb-4">Worldwide Recipes Websites</h3>
          <ul className="flex items-center gap-4">
            <li>
              <Link
                href={"https://www.epicurious.com"}
                target="_blank"
                rel="noreferrer noopener"
                className="text-md hover:text-orange transition-colors duration-300"
              >
                Epicurious
              </Link>
            </li>
            <li>
              <Link
                href={"https://www.allrecipes.com"}
                target="_blank"
                rel="noreferrer noopener"
                className="text-md hover:text-orange transition-colors duration-300"
              >
                Allrecipes
              </Link>
            </li>
            <li>
              <Link
                href={"https://www.taste.com.au/"}
                target="_blank"
                rel="noreferrer noopener"
                className="text-md hover:text-orange transition-colors duration-300"
              >
                Taste
              </Link>
            </li>
            <li>
              <Link
                href={"https://www.bonappetit.com"}
                target="_blank"
                rel="noreferrer noopener"
                className="text-md hover:text-orange transition-colors duration-300"
              >
                Bon Appetit
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
