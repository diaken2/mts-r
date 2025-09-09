"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import TariffCard from "@/components/tariff/TariffCard";
import ContactModal from "@/components/forms/ContactModal";
import ConnectionForm from "@/components/forms/ConnectionForm";
import MobileFiltersDrawer from "@/components/filters/MobileFiltersDrawer";
import { FiFilter, FiChevronDown } from "react-icons/fi";
import SegmentationModal from "@/components/ui/SegmentationModal";
import CallRequestModal from "@/components/ui/CallRequestModal";
import HowConnect from "@/components/blocks/HowConnect";
import Bonuses from "@/components/blocks/Bonuses";
import PromoSlider from "@/components/blocks/PromoSlider";
import EquipmentBlock from "@/components/blocks/EquipmentBlock";
import QuestionsBlock from "@/components/blocks/QuestionsBlock";
import InfoBlockKrasnodar from "@/components/blocks/InfoBlockKrasnodar";
import FaqBlock from "@/components/blocks/FaqBlock";
import SupportOnlyBlock from "@/components/ui/SupportOnlyBlock";
import { useSupportOnly } from "@/context/SupportOnlyContext";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { submitLead } from "@/lib/submitLead";
import InputMask from "react-input-mask";

type Filters = {
  internet: boolean;
  tv: boolean;
  mobile: boolean;
  onlineCinema: boolean;
  gameBonuses: boolean;
  promotions: boolean;
  hitsOnly: boolean;
  priceRange: number[];
  speedRange: number[];
};
type BooleanFilterKey = 
  | 'internet'
  | 'tv'
  | 'mobile'
  | 'onlineCinema'
  | 'gameBonuses'
  | 'promotions'
  | 'hitsOnly';

const defaultFilters: Filters = {
  internet: true,
  tv: false,
  mobile: false,
  onlineCinema: false,
  gameBonuses: false,
  promotions: false,
  hitsOnly: false,
  priceRange: [300, 1650],
  speedRange: [50, 1000],
};

const houseTypes = ["Квартира", "Частный дом", "Офис"];
const supportOptions = [
  "Оплата услуг",
  "Оборудование",
  "Не работает интернет/ТВ"
];
interface TimeSlot {
  value: string;
  label: string;
}
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


