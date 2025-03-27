"use client";
import { useState, useRef } from "react";
import axios from "axios";
import { FaSearch } from "react-icons/fa";

interface SearchResult {
  title: string;
  link: string;
  price: string;
  updated: string;
  store: string;
}

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const cleanInput = (input: string): string => {
    // Remove unnecessary whitespace and special characters
    return input.trim().replace(/[^a-zA-Z0-9 ]/g, "");
  };

  const handleSearch = async () => {
    const cleanedQuery = cleanInput(query);
    if (!cleanedQuery) {
      alert("Please enter a valid search query.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `/api/search?query=${encodeURIComponent(cleanedQuery)}`
      );
      console.log(response);
      setResults(response.data);
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleFocus = () => {
    if (inputRef.current) {
      inputRef.current.classList.add("animate-spin-border");
    }
    // Clear results when the user focuses on the search bar
    if (!query.trim()) {
      setResults([]);
    }
  };

  const handleBlur = () => {
    if (inputRef.current) {
      inputRef.current.classList.remove("animate-spin-border");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Clear results when the input is empty
    if (!value.trim()) {
      setResults([]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="flex items-center w-full md:w-1/2 relative">
        <input
          type="text"
          placeholder="What are you looking for?"
          value={query}
          onChange={handleInputChange} // Updated to use handleInputChange
          onKeyPress={handleKeyPress}
          onFocus={handleFocus}
          onBlur={handleBlur}
          ref={inputRef}
          className="border-2 border-gray-300 p-2 w-full rounded-2xl focus:outline-none transition duration-300 pr-10"
        />
        <button
          onClick={handleSearch}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent text-orange-500 p-2 hover:text-orange-600 transition duration-300"
        >
          <FaSearch />
        </button>
      </div>
      {loading ? (
        <div className="mt-2 w-full md:w-1/2 text-center text-gray-500">
          Comparing prices across various websites...
        </div>
      ) : (
        <div className="mt-2 w-full md:w-1/2">
          {results.map((result, index) => (
            <div
              key={index}
              className="p-4 border-b hover:bg-gray-100 transition duration-300 flex items-center"
            >
              <div className="flex-grow">
                <h3 className="text-lg font-semibold">{result.title}</h3>
                <p className="text-gray-500">{result.store}</p>
                <p className="text-gray-500">Updated {result.updated} ago</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">{result.price}</p>
                <a
                  href={result.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  View
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
