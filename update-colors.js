const fs = require('fs');
const path = require('path');

// Карта замен для обновления цветов и градиентов под МТС
const replacements = {
  // Градиенты
  'linear-gradient(90deg, #F26A2E 0%, #7B2FF2 100%)': 'linear-gradient(90deg, #E30613 0%, #000000 100%)',
  'linear-gradient(135deg, #FF4D06 0%, #2B4FFF 100%)': 'linear-gradient(135deg, #E30613 0%, #000000 100%)',
  'linear-gradient(135deg, #F36D3B 0%, #7B2AFB 100%)': 'linear-gradient(135deg, #E30613 0%, #000000 100%)',
  
  // Классы градиентов
  'bg-gradient-to-r from-[#ff6a2b] to-[#a84fd4]': 'bg-gradient-mts',
  'bg-gradient-to-r from-[#ed6a40] to-[#7c2bf6]': 'bg-gradient-mts-horizontal',
  'bg-gradient-to-r from-[#F26A2E] to-[#7B2FF2]': 'bg-gradient-mts-horizontal',
  'bg-gradient-to-r from-[#ff4f12] to-[#7750ff]': 'bg-gradient-mts-horizontal',
  'bg-gradient-to-r from-[#FF6633] via-[#C4387C] to-[#6637FF]': 'bg-gradient-mts-horizontal',
  
  // Цвета кнопок
  'bg-[#ff5c00]': 'bg-mts-red',
  'bg-[#ff4d06]': 'bg-mts-red',
  'bg-[#FF4F12]': 'bg-mts-red',
  'bg-[#FF4B00]': 'bg-mts-red',
  'bg-[#ff6a2b]': 'bg-mts-red',
  'bg-orange-500': 'bg-mts-red',
  
  // Hover эффекты
  'hover:bg-[#ff7f2a]': 'hover:bg-mts-red-dark',
  'hover:bg-[#e04300]': 'hover:bg-mts-red-dark',
  'hover:bg-orange-600': 'hover:bg-mts-red-dark',
  
  // Границы и акценты
  'border-[#FF4F12]': 'border-mts-red',
  'border-[#FF4B00]': 'border-mts-red',
  'border-[#ff5c00]': 'border-mts-red',
  'hover:border-[#FF4B00]': 'hover:border-mts-red',
  'hover:border-[#FF4F12]': 'hover:border-mts-red',
  'hover:border-[#ff5c00]': 'hover:border-mts-red',
  
  // Текст
  'text-[#FF4B00]': 'text-mts-red',
  'text-[#FF4F12]': 'text-mts-red',
  'text-[#ff5c00]': 'text-mts-red',
  
  // Фоны
  'bg-[#FF4B0008]': 'bg-mts-red/8',
  'bg-[#FF4B0011]': 'bg-mts-red/16',
  
  // Слайдеры и прогресс-бары
  'bg-[#FF6600]': 'bg-mts-red',
  'border-[#FF6600]': 'border-mts-red',
  
  // Фокус и кольца
  'focus:ring-orange-500': 'focus:ring-mts-red',
  'focus:border-[#FF4D15]': 'focus:border-mts-red',
  'focus:ring-[#FFF4F0]': 'focus:ring-mts-red/25',
  
  // Дополнительные цвета
  'bg-[#FFD6C2]': 'bg-mts-red/20',
  'bg-[#FFF4F0]': 'bg-mts-red/10',
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
  console.log('🎨 Начинаем обновление цветов и градиентов под стиль МТС...\n');
  
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
  console.log(`\n✅ Обновление цветов завершено!`);
  console.log(`\n🎨 Основные изменения:`);
  console.log(`- Градиенты: оранжевый-фиолетовый → красный-черный`);
  console.log(`- Кнопки: оранжевые → красные МТС`);
  console.log(`- Акценты: обновлены под стиль МТС`);
}

// Запускаем скрипт
main(); 