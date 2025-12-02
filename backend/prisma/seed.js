import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Aloitetaan tietokannan alustus...');

  // Luo koulu
  const school1 = await prisma.school.create({
    data: {
      name: 'Helsingin Ala-aste',
      address: 'Helsinki, Suomi',
    },
  });

  console.log('✓ Koulut luotu');

  // Luo admin-käyttäjä
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      name: 'Pääkäyttäjä',
      email: 'admin@lukudiplomi.fi',
      password: adminPassword,
      role: 'ADMIN',
      oauthProvider: 'LOCAL',
    },
  });

  console.log('✓ Admin-käyttäjä luotu');

  // Luo opettaja
  const teacherPassword = await bcrypt.hash('opettaja123', 10);
  const teacher = await prisma.user.create({
    data: {
      name: 'Maria Opettaja',
      email: 'maria.opettaja@lukudiplomi.fi',
      password: teacherPassword,
      role: 'TEACHER',
      schoolId: school1.id,
      oauthProvider: 'LOCAL',
    },
  });

  console.log('✓ Opettaja luotu');

  // Luo luokka
  const class1 = await prisma.class.create({
    data: {
      name: '3A',
      gradeLevel: 3,
      schoolId: school1.id,
      teacherId: teacher.id,
    },
  });

  console.log('✓ Luokka luotu');

  // Luo oppilaat
  const studentPassword = await bcrypt.hash('oppilas123', 10);

  const studentNames = ['Matti', 'Maija', 'Ville', 'Liisa', 'Pekka'];
  const students = [];

  for (let i = 0; i < 5; i++) {
    const student = await prisma.user.create({
      data: {
        name: `${studentNames[i]} Oppilas`,
        email: `oppilas${i + 1}@lukudiplomi.fi`,
        password: studentPassword,
        role: 'STUDENT',
        schoolId: school1.id,
        oauthProvider: 'LOCAL',
        studentProfile: {
          create: {
            classId: class1.id,
            gradeLevel: 3,
            readingGoal: 10,
          },
        },
        gameState: {
          create: {
            boardPosition: 0,
            streak: 0,
            xp: 0,
            level: 1,
          },
        },
      },
    });
    students.push(student);
  }

  console.log('✓ Oppilaat luotu');

  // Luo kirjat (suomalaiset ja pohjoismaiset kirjat)
  const books = [
    // Suomalaiset klassikot
    {
      title: 'Sinuhe egyptiläinen',
      author: 'Mika Waltari',
      isbn: '9789510425091',
      pages: 580,
      genre: 'Historiallinen',
      difficultyScore: 2.8,
      recommendedAgeMin: 14,
      recommendedAgeMax: 18,
    },
    {
      title: 'Kalevala',
      author: 'Elias Lönnrot',
      isbn: '9789510444986',
      pages: 500,
      genre: 'Kansanrunous',
      difficultyScore: 3.0,
      recommendedAgeMin: 12,
      recommendedAgeMax: 18,
    },
    {
      title: 'Seitsemän veljestä',
      author: 'Aleksis Kivi',
      isbn: '9789511227335',
      pages: 420,
      genre: 'Klassikko',
      difficultyScore: 2.5,
      recommendedAgeMin: 12,
      recommendedAgeMax: 16,
    },
    {
      title: 'Tuntematon sotilas',
      author: 'Väinö Linna',
      isbn: '9789510458693',
      pages: 420,
      genre: 'Sotaromaani',
      difficultyScore: 2.6,
      recommendedAgeMin: 14,
      recommendedAgeMax: 18,
    },
    {
      title: 'Täällä Pohjantähden alla',
      author: 'Väinö Linna',
      isbn: '9789510443903',
      pages: 680,
      genre: 'Historiallinen',
      difficultyScore: 2.9,
      recommendedAgeMin: 15,
      recommendedAgeMax: 18,
    },
    {
      title: 'Kalevalan tarinoita lapsille',
      author: 'Kirsti Mäkinen',
      isbn: '9789513175221',
      pages: 96,
      genre: 'Kansantarina',
      difficultyScore: 1.0,
      recommendedAgeMin: 7,
      recommendedAgeMax: 12,
    },
    {
      title: 'Koirien Kalevala',
      author: 'Mauri Kunnas',
      isbn: '9789513153533',
      pages: 64,
      genre: 'Kuvakirja',
      difficultyScore: 1.0,
      recommendedAgeMin: 5,
      recommendedAgeMax: 10,
    },

    // Muumit (Tove Jansson)
    {
      title: 'Taikatalvi',
      author: 'Tove Jansson',
      isbn: '9789513133269',
      pages: 160,
      genre: 'Seikkailu',
      difficultyScore: 1.2,
      recommendedAgeMin: 7,
      recommendedAgeMax: 12,
    },
    {
      title: 'Muumipappa ja meri',
      author: 'Tove Jansson',
      isbn: '9789513134716',
      pages: 256,
      genre: 'Seikkailu',
      difficultyScore: 1.2,
      recommendedAgeMin: 7,
      recommendedAgeMax: 12,
    },
    {
      title: 'Kevät ja muita vuodenaikoja',
      author: 'Tove Jansson',
      isbn: '9789513186265',
      pages: 160,
      genre: 'Seikkailu',
      difficultyScore: 1.3,
      recommendedAgeMin: 7,
      recommendedAgeMax: 11,
    },
    {
      title: 'Vaarallinen juhannus',
      author: 'Tove Jansson',
      isbn: '9789513135744',
      pages: 200,
      genre: 'Seikkailu',
      difficultyScore: 1.3,
      recommendedAgeMin: 7,
      recommendedAgeMax: 12,
    },

    // Suomalaiset lastenkirjat
    {
      title: 'Risto Räppääjä',
      author: 'Sinikka Nopola ja Tiina Nopola',
      isbn: '9789511226956',
      pages: 128,
      genre: 'Huumori',
      difficultyScore: 0.8,
      recommendedAgeMin: 7,
      recommendedAgeMax: 11,
    },
    {
      title: 'Ella ja kaverit',
      author: 'Timo Parvela',
      isbn: '9789510314562',
      pages: 96,
      genre: 'Huumori',
      difficultyScore: 0.7,
      recommendedAgeMin: 6,
      recommendedAgeMax: 10,
    },
    {
      title: 'Tatu ja Patu',
      author: 'Aino Havukainen ja Sami Toivonen',
      isbn: '9789510326015',
      pages: 48,
      genre: 'Kuvakirja',
      difficultyScore: 0.6,
      recommendedAgeMin: 5,
      recommendedAgeMax: 9,
    },
    {
      title: 'Herra Huu',
      author: 'Tove Jansson',
      isbn: '9789510390139',
      pages: 48,
      genre: 'Kuvakirja',
      difficultyScore: 0.7,
      recommendedAgeMin: 5,
      recommendedAgeMax: 9,
    },
    {
      title: 'Jäniksen vuosi',
      author: 'Arto Paasilinna',
      isbn: '9789510425367',
      pages: 224,
      genre: 'Huumori',
      difficultyScore: 2.2,
      recommendedAgeMin: 13,
      recommendedAgeMax: 18,
    },
    {
      title: 'Hurmaava joukkoitsemurha',
      author: 'Arto Paasilinna',
      isbn: '9789510425374',
      pages: 256,
      genre: 'Huumori',
      difficultyScore: 2.3,
      recommendedAgeMin: 14,
      recommendedAgeMax: 18,
    },

    // Mauri Kunnas -kirjat
    {
      title: 'Herra Hakkarainen',
      author: 'Mauri Kunnas',
      isbn: '9789513152604',
      pages: 48,
      genre: 'Kuvakirja',
      difficultyScore: 0.6,
      recommendedAgeMin: 4,
      recommendedAgeMax: 8,
    },
    {
      title: 'Seitsemän koiraveljestä',
      author: 'Mauri Kunnas',
      isbn: '9789513153540',
      pages: 64,
      genre: 'Kuvakirja',
      difficultyScore: 0.9,
      recommendedAgeMin: 6,
      recommendedAgeMax: 10,
    },

    // Pohjoismaiset klassikot (Astrid Lindgren)
    {
      title: 'Peppi Pitkätossu',
      author: 'Astrid Lindgren',
      isbn: '9789510422793',
      pages: 160,
      genre: 'Seikkailu',
      difficultyScore: 1.0,
      recommendedAgeMin: 7,
      recommendedAgeMax: 11,
    },
    {
      title: 'Ronja Ryövärintytär',
      author: 'Astrid Lindgren',
      isbn: '9789510422809',
      pages: 240,
      genre: 'Seikkailu',
      difficultyScore: 1.4,
      recommendedAgeMin: 9,
      recommendedAgeMax: 13,
    },
    {
      title: 'Veljeni Leijonamieli',
      author: 'Astrid Lindgren',
      isbn: '9789510422816',
      pages: 224,
      genre: 'Seikkailu',
      difficultyScore: 1.5,
      recommendedAgeMin: 9,
      recommendedAgeMax: 13,
    },
    {
      title: 'Konsta ja hänen koiransa',
      author: 'Astrid Lindgren',
      isbn: '9789510422830',
      pages: 144,
      genre: 'Seikkailu',
      difficultyScore: 1.1,
      recommendedAgeMin: 7,
      recommendedAgeMax: 11,
    },
    {
      title: 'Vilja ja Viulu',
      author: 'Astrid Lindgren',
      isbn: '9789510422847',
      pages: 96,
      genre: 'Ystävyys',
      difficultyScore: 0.9,
      recommendedAgeMin: 6,
      recommendedAgeMax: 10,
    },

    // Ruotsalaiset kirjat
    {
      title: 'Nils Holgersson',
      author: 'Selma Lagerlöf',
      isbn: '9789510394489',
      pages: 480,
      genre: 'Seikkailu',
      difficultyScore: 2.4,
      recommendedAgeMin: 10,
      recommendedAgeMax: 14,
    },

    // Norjalaiset kirjat
    {
      title: 'Sofian maailma',
      author: 'Jostein Gaarder',
      isbn: '9789510383261',
      pages: 544,
      genre: 'Filosofia',
      difficultyScore: 2.7,
      recommendedAgeMin: 14,
      recommendedAgeMax: 18,
    },

    // Tanskalaiset kirjat
    {
      title: 'Jäätynyt planeetta',
      author: 'Peter Høeg',
      isbn: '9789510385449',
      pages: 440,
      genre: 'Jännitys',
      difficultyScore: 2.6,
      recommendedAgeMin: 14,
      recommendedAgeMax: 18,
    },

    // Muita suosittuja kirjoja
    {
      title: 'Punahilkka',
      author: 'Velj. Grimm',
      isbn: '9789510387511',
      pages: 32,
      genre: 'Satu',
      difficultyScore: 0.5,
      recommendedAgeMin: 4,
      recommendedAgeMax: 8,
    },
    {
      title: 'Lumikki ja seitsemän kääpiötä',
      author: 'Velj. Grimm',
      isbn: '9789510387528',
      pages: 40,
      genre: 'Satu',
      difficultyScore: 0.5,
      recommendedAgeMin: 4,
      recommendedAgeMax: 8,
    },
    {
      title: 'Nukketalo',
      author: 'Rumer Godden',
      isbn: '9789513160555',
      pages: 192,
      genre: 'Fantasia',
      difficultyScore: 1.5,
      recommendedAgeMin: 8,
      recommendedAgeMax: 12,
    },

    // Lisää suomalaisia nykykirjailijoita
    {
      title: 'Kätilö',
      author: 'Katja Kettu',
      isbn: '9789510396759',
      pages: 432,
      genre: 'Historiallinen',
      difficultyScore: 2.7,
      recommendedAgeMin: 16,
      recommendedAgeMax: 18,
    },
    {
      title: 'Norma',
      author: 'Sofi Oksanen',
      isbn: '9789510396766',
      pages: 304,
      genre: 'Draama',
      difficultyScore: 2.6,
      recommendedAgeMin: 16,
      recommendedAgeMax: 18,
    },
    {
      title: 'Talvisota',
      author: 'Antti Tuuri',
      isbn: '9789510396773',
      pages: 368,
      genre: 'Sotaromaani',
      difficultyScore: 2.5,
      recommendedAgeMin: 14,
      recommendedAgeMax: 18,
    },
  ];

  for (const bookData of books) {
    await prisma.book.create({ data: bookData });
  }

  console.log('✓ Kirjat luotu');

  // Luo saavutukset
  const achievements = [
    {
      key: 'ensimmainen_kirja',
      name: 'Ensimmäiset Askeleet',
      description: 'Kirjaa ensimmäinen kirjasi',
      icon: '📚',
      criteriaJson: JSON.stringify({ total_books: 1 }),
      points: 10,
      tier: 'bronze',
    },
    {
      key: 'viisi_kirjaa',
      name: 'Kirjamato',
      description: 'Lue 5 kirjaa',
      icon: '🐛',
      criteriaJson: JSON.stringify({ total_books: 5 }),
      points: 25,
      tier: 'silver',
    },
    {
      key: 'kymmenen_kirjaa',
      name: 'Lukumestari',
      description: 'Lue 10 kirjaa',
      icon: '🏆',
      criteriaJson: JSON.stringify({ total_books: 10 }),
      points: 50,
      tier: 'gold',
    },
    {
      key: 'viikon_putki',
      name: 'Säännöllinen Lukija',
      description: 'Pidä yllä 7 päivän lukuputkea',
      icon: '🔥',
      criteriaJson: JSON.stringify({ streak_days: 7 }),
      points: 30,
      tier: 'silver',
    },
    {
      key: 'genretutkija',
      name: 'Genretutkija',
      description: 'Lue kirjoja 5 eri lajityypistä',
      icon: '🌍',
      criteriaJson: JSON.stringify({ unique_genres: 5 }),
      points: 40,
      tier: 'gold',
    },
    {
      key: 'nopea_lukija',
      name: 'Nopealukija',
      description: 'Lue 3 kirjaa 7 päivässä',
      icon: '⚡',
      criteriaJson: JSON.stringify({ books_in_7_days: 3 }),
      points: 35,
      tier: 'silver',
    },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.create({ data: achievement });
  }

  console.log('✓ Saavutukset luotu');

  // Luo laudan konfiguraatio
  await prisma.boardConfig.create({
    data: {
      version: '1.0',
      configJson: JSON.stringify({
        tiles: 50,
        themes: ['metsä', 'meri', 'avaruus', 'vuori'],
      }),
      minAge: 6,
      maxAge: 18,
      isActive: true,
    },
  });

  console.log('✓ Laudan konfiguraatio luotu');

  console.log('\n=== Alustus valmis ===\n');
  console.log('Kirjautumistiedot:');
  console.log('Admin:');
  console.log('  Sähköposti: admin@lukudiplomi.fi');
  console.log('  Salasana: admin123\n');
  console.log('Opettaja:');
  console.log('  Sähköposti: maria.opettaja@lukudiplomi.fi');
  console.log('  Salasana: opettaja123\n');
  console.log('Oppilaat (1-5):');
  console.log('  Sähköposti: oppilas[1-5]@lukudiplomi.fi');
  console.log('  Salasana: oppilas123\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
