"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ContactModal from "@/components/forms/ContactModal";
import Logo from "@/components/ui/Logo";
import CitySelectModal from "@/components/blocks/CitySelectModal";
import { useSupportOnly } from "@/context/SupportOnlyContext";
import { useRouter } from "next/navigation";
import { useCity } from "@/context/CityContext";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const servicesDropdownRef = useRef<HTMLDivElement>(null);
  const { isSupportOnly } = useSupportOnly();
  const router = useRouter();
  const { setCity, city } = useCity();

  const services = [
    { name: "Интернет", filter: "internet" },
    { name: "Интернет + ТВ", filter: "internet-tv" },
    { name: "Интернет + Мобильная связь", filter: "internet-mobile" },
    { name: "Интернет + ТV + Мобильная связь", filter: "internet-tv-mobile" },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        servicesDropdownRef.current &&
        !servicesDropdownRef.current.contains(event.target as Node)
      ) {
        setIsServicesDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleContactClick = () => {
    setIsContactModalOpen(true);
    setIsMenuOpen(false);
  };

  function slugifyCityName(city: string): string {
    const raw = city.replace(/^([а-яёa-z\-\.]+)[\s\-]+/i, "").trim().toLowerCase();
    return raw
      .replace(/ /g, "-")
      .replace(/[а-яё]/gi, (c) =>
        ({
          а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh",
          з: "z", и: "i", й: "i", к: "k", л: "l", м: "m", н: "n", о: "o",
          п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c",
          ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya"
        }[c.toLowerCase()] || "")
      );
  }

  const handleServiceClick = (filter: string) => {
    const citySlug =
      city && city.trim().length > 0 ? slugifyCityName(city) : "moskva";
    router.push(`/${citySlug}/${filter}`);
    setIsMenuOpen(false);
  };

  const handleCitySelect = (selectedCity: string) => {
    setIsCityModalOpen(false);
    setCity(selectedCity);
    document.cookie = `user-city=${encodeURIComponent(
      selectedCity
    )}; path=/; max-age=31536000`;

    router.push(`/${slugifyCityName(selectedCity)}`);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#e5e5ed] shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          {/* Лого + город */}
          <div className="flex items-center space-x-4">
            {/* Адаптивный логотип */}
      <Logo cityName={city && city.trim().length > 0 ? slugifyCityName(city) : "moskva"}/>
            
            {/* Город */}
            <div
              className="hidden md:flex items-center text-[#0f191e] cursor-pointer group relative ml-4" // Увеличил отступ
              onClick={() => setIsCityModalOpen(true)}
            >
              <div className="bg-[#ee3c6b] p-2 rounded-lg mr-3 shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="font-semibold text-lg group-hover:text-[#ee3c6b] transition-colors duration-300">
                {city && city.trim().length > 0 ? city.trim() : "в России"}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ee3c6b] transition-all duration-300 group-hover:w-full"></span>
              </span>
            </div>
          </div>

          {/* Десктоп меню - вернул нормальные размеры */}
          <nav className="hidden md:flex items-center space-x-6 font-medium text-[#0f191e]">
            <div className="relative" ref={servicesDropdownRef}>
              <button
                onClick={() => setIsServicesDropdownOpen(!isServicesDropdownOpen)}
                className="relative group flex items-center space-x-1 px-4 py-2 rounded-xl hover:bg-[#f6f8ff] transition-all duration-300"
              >
                <span className="font-semibold">Услуги</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 transition-transform ${
                    isServicesDropdownOpen ? "rotate-180" : ""
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              {isServicesDropdownOpen && (
                <div className="absolute bg-white border border-[#e5e5ed] shadow-xl rounded-xl mt-2 py-3 w-64 z-50 animate-fade-in">
                  {services.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleServiceClick(s.filter)}
                      className="block w-full text-left px-5 py-3 text-[#0f191e] hover:bg-[#f6f8ff] hover:text-[#ee3c6b] rounded-lg transition-all duration-300 font-medium"
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {!isSupportOnly && (
              <Link
                href="/contacts"
                className="px-4 py-2 rounded-xl font-semibold hover:bg-[#f6f8ff] hover:text-[#ee3c6b] transition-all duration-300"
              >
                Контакты
              </Link>
            )}

            {!isSupportOnly && (
              <button
                onClick={handleContactClick}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group relative overflow-hidden"
              >
                <span className="relative z-10">Консультация</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#ff0032] to-[#ee3c6b] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </button>
            )}
          </nav>

          {/* Мобильное меню */}
          <div className="md:hidden flex items-center space-x-3">
            <button
              onClick={() => setIsCityModalOpen(true)}
              className="p-2 bg-[#f6f8ff] rounded-lg shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-[#ee3c6b]"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 bg-[#f6f8ff] rounded-lg text-[#0f191e] hover:text-[#ee3c6b] transition-colors shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={
                    isMenuOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Мобильное выпадающее меню */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-[#e5e5ed] shadow-xl animate-slide-down">
            <div className="px-4 py-4 space-y-2">
              {services.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleServiceClick(s.filter)}
                  className="block w-full text-left py-3 px-4 font-semibold text-[#0f191e] hover:bg-[#f6f8ff] hover:text-[#ee3c6b] rounded-xl transition-all duration-300"
                >
                  {s.name}
                </button>
              ))}
              {!isSupportOnly && (
                <Link
                  href="/contacts"
                  className="block py-3 px-4 font-semibold text-[#0f191e] hover:bg-[#f6f8ff] hover:text-[#ee3c6b] rounded-xl transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Контакты
                </Link>
              )}
              {!isSupportOnly && (
                <button
                  onClick={handleContactClick}
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] text-white font-semibold rounded-xl shadow-lg mt-2"
                >
                  Консультация
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
      <CitySelectModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
        onSelect={handleCitySelect}
      />
    </>
  );
}