
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DaDataSuggestion, DaDataAddress } from 'react-dadata';
import 'react-dadata/dist/react-dadata.css';
import { submitLead } from '@/lib/submitLead';
import SupportOnlyBlock from '@/components/ui/SupportOnlyBlock';
import CallRequestModal from '@/components/ui/CallRequestModal';
import Image from 'next/image';
import { useCity } from '@/context/CityContext';
import { useSupportOnly } from '@/context/SupportOnlyContext';
import { regions } from "./regionsData"; // Предполагаем, что regionsData существует, как в втором компоненте

const DA_DATA_TOKEN = "48a6def168c648e4b5302f2696d9cb5de308032d";

// Функция для создания slug из названия города
function slugifyCityName(city: string): string {
  const raw = city.replace(/^([а-яёa-z\-\.]+)[\s\-]+/i, "").trim().toLowerCase();
  return raw
    .replace(/ /g, "-")
    .replace(/[а-яё]/gi, (c) =>
      ({
        а: "a",
        б: "b",
        в: "v",
        г: "g",
        д: "d",
        е: "e",
        ё: "e",
        ж: "zh",
        з: "z",
        и: "i",
        й: "i",
        к: "k",
        л: "l",
        м: "m",
        н: "n",
        о: "o",
        п: "p",
        р: "r",
        с: "s",
        т: "t",
        у: "u",
        ф: "f",
        х: "h",
        ц: "c",
        ч: "ch",
        ш: "sh",
        щ: "sch",
        ъ: "",
        ы: "y",
        ь: "",
        э: "e",
        ю: "yu",
        я: "ya",
      }[c.toLowerCase()] || "")
    );
}

// Функция для очистки названия города от префиксов
const cleanCityName = (city: string): string => {
  return city
    .replace(/^г\.|пгт\.|с\.|п\.|д\.|город\s|посёлок\s|село\s/gi, "")
    .trim();
};

interface CityDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (city: string, region: string) => void;
  currentCity: string;
}

