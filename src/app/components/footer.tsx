"use client";
import Image from "next/image";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 justify-center items-center text-center md:text-center">
        {/* Contact Us */}
        <div className="flex flex-col items-center md:place-items-center">
          <h3 className="font-bold mb-2">Contact Us</h3>
          <p className="text-gray-300">+1 (999) 888-77-66</p>
          <p className="text-gray-300">support@sastodeals.com</p>
        </div>

        {/* Location */}
        <div className="flex flex-col items-center md:place-items-center">
          <h3 className="font-bold mb-2">Location</h3>
          <p className="text-gray-300">Toronto, Canada</p>
          <p className="text-gray-300">123 Main Street</p>
        </div>

        {/* Social Media */}
        <div className="flex flex-col items-center md:place-items-center">
          <h3 className="font-bold mb-2">Social Media</h3>
          <div className="flex space-x-4">
            <a href="https://www.facebook.com" className="p-2">
              <Image
                src="/images/brandlogo/facebook.png"
                alt="Facebook"
                objectFit="cover"
                width={500}
                height={800}
                className="w-6 h-6"
              />
            </a>
            <a href="https://www.instagram.com" className="p-2">
              <Image
                src="/images/brandlogo/instagram.png"
                alt="Facebook"
                objectFit="cover"
                width={500}
                height={800}
                className="w-6 h-6"
              />
            </a>

            <a href="https://www.github.com" className="p-2">
              <Image
                src="/images/brandlogo/github.png"
                alt="Facebook"
                objectFit="cover"
                width={500}
                height={800}
                className="w-6 h-6"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
