"use client";
import Image from "next/image";

type Category = {
  name: string;
  img: string;
};

const categories: Category[] = [
  { name: "Automobiles", img: "/images/automobile/automobileDisplayImage.png" },
  { name: "Computer", img: "/images/Computer/computerDisplay.jpg" },
  { name: "Bikes", img: "/images/Bikes/bikeDisplayImage.jpg" },
  { name: "Camp Gears", img: "/images/CampGears/campGearDisplay.jpg" },
  { name: "Camera", img: "/images/Camera/cameraDisplayImage.png" },
  {
    name: "Musical Instruments",
    img: "/images/MusicalInstruments/musicalInstrumentDisplay.png",
  },
];

const Categories: React.FC = () => {
  return (
    <section className="p-4">
      <h2 className="text-lg font-semibold">Explore Categories</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
        {/* Renders a card component for a cat. * * @param {Object} cat - The
        cat object containing information to display. * @param {number} index -
        The index of the cat in the list, used as a key for the component. *
        @returns {JSX.Element} A JSX element representing the cat card. */}
        {categories.map((cat, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-md aspect-w-16 aspect-h-9"
          >
            <Image
              src={cat.img}
              alt={cat.name}
              objectFit="cover"
              width={500}
              height={800}
              className="object-cover rounded-md w-full h-auto"
            />

            <div className="absolute top-0 left-0 p-2">
              <p className="text-white font-bold">{cat.name}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Categories;