export default function TariffExplorer({
  tariffs,
  cityName,
  citySlug,
  service,
  titleservice,
  origservice
}: {
  tariffs: any[];
  cityName: string;
  citySlug: string;
  service: string;
  titleservice: string;
  origservice: string;
}) {
  const [visibleCount, setVisibleCount] = useState(6);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);
  const [isCallRequestModalOpen, setIsCallRequestModalOpen] = useState(false);
  const [isSegmentationModalOpen, setIsSegmentationModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState("popular");
  const [activeCategory, setActiveCategory] = useState("all");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({ ...defaultFilters });
  const { isSupportOnly } = useSupportOnly();
  const searchParams = useSearchParams();
  const router = useRouter();

  const categoryMapping = useMemo((): Record<string, string> => ({
    internet: "Интернет",
    "internet-tv": "Интернет + ТВ",
    "internet-mobile": "Интернет + Моб. связь",
    "internet-tv-mobile": "Интернет + ТВ + Моб. связь",
  }), []);

  const getTariffTypeKey = (type: string): string => {
    const hasInternet = /интернет/i.test(type);
    const hasTV = /тв/i.test(type);
    const hasMobile = /моб/i.test(type);

    if (hasInternet && hasTV && hasMobile) return "internet-tv-mobile";
    if (hasInternet && hasTV) return "internet-tv";
    if (hasInternet && hasMobile) return "internet-mobile";
    if (hasInternet) return "internet";
    return "other";
  };

  useEffect(() => {
    if (categoryMapping[origservice]) {
      setActiveCategory(origservice);
      setFilters(prev => ({
        ...prev,
        ...getServiceFiltersForCategory(origservice),
      }));
    }
  }, [origservice, categoryMapping]);

  const filteredTariffs = useMemo(() => {
    const hasActiveFilters = filters.internet || filters.tv || filters.mobile ||
      filters.onlineCinema || filters.gameBonuses;

    return tariffs.filter((tariff) => {
      const typeKey = getTariffTypeKey(tariff.type || "");
      const featureText = `${tariff.name ?? ''} ${(tariff.features || []).join(' ')}`.toLowerCase();

      let categoryMatch = true;
      if (activeCategory !== "all") {
        categoryMatch = typeKey === activeCategory;
      }

      let sidebarMatch = true;
      if (activeCategory === 'all' && hasActiveFilters) {
        sidebarMatch =
          (filters.internet && tariff.type.includes('Интернет')) ||
          (filters.tv && tariff.type.includes('ТВ')) ||
          (filters.mobile && tariff.type.includes('Моб')) ||
          (filters.onlineCinema && (
            featureText.includes('kion') ||
            featureText.includes('фильм') ||
            featureText.includes('сериал') ||
            featureText.includes('кино')
          )) ||
          (filters.gameBonuses && (
            featureText.includes('игров') ||
            featureText.includes('бонус')
          ));
      }

      const promoMatch =
        !filters.promotions ||
        tariff.discountPrice !== undefined ||
        tariff.discountPercentage !== undefined;

      const hitsMatch = !filters.hitsOnly || tariff.isHit;

      const priceMatch =
        tariff.price >= filters.priceRange[0] &&
        tariff.price <= filters.priceRange[1];

      const speedMatch =
        !tariff.speed ||
        (tariff.speed >= filters.speedRange[0] &&
          tariff.speed <= filters.speedRange[1]);

      return categoryMatch && sidebarMatch && promoMatch && hitsMatch && priceMatch && speedMatch;
    });
  }, [tariffs, filters, activeCategory]);

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters((prev) => {
      const updated = { ...prev, ...newFilters };
      const { internet, tv, mobile } = updated;

      let nextCategory = 'all';
      if (internet && tv && mobile) nextCategory = 'internet-tv-mobile';
      else if (internet && tv) nextCategory = 'internet-tv';
      else if (internet && mobile) nextCategory = 'internet-mobile';
      else if (internet && !tv && !mobile) nextCategory = 'internet';

      if ((!internet && tv && !mobile) || (!internet && !tv && mobile)) {
        nextCategory = 'all';
      }

      setActiveCategory(nextCategory);
      return updated;
    });
  };

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    if (categoryId === 'all') {
      setFilters(prev => ({
        ...prev,
        internet: false,
        tv: false,
        mobile: false,
      }));
    } else {
      const serviceFilters = getServiceFiltersForCategory(categoryId);
      setFilters(prev => ({
        ...prev,
        ...serviceFilters,
      }));
    }
  };

  const resetFilters = () => {
    setFilters({ ...defaultFilters });
    setActiveCategory("all");
  };

  const sortedTariffs = useMemo(() => {
    switch (sortBy) {
      case "speed":
        return [...filteredTariffs].sort((a, b) => (b.speed || 0) - (a.speed || 0));
      case "price-low":
        return [...filteredTariffs].sort((a, b) => a.price - b.price);
      case "price-high":
        return [...filteredTariffs].sort((a, b) => b.price - a.price);
      default:
        return filteredTariffs;
    }
  }, [filteredTariffs, sortBy]);

  const isAllCategoryActive = !filters.internet && !filters.tv && !filters.mobile;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#e30611]/5 via-[#8f97de]/10 to-[#ad82f2]/5 py-8">
        <div className="container mx-auto px-4">
          <div className="text-sm text-gray-600 mb-2">
            МТС / {cityName} / <b>{titleservice}</b>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Тарифы МТС на {service} в {cityName}
          </h1>
        </div>
      </div>

      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* Desktop Filters */}
        <aside className="hidden lg:block w-1/4">
          <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-4">
            <h3 className="text-lg font-bold mb-6 text-gray-900">Фильтры</h3>

            <div className="mb-6">
              <h4 className="font-semibold mb-4 text-gray-900">Услуги</h4>
              <div className="space-y-3">
                {[
                  { key: 'internet', label: 'Интернет' },
                  { key: 'tv', label: 'ТВ' },
                  { key: 'mobile', label: 'Мобильная связь' },
                  { key: 'onlineCinema', label: 'Онлайн-кинотеатр' },
                  { key: 'gameBonuses', label: 'Игровые бонусы' },
                ].map(item => (
                  <label key={item.key} className="flex items-center space-x-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={filters[item.key as BooleanFilterKey]}
                        onChange={() => handleFilterChange({ [item.key]: !filters[item.key as BooleanFilterKey] })}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        filters[item.key as BooleanFilterKey] 
                          ? 'bg-[#ee3c6b] border-[#ee3c6b]' 
                          : 'border-gray-300 group-hover:border-[#ee3c6b]'
                      }`}>
                        {filters[item.key as BooleanFilterKey] && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-gray-700 group-hover:text-[#ee3c6b] transition-colors">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold mb-4 text-gray-900">Спецпредложения</h4>
              {[
                { key: 'promotions', label: '% Акции' },
                { key: 'hitsOnly', label: 'Только хиты' },
              ].map(item => (
                <label key={item.key} className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={filters[item.key as BooleanFilterKey]}
                      onChange={() => handleFilterChange({ [item.key]: !filters[item.key as BooleanFilterKey] })}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      filters[item.key as BooleanFilterKey] 
                        ? 'bg-[#ee3c6b] border-[#ee3c6b]' 
                        : 'border-gray-300 group-hover:border-[#ee3c6b]'
                    }`}>
                      {filters[item.key as BooleanFilterKey] && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-gray-700 group-hover:text-[#ee3c6b] transition-colors">{item.label}</span>
                </label>
              ))}
            </div>

            <div className="mb-6">
              <h4 className="font-semibold mb-4 text-gray-900">Стоимость в месяц (₽)</h4>
              <div className="flex justify-between text-sm text-gray-600 mb-3">
                <span>{filters.priceRange[0]}</span>
                <span>{filters.priceRange[1]}</span>
              </div>
              <Slider
                range
                min={300}
                max={1650}
                value={filters.priceRange}
                onChange={(value) => Array.isArray(value) && handleFilterChange({ priceRange: value })}
                trackStyle={[{ backgroundColor: '#ee3c6b' }]}
                handleStyle={[
                  { borderColor: '#ee3c6b', backgroundColor: '#ee3c6b' },
                  { borderColor: '#ee3c6b', backgroundColor: '#ee3c6b' }
                ]}
                railStyle={{ backgroundColor: '#e5e5ed' }}
              />
            </div>

            <div className="mb-6">
              <h4 className="font-semibold mb-4 text-gray-900">Скорость (Мбит/с)</h4>
              <div className="flex justify-between text-sm text-gray-600 mb-3">
                <span>{filters.speedRange[0]}</span>
                <span>{filters.speedRange[1]}</span>
              </div>
              <Slider
                range
                min={50}
                max={1000}
                value={filters.speedRange}
                onChange={(value) => Array.isArray(value) && handleFilterChange({ speedRange: value })}
                trackStyle={[{ backgroundColor: '#ee3c6b' }]}
                handleStyle={[
                  { borderColor: '#ee3c6b', backgroundColor: '#ee3c6b' },
                  { borderColor: '#ee3c6b', backgroundColor: '#ee3c6b' }
                ]}
                railStyle={{ backgroundColor: '#e5e5ed' }}
              />
            </div>

            <button
              onClick={resetFilters}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Сбросить фильтры
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="w-full lg:w-3/4">
          {/* Category Filters */}
          <div className="mb-6">
            <div className="flex gap-3 items-center overflow-x-auto scroll-smooth whitespace-nowrap pb-2">
              <button
                onClick={() => handleCategoryChange("all")}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  isAllCategoryActive 
                    ? "bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] text-white shadow-lg" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Все
              </button>
              
              {Object.entries(categoryMapping).map(([id, label]) => {
                const { internet, tv, mobile } = filters;
                const expected = getServiceFiltersForCategory(id);
                const isActiveCategory = internet === expected.internet && tv === expected.tv && mobile === expected.mobile;

                return (
                  <button
                    key={id}
                    onClick={() => handleCategoryChange(id)}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                      isActiveCategory
                        ? "bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Header with Sort */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Доступные тарифы 
              <span className="text-base font-normal text-gray-600 ml-2">
                ({filteredTariffs.length})
              </span>
            </h2>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Сортировка:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm min-w-[140px] focus:ring-2 focus:ring-[#ee3c6b] focus:border-transparent"
              >
                <option value="popular">Популярные</option>
                <option value="speed">Быстрые</option>
                <option value="price-low">Подешевле</option>
                <option value="price-high">Подороже</option>
              </select>
              
              <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="lg:hidden inline-flex items-center gap-1 px-2 py-1.5 bg-white border border-gray-300 rounded-xl text-xs font-medium text-[#ee3c6b] hover:bg-gray-50 transition-colors"
            >
              <FiFilter size={12} />
              <span className="sm:inline hidden">Все фильтры</span>
              <span className="sm:hidden">Фильтры</span>
            </button>
            </div>
          </div>

          {/* Tariffs Grid */}
          {sortedTariffs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sortedTariffs.slice(0, visibleCount).map((tariff) => (
                <TariffCard
                  key={tariff.id}
                  tariff={tariff}
                  onClick={() => setIsSegmentationModalOpen(true)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
              <div className="text-gray-600 mb-4">Тарифы не найдены</div>
              <button 
                onClick={resetFilters}
                className="bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all"
              >
                Сбросить фильтры
              </button>
            </div>
          )}

          {/* Load More Button */}
          {visibleCount < sortedTariffs.length && (
            <div className="text-center mt-8">
              <button 
                onClick={() => setVisibleCount(prev => prev + 6)}
                className="bg-white border-2 border-[#ee3c6b] text-[#ee3c6b] px-8 py-3 rounded-xl font-medium hover:bg-[#ee3c6b] hover:text-white transition-all"
              >
                Показать ещё
              </button>
            </div>
          )}

          {/* Help Section */}
          <section className="mt-12 rounded-2xl bg-gradient-to-r from-[#8e66e4] to-[#c1d8fb] p-8 text-white">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl md:text-2xl font-bold mb-4">Хотите быстро найти самый выгодный тариф?</h2>
              <p className="text-base md:text-lg mb-6 opacity-90">Подберите тариф с экспертом. Найдём для вас лучшее решение с учетом ваших пожеланий</p>
              
              <SupportOnlyBlock>
                <TariffHelpForm />
              </SupportOnlyBlock>
            </div>
          </section>
        </div>
      </main>

      {/* Additional Blocks */}
      <HowConnect onOpenSegmentationModal={() => setIsSegmentationModalOpen(true)} />
      <Bonuses onOpenSegmentationModal={() => setIsSegmentationModalOpen(true)} />
      <PromoSlider onOpenSegmentationModal={() => setIsSegmentationModalOpen(true)} />
      <InfoBlockKrasnodar />
      <EquipmentBlock />
      <FaqBlock />
      
      <SupportOnlyBlock isQuestionsBlock>
        <QuestionsBlock />
      </SupportOnlyBlock>

      {/* Modals */}
      <SegmentationModal
        isOpen={isSegmentationModalOpen}
        onClose={() => setIsSegmentationModalOpen(false)}
        onNewConnection={() => setIsConnectionModalOpen(true)}
        onExistingConnection={() => setIsConnectionModalOpen(true)}
      />
      
      <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />
      <ConnectionForm isOpen={isConnectionModalOpen} onClose={() => setIsConnectionModalOpen(false)} />
      <CallRequestModal isOpen={isCallRequestModalOpen} onClose={() => setIsCallRequestModalOpen(false)} />
      
      <MobileFiltersDrawer
        open={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
        filters={filters}
        onFiltersChange={handleFilterChange}
        onApply={() => setIsMobileFiltersOpen(false)}
        onClear={resetFilters}
      />
    </div>
  );
}

function getServiceFiltersForCategory(categoryId: string) {
  switch (categoryId) {
    case "internet": return { internet: true, tv: false, mobile: false };
    case "internet-tv": return { internet: true, tv: true, mobile: false };
    case "internet-mobile": return { internet: true, tv: false, mobile: true };
    case "internet-tv-mobile": return { internet: true, tv: true, mobile: true };
    default: return { internet: false, tv: false, mobile: false };
  }
}