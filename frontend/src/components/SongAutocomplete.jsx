import { useState, useEffect, useRef } from "react";

export default function SongAutocomplete({
  songs,
  value,
  onChange,
  placeholder,
}) {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  const normalize = (text) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const handleInputChange = (e) => {
    const q = e.target.value;
    setQuery(q);
    onChange(q); // ✅ cập nhật ra ngoài ngay khi nhập tay

    if (q.trim().length === 0) {
      setSuggestions([]);
      return;
    }
    const filtered = songs.filter((s) =>
      normalize(s.title).includes(normalize(q))
    );
    setSuggestions(filtered.slice(0, 6));
    setShowSuggestions(true);
  };

  const handleSelect = (title) => {
    setQuery(title);
    onChange(title);
    setShowSuggestions(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <input
        type="text"
        className="w-full p-2 rounded bg-gray-700 text-white"
        placeholder={placeholder}
        value={query}
        onChange={handleInputChange}
        onFocus={() => setShowSuggestions(true)}
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-gray-800 border border-gray-700 rounded mt-1 max-h-40 overflow-y-auto">
          {suggestions.map((s, i) => (
            <li
              key={i}
              className="p-2 hover:bg-gray-700 cursor-pointer"
              onClick={() => handleSelect(s.title)}
            >
              {s.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
