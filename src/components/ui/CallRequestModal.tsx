import React, { useState, useEffect, useRef } from 'react';
import InputMask from "react-input-mask";
import { useRouter } from 'next/navigation';
import { submitLead } from '@/lib/submitLead';
import { useSupportOnly } from '@/context/SupportOnlyContext';
import { useCity } from '@/context/CityContext'; // Импортируем контекст города

interface CallRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TimeSlot {
  value: string;
  label: string;
}

export default function CallRequestModal({ isOpen, onClose }: CallRequestModalProps) {
  const [step, setStep] = useState<'type' | 'form' | 'support'>('type');
  const [requestType, setRequestType] = useState<'new' | 'support' | null>(null);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string; name?: string }>({});
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const timeDropdownRef = useRef<HTMLDivElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const [shouldOpenUp, setShouldOpenUp] = useState(false);
  const { setSupportOnly, isSupportOnly } = useSupportOnly();
  const { city } = useCity(); // Используем город из контекста

  // Определение мобильного устройства и автофокус
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  useEffect(() => {
    if (step === 'form' && phoneInputRef.current) {
      phoneInputRef.current.focus();
    }
  }, [step]);

  const isFormValid = phone.replace(/\D/g, "").length === 10 && name.trim().length > 1 && selectedTime;

  // Генерация временных слотов на основе текущего времени
  useEffect(() => {
    if (step === 'form') {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const slots: TimeSlot[] = [];

      // Определяем рабочее время (6:00-21:00)
      const isWorkingHours = currentHour >= 6 && currentHour < 21;

      // Вне рабочего времени (21:00-6:00)
      if (!isWorkingHours) {
        slots.push({
          value: 'out-of-hours',
          label: 'Перезвоним в рабочее время'
        });
        
        // Добавляем утренние слоты на завтра
        for (let hour = 6; hour <= 11; hour++) {
          slots.push({
            value: `tomorrow-${hour}`,
            label: `завтра с ${hour.toString().padStart(2, '0')}:00 до ${(hour + 1).toString().padStart(2, '0')}:00`
          });
        }
        
        setTimeSlots(slots);
        setSelectedTime('out-of-hours');
        return;
      }

      // Рабочее время (6:00-21:00)
      // 1. ASAP вариант
      slots.push({
        value: 'asap',
        label: 'Перезвоним в течение 15 минут'
      });

      // 2. Слоты на сегодня (каждые 15 минут до конца рабочего дня)
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
        
        // Пропускаем слоты, которые заканчиваются после 21:00
        if (endHour > 21 || (endHour === 21 && endMinute > 0)) {
          break;
        }
        
        slots.push({
          value: `today-${slotHour}-${slotMinute}`,
          label: `сегодня ${slotHour.toString().padStart(2, '0')}:${slotMinute.toString().padStart(2, '0')}–${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`
        });
        
        // Переходим к следующему слоту
        slotMinute += 15;
        if (slotMinute >= 60) {
          slotHour += 1;
          slotMinute = 0;
        }
      }

      // 3. Слоты на завтра (если не набрали 8 пунктов)
      if (slots.length < 8) {
        for (let hour = 6; hour <= 11; hour++) {
          if (slots.length >= 8) break;
          slots.push({
            value: `tomorrow-${hour}`,
            label: `завтра ${hour.toString().padStart(2, '0')}:00–${(hour + 1).toString().padStart(2, '0')}:00`
          });
        }
      }

      setTimeSlots(slots);
      setSelectedTime('asap');
    }
  }, [step]);

  // Закрытие дропдауна при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(event.target as Node)) {
        setIsTimeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isTimeDropdownOpen && timeDropdownRef.current) {
      const rect = timeDropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setShouldOpenUp(spaceBelow < 350);
    }
  }, [isTimeDropdownOpen]);

  const validateField = (field: 'phone' | 'name', value: string) => {
    if (field === 'phone') {
      const phoneRegex = /^\(\d{3}\)\s?\d{3}-\d{2}-\d{2}$/;
      if (!phoneRegex.test(value)) {
        setErrors(prev => ({ ...prev, phone: 'Введите корректный номер телефона' }));
        return false;
      }
    } else if (field === 'name') {
      const nameRegex = /^[А-ЯЁа-яё\s-]{2,30}$/;
      if (!nameRegex.test(value.trim())) {
        setErrors(prev => ({ ...prev, name: 'Только кириллические символы' }));
        return false;
      }
    }
    setErrors(prev => ({ ...prev, [field]: undefined }));
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация всех полей
    const isPhoneValid = validateField('phone', phone);
    const isNameValid = validateField('name', name);
    
    if (!isPhoneValid || !isNameValid || !selectedTime) return;

    setIsSubmitting(true);
    setSubmitted(true);

    try {
      const selectedSlot = timeSlots.find(slot => slot.value === selectedTime);
      const result = await submitLead({
        type: requestType === 'new' ? 'Новое подключение домашнего интернета' : 'Вопросы по действующему подключению',
        name: name,
        phone: phone,
        callTime: selectedSlot?.label || selectedTime,
      });

      if (result.success) {
        setTimeout(() => {
          setSubmitted(false);
          setPhone('');
          setName('');
          setSelectedTime('');
          setRequestType(null);
          setStep('type');
          setErrors({});
          onClose();
          router.push('/complete');
        }, 2000);
      } else {
        console.error('Failed to submit lead:', result.error);
        setTimeout(() => {
          setSubmitted(false);
          setPhone('');
          setName('');
          setSelectedTime('');
          setRequestType(null);
          setStep('type');
          setErrors({});
          onClose();
          router.push('/complete');
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting lead:', error);
      setTimeout(() => {
        setSubmitted(false);
        setPhone('');
        setName('');
        setSelectedTime('');
        setRequestType(null);
        setStep('type');
        setErrors({});
        onClose();
        router.push('/complete');
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;
  if (isSupportOnly) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-md relative flex flex-col items-center justify-center p-8">
          <h2 className="text-2xl font-bold mb-4 text-center text-gray-900">Вы являетесь действующим абонентом МТС</h2>
          <p className="text-gray-600 mb-4 text-center">Мы не сможем ответить на вопросы по действующему подключению или сменить ваш текущий тариф.</p>
          <div className="bg-gray-50 rounded-xl p-4 mb-4 text-center w-full">
            <p className="text-gray-800 mb-2 font-medium">Рекомендуем позвонить по номеру</p>
            <a href="tel:88002500890" className="text-2xl font-bold text-[#ee3c6b] tracking-wider block mb-1 hover:text-[#ff0032] transition-colors"> 8 800 250-08-90</a>
            <p className="text-sm text-gray-500">Линия для клиентов</p>
          </div>
          <div className="text-base text-center text-gray-600">
            или узнать информацию в <a href="https://lk.mts.ru/" target="_blank" rel="noopener noreferrer" className="text-[#ee3c6b] underline hover:text-[#ff0032] transition-colors">личном кабинете</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-45 flex items-center justify-center z-[1000] p-4">
      <div
        className={
          isMobile
            ? "fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-[1001] overflow-y-auto"
            : "w-full max-w-md bg-white rounded-2xl p-6 md:p-8 relative shadow-xl"
        }
        style={isMobile ? { maxHeight: '90vh' } : {}}
        ref={timeDropdownRef}
      >
        {isMobile && (
          <div className="sticky top-0 bg-white py-4 px-4 flex justify-center border-b border-gray-200 z-10">
            <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
          </div>
        )}
        
        <button 
          onClick={onClose}
          className={
            isMobile
              ? "absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 text-gray-600 text-xl border-0 cursor-pointer hover:bg-gray-200 transition-colors flex items-center justify-center z-10"
              : "absolute top-6 right-6 w-8 h-8 rounded-full bg-gray-100 text-gray-600 text-xl border-0 cursor-pointer hover:bg-gray-200 transition-colors flex items-center justify-center"
          }
        >
          ×
        </button>

        <div className={isMobile ? "p-4" : ""}>
          {step === 'type' && (
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Вас интересует?</h2>
              <div className="space-y-4 mb-8">
                <label className="flex items-start cursor-pointer group">
                  <div className="relative mr-4 mt-1">
                    <input
                      type="radio"
                      name="requestType"
                      value="new"
                      checked={requestType === 'new'}
                      onChange={() => setRequestType('new')}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors group-hover:border-[#ee3c6b] ${
                      requestType === 'new' 
                        ? 'bg-[#ee3c6b] border-[#ee3c6b]' 
                        : 'border-gray-300'
                    }`}>
                      {requestType === 'new' && (
                        <div className="w-3 h-2 border-l-2 border-b-2 border-white transform -rotate-45"></div>
                      )}
                    </div>
                  </div>
                  <div className="group-hover:opacity-90 transition-opacity">
                    <div className={`text-base md:text-lg text-gray-900 ${requestType === 'new' ? 'font-semibold' : ''}`}>
                      Новое подключение домашнего интернета
                    </div>
                  </div>
                </label>
                
                <label className="flex items-start cursor-pointer group">
                  <div className="relative mr-4 mt-1">
                    <input
                      type="radio"
                      name="requestType"
                      value="support"
                      checked={requestType === 'support'}
                      onChange={() => setRequestType('support')}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors group-hover:border-[#ee3c6b] ${
                      requestType === 'support' 
                        ? 'bg-[#ee3c6b] border-[#ee3c6b]' 
                        : 'border-gray-300'
                    }`}>
                      {requestType === 'support' && (
                        <div className="w-3 h-2 border-l-2 border-b-2 border-white transform -rotate-45"></div>
                      )}
                    </div>
                  </div>
                  <div className="group-hover:opacity-90 transition-opacity">
                    <div className={`text-base md:text-lg text-gray-900 ${requestType === 'support' ? 'font-semibold' : ''}`}>
                      Вопросы по действующему подключению
                    </div>
                    <small className="text-sm text-gray-600 mt-1 block">
                      (Техподдержка, подключение, оплата)
                    </small>
                  </div>
                </label>
              </div>

              <button
                onClick={() => {
                  if (requestType === 'new') {
                    setStep('form');
                  } else if (requestType === 'support') {
                    setSupportOnly(true);
                    setStep('support');
                  }
                }}
                disabled={!requestType}
                className={`w-full h-12 rounded-xl text-base font-semibold transition-all duration-300 ${
                  requestType 
                    ? 'bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] text-white cursor-pointer hover:shadow-lg' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Выбрать
              </button>
            </div>
          )}

          {step === 'form' && (
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
                Специалист перезвонит и ответит на все вопросы по новому подключению
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <label className="block text-gray-900 mb-2 font-medium flex items-center">
                    Телефон
                    {errors.phone && (
                      <span className="ml-2 text-xs text-[#ee3c6b] flex items-center">
                        {errors.phone}
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 font-semibold text-gray-900 z-10">
                      +7
                    </span>
                    <InputMask
                      mask="(999) 999-99-99"
                      value={phone}
                      inputRef={phoneInputRef}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setPhone(e.target.value);
                        if (errors.phone) validateField('phone', e.target.value);
                      }}
                      onBlur={() => validateField('phone', phone)}
                      className={`w-full h-12 pl-14 pr-5 border rounded-xl text-base transition-all ${
                        errors.phone 
                          ? 'border-2 border-[#ee3c6b]' 
                          : 'border border-gray-300 hover:border-gray-400 focus:border-2 focus:border-[#ee3c6b]'
                      }`}
                      placeholder="(___) ___-__-__"
                      type="tel"
                      autoComplete="tel"
                      aria-invalid={!!errors.phone}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-900 mb-2 font-medium flex items-center">
                    Имя
                    {errors.name && (
                      <span className="ml-2 text-xs text-[#ee3c6b] flex items-center">
                        {errors.name}
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setName(e.target.value);
                      if (errors.name) validateField('name', e.target.value);
                    }}
                    onBlur={() => validateField('name', name)}
                    className={`w-full h-12 px-4 border rounded-xl text-base transition-all placeholder-gray-400 ${
                      errors.name 
                        ? 'border-2 border-[#ee3c6b]' 
                        : 'border border-gray-300 hover:border-gray-400 focus:border-2 focus:border-[#ee3c6b]'
                    }`}
                    placeholder="Имя"
                    autoComplete="name"
                    aria-invalid={!!errors.name}
                  />
                </div>

                <div className="relative">
                  <label className="block text-gray-900 mb-2 font-medium">Время звонка</label>
                  <button
                    type="button"
                    onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                    className={`w-full inline-flex items-center justify-between gap-2 text-base cursor-pointer p-3 border rounded-xl hover:border-gray-400 transition-colors
                      ${isTimeDropdownOpen ? 'border-[#ee3c6b] border-2' : 'border-gray-300'}`}
                    style={{ background: 'none', outline: 'none', boxShadow: 'none' }}
                  >
                    <span>{timeSlots.find(slot => slot.value === selectedTime)?.label || 'Выберите время'}</span>
                    <svg 
                      className={`w-5 h-5 transition-transform duration-200 ${isTimeDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none" 
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isTimeDropdownOpen && (
                    <div className={`absolute left-0 right-0 mt-1 bg-white rounded-xl shadow-lg py-2 z-20 ${
                      shouldOpenUp ? 'bottom-full mb-2' : 'top-full'
                    } max-h-[50vh] overflow-y-auto border border-gray-200`}
                    >
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.value}
                          type="button"
                          onClick={() => {
                            setSelectedTime(slot.value);
                            setIsTimeDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-left transition-colors ${
                            selectedTime === slot.value 
                              ? 'bg-gray-100 text-[#ee3c6b] font-semibold' 
                              : 'text-gray-900 hover:bg-gray-50'
                          }`}
                          role="option"
                          aria-selected={selectedTime === slot.value}
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
                  className={`w-full h-12 rounded-xl text-base font-semibold transition-all duration-300 flex items-center justify-center mt-6 ${
                    isFormValid && !submitted && !isSubmitting 
                      ? 'bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] text-white hover:shadow-lg' 
                      : 'bg-gray-200 text-gray-500'
                  }`}
                  aria-disabled={!isFormValid || submitted || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Отправка...
                    </>
                  ) : submitted ? (
                    'Отправлено!'
                  ) : (
                    'Отправить'
                  )}
                </button>
              </form>

              <p className="text-xs text-gray-600 text-center mt-6">
                Отправляя, вы соглашаетесь с <button type="button" className="underline text-[#174A8D]">политикой обработки данных</button>
              </p>
            </div>
          )}

          {step === 'support' && (
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Вопросы по действующему подключению</h2>
              
              <div className="space-y-4">
                <p className="text-base text-gray-800">
                  Вы являетесь действующим абонентом МТС
                </p>
                <p className="text-base text-gray-800">
                  Мы не сможем ответить на вопросы по действующему подключению или сменить ваш текущий тариф.
                </p>
                
                <div className="mt-6">
                  <p className="text-base text-gray-800 mb-3">
                    Рекомендуем позвонить по номеру
                  </p>
                  <a 
                    href="tel:88002500890" 
                    className="text-xl md:text-2xl font-semibold text-[#ee3c6b] tracking-wider block mb-1 hover:text-[#ff0032] transition-colors"
                  >
                     8 800 250-08-90
                  </a>
                  <p className="text-sm text-gray-500">Линия для клиентов</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}