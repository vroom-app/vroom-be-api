import { OptionsTransliterate, transliterate } from 'transliteration';

export class SlugGenerator {
    static generateSlug(name: string, city: string): string {
        const combined = `${name} ${city}`;
        
        const options = {
            replace: [
                [/Ж/g, 'Zh'], [/ж/g, 'zh'],
                [/Ц/g, 'Ts'], [/ц/g, 'ts'],
                [/Ч/g, 'Ch'], [/ч/g, 'ch'],
                [/Ш/g, 'Sh'], [/ш/g, 'sh'],
                [/Щ/g, 'Sht'], [/щ/g, 'sht'],
                [/Ъ/g, 'A'], [/ъ/g, 'a'],
                [/Ь/g, 'Y'], [/ь/g, 'y'],
                [/Ю/g, 'Yu'], [/ю/g, 'yu'],
                [/Я/g, 'Ya'], [/я/g, 'ya'],
                [' ', '-'], ['_', '-'], ['.', '-'], [',', '-'],
                ['?', ''], ['!', ''], ['@', ''], ['#', ''], ['$', ''],
                ['%', ''], ['^', ''], ['&', ''], ['*', ''], ['(', ''],
                [')', ''], ['+', ''], ['=', ''], ['[', ''], [']', ''],
                ['{', ''], ['}', ''], ['|', ''], ['\\', ''], ['/', ''],
                [':', ''], [';', ''], ['"', ''], ["'", ''], ['<', ''],
                ['>', ''], ['~', ''], ['`', '']
            ],
            unknown: '',
            trim: true,
        };
        
        const transliterated = transliterate(combined, options as any);
        
        return transliterated
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
    }
}