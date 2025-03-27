import Navbar from "@/app/components/Navbar";
import SearchBar from "@/app/components/searchbar";
import Categories from "@/app/components/categories";
import Footer from "@/app/components/footer";

export default function Home() {
  return (
    <div>
      <Navbar />
      <SearchBar />
      <Categories />
      <Footer />
    </div>
  );
}