function CityDropdown({ isOpen, onClose, onSelect, currentCity }: CityDropdownProps) {
  const [query, setQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setTimeout(() => {
        const input = dropdownRef.current?.querySelector("input");
        input?.focus();
      }, 100);
    }
  }, [isOpen]);

  const searchResults = query.trim()
    ? (() => {
        const q = query.toLowerCase();
        const results: Array<{ city: string; region: string; regionId: string }> = [];

        regions.forEach((letterGroup) => {
          letterGroup.areas.forEach((region) => {
            region.cities.forEach((city) => {
              if (city.toLowerCase().includes(q)) {
                results.push({
                  city,
                  region: region.name,
                  regionId: region.id,
                });
              }
            });
          });
        });

        return results;
      })()
    : [];

  const filteredRegions = query.trim()
    ? regions
        .map((letterGroup) => ({
          ...letterGroup,
          areas: letterGroup.areas.filter(
            (area) =>
              area.name.toLowerCase().includes(query.toLowerCase()) ||
              area.cities.some((city) => city.toLowerCase().includes(query.toLowerCase()))
          ),
        }))
        .filter((letterGroup) => letterGroup.areas.length > 0)
    : regions;

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto backdrop-blur-sm bg-white/95"
    >
      <div className="p-4">
        <div className="relative mb-3">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск города..."
              className="w-full h-12 rounded-xl border border-gray-200 pl-10 pr-10 text-sm focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition-all"
            />
            {query && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setQuery("")}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                  <path d="M4 4l8 8M4 12L12 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {query.trim() ? (
          <div>
            <div className="text-sm font-medium text-gray-500 mb-2">
              Результаты поиска {searchResults.length > 0 && `(${searchResults.length})`}
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {searchResults.length > 0 ? (
                searchResults.map((result, index) => (
                  <button
                    key={`${result.city}-${result.regionId}-${index}`}
                    className="w-full px-4 py-3 text-left text-sm text-gray-800 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-all duration-200 hover:shadow-sm"
                    onClick={() => onSelect(result.city, result.region)}
                  >
                    <div className="font-medium">{result.city}</div>
                    <div className="text-xs text-gray-500 mt-1">{result.region}</div>
                  </button>
                ))
              ) : (
                <div className="px-3 py-6 text-center text-gray-500 text-sm">
                  <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Город не найден
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {filteredRegions.map((letterGroup) => (
              <div key={letterGroup.letter}>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-2">
                  {letterGroup.letter}
                </div>
                <div className="space-y-2">
                  {letterGroup.areas.map((region) => (
                    <div key={region.id}>
                      <div className="text-sm font-medium text-gray-700 px-2 py-1 bg-gray-50 rounded-lg">{region.name}</div>
                      <div className="space-y-1 ml-1 mt-1">
                        {region.cities.slice(0, 5).map((city) => (
                          <button
                            key={city}
                            className="w-full px-3 py-2 text-left text-sm text-gray-600 hover:bg-orange-50 hover:text-orange-600 rounded-md transition-all duration-200"
                            onClick={() => onSelect(city, region.name)}
                          >
                            {city}
                          </button>
                        ))}
                        {region.cities.length > 5 && (
                          <div className="text-xs text-gray-400 px-2 py-1">+{region.cities.length - 5} городов</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Кастомный компонент для поиска адресов с фильтрацией по городу
type Props = {
  cityFiasId: string | null;
  cityName?: string | null;
  value?: DaDataSuggestion<DaDataAddress> | undefined;
  onChange: (suggestion: DaDataSuggestion<DaDataAddress> | undefined) => void;
};

export function CustomAddressSuggestionsFetch({ cityFiasId, cityName, value, onChange }: Props) {
  const currentCityName = cityName || "";
  const [query, setQuery] = useState<string>(value?.value || "");
  const [suggestions, setSuggestions] = useState<DaDataSuggestion<DaDataAddress>[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const justSelectedRef = useRef(false);
  const suppressOpenRef = useRef<number>(0);

  useEffect(() => {
    if (value && value.value) {
      setQuery(value.value);
      setSuggestions([]);
      setOpen(false);
      suppressOpenRef.current = Date.now() + 400;
      return;
    }
    if (!value) {
      setQuery("");
      setSuggestions([]);
      setOpen(false);
    }
  }, [value]);

  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      setOpen(false);
      abortRef.current?.abort();
      return;
    }

    if (justSelectedRef.current) {
      const t = setTimeout(() => {
        justSelectedRef.current = false;
      }, 300);
      return () => clearTimeout(t);
    }

    const t = setTimeout(() => fetchSuggestions(query.trim()), 220);
    return () => {
      clearTimeout(t);
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, cityFiasId, currentCityName]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function normalize(str?: string) {
    return (str || "").toString().toLowerCase().replace(/\s+/g, " ").trim();
  }

  function parseHouseToken(q: string) {
    const houseMatch = q.match(/(\d+)\s*([а-яёa-zA-Z]{0,2})$/i);
    if (!houseMatch) return null;
    const num = houseMatch[1];
    const letter = houseMatch[2] ? houseMatch[2].toLowerCase() : "";
    return { num, letter };
  }

  function filterByCityAndHouse(sugs: DaDataSuggestion<DaDataAddress>[], rawQuery: string) {
    if (!sugs || sugs.length === 0) return sugs;
    const targetFias = cityFiasId ? String(cityFiasId).toLowerCase() : null;
    const targetCity = normalize(currentCityName);

    const houseToken = parseHouseToken(rawQuery);

    const filtered = sugs.filter((s) => {
      const d: any = s.data || {};

      const ids = [d.city_fias_id, d.settlement_fias_id, d.fias_id].filter(Boolean).map(String).map(x => x.toLowerCase());
      if (targetFias && ids.includes(targetFias)) {
        if (houseToken) {
          if (d.house && String(d.house).toLowerCase().startsWith(houseToken.num)) {
            if (!houseToken.letter) return true;
            const houseNorm = String(d.house || "").toLowerCase();
            if (houseNorm.includes(houseToken.num + houseToken.letter)) return true;
            if (normalize(s.value).includes(houseToken.num + houseToken.letter)) return true;
            return false;
          }
          const valNorm = normalize(s.value);
          if (valNorm.includes(" " + houseToken.num) || valNorm.includes("," + houseToken.num)) {
            if (!houseToken.letter) return true;
            if (valNorm.includes(houseToken.num + houseToken.letter)) return true;
            return false;
          }
          return false;
        }
        return true;
      }

      if (targetCity) {
        const cityCandidates = [
          d.city_with_type,
          d.city,
          d.settlement_with_type,
          d.settlement,
          d.region_with_type,
          d.region
        ].filter(Boolean).map((x: string) => normalize(x));

        if (cityCandidates.some(c => c.includes(targetCity))) {
          if (houseToken) {
            if (d.house && String(d.house).toLowerCase().startsWith(houseToken.num)) {
              if (!houseToken.letter) return true;
              const houseNorm = String(d.house || "").toLowerCase();
              if (houseNorm.includes(houseToken.num + houseToken.letter)) return true;
              if (normalize(s.value).includes(houseToken.num + houseToken.letter)) return true;
              return false;
            }
            const valNorm = normalize(s.value);
            if (valNorm.includes(" " + houseToken.num) || valNorm.includes("," + houseToken.num)) {
              if (!houseToken.letter) return true;
              if (valNorm.includes(houseToken.num + houseToken.letter)) return true;
              return false;
            }
            return false;
          }
          return true;
        }
      }

      return false;
    });

    return filtered.length > 0 ? filtered : sugs;
  }

  async function fetchSuggestions(rawQuery: string) {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setLoading(true);

    try {
      const effectiveQuery = cityFiasId || !currentCityName ? rawQuery : `${currentCityName} ${rawQuery}`;

      const body: any = {
        query: effectiveQuery,
        count: 12,
        restrict_value: true
      };

      if (cityFiasId) body.locations = [{ city_fias_id: cityFiasId }];

      const res = await fetch("https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Token ${DA_DATA_TOKEN}`,
        },
        body: JSON.stringify(body),
        signal: ac.signal
      });

      if (!res.ok) {
        console.warn("DaData responded with status", res.status);
        return [];
      }

      const json = await res.json();
      const sugs = json.suggestions || [];

      const filtered = filterByCityAndHouse(sugs, rawQuery);

      setSuggestions(filtered);
      setOpen(filtered.length > 0 && Date.now() > suppressOpenRef.current);
    } catch (err: any) {
      if (err?.name !== "AbortError") console.error("Fetch suggestions error", err);
      setSuggestions([]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(s: DaDataSuggestion<DaDataAddress>) {
    justSelectedRef.current = true;
    setQuery(s.value);
    setSuggestions([]);
    setOpen(false);
    suppressOpenRef.current = Date.now() + 400;
    onChange(s);
    setTimeout(() => {
      justSelectedRef.current = false;
    }, 400);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setQuery(v);
    if (!v) onChange(undefined);
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={() => {
          if (justSelectedRef.current || Date.now() < suppressOpenRef.current) return;
          if (suggestions.length) setOpen(true);
        }}
        placeholder="Введите улицу и дом"
        className="bg-transparent outline-none flex-1 text-sm md:text-lg px-2 py-1 w-full text-gray-800 placeholder-gray-500"
        autoComplete="off"
      />

      {!query && (
        <div className="absolute top-full left-0 right-0 mt-1 text-xs text-gray-500 bg-white p-2 border border-gray-200 rounded-md">
          Введите минимум 1 букву для поиска
        </div>
      )}

      {open && (
        <div className="absolute z-50 left-0 right-0 bg-white border border-gray-200 rounded-xl mt-2 max-h-64 overflow-auto shadow-xl backdrop-blur-sm bg-white/95">
          {loading && (
            <div className="p-4 text-center">
              <div className="inline-flex items-center">
                <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                <span className="text-sm text-gray-500">Загрузка...</span>
              </div>
            </div>
          )}
          {!loading && suggestions.length === 0 && query.length > 0 && (
            <div className="p-4 text-center text-sm text-gray-500">
              <svg className="w-6 h-6 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ничего не найдено
            </div>
          )}
          {!loading && suggestions.map((s, idx) => (
            <button
              key={(s.data?.fias_id || s.value || "") + "_" + idx}
              type="button"
              onClick={() => handleSelect(s)}
              className="w-full px-4 py-3 text-left hover:bg-orange-50 hover:text-orange-600 transition-colors border-b border-gray-100 last:border-b-0"
            >
              <div className="font-medium text-sm">{s.value}</div>
              {s.data && (
                <div className="text-xs text-gray-500 mt-1">
                  {s.data.region_with_type || s.data.region || ""}{s.data.city_with_type ? `, ${s.data.city_with_type}` : ""}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function HeroAddressSearch() {
  const { city, setCity } = useCity();
  const { isSupportOnly } = useSupportOnly();
  const [form, setForm] = useState({ address: "", phone: "" });
  const [selectedSuggestion, setSelectedSuggestion] = useState<DaDataSuggestion<DaDataAddress> | undefined>(undefined);
  const [error, setError] = useState({ address: false, phone: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCallRequestModalOpen, setIsCallRequestModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [cityFiasId, setCityFiasId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!city || city.trim().length === 0) {
      setCityFiasId(null);
      return;
    }

    let mounted = true;
    (async () => {
      const id = await fetchCityFiasIdByName(city);
      if (mounted) {
        setCityFiasId(id);
        if (!id) console.warn("Не нашли fias_id для города", city);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [city]);

  async function fetchCityFiasIdByName(cityName: string): Promise<string | null> {
    if (!DA_DATA_TOKEN) {
      console.warn("DaData token is not set");
      return null;
    }

    try {
      const res = await fetch("https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Token ${DA_DATA_TOKEN}`,
        },
        body: JSON.stringify({
          query: cityName,
          count: 5,
          from_bound: { value: "city" },
          to_bound: { value: "city" },
        }),
      });

      if (!res.ok) {
        console.error("DaData responded with status", res.status);
        return null;
      }

      const json = await res.json();
      const first = json.suggestions && json.suggestions[0];
      return first?.data?.city_fias_id || first?.data?.fias_id || null;
    } catch (err) {
      console.error("Error fetching city fias id", err);
      return null;
    }
  }

  const handleCitySelect = async (selectedCityName: string, selectedRegionName: string) => {
    setCity(selectedCityName);

    const fetchedFias = await fetchCityFiasIdByName(selectedCityName);
    setCityFiasId(fetchedFias);

    setIsCityDropdownOpen(false);
    document.cookie = `user-city=${encodeURIComponent(selectedCityName)}; path=/; max-age=31536000`;

    const citySlug = slugifyCityName(selectedCityName);
    router.push(`/${citySlug}`);
  };

  const handleCallRequest = () => {
    setIsCallRequestModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newError = {
      address: !form.address.trim(),
      phone: !/^(\+7|8)?[\d\s-]{10,15}$/.test(form.phone)
    };

    setError(newError);
    
    if (newError.address || newError.phone) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitLead({
        type: 'Поиск тарифов по адресу',
        phone: form.phone,
        address: form.address,
      });

      if (result.success) {
        router.push('/complete');
      } else {
        console.error('Failed to submit lead:', result.error);
        router.push('/complete');
      }
    } catch (error) {
      console.error('Error submitting lead:', error);
      router.push('/complete');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Исправленные иконки с правильными путями
  const benefits = [
    { icon: "/icons/abons.svg", text: "11 млн. абонентов" },
    { icon: "/icons/soedineniye.svg", text: "Надежное соединение" },
    { icon: "/icons/onlenekinoandtv.svg", text: "Онлайн кино и ТВ" },
    { icon: "/icons/parens.svg", text: "Родительский контроль" },
    { icon: "/icons/wifidots.svg", text: "Wi-Fi в любой точке" },
    { icon: "/icons/games.svg", text: "Облачный гейминг" },
  ];

  return (
    <section className="relative">
      {/* Убрал все свечения и анимации */}

      {/* Текстура с градиентом МТС - упрощена для мобильных */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#e30611]/5 via-[#8f97de]/10 to-[#ad82f2]/5"></div>

      <div className="container mx-auto px-4 md:px-8 relative z-20 flex flex-col items-center justify-center w-full py-12 md:py-20">
        {/* Main Content */}
        <div className="w-full max-w-6xl flex flex-col lg:flex-row items-start gap-8 lg:gap-16">
          
          {/* Left Content */}
          <div className="flex-1 flex flex-col justify-center">
            {/* Title */}
            <div className="relative mb-6 md:mb-8">
              <h1 className="text-2xl md:text-4xl lg:text-6xl font-extrabold leading-tight mb-4 md:mb-6 text-center">
                <span className="text-gray-900">Домашний интернет</span>
                <br />
                <span className="bg-gradient-to-r from-[#e30611] via-[#ad82f2] to-[#8f97de] bg-clip-text text-transparent">
                  МТС в {city && city.trim().length > 0 ? city.trim() : 'вашем городе'}
                </span>
              </h1>
              <div className="absolute -bottom-2 md:-bottom-4 left-0 right-0 mx-auto w-24 md:w-32 h-1 bg-gradient-to-r from-[#ee3c6b] to-transparent rounded-full"></div>
            </div>

            {/* Premium Card */}
            <div className="relative">
              <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-8 border border-gray-200 shadow-lg">
                <div className="text-base md:text-xl font-medium mb-6 md:mb-8 text-gray-800 leading-relaxed">
                  Узнайте эксклюзивные тарифы и акции МТС, доступные только по вашему адресу
                </div>
                
                <div className="flex items-center mb-6 md:mb-8 relative">
                  <div className="bg-[#ee3c6b] p-2 rounded-full mr-3 md:mr-4">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 12.414A6 6 0 1112.414 13.414l4.243 4.243a1 1 0 001.414-1.414z" />
                    </svg>
                  </div>
                  <span 
                    className="text-base md:text-lg text-gray-800 font-medium cursor-pointer" 
                    onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                  >
                    {city && city.trim().length > 0 ? city.trim() : 'в России'}
                  </span>
                  <CityDropdown 
                    isOpen={isCityDropdownOpen} 
                    onClose={() => setIsCityDropdownOpen(false)} 
                    onSelect={handleCitySelect} 
                    currentCity={city} 
                  />
                </div>

                <SupportOnlyBlock>
                  <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                    {/* Address Field */}
                    <div className="relative">
                      <div className="flex items-center bg-gray-50 rounded-lg md:rounded-xl px-4 md:px-6 py-3 md:py-4 border border-gray-200">
                        <div className="bg-[#ee3c6b] p-1.5 md:p-2 rounded-lg mr-3 md:mr-4">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" fill="currentColor"/>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <CustomAddressSuggestionsFetch
                            cityFiasId={cityFiasId}
                            cityName={city}
                            value={selectedSuggestion}
                            onChange={(suggestion: DaDataSuggestion<DaDataAddress> | undefined) => {
                              setSelectedSuggestion(suggestion);
                              if (suggestion) {
                                setForm({ ...form, address: suggestion.value });
                              }
                            }}
                          />
                        </div>
                      </div>
                      {error.address && (
                        <div className="text-[#ee3c6b] text-xs md:text-sm mt-1 md:mt-2 ml-12 md:ml-14">Пожалуйста, введите адрес</div>
                      )}
                    </div>

                    {/* Phone Field */}
                    <div className="relative">
                      <div className="flex items-center bg-gray-50 rounded-lg md:rounded-xl px-4 md:px-6 py-3 md:py-4 border border-gray-200">
                        <div className="bg-[#ee3c6b] p-1.5 md:p-2 rounded-lg mr-3 md:mr-4">
                          <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                          </svg>
                        </div>
                        <input
                          type="tel"
                          placeholder="Введите номер телефона"
                          className="bg-transparent outline-none flex-1 text-sm md:text-lg px-2 py-1 w-full text-gray-800 placeholder-gray-500"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        />
                      </div>
                      {error.phone && (
                        <div className="text-[#ee3c6b] text-xs md:text-sm mt-1 md:mt-2 ml-12 md:ml-14">Введите корректный номер телефона</div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] text-white font-semibold py-3 md:py-4 px-6 md:px-8 rounded-lg md:rounded-xl transition-all duration-300 text-sm md:text-lg shadow-lg hover:shadow-xl ${
                        isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-white mr-2 md:mr-3"></div>
                          Отправляем...
                        </span>
                      ) : (
                        'Найти эксклюзивные тарифы'
                      )}
                    </button>
                  </form>
                </SupportOnlyBlock>
              </div>
            </div>
          </div>
          
          {/* Right Content - Call Request */}
          <div className="lg:w-96 flex flex-col justify-center mt-8 lg:mt-0">
            <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-8 border border-gray-200 shadow-lg">
              {isSupportOnly ? (
                <div className="text-center">
                  <div className="bg-[#fff2f6] p-3 md:p-4 rounded-lg md:rounded-xl mb-4 md:mb-6 border border-[#ee3c6b]/30">
                    <p className="text-gray-800 text-sm md:text-lg font-semibold">Вы являетесь действующим абонентом</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg md:rounded-xl p-4 md:p-6 border border-gray-200">
                    <p className="text-gray-800 mb-2 md:mb-4 font-medium text-sm md:text-base">Премиум поддержка 24/7</p>
                    <a 
                      href="tel:87501000750" 
                      className="text-lg md:text-2xl font-bold text-[#1e4e9d] tracking-wider block mb-1 md:mb-2 hover:text-[#ee3c6b] transition-colors duration-300"
                    >
                      8 750 100-08-00
                    </a>
                    <p className="text-gray-600 text-xs md:text-sm">Эксклюзивная линия для клиентов</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-center mb-6 md:mb-8">
                    <div className="bg-[#ee3c6b] p-2 md:p-3 rounded-full mb-3 md:mb-4 mx-auto w-10 h-10 md:w-12 md:h-12 flex items-center justify-center">
                      <svg className="w-4 h-4 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </div>
                    <p className="text-gray-800 text-sm md:text-lg mb-1 md:mb-2 font-medium">Или доверьтесь экспертам</p>
                    <p className="text-gray-600 text-xs md:text-sm">Персональный менеджер перезвонит в течение 5 минут</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCallRequest}
                    className="w-full bg-transparent border-2 border-[#ee3c6b] text-[#ee3c6b] hover:bg-[#ee3c6b] hover:text-white font-semibold py-2 md:py-3 px-4 md:px-8 rounded-lg md:rounded-xl transition-all duration-300 text-sm md:text-lg"
                  >
                    Заказать консультацию
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Premium Benefits Section */}
        <div className="w-full max-w-6xl mx-auto mt-12 md:mt-20">
          <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-center mb-8 md:mb-12 relative">
            <span className="bg-gradient-to-r from-[#ee3c6b] via-[#ad82f2] to-[#8f97de] bg-clip-text text-transparent">
              Превосходство в каждой детали
            </span>
            <div className="absolute -bottom-2 md:-bottom-4 left-1/2 transform -translate-x-1/2 w-16 md:w-24 h-1 bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] rounded-full"></div>
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {benefits.map((b, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="relative mb-3 md:mb-4">
                  <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200">
                    <div className="relative w-6 h-6 md:w-8 md:h-8 mx-auto">
                      <Image 
                        src={b.icon} 
                        alt={b.text}
                        width={24}
                        height={24}
                        className="md:w-8 md:h-8"
                        style={{
                          filter: 'brightness(0) saturate(100%) invert(37%) sepia(91%) saturate(1021%) hue-rotate(312deg) brightness(99%) contrast(83%)'
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="text-xs md:text-sm font-medium text-gray-600 px-1 md:px-2 leading-tight">
                  {b.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <CallRequestModal
        isOpen={isCallRequestModalOpen}
        onClose={() => setIsCallRequestModalOpen(false)}
      />
    </section>
  );
}
