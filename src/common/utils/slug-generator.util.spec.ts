// slug-.spec.ts
import { SlugGenerator } from './slug-generator.util'

describe('SlugGenerator', () => {
  describe('generateSlug', () => {
    it('should transliterate Bulgarian cyrillic to latin', () => {
      expect(SlugGenerator.generateSlug('Сервиз', 'София')).toBe('serviz-sofiya');
      expect(SlugGenerator.generateSlug('Автоуслуги', 'Пловдив')).toBe('avtouslugi-plovdiv');
      expect(SlugGenerator.generateSlug('Жълт', 'Варна')).toBe('zhalt-varna');
    });

    it('should handle Bulgarian specific characters correctly', () => {
      expect(SlugGenerator.generateSlug('Чистачки', 'Царево')).toBe('chistachki-tsarevo');
      expect(SlugGenerator.generateSlug('Щастливи', 'Бургас')).toBe('shtastlivi-burgas');
      expect(SlugGenerator.generateSlug('Ютия', 'Русе')).toBe('yutiya-ruse');
      expect(SlugGenerator.generateSlug('Ягодово', 'Велико Търново')).toBe('yagodovo-veliko-tarnovo');
    });

    it('should handle tricky Bulgarian characters', () => {
      expect(SlugGenerator.generateSlug('Търговище', 'Град')).toBe('targovishte-grad');
      expect(SlugGenerator.generateSlug('София', 'България')).toBe('sofiya-balgariya');
      expect(SlugGenerator.generateSlug('ЖълтоЗелено', 'София')).toBe('zhaltozeleno-sofiya');
    });

    it('should handle already latin text correctly', () => {
      expect(SlugGenerator.generateSlug('Auto Service', 'Sofia')).toBe('auto-service-sofia');
      expect(SlugGenerator.generateSlug('CarWash', 'Plovdiv')).toBe('carwash-plovdiv');
      expect(SlugGenerator.generateSlug('Mega Motors', 'Varna')).toBe('mega-motors-varna');
    });

    it('should handle mixed Bulgarian and Latin text', () => {
      expect(SlugGenerator.generateSlug('Auto Сервиз', 'София')).toBe('auto-serviz-sofiya');
      expect(SlugGenerator.generateSlug('Mega Жълт', 'Варна')).toBe('mega-zhalt-varna');
      expect(SlugGenerator.generateSlug('Elite Чистачки', 'Пловдив')).toBe('elite-chistachki-plovdiv');
    });

    // Special characters and formatting
    it('should remove or replace special characters', () => {
      expect(SlugGenerator.generateSlug('Auto&Service', 'Sofia!')).toBe('autoservice-sofia');
      expect(SlugGenerator.generateSlug('Mega*Motors', 'Plovdiv#')).toBe('megamotors-plovdiv');
      expect(SlugGenerator.generateSlug('Best.Car,Wash', 'Varna?')).toBe('best-car-wash-varna');
    });

    // Spaces and hyphens
    it('should convert spaces to hyphens and clean up multiple hyphens', () => {
      expect(SlugGenerator.generateSlug('Auto  Service', 'София')).toBe('auto-service-sofiya');
      expect(SlugGenerator.generateSlug('Mega--Motors', 'Пловдив')).toBe('mega-motors-plovdiv');
      expect(SlugGenerator.generateSlug('Best - Car - Wash', 'Варна')).toBe('best-car-wash-varna');
    });

    // Case normalization
    it('should convert everything to lowercase', () => {
      expect(SlugGenerator.generateSlug('AUTO SERVICE', 'SOFIA')).toBe('auto-service-sofia');
      expect(SlugGenerator.generateSlug('Auto Service', 'Sofia')).toBe('auto-service-sofia');
      expect(SlugGenerator.generateSlug('aUTO sERVICE', 'sOFIA')).toBe('auto-service-sofia');
    });

    // Trimming and edge whitespace
    it('should trim whitespace and clean leading/trailing hyphens', () => {
      expect(SlugGenerator.generateSlug('  Auto Service  ', '  Sofia  ')).toBe('auto-service-sofia');
      expect(SlugGenerator.generateSlug('-Auto-Service-', '-Sofia-')).toBe('auto-service-sofia');
      expect(SlugGenerator.generateSlug('...Auto...', '..Sofia..')).toBe('auto-sofia');
    });

    // Numbers in names
    it('should preserve numbers', () => {
      expect(SlugGenerator.generateSlug('Auto24', 'София')).toBe('auto24-sofiya');
      expect(SlugGenerator.generateSlug('Service 2000', 'Пловдив')).toBe('service-2000-plovdiv');
      expect(SlugGenerator.generateSlug('Garage №5', 'Варна')).toBe('garage-no5-varna');
    });

    // Complex real-world examples
    it('should handle complex real-world business names', () => {
      expect(SlugGenerator.generateSlug('Автосервиз "Скорост"', 'София')).toBe('avtoserviz-skorost-sofiya');
      expect(SlugGenerator.generateSlug('Мотор-Клуб & Партньори', 'Стара Загора')).toBe('motor-klub-partnyori-stara-zagora');
      expect(SlugGenerator.generateSlug('ЖълтоЗелено Авто БГ', 'Велико Търново')).toBe('zhaltozeleno-avto-bg-veliko-tarnovo');
    });

    // Consistency test
    it('should produce consistent slugs for same input', () => {
      const slug1 = SlugGenerator.generateSlug('Авто Сервиз', 'София');
      const slug2 = SlugGenerator.generateSlug('Авто Сервиз', 'София');
      const slug3 = SlugGenerator.generateSlug('Авто Сервиз', 'София');
      
      expect(slug1).toBe(slug2);
      expect(slug2).toBe(slug3);
      expect(slug1).toBe('avto-serviz-sofiya');
    });
  });

  // Add tests for the transliteration behavior separately if needed
  describe('transliteration edge cases', () => {
    it('should handle diacritics from other languages', () => {
      expect(SlugGenerator.generateSlug('Café', 'Paris')).toBe('cafe-paris');
      expect(SlugGenerator.generateSlug('Señor', 'Madrid')).toBe('senor-madrid');
      expect(SlugGenerator.generateSlug('Über', 'Berlin')).toBe('uber-berlin');
    });
  });
});