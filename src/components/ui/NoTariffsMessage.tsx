interface NoTariffsMessageProps {
  cityName: string;
  serviceName: string;
}

export default function NoTariffsMessage({ cityName, serviceName }: NoTariffsMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
      <div className="bg-gray-50 rounded-2xl p-8 max-w-md w-full">
        <div className="text-6xl mb-4">📭</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Тарифы временно отсутствуют
        </h2>
        <p className="text-gray-600 mb-6">
          В {cityName} пока нет доступных тарифов на {serviceName}. 
          Попробуйте проверить другие услуги или обратиться в поддержку.
        </p>
        
        <div className="space-y-3">
          <button 
            onClick={() => window.history.back()}
            className="w-full bg-[#ee3c6b] text-white py-3 px-6 rounded-xl font-medium hover:bg-[#d42a5a] transition-colors"
          >
            Вернуться назад
          </button>
          
          <a 
            href="/"
            className="block w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            На главную
          </a>
        </div>
      </div>
    </div>
  );
}