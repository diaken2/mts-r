import React, { useState, useEffect, useRef } from 'react';
import { useSupportOnly } from '@/context/SupportOnlyContext';
import { useCity } from '@/context/CityContext';

interface SegmentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNewConnection: () => void;
  onExistingConnection: () => void;
}

export default function SegmentationModal({ isOpen, onClose, onNewConnection, onExistingConnection }: SegmentationModalProps) {
  const [step, setStep] = useState<'choose' | 'existing' | 'final'>('choose');
  const [existingChoice, setExistingChoice] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { setSupportOnly } = useSupportOnly();
  const { city } = useCity();
  const modalRef = useRef<HTMLDivElement>(null);

  // Определение мобильного устройства
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Обработка клика вне модалки
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
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

  // Если пользователь уже выбрал "действующий абонент" (вариант 3), всегда показываем финальное окно
  React.useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('rt_is_existing_abonent') === '1') {
      setStep('final');
      setSupportOnly(true);
    }
  }, [isOpen, setSupportOnly]);

  const handleExistingContinue = () => {
    if (existingChoice === 2) {
      // Сменить тариф без добавления услуг — показываем финальное окно и запоминаем в localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('rt_is_existing_abonent', '1');
      }
      setSupportOnly(true);
      setStep('final');
    } else if (existingChoice === 0 || existingChoice === 1) {
      onExistingConnection();
      onClose();
    }
  };

  const handleExistingClick = () => {
    setStep('existing');
  };

  React.useEffect(() => {
    if (step === 'final') {
      setSupportOnly(true);
    }
  }, [step, setSupportOnly]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-45 flex items-center justify-center z-[1000] p-4">
      <div
        className={
          isMobile
            ? "fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-[1001] overflow-y-auto"
            : "w-full max-w-md bg-white rounded-2xl p-6 md:p-8 relative shadow-xl"
        }
        style={isMobile ? { maxHeight: '90vh' } : {}}
        ref={modalRef}
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
          {step === 'choose' && (
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 text-center">
                Новое подключение или уже подключены к МТС?
              </h2>
              <div className="space-y-4">
                <button
                  className="w-full h-12 rounded-xl text-base font-semibold transition-all duration-300 bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] text-white hover:shadow-lg"
                  onClick={() => {
                    onNewConnection();
                    onClose();
                  }}
                >
                  Новое подключение
                </button>
                <button
                  className="w-full h-12 rounded-xl text-base font-semibold transition-all duration-300 border-2 border-[#ee3c6b] text-[#ee3c6b] hover:bg-[#ee3c6b] hover:text-white"
                  onClick={handleExistingClick}
                >
                  Уже подключен к МТС
                </button>
              </div>
            </div>
          )}

          {step === 'existing' && (
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 text-center">
                Выберите вариант:
              </h2>
              <div className="space-y-3 mb-6">
                <button
                  className={`w-full text-left px-4 py-4 rounded-xl border-2 transition-all duration-300 font-medium text-sm ${
                    existingChoice === 0 
                      ? 'border-[#ee3c6b] bg-[#fff2f6] text-[#ee3c6b]' 
                      : 'border-gray-300 bg-white text-gray-900 hover:border-[#ee3c6b]'
                  }`}
                  onClick={() => setExistingChoice(0)}
                  type="button"
                >
                  Переоформить договор на себя или оформить на новом адресе
                </button>
                <button
                  className={`w-full text-left px-4 py-4 rounded-xl border-2 transition-all duration-300 font-medium text-sm ${
                    existingChoice === 1 
                      ? 'border-[#ee3c6b] bg-[#fff2f6] text-[#ee3c6b]' 
                      : 'border-gray-300 bg-white text-gray-900 hover:border-[#ee3c6b]'
                  }`}
                  onClick={() => setExistingChoice(1)}
                  type="button"
                >
                  Добавить домашний интернет, ТВ или мобильную связь в свой тариф
                </button>
                <button
                  className={`w-full text-left px-4 py-4 rounded-xl border-2 transition-all duration-300 font-medium text-sm ${
                    existingChoice === 2 
                      ? 'border-[#ee3c6b] bg-[#fff2f6] text-[#ee3c6b]' 
                      : 'border-gray-300 bg-white text-gray-900 hover:border-[#ee3c6b]'
                  }`}
                  onClick={() => setExistingChoice(2)}
                  type="button"
                >
                  Сменить тариф без добавления услуг
                </button>
              </div>
              <button
                className={`w-full h-12 rounded-xl text-base font-semibold transition-all duration-300 ${
                  existingChoice !== null
                    ? 'bg-gradient-to-r from-[#ee3c6b] to-[#ff0032] text-white cursor-pointer hover:shadow-lg' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={existingChoice === null}
                onClick={handleExistingContinue}
              >
                Далее
              </button>
            </div>
          )}

          {step === 'final' && (
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 text-center">
                Вы являетесь действующим абонентом МТС
              </h2>
              <p className="text-base text-gray-800 mb-6 text-center">
                Мы не сможем ответить на вопросы по действующему подключению или сменить ваш текущий тариф.
              </p>
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <div className="font-semibold mb-2 text-gray-900">Для смены тарифа необходимо позвонить по номеру:</div>
                <a href="tel:88002500890" className="text-xl md:text-2xl font-bold text-[#ee3c6b] tracking-wider block mb-1 hover:text-[#ff0032] transition-colors">
                   8 800 250-08-90
                </a>
                <span className="text-sm text-gray-600 block mb-2">Линия для клиентов</span>
                <div className="text-sm text-gray-600">
                  или узнать информацию в <a href="https://lk.mts.ru/" target="_blank" rel="noopener noreferrer" className="underline text-[#ee3c6b] hover:text-[#ff0032] transition-colors">личном кабинете</a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}