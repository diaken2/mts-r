const fs = require('fs');
const path = require('path');

// Карта замен для миграции МТС ТВ на KION
const replacements = {
  // Основные замены
  'МТС ТВ': 'KION',
  'мтс-тв': 'kion',
  'мтс тв': 'kion',
  
  // Описания услуг
  'МТС ТВ на 180 дней (20 000 фильмов и сериалов)': 'KION на 180 дней (20 000 фильмов и сериалов)',
  'МТС ТВ (20 000 фильмов и сериалов)': 'KION (20 000 фильмов и сериалов)',
  'МТС ТВ включен': 'KION включен',
  
  // Иконки и изображения
  'src="/icons/wink.png"': 'src="/icons/kion.png"',
  'alt="МТС ТВ"': 'alt="KION"',
  
  // Дополнительные контексты
  'МТС ТВ в': 'KION в',
  'МТС ТВ и': 'KION и',
  'МТС ТВ,': 'KION,',
  'МТС ТВ.': 'KION.',
  'МТС ТВ!': 'KION!',
  'МТС ТВ?': 'KION?',
  
  // В различных падежах
  'МТС ТВом': 'KION',
  'МТС ТВу': 'KION',
  'МТС ТВа': 'KION',
  'МТС ТВом': 'KION',
  'МТС ТВе': 'KION',
  
  // Специфичные для тарифов
  'с МТС ТВ': 'с KION',
  'включает МТС ТВ': 'включает KION',
  'доступ к МТС ТВ': 'доступ к KION',
  'подписка на МТС ТВ': 'подписка на KION',
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
  console.log('🚀 Начинаем замену МТС ТВ на KION...\n');
  
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
  console.log(`\n✅ Замена МТС ТВ на KION завершена!`);
  console.log(`\n⚠️ Не забудьте создать иконку: public/icons/kion.png`);
}

// Запускаем скрипт
main(); 