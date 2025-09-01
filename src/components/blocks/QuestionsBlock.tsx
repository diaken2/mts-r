import React, { useState, useEffect, useRef } from "react";
import InputMask from "react-input-mask";
import { useRouter } from "next/navigation";
import { submitLead } from '@/lib/submitLead';
import Image from 'next/image';
import { useSupportOnly } from '@/context/SupportOnlyContext';
import Link from 'next/link';

const categories = [
  { key: "connection", label: "Подключение", icon: "🚀" },
  { key: "support", label: "Поддержка", icon: "🔧" },
  { key: "other", label: "Другое", icon: "💡" },
];

const houseTypes = [
  "Квартира",
  "Частный дом",
  "Офис"
];

const supportOptions = [
  "Оплата услуг",
  "Оборудование", 
  "Не работает интернет/ТВ"
];

const otherOptions = [
  "Смена тарифа домашнего интернета (я абонент МТС)",
  "Подключение ТВ или мобильной связи в мой тариф",
  "Другое"
];

interface TimeSlot {
  value: string;
  label: string;
}

const QuestionsBlock: React.FC = () => {
  const [category, setCategory] = useState<string | null>(null);
  const [houseType, setHouseType] = useState(houseTypes[0]);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [supportValue, setSupportValue] = useState<string | null>(null);
  const [otherValue, setOtherValue] = useState<string | null>(null);
  const [callTime, setCallTime] = useState("");
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [shouldOpenUp, setShouldOpenUp] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { setSupportOnly, isSupportOnly } = useSupportOnly();
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

  // Определение направления открытия выпадающего списка
  useEffect(() => {
    if (isTimeDropdownOpen && timeDropdownRef.current) {
      const rect = timeDropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setShouldOpenUp(spaceBelow < 350);
    }
  }, [isTimeDropdownOpen]);

  // Закрытие выпадающего списка при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(event.target as Node)) {
        setIsTimeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isFormValid = phone.replace(/\D/g, "").length === 10 && name.trim().length > 1;

  const showSupportInfo =
    (category === "support" && supportValue) ||
    (category === "other" && (otherValue === otherOptions[0] || otherValue === otherOptions[2]));

  const showOtherForm = category === "other" && otherValue === otherOptions[1];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitted(true);

    try {
      const selectedSlot = timeSlots.find(slot => slot.value === callTime);
      const callTimeText = selectedSlot?.label || callTime;

      const result = await submitLead({
        type: `Вопросы - ${category}`,
        name: name,
        phone: phone,
        houseType: houseType,
        supportValue: supportValue || undefined,
        otherValue: otherValue || undefined,
        callTime: callTimeText,
      });

      if (result.success) {
        setTimeout(() => {
          setSubmitted(false);
          setPhone("");
          setName("");
          setCategory(null);
          setSupportValue(null);
          setOtherValue(null);
          router.push('/complete');
        }, 2000);
      } else {
        console.error('Failed to submit lead:', result.error);
        setTimeout(() => {
          setSubmitted(false);
          setPhone("");
          setName("");
          setCategory(null);
          setSupportValue(null);
          setOtherValue(null);
          router.push('/complete');
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting lead:', error);
      setTimeout(() => {
        setSubmitted(false);
        setPhone("");
        setName("");
        setCategory(null);
        setSupportValue(null);
        setOtherValue(null);
        router.push('/complete');
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (showSupportInfo) {
      setSupportOnly(true);
    }
  }, [showSupportInfo, setSupportOnly]);

  if (isSupportOnly) {
    return (
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 flex flex-col md:flex-row items-center overflow-hidden">
          {/* Изображение оператора */}
          <div className="w-full md:w-1/3 flex justify-center mb-8 md:mb-0">
            <div className="relative">
              <Image
                src="/questions/operator.png"
                alt="Оператор поддержки МТС"
                width={280}
                height={280}
                className="object-contain"
              />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-r from-[#ee3c6b]/10 to-[#ff0032]/10 rounded-full blur-2xl -z-10"></div>
            </div>
          </div>

          {/* Информация для действующих абонентов */}
          <div className="w-full md:w-2/3 md:pl-12">
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Вы являетесь действующим абонентом{" "}
                <span className="bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] bg-clip-text text-transparent">
                  МТС
                </span>
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Мы не сможем ответить на вопросы по действующему подключению или сменить ваш текущий тариф
              </p>

              <div className="bg-gradient-to-r from-[#f8f8f8] to-[#f0f0f0] rounded-2xl p-6 mb-6">
                <div className="text-center">
                  <p className="text-gray-700 mb-3">Рекомендуем позвонить по номеру</p>
                  <a 
                    href="tel:87501000750" 
                    className="text-2xl md:text-3xl font-bold text-[#ee3c6b] hover:text-[#ff0032] transition-colors inline-flex items-center"
                  >
                    📞 8 750 100-08-00
                  </a>
                  <p className="text-sm text-gray-500 mt-2">Круглосуточная поддержка</p>
                </div>
              </div>

              <div className="text-gray-600">
                или узнать информацию в{" "}
                <a 
                  href="#" 
                  className="text-[#ee3c6b] font-semibold hover:text-[#ff0032] transition-colors underline"
                >
                  личном кабинете
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Фото оператора */}
          <div className="w-full md:w-2/5 bg-gradient-to-br from-[#f8f8f8] to-[#f0f0f0] flex items-center justify-center p-8 md:p-12">
            <div className="relative">
              <Image
                src="/questions/operator.png"
                alt="Консультант МТС"
                width={320}
                height={320}
                className="object-contain"
              />
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-[#ee3c6b]/10 to-[#ff0032]/10 rounded-full blur-2xl"></div>
            </div>
          </div>

          {/* Форма/инфо */}
          <div className="w-full md:w-3/5 p-8 md:p-12">
            <div className="max-w-2xl">
              {!(showSupportInfo || showOtherForm) ? (
                <>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    Остались{" "}
                    <span className="bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] bg-clip-text text-transparent">
                      вопросы?
                    </span>
                  </h2>
                  <p className="text-lg text-gray-600 mb-8">Выберите вариант обращения</p>

                  {/* Категории */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {categories.map((cat) => (
                      <button
                        key={cat.key}
                        className={`
                          flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-300
                          ${category === cat.key
                            ? "border-[#ee3c6b] bg-gradient-to-r from-[#ee3c6b]/10 to-[#ff0032]/10 shadow-lg"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                          }
                        `}
                        onClick={() => {
                          setCategory(cat.key);
                          setSupportValue(null);
                          setOtherValue(null);
                        }}
                      >
                        <span className="text-2xl mb-2">{cat.icon}</span>
                        <span className={`
                          font-semibold transition-colors
                          ${category === cat.key ? "text-[#ee3c6b]" : "text-gray-700"}
                        `}>
                          {cat.label}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Опции поддержки */}
                  {category === "support" && (
                    <div className="space-y-3 mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Что вас интересует?</h3>
                      {supportOptions.map((opt) => (
                        <label key={opt} className="flex items-center p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                          <div className={`
                            w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-all
                            ${supportValue === opt
                              ? "border-[#ee3c6b] bg-[#ee3c6b]"
                              : "border-gray-300 bg-white"
                            }
                          `}>
                            {supportValue === opt && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <input
                            type="radio"
                            name="supportOption"
                            value={opt}
                            checked={supportValue === opt}
                            onChange={() => setSupportValue(opt)}
                            className="hidden"
                          />
                          <span className="text-gray-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Другие опции */}
                  {category === "other" && (
                    <div className="space-y-3 mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Выберите вариант:</h3>
                      {otherOptions.map((opt) => (
                        <label key={opt} className="flex items-start p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                          <div className={`
                            w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 mt-1 flex-shrink-0
                            ${otherValue === opt
                              ? "border-[#ee3c6b] bg-[#ee3c6b]"
                              : "border-gray-300 bg-white"
                            }
                          `}>
                            {otherValue === opt && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <input
                            type="radio"
                            name="otherOption"
                            value={opt}
                            checked={otherValue === opt}
                            onChange={() => setOtherValue(opt)}
                            className="hidden"
                          />
                          <span className="text-gray-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Форма подключения */}
                  {category === "connection" && (
                    <form className="space-y-6" autoComplete="off" onSubmit={handleSubmit}>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Тип помещения:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {houseTypes.map((type) => (
                            <label key={type} className={`
                              flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all
                              ${houseType === type
                                ? "border-[#ee3c6b] bg-gradient-to-r from-[#ee3c6b]/10 to-[#ff0032]/10"
                                : "border-gray-200 bg-white hover:border-gray-300"
                              }
                            `}>
                              <input
                                type="radio"
                                name="houseType"
                                value={type}
                                checked={houseType === type}
                                onChange={() => setHouseType(type)}
                                className="hidden"
                              />
                              <span className={`
                                font-medium
                                ${houseType === type ? "text-[#ee3c6b]" : "text-gray-700"}
                              `}>
                                {type}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Телефон</label>
                          <div className="flex items-center rounded-xl border border-gray-300 bg-white overflow-hidden">
                            <span className="px-4 py-3 bg-gray-100 text-gray-600 font-medium">+7</span>
                            <InputMask
                              mask="(999) 999-99-99"
                              value={phone}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                              className="flex-1 px-4 py-3 outline-none"
                              placeholder="(___) ___-__-__"
                              type="tel"
                              autoComplete="tel"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Имя</label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none"
                            placeholder="Ваше имя"
                            autoComplete="name"
                          />
                        </div>
                      </div>

                      {/* Выбор времени звонка */}
                      <div className="relative" ref={timeDropdownRef}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Время звонка
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                          className={`
                            w-full flex items-center justify-between px-4 py-3 rounded-xl border-2
                            text-left transition-all
                            ${isTimeDropdownOpen
                              ? 'border-[#ee3c6b] ring-2 ring-[#ee3c6b]/20'
                              : 'border-gray-300 hover:border-gray-400'
                            }
                          `}
                        >
                          <span className="text-gray-900">
                            {timeSlots.find(slot => slot.value === callTime)?.label || 'Выберите время'}
                          </span>
                          <svg className={`w-5 h-5 text-gray-400 transition-transform ${isTimeDropdownOpen ? 'rotate-180' : ''}`} 
                               fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {isTimeDropdownOpen && (
                          <div className={`
                            absolute left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg
                            z-10 max-h-60 overflow-y-auto
                            ${shouldOpenUp ? 'bottom-full mb-1' : 'top-full mt-1'}
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

                      <button
                        type="submit"
                        disabled={!isFormValid || submitted || isSubmitting}
                        className={`
                          w-full bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] text-white font-bold py-4 px-8 rounded-xl
                          transition-all duration-300 hover:shadow-lg transform hover:scale-105
                          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                        `}
                      >
                        {submitted ? '✓ Отправлено!' : isSubmitting ? '⏳ Отправляем...' : '📞 Жду звонка'}
                      </button>

                      <p className="text-xs text-gray-400 text-center">
                        Отправляя заявку, вы соглашаетесь с{" "}
                        <Link href="/privacy" className="text-[#ee3c6b] hover:text-[#ff0032] underline transition-colors">
                          политикой обработки данных
                        </Link>
                      </p>
                    </form>
                  )}
                </>
              ) : showOtherForm ? (
                // Форма для дополнительных услуг
                <>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Подключение дополнительных услуг</h2>
                  <p className="text-gray-600 mb-8">Заполните форму и мы свяжемся с вами</p>

                  <form className="space-y-6" autoComplete="off" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Телефон</label>
                        <div className="flex items-center rounded-xl border border-gray-300 bg-white overflow-hidden">
                          <span className="px-4 py-3 bg-gray-100 text-gray-600 font-medium">+7</span>
                          <InputMask
                            mask="(999) 999-99-99"
                            value={phone}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                            className="flex-1 px-4 py-3 outline-none"
                            placeholder="(___) ___-__-__"
                            type="tel"
                            autoComplete="tel"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Имя</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none"
                          placeholder="Ваше имя"
                          autoComplete="name"
                        />
                      </div>
                    </div>

                    {/* Выбор времени звонка для дополнительных услуг */}
                    <div className="relative" ref={timeDropdownRef}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Время звонка
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                        className={`
                          w-full flex items-center justify-between px-4 py-3 rounded-xl border-2
                          text-left transition-all
                          ${isTimeDropdownOpen
                            ? 'border-[#ee3c6b] ring-2 ring-[#ee3c6b]/20'
                            : 'border-gray-300 hover:border-gray-400'
                          }
                        `}
                      >
                        <span className="text-gray-900">
                          {timeSlots.find(slot => slot.value === callTime)?.label || 'Выберите время'}
                        </span>
                        <svg className={`w-5 h-5 text-gray-400 transition-transform ${isTimeDropdownOpen ? 'rotate-180' : ''}`} 
                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {isTimeDropdownOpen && (
                        <div className={`
                          absolute left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg
                          z-10 max-h-60 overflow-y-auto
                          ${shouldOpenUp ? 'bottom-full mb-1' : 'top-full mt-1'}
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

                    <button
                      type="submit"
                      disabled={!isFormValid}
                      className="w-full bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] text-white font-bold py-4 px-8 rounded-xl hover:shadow-lg transition-all"
                    >
                      📞 Жду звонка
                    </button>
                  </form>
                </>
              ) : (
                // Информация для действующих абонентов
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Вы являетесь действующим абонентом МТС</h2>
                  <p className="text-gray-600 mb-8">Мы не сможем ответить на вопросы по действующему подключению</p>

                  <div className="bg-gradient-to-r from-[#f8f8f8] to-[#f0f0f0] rounded-2xl p-6 mb-6">
                    <a 
                      href="tel:87501000750" 
                      className="text-2xl font-bold text-[#ee3c6b] hover:text-[#ff0032] transition-colors"
                    >
                      📞 8 750 100-08-00
                    </a>
                    <p className="text-sm text-gray-500 mt-2">Круглосуточная поддержка</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuestionsBlock;