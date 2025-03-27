"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/app/supabaseClient";

const Navbar: React.FC = () => {
  const [menuOpen] = useState<boolean>(false); // Tracks if the menu is open
  const [user, setUser] = useState<{ email: string; name?: string } | null>(
    null
  ); // Tracks the logged-in user
  const [profileMenuOpen, setProfileMenuOpen] = useState<boolean>(false); // Tracks if the profile dropdown is open

  useEffect(() => {
    // Listen for auth state changes
    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser({
            email: session.user.email || "No Email Provided",
            name: session.user.user_metadata?.name || "User",
          }); // Set the logged-in user
        } else {
          setUser(null); // Clear the user if logged out
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error);
    } else {
      setUser(null); // Clear the user state
    }
  };

  return (
    <nav className="bg-[#ffffff] shadow-md flex justify-between items-center p-1 relative z-50">
      {/* Left Section: Logo */}
      <div className="flex items-center">
        <div>
          <Image
            src="/images/brandlogo/logo.png"
            alt="Sasto Deals"
            width={70}
            height={60}
            className="ml-2"
          />
        </div>
      </div>

      {/* Center Section: Menu Items (Visible in Desktop Mode) */}
      <ul className="hidden md:flex items-center space-x-6">
        <li>
          <Link
            href="/trending-products"
            className="text-gray-600 hover:text-gray-800"
          >
            Trending Products
          </Link>
        </li>
        <li>
          <Link
            href="/compare-products"
            className="text-gray-600 hover:text-gray-800"
          >
            Compare Products
          </Link>
        </li>
        <li>
          <Link href="/wishlist" className="text-gray-600 hover:text-gray-800">
            Wishlist / Favourite
          </Link>
        </li>
        <li>
          <Link
            href="/price-drop-alerts"
            className="text-gray-600 hover:text-gray-800"
          >
            Price Drop Alerts
          </Link>
        </li>
        <li>
          <Link href="/about" className="text-gray-600 hover:text-gray-800">
            About Sasto Deals
          </Link>
        </li>
      </ul>

      {/* Right Section: Icons and Profile */}
      <div className="flex items-center space-x-6">
        {/* Notification Icon (Visible only when user is logged in) */}
        {user && (
          <button className="text-gray-600 hover:text-gray-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </button>
        )}

        {/* Profile Section or Login Button */}
        {user ? (
          <div className="relative">
            <button
              className="flex items-center space-x-2"
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            >
              <Image
                src="/images/brandlogo/profileIcon.png"
                alt="Profile"
                width={40}
                height={40}
                className="rounded-full"
              />
              <div className="text-left">
                <p className="text-xs text-gray-500">Personal</p>
                <p className="font-bold text-sm">{user.name}</p>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Profile Dropdown */}
            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2">
                <button
                  className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                  onClick={() => alert("Profile Settings")}
                >
                  Profile Settings
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login">
            <button className="bg-[#9400D3] text-white px-4 py-2 rounded-xl">
              Log In
            </button>
          </Link>
        )}
      </div>

      {/* Mobile Dropdown Menu */}
      <ul
        className={`absolute md:hidden bg-white text-black w-full left-0 top-20 transition-transform duration-300 ease-in-out ${
          menuOpen ? "block transform translate-y-0" : "hidden"
        } z-40`}
      >
        {/* Profile Section (Visible only when user is logged in) */}
        {user && (
          <li className="p-4 border-b border-gray-200 flex items-center">
            <Image
              src="/images/brandlogo/profileIcon.png"
              alt="Profile"
              width={40}
              height={40}
              className="rounded-full mr-2"
            />
            <div>
              <p className="font-bold">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
              <button
                className="text-red-600 text-sm mt-1"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </li>
        )}

        {/* Existing Menu Items */}
        <li className="p-4 border-b border-gray-200">Trending Products</li>
        <li className="p-4 border-b border-gray-200">Compare Products</li>
        <li className="p-4 border-b border-gray-200">Wishlist / Favourite</li>
        <li className="p-4 border-b border-gray-200">Price Drop Alerts</li>
        <li className="p-4 border-b border-gray-200">
          <Link href="/about">About Sasto Deals</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
