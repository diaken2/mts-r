
"use client";
import React, { useState, useEffect, useRef } from 'react';
import InputMask from 'react-input-mask';
import { useRouter } from 'next/navigation';
import { submitLead } from '@/lib/submitLead';
import { useSupportOnly } from '@/context/SupportOnlyContext';
import Link from 'next/link';
interface ConnectionFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTariff?: any; // Добавьте это (опционально)
}

interface TimeSlot {
  value: string;
  label: string;
}

export default function ConnectionForm({ isOpen,selectedTariff, onClose }: ConnectionFormProps) {
  const [phone, setPhone] = useState('');
  const [callTime, setCallTime] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [shouldOpenUp, setShouldOpenUp] = useState(false);
  const router = useRouter();
  const { isSupportOnly } = useSupportOnly();
  const modalRef = useRef<HTMLDivElement>(null);
  const timeDropdownRef = useRef<HTMLDivElement>(null);

  // Определение мобильного устройства
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // Обработка клика вне модалки
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(event.target as Node)) {
        setIsTimeDropdownOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isTimeDropdownOpen && timeDropdownRef.current) {
      const rect = timeDropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setShouldOpenUp(spaceBelow < 350);
    }
  }, [isTimeDropdownOpen]);

  const isValidPhone = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(phone);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isValidPhone) return;
    
    setIsSubmitting(true);
    setSubmitted(true);

    try {
      const selectedSlot = timeSlots.find(slot => slot.value === callTime);
      const callTimeText = selectedSlot?.label || callTime;

      const result = await submitLead({
        type: 'Заявка на подключение',
        phone: phone,
        callTime: callTimeText,
          tariffName: selectedTariff?.name || 'Не указан', // Добавьте название тарифа
      tariffPrice: selectedTariff?.price || 0, // Добавьте цену тарифа
      tariffSpeed: selectedTariff?.speed || 0, // Добавьте скорость тарифа
      });

      if (result.success) {
        setTimeout(() => {
          setSubmitted(false);
          setPhone('');
          setCallTime('');
          setTouched(false);
          onClose();
          router.push('/complete');
        }, 2000);
      } else {
        console.error('Failed to submit lead:', result.error);
        setTimeout(() => {
          setSubmitted(false);
          setPhone('');
          setCallTime('');
          setTouched(false);
          onClose();
          router.push('/complete');
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting lead:', error);
      setTimeout(() => {
        setSubmitted(false);
        setPhone('');
        setCallTime('');
        setTouched(false);
        onClose();
        router.push('/complete');
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const overlayClass = `fixed inset-0 bg-black bg-opacity-50 flex ${isMobile ? 'items-end' : 'items-center'} justify-center z-50 ${isMobile ? 'p-0' : 'p-4'} backdrop-blur-sm`;

  const modalClass = `
    bg-white ${isMobile ? 'rounded-t-3xl rounded-b-none' : 'rounded-3xl'} shadow-2xl w-full ${isMobile ? 'max-w-none' : 'max-w-lg'} ${isMobile ? '' : 'mx-auto'} relative
    transform transition-all duration-300
    ${isOpen ? (isMobile ? 'translate-y-0 opacity-100' : 'scale-100 opacity-100') : (isMobile ? 'translate-y-full opacity-0' : 'scale-95 opacity-0')}
  `;

  return (
    <div className={overlayClass}>
      <div
        ref={modalRef}
        className={modalClass}
      >
        {/* Заголовок */}
        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Заявка на{' '}
              <span className="bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] bg-clip-text text-transparent">
                подключение
              </span>
            </h2>
            <p className="text-gray-600 text-lg">
              Перезвоним для уточнения деталей и согласования времени
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Поле телефона */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Номер телефона
              </label>
              <div className={`
                flex items-center rounded-xl border-2 px-4 py-3 transition-all
                ${touched && !isValidPhone
                  ? 'border-red-500 ring-2 ring-red-500/20'
                  : 'border-gray-300 focus-within:border-[#ee3c6b] focus-within:ring-2 focus-within:ring-[#ee3c6b]/20'
                }
              `}>
                <span className="text-gray-600 font-medium mr-2">+7</span>
                <InputMask
                  mask="(999) 999-99-99"
                  value={phone.replace('+7 ', '')}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone('+7 ' + e.target.value)}
                  onBlur={() => setTouched(true)}
                  className="flex-1 outline-none text-lg placeholder-gray-400"
                  placeholder="(___) ___-__-__"
                />
              </div>
              {touched && !isValidPhone && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Введите корректный номер
                </p>
              )}
            </div>

            {/* Выбор времени */}
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
                  absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg
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

            {/* Кнопка отправки */}
            <button
              type="submit"
              disabled={!isValidPhone || submitted}
              className={`
                w-full bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] text-white font-semibold
                py-4 px-6 rounded-xl transition-all duration-300
                hover:shadow-lg transform hover:-translate-y-0.5
                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
              `}
            >
              {submitted ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Отправляем...
                </div>
              ) : (
                'Получить консультацию'
              )}
            </button>
          </form>

          {/* Политика конфиденциальности */}
          <p className="text-xs text-gray-500 text-center mt-6">
            Отправляя заявку, вы соглашаетесь с{' '}
            <Link href="/privacy" className="text-[#ee3c6b] hover:text-[#ff0032] underline transition-colors">
              политикой обработки данных
            </Link>
          </p>
        </div>

        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 text-gray-600
                   hover:bg-gray-200 transition-colors flex items-center justify-center"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
