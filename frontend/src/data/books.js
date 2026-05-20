// Built-in Finnish book database for the demo — no API needed.
export const BOOKS = [
  { id: 1,  title: 'Peppi Pitkätossu',              author: 'Astrid Lindgren',           pages: 152, genre: 'seikkailu',    difficulty: 0.9 },
  { id: 2,  title: 'Vaahteramäen Eemeli',            author: 'Astrid Lindgren',           pages: 120, genre: 'huumori',      difficulty: 1.0 },
  { id: 3,  title: 'Ronia Ryövärintytär',            author: 'Astrid Lindgren',           pages: 192, genre: 'seikkailu',    difficulty: 1.2 },
  { id: 4,  title: 'Veljeni Leijonamieli',           author: 'Astrid Lindgren',           pages: 182, genre: 'fantasia',     difficulty: 1.3 },
  { id: 5,  title: 'Muumipappa ja meri',             author: 'Tove Jansson',              pages: 218, genre: 'seikkailu',    difficulty: 1.2 },
  { id: 6,  title: 'Taikatalvi',                     author: 'Tove Jansson',              pages: 148, genre: 'fantasia',     difficulty: 1.1 },
  { id: 7,  title: 'Hobitti',                        author: 'J.R.R. Tolkien',            pages: 300, genre: 'fantasia',     difficulty: 1.6 },
  { id: 8,  title: 'Taru sormusten herrasta I',      author: 'J.R.R. Tolkien',            pages: 544, genre: 'fantasia',     difficulty: 2.0 },
  { id: 9,  title: 'Harry Potter ja viisasten kivi', author: 'J.K. Rowling',              pages: 344, genre: 'fantasia',     difficulty: 1.5 },
  { id: 10, title: 'Harry Potter ja salaisuuksien kammio', author: 'J.K. Rowling',        pages: 360, genre: 'fantasia',     difficulty: 1.5 },
  { id: 11, title: 'Pikku prinssi',                  author: 'Antoine de Saint-Exupéry', pages: 96,  genre: 'filosofia',    difficulty: 1.4 },
  { id: 12, title: 'Ihme',                           author: 'R.J. Palacio',              pages: 336, genre: 'kasvukertomus',difficulty: 1.4 },
  { id: 13, title: 'Nälkäpeli',                      author: 'Suzanne Collins',           pages: 374, genre: 'scifi',        difficulty: 1.5 },
  { id: 14, title: 'Kahdeksan veljestä',             author: 'Aleksis Kivi',              pages: 340, genre: 'klassikko',   difficulty: 1.8 },
  { id: 15, title: 'Prinsessa Ruusunen',             author: 'Grimmin veljekset',         pages: 64,  genre: 'satu',         difficulty: 0.7 },
  { id: 16, title: 'Lumikki',                        author: 'Grimmin veljekset',         pages: 48,  genre: 'satu',         difficulty: 0.6 },
  { id: 17, title: 'Sininen planeetta',              author: 'Timo Parvela',              pages: 128, genre: 'seikkailu',    difficulty: 0.8 },
  { id: 18, title: 'Ella',                           author: 'Timo Parvela',              pages: 96,  genre: 'huumori',      difficulty: 0.7 },
  { id: 19, title: 'Viikinkipoika',                  author: 'Henry Winterfeld',          pages: 160, genre: 'historia',     difficulty: 1.1 },
  { id: 20, title: 'Matilda',                        author: 'Roald Dahl',                pages: 240, genre: 'fantasia',     difficulty: 1.2 },
  { id: 21, title: 'Kuka pelkää murjottajaa?',       author: 'Timo Parvela',              pages: 128, genre: 'huumori',      difficulty: 0.8 },
  { id: 22, title: 'Detectiivi Palmu',               author: 'Mika Waltari',              pages: 220, genre: 'jännitys',     difficulty: 1.5 },
  { id: 23, title: 'Punainen poni',                  author: 'John Steinbeck',            pages: 112, genre: 'klassikko',   difficulty: 1.3 },
  { id: 24, title: 'Aikavartijat',                   author: 'Eoin Colfer',               pages: 280, genre: 'scifi',        difficulty: 1.4 },
  { id: 25, title: 'Koirien kunta',                  author: 'Hannele Huovi',             pages: 144, genre: 'fantasia',     difficulty: 1.0 },
];

export const GENRES = ['seikkailu', 'huumori', 'fantasia', 'scifi', 'historia', 'satu', 'jännitys', 'klassikko', 'kasvukertomus', 'filosofia', 'muu'];

export const DIFFICULTY_OPTIONS = [
  { value: 0.7, label: 'Helppo', color: 'bg-green-100 text-green-800' },
  { value: 1.2, label: 'Sopiva', color: 'bg-yellow-100 text-yellow-800' },
  { value: 1.8, label: 'Haastava', color: 'bg-red-100 text-red-800' },
];

export function searchBooks(query) {
  const q = query.toLowerCase().trim();
  if (!q) return BOOKS;
  return BOOKS.filter(
    b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.genre.toLowerCase().includes(q)
  );
}
