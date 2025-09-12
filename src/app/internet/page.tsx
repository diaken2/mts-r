"use client";

import React, { useState, useCallback, Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import TariffCard from "@/components/tariff/TariffCard";
import ContactModal from "@/components/forms/ContactModal";
import ConnectionForm from "@/components/forms/ConnectionForm";
import MobileFiltersDrawer from "@/components/filters/MobileFiltersDrawer";
import { FiFilter } from "react-icons/fi";
import 'rc-slider/assets/index.css';
import Slider from 'rc-slider';
import SegmentationModal from '@/components/ui/SegmentationModal';
import CallRequestModal from '@/components/ui/CallRequestModal';
import HowConnect from '@/components/blocks/HowConnect';
import Bonuses from '@/components/blocks/Bonuses';
import PromoSlider from '@/components/blocks/PromoSlider';
import EquipmentBlock from '@/components/blocks/EquipmentBlock';
import QuestionsBlock from '@/components/blocks/QuestionsBlock';
import InfoBlockKrasnodar from '@/components/blocks/InfoBlockKrasnodar';
import FaqBlock from "@/components/blocks/FaqBlock";
import SupportOnlyBlock from '@/components/ui/SupportOnlyBlock';
import { tariffsData } from '@/components/tariff/tariffsData';
import InputMask from "react-input-mask";
import { submitLead } from '@/lib/submitLead';
import { useSupportOnly } from '@/context/SupportOnlyContext';

const city = "в России";

type Filters = {
  internet: boolean;
  tv: boolean;
  mobile: boolean;
  onlineCinema: boolean;
  gameBonuses: boolean;
  promotions: boolean;
  freeInstallation: boolean;
  wifiRouter: boolean;
  hitsOnly: boolean;
  connectionType: string;
  priceRange: number[];
  speedRange: number[];
  [key: string]: any;
};

const defaultFilters = {
  internet: true,
  tv: false,
  mobile: false,
  onlineCinema: false,
  gameBonuses: false,
  promotions: false,
  freeInstallation: false,
  wifiRouter: false,
  hitsOnly: false,
  connectionType: "apartment",
  priceRange: [300, 1650],
  speedRange: [50, 1000],
};

const getServiceFiltersForCategory = (categoryId: string) => {
  switch (categoryId) {
    case "internet":
      return { internet: true, tv: false, mobile: false };
    case "internet-tv":
      return { internet: true, tv: true, mobile: false };
    case "internet-mobile":
      return { internet: true, tv: false, mobile: true };
    case "internet-tv-mobile":
      return { internet: true, tv: true, mobile: true };
    default:
      return { internet: false, tv: false, mobile: false };
  }
};

const isTariffInCategory = (tariff: any, categoryId: string) => {
  switch (categoryId) {
    case "internet":
      return tariff.type === "Интернет";
    case "internet-tv":
      return tariff.type === "Интернет + ТВ";
    case "internet-mobile":
      return tariff.type === "Интернет + Моб. связь";
    case "internet-tv-mobile": {
      const hasInternet = tariff.speed > 0;
      const hasTV = (tariff.tvChannels || 0) > 0;
      const hasMobile = (tariff.mobileData || 0) > 0 || (tariff.mobileMinutes || 0) > 0;
      if (hasInternet && hasTV && hasMobile) return true;
      if (tariff.type === "Интернет + ТВ + Моб. связь") {
        const categoryKeywords = ['выгоды', 'семейный', 'игровой', 'комбинированный', 'тест-драйв'];
        if (categoryKeywords.some(keyword => tariff.name.toLowerCase().includes(keyword))) {
          return true;
        }
      }
      if (tariff.name.toLowerCase().includes('тест-драйв')) {
        const hasAnyTV = tariff.type.includes('ТВ') || (tariff.tvChannels || 0) > 0;
        const hasAnyMobile = tariff.type.includes('Моб. связь') || (tariff.mobileData || 0) > 0 || (tariff.mobileMinutes || 0) > 0;
        if (hasInternet && hasAnyTV && hasAnyMobile) return true;
      }
      return false;
    }
    default:
      return true;
  }
};

const houseTypes = ["Квартира", "Частный дом", "Офис"];

function TariffHelpForm() {
  const [step, setStep] = React.useState<null | 'connection' | 'support'>(null);
  const [houseType, setHouseType] = React.useState(houseTypes[0]);
  const [phone, setPhone] = React.useState("");
  const [name, setName] = React.useState("");
  const [supportValue, setSupportValue] = React.useState<string | null>(null);
  const isFormValid = phone.replace(/\D/g, "").length === 10 && name.trim().length > 1;
  const [submitted, setSubmitted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();
  const { setSupportOnly } = useSupportOnly();
interface TimeSlot {
  value: string;
  label: string;
}
  const [callTime, setCallTime] = useState('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [shouldOpenUp, setShouldOpenUp] = useState(false);
  const timeDropdownRef = useRef<HTMLDivElement>(null);

  // Генерация временных слотов
  useEffect(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const slots: TimeSlot[] = [];

    // Определяем рабочее время (6:00-21:00)
    const isWorkingHours = currentHour >= 6 && currentHour < 21;

    if (!isWorkingHours) {
      slots.push({
        value: 'out-of-hours',
        label: 'Перезвоним в рабочее время'
      });
      
      for (let hour = 6; hour <= 11; hour++) {
        slots.push({
          value: `tomorrow-${hour}`,
          label: `Завтра ${hour}:00-${hour + 1}:00`
        });
      }
      
      setTimeSlots(slots);
      setCallTime('out-of-hours');
      return;
    }

    // Рабочее время
    slots.push({
      value: 'asap',
      label: 'Перезвоним в течение 15 минут'
    });

    let slotHour = currentHour;
    let slotMinute = Math.ceil(currentMinute / 15) * 15;
    
    if (slotMinute === 60) {
      slotHour += 1;
      slotMinute = 0;
    }
    
    while (slotHour < 21 && slots.length < 8) {
      let endMinute = slotMinute + 15;
      let endHour = slotHour;
      
      if (endMinute >= 60) {
        endHour += 1;
        endMinute = endMinute - 60;
      }
      
      if (endHour > 21 || (endHour === 21 && endMinute > 0)) {
        break;
      }
      
      slots.push({
        value: `today-${slotHour}-${slotMinute}`,
        label: `Сегодня ${slotHour}:${slotMinute.toString().padStart(2, '0')}-${endHour}:${endMinute.toString().padStart(2, '0')}`
      });
      
      slotMinute += 15;
      if (slotMinute >= 60) {
        slotHour += 1;
        slotMinute = 0;
      }
    }

    if (slots.length < 8) {
      for (let hour = 6; hour <= 11; hour++) {
        if (slots.length >= 8) break;
        slots.push({
          value: `tomorrow-${hour}`,
          label: `Завтра ${hour}:00-${hour + 1}:00`
        });
      }
    }

    setTimeSlots(slots);
    setCallTime('asap');
  }, []);

  useEffect(() => {
    if (isTimeDropdownOpen && timeDropdownRef.current) {
      const rect = timeDropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setShouldOpenUp(spaceBelow < 350);
    }
  }, [isTimeDropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(event.target as Node)) {
        setIsTimeDropdownOpen(false);
      }
    };

    if (isTimeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTimeDropdownOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitted(true);

    try {
      const selectedSlot = timeSlots.find(slot => slot.value === callTime);
      const callTimeText = selectedSlot?.label || callTime;

      const result = await submitLead({
        type: step === 'connection' ? 'Новое подключение' : 'Поддержка существующего абонента',
        name: name,
        phone: phone,
        houseType: houseType,
        supportValue: supportValue || undefined,
        callTime: callTimeText,
      });

      if (result.success) {
        setTimeout(() => {
          setSubmitted(false);
          setPhone(""); 
          setName("");
          router.push('/complete');
        }, 2000);
      } else {
        console.error('Failed to submit lead:', result.error);
        // В случае ошибки все равно показываем успех пользователю
        setTimeout(() => {
          setSubmitted(false);
          setPhone(""); 
          setName("");
          router.push('/complete');
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting lead:', error);
      // В случае ошибки все равно показываем успех пользователю
      setTimeout(() => {
        setSubmitted(false);
        setPhone(""); 
        setName("");
        router.push('/complete');
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // step === 'support'
  React.useEffect(() => {
    if (step === 'support' && supportValue) {
      setSupportOnly(true);
    }
  }, [step, supportValue, setSupportOnly]);

  if (!step) {
    return (
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button className="bg-mts-red hover:bg-mts-red-dark text-white font-bold rounded-full px-10 py-4 text-lg transition" onClick={() => setStep('connection')}>Новое подключение</button>
        <button className="bg-transparent border-2 border-white text-white font-bold rounded-full px-10 py-4 text-lg transition hover:bg-white hover:text-[#7500ff]" onClick={() => setStep('support')}>Я существующий абонент</button>
      </div>
    );
  }

  if (step === 'connection') {
    return (
      <>
        <form className="w-full flex flex-col gap-4" autoComplete="off" onSubmit={handleSubmit}>
          {/* Радиокнопки */}
          <div className="flex flex-row gap-8 items-center mb-2 overflow-x-auto pb-2">
            {houseTypes.map((type) => (
              <label key={type} className="flex items-center cursor-pointer select-none text-[16px] font-medium font-sans flex-shrink-0">
                <span className={`w-7 h-7 flex items-center justify-center rounded-full border-2 mr-2 transition-all duration-150 ${houseType === type ? "border-mts-red bg-mts-red" : "border-gray-300 bg-white"}`}>
                  {houseType === type && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5" fill="#fff" /></svg>
                  )}
                </span>
                <input type="radio" name="houseType" value={type} checked={houseType === type} onChange={() => setHouseType(type)} className="hidden" />
                <span className={`text-[16px] font-medium font-sans ${houseType === type ? "text-white" : "text-white/80"}`}>{type}</span>
              </label>
            ))}
          </div>
          {/* Поля и кнопка в один ряд */}
          <div className="flex flex-col md:flex-row gap-4 items-end w-full">
            {/* Телефон */}
            <div className="w-full md:flex-1">
              <label className="text-[14px] font-medium font-sans mb-1 text-white text-left">Введите телефон</label>
              <div className="flex flex-row items-center bg-white rounded-full overflow-hidden h-[44px]">
                <span className="bg-gray-100 text-gray-500 px-3 h-full flex items-center font-semibold text-base rounded-l-full select-none">+7</span>
                <InputMask
                  mask="(999) 999-99-99"
                  value={phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                  className="flex-1 bg-transparent border-none px-2 py-2 text-base text-[#222] placeholder-[#bbb] outline-none focus:ring-2 focus:ring-orange-500 transition font-sans"
                  placeholder="(___) ___-__-__"
                  type="tel"
                  autoComplete="tel"
                />
              </div>
            </div>
            {/* Имя */}
            <div className="w-full md:flex-1">
              <label className="text-[14px] font-medium font-sans mb-1 text-white text-left">Введите имя</label>
              <input
                type="text"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                className="w-full rounded-full bg-white px-4 py-2 text-base text-[#222] placeholder-[#bbb] outline-none focus:ring-2 focus:ring-orange-500 transition h-[44px] font-sans"
                placeholder="Имя"
                autoComplete="name"
              />
            </div>
            {/* Кнопка */}
            <button
              type="submit"
              className={`w-full md:w-[200px] h-[44px] rounded-full px-6 text-[16px] font-medium font-sans transition ml-0 md:ml-4 ${isFormValid && !submitted && !isSubmitting ? "bg-mts-red text-white" : "bg-[#FFD6C2] text-white cursor-not-allowed"}`}
              disabled={!isFormValid || submitted || isSubmitting}
            >
              {submitted ? 'Отправлено!' : isSubmitting ? 'Отправляем...' : 'Жду звонка'}
            </button>
          </div>
          {/* Выбор времени */}
          <div className="relative mt-3" ref={timeDropdownRef}>
            <button
              type="button"
              onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
              className={`
                flex items-center gap-2 justify-start text-left transition-all
                text-white text-[13px] font-normal font-sans
                ${isTimeDropdownOpen ? 'opacity-100' : 'opacity-80'}
              `}
            >
              <span>
                {timeSlots.find(slot => slot.value === callTime)?.label || 'Перезвоним в течение 15 минут'}
              </span>
              <svg className={`w-[18px] h-[18px] transition-transform ${isTimeDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24">
                <path d="M7 10l5 5 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {isTimeDropdownOpen && (
              <div className={`
                absolute left-0 right-auto mt-1 bg-white border border-gray-200 rounded-xl shadow-lg
                z-10 max-h-60 overflow-y-auto
                ${shouldOpenUp ? 'bottom-full mb-1' : 'top-full'}
              `}>
                {timeSlots.map((slot) => (
                  <button
                    key={slot.value}
                    type="button"
                    onClick={() => {
                      setCallTime(slot.value);
                      setIsTimeDropdownOpen(false);
                    }}
                    className={`
                      w-full px-4 py-3 text-left transition-colors
                      ${callTime === slot.value
                        ? 'bg-[#ee3c6b] text-white'
                        : 'text-gray-900 hover:bg-gray-50'
                      }
                    `}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Юридическая строка */}
          <p className="text-[12px] font-light font-sans mt-2 text-left text-[#D8B5FF]">Отправляя заявку, вы соглашаетесь с <a href="#" className="underline">политикой обработки персональных данных</a></p>
        </form>
      </>
    );
  }
}


function getCityFromCookie() {
  if (typeof document === "undefined") return "в России";
  const match = document.cookie.match(/(?:^|; )user-city=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : "в России";
}

function InternetPageContent() {
  const [visibleCount, setVisibleCount] = useState(6);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);
  const [isCallRequestModalOpen, setIsCallRequestModalOpen] = useState(false);
  const [selectedTariff, setSelectedTariff] = useState(null);
  const [isSegmentationModalOpen, setIsSegmentationModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState("popular");
  const [activeCategory, setActiveCategory] = useState("internet");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    ...defaultFilters,
    internet: true,
    tv: false,
    mobile: false
  });
  const { isSupportOnly } = useSupportOnly();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [city, setCity] = useState("");
 const [citySlug, setCitySlug]=useState('')
  useEffect(() => {
    setCity(getCityFromCookie());
  }, []);
useEffect(()=>{
const slug = city
              .toLowerCase()
              .replace(/^(г\.|пгт|село|аул|деревня|поселок|ст-ца|п\.)\s*/i, "")
              .replace(/ё/g, "e")
              .replace(/\s+/g, "-")
              .replace(/[а-я]/g, (c: string) => {
                const map: Record<string, string> = {
                  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ж: "zh", з: "z", и: "i", й: "i",
                  к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f",
                  х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch", ы: "y", э: "e", ю: "yu", я: "ya"
                };
                return map[c] || "";
              })
              .replace(/[^a-z0-9-]/g, "");
              setCitySlug(slug)
},[city])
  // Обработка URL параметров
  React.useEffect(() => {
    const urlCategory = searchParams.get('filter');
    if (urlCategory && urlCategory !== activeCategory) {
      setActiveCategory(urlCategory);
      setFilters(prev => ({ ...prev, ...getServiceFiltersForCategory(urlCategory) }));
    } else if (!urlCategory) {
      // Если нет параметра в URL, устанавливаем фильтры для текущей страницы
      const serviceFilters = getServiceFiltersForCategory(activeCategory);
      setFilters(prev => ({ ...prev, ...serviceFilters }));
    }
  }, [searchParams, activeCategory, pathname, router]);

  // Мемоизированная фильтрация и сортировка тарифов
  const filteredTariffs = React.useMemo(() => {
    let filtered = tariffsData;
    const isDefaultPrice = filters.priceRange[0] === 300 && filters.priceRange[1] === 1650;
    const isDefaultSpeed = filters.speedRange[0] === 50 && filters.speedRange[1] === 1000;
    const hasActiveFilters = filters.internet || filters.tv || filters.mobile || filters.onlineCinema || filters.gameBonuses;

    if (
      activeCategory !== "all" ||
      hasActiveFilters ||
      !isDefaultPrice ||
      !isDefaultSpeed ||
      filters.promotions ||
      filters.hitsOnly
    ) {
      filtered = tariffsData.filter(tariff => {
        let categoryMatch = true;
        if (activeCategory !== "all") {
          categoryMatch = isTariffInCategory(tariff, activeCategory);
        }
        let sidebarMatch = true;
        if (activeCategory === "all" && hasActiveFilters) {
          sidebarMatch = 
            (filters.internet && tariff.type.includes("Интернет")) ||
            (filters.tv && tariff.type.includes("ТВ")) ||
            (filters.mobile && tariff.type.includes("Моб. связь")) ||
            (filters.onlineCinema && tariff.features.some(f => f.includes("KION"))) ||
            (filters.gameBonuses && tariff.features.some(f => f.includes("Игровой") || f.includes("Бонусы в играх")));
        }
        const promoMatch = !filters.promotions || 
          tariff.discountPrice !== undefined || 
          tariff.name.toLowerCase().includes('тест-драйв');
        const hitsMatch = !filters.hitsOnly || tariff.isHit;
        const basePrice = tariff.price;
        const priceMatch = basePrice >= filters.priceRange[0] && basePrice <= filters.priceRange[1];
        const speedMatch = tariff.speed >= filters.speedRange[0] && tariff.speed <= filters.speedRange[1];
        return categoryMatch && sidebarMatch && promoMatch && hitsMatch && priceMatch && speedMatch;
      });
    }
    switch (sortBy) {
      case "speed":
        filtered = [...filtered].sort((a, b) => b.speed - a.speed);
        break;
      case "price-low":
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
      default:
        filtered = [...filtered].sort((a, b) => {
          if (a.isHit && !b.isHit) return -1;
          if (!a.isHit && b.isHit) return 1;
          if (a.isHit === b.isHit) return b.speed - a.speed;
          return 0;
        });
    }
    return filtered;
  }, [filters, activeCategory, sortBy]);

  // Категории для быстрого фильтра
  const categories = [
    { id: "all", label: "Все", count: tariffsData.length },
    { id: "internet", label: "Интернет", count: tariffsData.filter(t => t.type === "Интернет").length },
    { id: "internet-tv", label: "Интернет + ТВ", count: tariffsData.filter(t => t.type === "Интернет + ТВ").length },
    { id: "internet-mobile", label: "Интернет + Моб. связь", count: tariffsData.filter(t => t.type === "Интернет + Моб. связь").length },
    { id: "internet-tv-mobile", label: "Интернет + ТВ + Моб. связь", count: tariffsData.filter(t => {
      const hasInternet = t.speed > 0;
      const hasTV = (t.tvChannels || 0) > 0;
      const hasMobile = (t.mobileData || 0) > 0 || (t.mobileMinutes || 0) > 0;
      if (hasInternet && hasTV && hasMobile) return true;
      if (t.type === "Интернет + ТВ + Моб. связь") {
        const categoryKeywords = ['выгоды', 'семейный', 'игровой', 'комбинированный', 'тест-драйв'];
        if (categoryKeywords.some(keyword => t.name.toLowerCase().includes(keyword))) {
          return true;
        }
      }
      if (t.name.toLowerCase().includes('тест-драйв')) {
        const hasAnyTV = t.type.includes('ТВ') || (t.tvChannels || 0) > 0;
        const hasAnyMobile = t.type.includes('Моб. связь') || (t.mobileData || 0) > 0 || (t.mobileMinutes || 0) > 0;
        if (hasInternet && hasAnyTV && hasAnyMobile) return true;
      }
      return false;
    }).length }
  ];

  const mapFiltersToCategory = (f: Filters) => {
    if (f.internet && f.tv && f.mobile) return "internet-tv-mobile";
    if (f.internet && f.tv && !f.mobile) return "internet-tv";
    if (f.internet && !f.tv && f.mobile) return "internet-mobile";
    if (f.internet && !f.tv && !f.mobile) return "internet";
    return "all";
  };

  const handleTariffClick = (tariff: any) => {
    setSelectedTariff(tariff);
    setIsSegmentationModalOpen(true);
  };

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters(prev => {
      const updated = { ...prev, ...newFilters };
      const cat = mapFiltersToCategory(updated);
      setActiveCategory(cat);
      return updated;
    });
  };

  const resetFilters = useCallback(() => {
    setActiveCategory("all");
    setFilters({
      ...defaultFilters,
      internet: true,
      tv: false,
      mobile: false
    });
  }, []);

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    if (categoryId === "all") {
      setFilters(prev => ({
        ...prev,
        internet: true,
        tv: false,
        mobile: false,
        onlineCinema: false,
        gameBonuses: false
      }));
    } else {
      const serviceFilters = getServiceFiltersForCategory(categoryId);
      setFilters(prev => ({
        ...prev,
        ...serviceFilters,
      }));
    }
  };

  const handleMobileFiltersApply = () => {
    setIsMobileFiltersOpen(false);
  };

  const scrollToTariffs = () => {
    const tariffsSection = document.getElementById('tariffs-section');
    if (tariffsSection) {
      tariffsSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleFooterCategoryClick = (categoryId: string) => {
    handleCategoryChange(categoryId);
    setTimeout(() => {
      scrollToTariffs();
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
              <div style={{background: "linear-gradient(90deg, #E30613 0%, #000000 100%)", padding: "20px 0 32px 0", color: "#fff"}} className="md:py-8 md:pb-12">
        <div style={{maxWidth: 1200, margin: "0 auto", padding: "0 16px"}}>
          <div style={{fontSize: 14, opacity: 0.8, marginBottom: 12}} className="md:text-base md:mb-4">
            МТС / {city} / <b>Интернет</b>
          </div>
          <h1 style={{fontSize: 28, fontWeight: 650, lineHeight: 1.1}} className="md:text-5xl">
            Тарифы МТС на интернет в {city}
          </h1>
        </div>
      </div>
      <main className="flex-grow container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="hidden lg:block lg:w-1/4 order-2 lg:order-1">
            <div className="card sticky top-4">
              <h3 className="text-lg font-bold mb-6">Фильтры</h3>
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Услуги</h4>
                <div className="space-y-3">
                  {[
                    { key: 'internet', label: 'Интернет' },
                    { key: 'tv', label: 'ТВ' },
                    { key: 'mobile', label: 'Мобильная связь' },
                    { key: 'onlineCinema', label: 'Онлайн-кинотеатры' },
                    { key: 'gameBonuses', label: 'Игровые бонусы' }
                  ].map(item => (
                    <label key={item.key} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters[item.key]}
                        onChange={() => handleFilterChange({ [item.key]: !filters[item.key] })}
                        className="checkbox-custom mr-3"
                      />
                      <span className="text-sm">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Спецпредложения</h4>
                <div className="space-y-3">
                  {[
                    { key: 'promotions', label: '% Акции' },
                    { key: 'hitsOnly', label: 'Только хиты' }
                  ].map(item => (
                    <label key={item.key} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters[item.key]}
                        onChange={() => handleFilterChange({ [item.key]: !filters[item.key] })}
                        className="checkbox-custom mr-3"
                      />
                      <span className="text-sm">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Стоимость в месяц (₽)</h4>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{filters.priceRange[0]}</span>
                  <span>{filters.priceRange[1]}</span>
                </div>
                <Slider
                  range
                  min={300}
                  max={1650}
                  value={filters.priceRange}
                  onChange={(value) => Array.isArray(value) && handleFilterChange({ priceRange: value })}
                  trackStyle={[{ backgroundColor: '#FF6600' }]}
                  handleStyle={[{ borderColor: '#FF6600', backgroundColor: '#FF6600' }, { borderColor: '#FF6600', backgroundColor: '#FF6600' }]}
                  railStyle={{ backgroundColor: '#eee' }}
                />
              </div>
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Скорость (Мбит/с)</h4>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{filters.speedRange[0]}</span>
                  <span>{filters.speedRange[1]}</span>
                </div>
                <Slider
                  range
                  min={50}
                  max={1000}
                  value={filters.speedRange}
                  onChange={(value) => Array.isArray(value) && handleFilterChange({ speedRange: value })}
                  trackStyle={[{ backgroundColor: '#FF6600' }]}
                  handleStyle={[{ borderColor: '#FF6600', backgroundColor: '#FF6600' }, { borderColor: '#FF6600', backgroundColor: '#FF6600' }]}
                  railStyle={{ backgroundColor: '#eee' }}
                />
              </div>
            </div>
          </aside>
          <div id="tariffs-section" className="lg:w-3/4 order-1 lg:order-2">
            <div className="mb-6 -mx-4 lg:mx-0">
              <div className="flex gap-3 items-center px-4 overflow-x-auto scroll-smooth whitespace-nowrap lg:flex-wrap lg:overflow-visible lg:whitespace-normal">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeCategory === category.id ? 'bg-rt-cta text-white' : 'bg-gray-100 text-gray-650 hover:bg-gray-200'}`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold">
                Доступные тарифы
                <span className="text-lg font-normal text-gray-600 ml-2">
                  ({filteredTariffs.length})
                </span>
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Сортировка:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                  }}
                  className="form-input py-2 text-sm min-w-[140px]"
                >
                  <option value="popular">Популярные</option>
                  <option value="speed">Быстрые</option>
                  <option value="price-low">Подешевле</option>
                  <option value="price-high">Подороже</option>
                </select>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={() => setIsMobileFiltersOpen(true)}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setIsMobileFiltersOpen(true)}
                  className="lg:hidden inline-flex items-center gap-1 text-sm font-medium text-rt-cta active:opacity-60"
                >
                  <FiFilter size={16} />
                  Все фильтры
                </span>
              </div>
            </div>
            {/* {filteredTariffs.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredTariffs.slice(0, visibleCount).map((tariff) => (
                    <TariffCard
                      key={tariff.id}
                      tariff={tariff}
                      onClick={() => handleTariffClick(tariff)}
                    />
                  ))}
                </div>
                {visibleCount < filteredTariffs.length && (
                  <div className="text-center mt-6">
                    <button className="btn-secondary" onClick={() => setVisibleCount(prev => Math.min(prev + 5, filteredTariffs.length))}>Показать ещё</button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-650 mb-2">Тарифы не найдены</h3>
                <p className="text-gray-600 mb-6">Попробуйте изменить параметры фильтрации</p>
                <button
                  onClick={resetFilters}
                  className="btn-secondary"
                >
                  Сбросить фильтры
                </button>
              </div>
            )} */}
            <section className="mt-12 rounded-3xl bg-[#6500FF] p-6 md:p-12 text-white flex flex-col items-center justify-center max-w-3xl mx-auto shadow-lg">
              <div className="w-full flex flex-col gap-2 md:gap-4">
                <h2 className="text-[28px] leading-[1.05] font-bold font-sans mb-2 md:mb-3 text-left text-white">Хотите быстро найти самый выгодный тариф?</h2>
                <p className="text-[18px] leading-[1.2] font-normal font-sans mb-4 md:mb-6 text-left max-w-xl text-white">Подберите тариф с экспертом. Найдём для вас лучшее решение с учетом ваших пожеланий</p>
                <SupportOnlyBlock>
                  <TariffHelpForm />
                </SupportOnlyBlock>
              </div>
            </section>
          </div>
        </div>
      </main>
      <HowConnect onOpenSegmentationModal={() => setIsSegmentationModalOpen(true)} />
      <Bonuses />
      <PromoSlider onOpenSegmentationModal={() => setIsSegmentationModalOpen(true)} />
      <InfoBlockKrasnodar />
      <EquipmentBlock />
      <FaqBlock />
      <SupportOnlyBlock isQuestionsBlock={true}>
        <QuestionsBlock />
      </SupportOnlyBlock>
      <Footer cityName={citySlug} />
      <SegmentationModal
        isOpen={isSegmentationModalOpen}
        onClose={() => setIsSegmentationModalOpen(false)}
        onNewConnection={() => setIsConnectionModalOpen(true)}
        onExistingConnection={() => setIsConnectionModalOpen(true)}
      />
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
      <ConnectionForm
        isOpen={isConnectionModalOpen}
        onClose={() => setIsConnectionModalOpen(false)}
      />
      <CallRequestModal
        isOpen={isCallRequestModalOpen}
        onClose={() => setIsCallRequestModalOpen(false)}
      />
      <MobileFiltersDrawer
        open={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
        filters={filters}
        onFiltersChange={handleFilterChange}
        onApply={handleMobileFiltersApply}
        onClear={resetFilters}
      />
    </div>
  );
}

export default function InternetPage() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <InternetPageContent />
    </Suspense>
  );
}