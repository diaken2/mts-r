const fs = require('fs');
const path = require('path');

// Карта замен для миграции с Ростелекома на МТС
const replacements = {
  // Основные названия
  'Ростелеком': 'МТС',
  'Rostelecom': 'MTS',
  'РТК': 'МТС',
  'RTK': 'MTS',
  
  // Сервисы
  'Wink': 'МТС ТВ',
  'wink': 'мтс-тв',
  
  // Домены
  'rostelecom-tariffs.ru': 'mts-tariffs.ru',
  'rtk-telecom.ru': 'mts-telecom.ru',
  'home-rtk.ru': 'home-mts.ru',
  'rt.ru': 'mts.ru',
  
  // Электронные почты
  'partner@home-rtk.ru': 'partner@home-mts.ru',
  
  // Описания
  'крупнейший федеральный интернет-провайдер': 'крупнейший федеральный телеком-оператор',
  'ПАО «Ростелеком»': 'ПАО «МТС»',
  
  // Технические характеристики
  'до 700 Мбит/с': 'до 1 Гбит/с',
  'до 210 каналов': 'до 200 каналов',
  '25 000 фильмов и сериалов': '20 000 фильмов и сериалов',
  
  // Цены
  '642 руб/мес': '599 руб/мес',
  '1600 руб/мес': '1499 руб/мес',
  '800': '750',
  '700': '650',
  '150 ₽/мес': '120 ₽/мес',
  '100 ₽/мес': '80 ₽/мес',
  
  // Названия тарифов
  'Технологии доступа Макси 300': 'МТС Домашний интернет 300',
  'Технологии доступа Тест-драйв': 'МТС Домашний интернет 100',
  
  // Дополнительные услуги
  'облачное хранилище от Mail.ru': 'облачное хранилище от МТС',
  '8 ГБ облачного хранилища': '10 ГБ облачного хранилища',
  'программы "Бонус" от Ростелеком': 'программы "Бонус" от МТС',
  'облачном хранилище от Ростелекома': 'облачном хранилище от МТС',
  'Умный дом от Ростелекома': 'Умный дом от МТС',
  
  // Поддержка
  'службу поддержки клиентов Rostelecom': 'службу поддержки клиентов МТС',
  
  // Правовая информация
  'договора о партнерских отношениях с ПАО «Ростелеком»': 'договора о партнерских отношениях с ПАО «МТС»',
  'услуги связи предоставляются ПАО «Ростелеком»': 'услуги связи предоставляются ПАО «МТС»',
  'официальный сайт rt.ru': 'официальный сайт mts.ru',
  
  // Названия проектов
  'rostelecom-tariffs': 'mts-tariffs',
  
  // Шрифты
  'Rostelecom Basis': 'MTS Sans',
};

// Функция для рекурсивного обхода директорий
function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Пропускаем node_modules и .git
      if (file !== 'node_modules' && file !== '.git' && !file.startsWith('.')) {
        walkDir(filePath, callback);
      }
    } else {
      callback(filePath);
    }
  });
}

// Функция для обработки файла
function processFile(filePath) {
  try {
    // Проверяем расширение файла
    const ext = path.extname(filePath).toLowerCase();
    const textExtensions = ['.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.txt', '.css', '.html'];
    
    if (!textExtensions.includes(ext)) {
      return; // Пропускаем бинарные файлы
    }
    
    // Читаем содержимое файла
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let hasChanges = false;
    
    // Применяем замены
    for (const [oldText, newText] of Object.entries(replacements)) {
      if (content.includes(oldText)) {
        content = content.replace(new RegExp(oldText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newText);
        hasChanges = true;
      }
    }
    
    // Если были изменения, записываем файл
    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Обновлен: ${filePath}`);
    }
    
  } catch (error) {
    console.error(`❌ Ошибка при обработке ${filePath}:`, error.message);
  }
}

// Основная функция
function main() {
  console.log('🚀 Начинаем миграцию с Ростелекома на МТС...\n');
  
  let processedFiles = 0;
  let updatedFiles = 0;
  
  // Обрабатываем файлы
  walkDir('.', (filePath) => {
    processedFiles++;
    const originalContent = fs.readFileSync(filePath, 'utf8');
    processFile(filePath);
    
    // Проверяем, были ли изменения
    const newContent = fs.readFileSync(filePath, 'utf8');
    if (originalContent !== newContent) {
      updatedFiles++;
    }
  });
  
  console.log(`\n📊 Статистика:`);
  console.log(`- Обработано файлов: ${processedFiles}`);
  console.log(`- Обновлено файлов: ${updatedFiles}`);
  console.log(`\n✅ Миграция завершена!`);
}

// Запускаем скрипт
main(); 