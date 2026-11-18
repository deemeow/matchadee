import kancilBuayaImg from '../assets/images/cerita_kancil_buaya_1794748578253.jpg';
import bawangMerahImg from '../assets/images/cerita_bawang_merah_putih_1794816678108.jpg';
import siTanggangImg from '../assets/images/cerita_si_tanggang_baru_1794816986541.jpg';
import batuBelahImg from '../assets/images/cerita_batu_belah_baru_1794817307910.jpg';
import arnabKuraImg from '../assets/images/cerita_arnab_kurakura_1794748579171.jpg';
import legendaMahsuriImg from '../assets/images/cerita_legenda_mahsuri_baru_1794818175897.jpg';
import anjingTulangImg from '../assets/images/cerita_anjing_tulang_1794748580691.jpg';
import cikguKancilImg from '../assets/images/cikgu_kancil_mascot_1794748577492.jpg';
import { BadgeInfo, Story } from '../types';

export const CIKGU_KANCIL_IMAGE = cikguKancilImg;

export const MISSION_BADGES: BadgeInfo[] = [
  {
    id: 'penjelajah_sastera',
    mission: 1,
    title: 'PENJELAJAH SASTERA',
    stars: 10,
    description: 'Berjaya membaca dan memahami karya sastera pilihan di Perpustakaan Sastera Ajaib.'
  },
  {
    id: 'detektif_sastera',
    mission: 2,
    title: 'DETEKTIF SASTERA',
    stars: 15,
    description: 'Berjaya menyiasat dan membandingkan tiga bentuk persembahan sastera.'
  },
  {
    id: 'pengarah_muda',
    mission: 3,
    title: 'PENGARAH MUDA',
    stars: 20,
    description: 'Menguasai lima kemahiran pentas dan merancang pelan persembahan kreatif.'
  },
  {
    id: 'bintang_berkembang',
    mission: 4,
    title: 'BINTANG YANG BERKEMBANG',
    stars: 20,
    description: 'Berani membuat percubaan, menerima maklum balas dan merancang penambahbaikan.'
  },
  {
    id: 'bintang_pentas_teater',
    mission: 5,
    title: 'BINTANG PENTAS TEATER',
    stars: 25,
    description: 'Menghidupkan karya sastera di Pentas Teater Akhir dengan penuh keyakinan.'
  }
];

export const AWARD_CATEGORIES = [
  'Bintang Sebutan Jelas',
  'Bintang Intonasi Hebat',
  'Bintang Ekspresi Menarik',
  'Bintang Kreativiti Persembahan',
  'Bintang Penyampai Mesej'
];

export const STORIES: Story[] = [
  {
    id: 'sang-kancil-dan-buaya',
    title: 'Sang Kancil dan Buaya',
    tagline: 'Kebijaksanaan akal mengatasi kekuatan fizikal.',
    moral: 'Gunakan akal fikiran yang tenang dan bijaksana ketika menghadapi cabaran.',
    image: kancilBuayaImg,
    accentColor: '#10B981',
    sampleLine: '“Wahai Sang Buaya, Raja Sulaiman menitahkan aku mengira jumlah buaya di sungai ini!”',
    jedaSentence: {
      words: ['Pada', 'suatu', 'pagi,', 'Sang', 'Kancil', 'berjalan', 'ke', 'tepi', 'sungai', 'untuk', 'mencari', 'buah', 'rambutan.'],
      correctPauseIndices: [2, 8],
      explanation: 'Kita berhenti seketika selepas kata keterangan masa “pagi,” dan sebelum frasa tujuan “untuk” supaya maksud ayat jelas dan nafas terkawal.'
    },
    characters: ['Sang Kancil', 'Ketua Buaya', 'Kumpulan Buaya', 'Pencerita'],
    setting: 'Tebing sungai rimba tropika yang dipenuhi pokok rambutan ranum.',
    paragraphs: [
      'Pada suatu pagi yang cerah, Sang Kancil berjalan menyusuri denai hutan untuk mencari makanan. Tiba di tebing sebuah sungai yang luas dan jernih, matanya tertumpu pada pokok-pokok rambutan yang sedang berbuah lebat di seberang sungai.',
      'Buah rambutan yang merah menyala itu sungguh menyelerakan. Namun, Sang Kancil termenung seketika kerana air sungai mengalir deras dan di dalamnya pula dihuni oleh sekumpulan buaya yang garang serta sentiasa lapar.',
      'Sedang Sang Kancil berfikir, seekor buaya besar muncul di permukaan air sambil membuka mulutnya luas-luas. “Wahai Sang Kancil, mahukah engkau menjadi santapan tengah hari kami?” soal buaya itu dengan suara yang garau.',
      'Sang Kancil langsung tidak panik. Sebaliknya, dia tersenyum tenang lalu berkata, “Wahai Sang Buaya, aku datang membawa titah Raja Sulaiman! Baginda ingin mengadakan kenduri besar dan mahu tahu bilangan buaya di sungai ini.”',
      'Mendengar perkataan kenduri, Sang Buaya berasa amat teruja lalu memanggil semua kawannya. “Berbarislah kalian dari tebing ini hingga ke seberang sana supaya mudah untukku mengira,” arah Sang Kancil dengan yakin.',
      'Dalam sekelip mata, puluhan buaya berbaris rapat membentuk sebuah jambatan hidup merentasi sungai. Sang Kancil pun melompat dari satu belakang buaya ke belakang buaya yang lain sambil mengira dengan suara lantang: “Satu, dua, tiga, empat...”',
      'Setibanya di tebing seberang, Sang Kancil melompat turun dengan pantas lalu tertawa riang. “Terima kasih, Sang Buaya! Sebenarnya tiada kenduri, aku cuma perlukan jambatan untuk menyeberangi sungai,” katanya sebelum berlari menuju ke pohon rambutan.',
      'Sang Buaya berasa tertipu namun tidak dapat berbuat apa-apa. Sejak hari itu, seluruh penghuni hutan mengagumi kebijaksanaan Sang Kancil yang menggunakan akal fikiran yang tenang untuk melepaskan diri daripada bahaya.'
    ],
    performanceDemos: {
      normal: {
        note: 'Suara sekata, kelajuan tetap dan tidak berubah mengikut emosi watak.',
        lines: [
          'Pada suatu pagi, Sang Kancil berjalan ke tepi sungai untuk mencari buah rambutan.',
          'Buah itu terletak di seberang sungai yang penuh dengan buaya.',
          'Sang Kancil meminta buaya berbaris supaya dia dapat mengira jumlah mereka.'
        ]
      },
      expressive: {
        note: 'Menggunakan turun naik intonasi, jeda terancang dan warna suara berbeza antara pencerita dengan dialog.',
        lines: [
          { text: '“Wahai Sang Buaya...”', cue: 'Nada yakin & lembut, tarik nafas sebelum berkata' },
          { text: '“...aku datang membawa titah Raja Sulaiman!”', cue: 'Suara ditegaskan untuk meyakinkan buaya' },
          { text: '“Satu... dua... tiga... dan sampai!”', cue: 'Ritma melompat semakin ceria dan bersemangat' }
        ]
      },
      acting: {
        note: 'Menggabungkan suara berwatak, mimik muka, pergerakan tangan serta aksi melompat di pentas.',
        scenes: [
          { character: 'Ketua Buaya', action: 'Menggeliat perlahan dan merenung tajam ke arah tebing', dialogue: '“Hmm... sedapnya kalau dapat makan Sang Kancil hari ini!”' },
          { character: 'Sang Kancil', action: 'Bercekak pinggang sambil mengangkat jari telunjuk', dialogue: '“Nanti dulu! Berbarislah dari tebing ini ke seberang supaya aku dapat mengira kalian!”' },
          { character: 'Sang Kancil', action: 'Melompat riang dari satu batu pentas ke batu seterusnya', dialogue: '“Terima kasih sahabatku! Selamat tinggal!”' }
        ]
      }
    }
  },
  {
    id: 'bawang-merah-bawang-putih',
    title: 'Bawang Merah dan Bawang Putih',
    tagline: 'Kesabaran dan kebaikan hati pasti membawa bahagia.',
    moral: 'Bersikap jujur, sabar dan baik hati walaupun diuji dengan kesusahan.',
    image: bawangMerahImg,
    accentColor: '#EC4899',
    sampleLine: '“Wahai ikan kaloi sahabatku, marilah bermain bersamaku di tepi perigi ini.”',
    jedaSentence: {
      words: ['Setiap', 'petang,', 'Bawang', 'Putih', 'bermain', 'buaian', 'sambil', 'bernyanyi', 'dengan', 'suara', 'yang', 'merdu.'],
      correctPauseIndices: [1, 5],
      explanation: 'Berhenti sebentar selepas “petang,” dan sebelum kata hubung “sambil” menjadikan bacaan lebih beralun dan merdu.'
    },
    characters: ['Bawang Putih', 'Bawang Merah', 'Mak Kundur', 'Putera Raja', 'Ikan Kaloi'],
    setting: 'Halaman rumah kayu kampung dengan perigi jernih dan pokok beringin berbuai.',
    paragraphs: [
      'Di sebuah kampung yang damai, tinggal seorang gadis bernama Bawang Putih bersama ibu tirinya, Mak Kundur, dan adik tirinya, Bawang Merah. Bawang Putih terkenal dengan sifatnya yang rajin, lemah lembut dan tidak pernah merungut.',
      'Setiap hari, Bawang Putih melakukan pelbagai kerja rumah seperti mengemas, membasuh pakaian di sungai dan mengumpul kayu api. Sebaliknya, Bawang Merah sering bersenang-senang dan membiarkan kakaknya bekerja sendirian.',
      'Satu-satunya penghibur hati Bawang Putih ialah seekor ikan kaloi kecil yang tinggal di dalam perigi di belakang rumah. Setiap kali dia menyanyi sambil memberi makan, ikan kaloi itu akan timbul di permukaan air seolah-olah memahami perasaannya.',
      'Suatu hari, Mak Kundur dan Bawang Merah mengetahui rahsia ikan kaloi tersebut lalu menangkap dan memasaknya tanpa pengetahuan Bawang Putih. Apabila mendapat tahu perkara itu, Bawang Putih menangis pilu dan menanam tulang ikan itu di bawah sepohon pokok rendang.',
      'Dengan kuasa Tuhan, keesokan harinya tumbuh sebatang pokok yang rendang dan mempunyai buaian bunga yang sangat cantik. Apabila Bawang Putih duduk di atas buaian sambil bernyanyi, buaian itu berayun sendiri dengan alunan muzik yang mempesonakan.',
      'Pada suatu petang, seorang Putera Raja yang sedang berburu terdengar nyanyian merdu Bawang Putih dari dalam hutan. Baginda mengikut arah suara tersebut hingga tiba di halaman rumah Bawang Putih dan terpikat dengan budi bahasanya.',
      'Mak Kundur cuba menyuruh Bawang Merah menggantikan tempat Bawang Putih, tetapi buaian ajaib itu langsung tidak mahu bergerak ketika Bawang Merah menyanyi dengan suara yang kasar.',
      'Akhirnya, kebenaran terbongkar. Putera Raja menjemput Bawang Putih ke istana untuk dijadikan permaisuri kerana keikhlasan dan kemurnian hatinya. Bawang Putih pun hidup bahagia, membuktikan bahawa kesabaran sentiasa membuahkan kemanisan.'
    ],
    performanceDemos: {
      normal: {
        note: 'Dibaca dengan nada rata tanpa menggambarkan kesedihan atau keajaiban buaian.',
        lines: [
          'Bawang Putih seorang gadis yang rajin dan baik hati.',
          'Dia mempunyai seekor ikan kaloi di dalam perigi.',
          'Suatu hari tumbuh sepohon pokok rendang yang mempunyai buaian cantik.'
        ]
      },
      expressive: {
        note: 'Suara sayu ketika Bawang Putih kehilangan ikan kaloi dan bertukar ceria apabila buaian ajaib mula berayun.',
        lines: [
          { text: '“Wahai ikan kaloi sahabatku...”', cue: 'Lembut, mesra dan penuh kasih sayang' },
          { text: '“Mengapa kalian tergamak melakukan ini?”', cue: 'Nada sebak, perlahan dengan jeda panjang' },
          { text: '“Lajulah buaian, laju... tinggi ke awan biru!”', cue: 'Nyanyian ceria dan beralun penuh harapan' }
        ]
      },
      acting: {
        note: 'Pelakon menunjukkan gerakan berbuai, mimik wajah sedih dan dialog berbalas dengan Putera Raja.',
        scenes: [
          { character: 'Bawang Putih', action: 'Duduk mengayunkan badan perlahan sambil memandang langit', dialogue: '“Lajulah buaianku... hiburkanlah hatiku yang lara ini.”' },
          { character: 'Putera Raja', action: 'Melangkah masuk sambil menoleh kagum ke arah pokok', dialogue: '“Merdu sungguh suara itu! Siapakah gerangan gadis yang bernyanyi?”' },
          { character: 'Mak Kundur', action: 'Menolak Bawang Merah ke hadapan dengan tergesa-gesa', dialogue: '“Tuanku! Anak patiklah yang menyanyi tadi!”' }
        ]
      }
    }
  },
  {
    id: 'si-tanggang',
    title: 'Si Tanggang',
    tagline: 'Hormatilah ibu bapa walau setinggi mana darjat kita.',
    moral: 'Jangan sesekali menderhaka kepada ibu bapa dan melupakan asal usul diri.',
    image: siTanggangImg,
    accentColor: '#6366F1',
    sampleLine: '“Pergi dari sini! Perempuan tua ini bukan ibuku!”',
    jedaSentence: {
      words: ['Walaupun', 'sudah', 'menjadi', 'nakhoda', 'kaya,', 'Si', 'Tanggang', 'terlupa', 'akan', 'jasa', 'ibunya.'],
      correctPauseIndices: [4],
      explanation: 'Jeda selepas klausa “kaya,” memberi penekanan kepada pertentangan antara kekayaan dengan sikap lupa diri.'
    },
    characters: ['Si Tanggang', 'Si Talang (Ibu)', 'Puteri', 'Anak Kapal'],
    setting: 'Pelabuhan kampung di tepi laut dengan kapal layar megah yang berlabuh.',
    paragraphs: [
      'Pada zaman dahulu, di sebuah kampung di pinggir laut, tinggal seorang wanita tua bernama Si Talang bersama anak lelakinya, Si Tanggang. Kehidupan mereka sangat miskin, namun Si Talang sentiasa mendidik anaknya dengan penuh kasih sayang.',
      'Suatu hari, Si Tanggang meminta izin ibunya untuk merantau menaiki sebuah kapal dagang bagi mengubah nasib keluarga. Dengan berat hati tetapi penuh doa, Si Talang merestui pemergian anaknya sambil berpesan agar tidak melupakan dirinya.',
      'Bertahun-tahun lamanya Si Tanggang bekerja keras di perantauan. Berkat kesungguhannya, dia diangkat menjadi seorang nakhoda kapal yang kaya-raya dan berjaya mengahwini seorang puteri bangsawan yang jelita.',
      'Pada suatu hari, kapal megah milik Si Tanggang berlabuh di pelabuhan kampung asalnya. Berita kepulangan Si Tanggang segera sampai ke telinga Si Talang yang sudah uzur dan merindui anaknya selama bertahun-tahun.',
      'Dengan berbekalkan pisang salai kegemaran anaknya, Si Talang mendayung sampan kecil menghampiri kapal besar itu. “Tanggang! Ini ibu, nak! Ibu datang membawakan makanan kegemaranmu!” laung Si Talang dengan air mata kegembiraan.',
      'Namun, apabila melihat keadaan ibunya yang berpakaian lusuh di hadapan isterinya, Si Tanggang berasa malu. Dia membentak dengan kasar, “Pergi! Perempuan tua ini bukan ibuku! Ibuku tidak semiskin ini!”',
      'Hati Si Talang remuk mendengar kata-kata kejam itu. Sambil mengangkat tangan ke langit, dia berdoa, “Ya Tuhan, jika benar dia anakku Si Tanggang yang kuasuh sejak kecil, tunjukkanlah balasan atas penderhakaannya.”',
      'Tiba-tiba langit menjadi gelap, guruh berdentum dan ribut kencang membadai kapal tersebut. Perlahan-lahan kapal dan tubuh Si Tanggang bertukar menjadi batu. Kisah ini menjadi pengajaran abadi agar kita sentiasa menyayangi dan menghormati ibu bapa.'
    ],
    performanceDemos: {
      normal: {
        note: 'Bacaan tenang tanpa membezakan suara lembut ibu yang tua dengan suara angkuh Si Tanggang.',
        lines: [
          'Si Talang mendayung sampan menghampiri kapal anaknya.',
          'Si Tanggang berasa malu lalu menghalau ibunya dari kapal.',
          'Ribut kencang melanda lalu menukarkan kapal itu menjadi batu.'
        ]
      },
      expressive: {
        note: 'Kontras suara yang ketara: nada sayu merayu daripada ibu dan nada tegas meninggi daripada Si Tanggang.',
        lines: [
          { text: '“Tanggang, nak... ini ibu datang membawamu pulang...”', cue: 'Suara bergetar lembut penuh kerinduan' },
          { text: '“Pengawal! Halau perempuan tua ini sekarang juga!”', cue: 'Tegas, sombong dan bertempo cepat' },
          { text: '“Maafkan Tanggang, ibu... ampunkan Tanggang!”', cue: 'Cemas dan menyesal apabila ribut bermula' }
        ]
      },
      acting: {
        note: 'Memanfaatkan ruang pentas untuk memisahkan dek kapal yang tinggi dengan sampan kecil Si Talang.',
        scenes: [
          { character: 'Si Talang', action: 'Mengangkat bungkusan daun pisang dengan tangan terketar-ketar', dialogue: '“Tanggang! Lihatlah, ibu bawakan pisang salai kegemaranmu!”' },
          { character: 'Si Tanggang', action: 'Memalingkan muka dan mengibas tangan tanda menolak', dialogue: '“Jangan dekati kapalku! Aku tidak pernah mengenalimu!”' },
          { character: 'Anak Kapal', action: 'Berpegang pada tiang sambil bergoyang ketika bunyi guruh', dialogue: '“Awas! Ombak besar datang! Kapal kita semakin mengeras!”' }
        ]
      }
    }
  },
  {
    id: 'batu-belah-batu-bertangkup',
    title: 'Batu Belah Batu Bertangkup',
    tagline: 'Kasih sayang keluarga dan tanggungjawab anak terhadap ibu.',
    moral: 'Kita hendaklah bertimbang rasa, bersyukur dan sentiasa menghargai pengorbanan ibu bapa.',
    image: batuBelahImg,
    accentColor: '#8B5CF6',
    sampleLine: '“Wahai Batu Belah Batu Bertangkup, telanlah aku yang sedang berduka ini...”',
    jedaSentence: {
      words: ['Mak', 'Tanjung', 'menyimpan', 'telur', 'ikan', 'tembakul', 'itu', 'di', 'dalam', 'periuk', 'tanah.'],
      correctPauseIndices: [6],
      explanation: 'Hentian seketika selepas objek “itu” menonjolkan di mana telur ikan tersebut disimpan.'
    },
    characters: ['Mak Tanjung', 'Melur', 'Pekan', 'Pencerita'],
    setting: 'Pondok kecil di pinggir hutan berhampiran gua batu misteri.',
    paragraphs: [
      'Di pinggir sebuah hutan tinggal seorang ibu bernama Mak Tanjung bersama dua orang anaknya, Melur dan Pekan. Sejak ketiadaan suami, Mak Tanjung bekerja keras menangkap ikan di sungai demi menyara kehidupan mereka.',
      'Pada suatu hari, Mak Tanjung berjaya menangkap seekor ikan tembakul yang besar dan penuh telur. Dia berasa amat gembira kerana sudah lama mengidam untuk menikmati telur ikan tersebut.',
      'Mak Tanjung menggoreng telur ikan itu dan membahagikannya sama rata. Sebahagiannya diberikan kepada Melur dan Pekan, manakala bakinya disimpan di atas para untuk dimakan selepas dia pulang mencari kayu api.',
      'Malangnya, Pekan yang masih kecil berasa sangat lapar lalu meminta telur ikan simpanan ibunya. Walaupun Melur cuba menasihati adiknya, Pekan tetap menangis sehingga Melur terpaksa memberikan bahagian ibu mereka kepada Pekan.',
      'Apabila Mak Tanjung pulang dengan tubuh yang letih, hatinya berasa amat hiba melihat pinggan telur ikannya sudah kosong. Terasa pengorbanannya kurang dihargai, Mak Tanjung berjalan meninggalkan rumah menuju ke arah sebuah gua batu ajaib di dalam hutan.',
      '“Batu Belah Batu Bertangkup, telanlah aku, aku sudah tidak sanggup lagi menahan duka,” seru Mak Tanjung sambil melangkah masuk ke celah batu besar itu. Melur dan Pekan yang menyedari kehilangan ibu mereka segera mengejar ke dalam hutan.',
      'Setibanya di hadapan gua, batu itu hampir tertutup rapat. Melur merayu sambil menangis, “Ibu, ampunkan kami! Jangan tinggalkan kami berdua!” Namun hanya hujung rambut Mak Tanjung yang sempat disentuh oleh Melur.',
      'Selepas kejadian itu, Melur menjaga Pekan dengan penuh kasih sayang. Kisah Batu Belah Batu Bertangkup mengingatkan kanak-kanak agar sentiasa bersyukur, berkongsi dengan adil dan menghormati perasaan orang tua.'
    ],
    performanceDemos: {
      normal: {
        note: 'Dibaca lurus tanpa menekankan rasa keletihan Mak Tanjung atau cemasnya Melur.',
        lines: [
          'Mak Tanjung menyimpan telur ikan tembakul untuk dimakan kemudian.',
          'Pekan menangis kerana lapar lalu memakan telur ikan tersebut.',
          'Mak Tanjung berasa sedih dan berjalan menuju ke Batu Belah Batu Bertangkup.'
        ]
      },
      expressive: {
        note: 'Nada penuh perasaan sayu, suara memujuk dan rayuan mendayu yang menyentuh hati pendengar.',
        lines: [
          { text: '“Pekan, janganlah habiskan bahagian ibu...”', cue: 'Nada lembut memujuk dengan keluhan ringan' },
          { text: '“Batu Belah Batu Bertangkup... bukalah pintumu.”', cue: 'Suara perlahan, syahdu dan beralun' },
          { text: '“Ibu! Jangan tinggalkan kami, ibu!”', cue: 'Nada cemas dan tinggi penuh rayuan' }
        ]
      },
      acting: {
        note: 'Menampilkan lakonan emosi mendalam antara kakak yang bertanggungjawab dengan ibu yang terkilan.',
        scenes: [
          { character: 'Melur', action: 'Memegang bahu Pekan sambil melihat periuk kosong', dialogue: '“Adik, bagaimana kita hendak beritahu ibu apabila dia pulang nanti?”' },
          { character: 'Mak Tanjung', action: 'Berdiri di ambang cahaya gua dengan langkah berat', dialogue: '“Penat lelahku hari ini bagaikan tiada nilainya lagi...”' },
          { character: 'Melur', action: 'Berlari ke hadapan pentas menghulurkan tangan', dialogue: '“Ibu! Maafkan kami, ibu! Kembalilah bersama Melur dan Pekan!”' }
        ]
      }
    }
  },
  {
    id: 'sang-arnab-dan-sang-kura-kura',
    title: 'Sang Arnab dan Sang Kura-kura',
    tagline: 'Usaha yang berterusan lebih baik daripada sikap sombong.',
    moral: 'Jangan memandang rendah kebolehan orang lain dan sentiasa tekun berusaha.',
    image: arnabKuraImg,
    accentColor: '#F59E0B',
    sampleLine: '“Biarpun langkahku perlahan, aku tidak akan pernah berputus asa!”',
    jedaSentence: {
      words: ['Sang', 'Kura-kura', 'berjalan', 'perlahan-lahan,', 'namun', 'dia', 'tetap', 'fokus', 'hingga', 'ke', 'garisan', 'penamat.'],
      correctPauseIndices: [3],
      explanation: 'Jeda selepas “perlahan-lahan,” memisahkan cabaran awal dengan keazaman Sang Kura-kura.'
    },
    characters: ['Sang Arnab', 'Sang Kura-kura', 'Sang Tupai (Pengadil)', 'Penghuni Hutan'],
    setting: 'Laluan balapan hutan yang dihiasi bendera warna-warni dan pokok rendang.',
    paragraphs: [
      'Di dalam sebuah rimba yang ceria, Sang Arnab terkenal sebagai haiwan yang paling pantas berlari. Namun malangnya, kelebihan itu membuatkan dia bersikap sombong dan sering mengejek haiwan lain yang bergerak perlahan.',
      'Pada suatu hari, Sang Arnab mentertawakan Sang Kura-kura yang sedang berjalan menuju ke tepi tasik. “Hei Kura-kura, bilakah agaknya kamu akan sampai dengan langkah sekecil itu?” ejek Sang Arnab sambil melompat-lompat.',
      'Sang Kura-kura tersenyum tenang lalu menjawab, “Walaupun perlahan, aku sentiasa sampai ke destinasi. Jika kamu berani, marilah kita berlumba hingga ke puncak bukit sana.”',
      'Sang Arnab ketawa terbahak-bahak menerima cabaran itu. Keesokan paginya, semua penghuni hutan berkumpul di garisan permulaan. Sang Tupai bertindak sebagai pengadil lalu meniup wisel memulakan perlumbaan.',
      'Sebaik sahaja wisel berbunyi, Sang Arnab meluru laju meninggalkan Sang Kura-kura jauh di belakang. Apabila menoleh ke belakang dan melihat Sang Kura-kura masih jauh, Sang Arnab berasa terlalu yakin dirinya akan menang.',
      '“Ah, masih lama lagi Kura-kura hendak tiba! Baik aku berehat dan tidur sebentar di bawah pokok rendang ini,” fikir Sang Arnab lalu tertidur lena dibuai angin sepoi-sepoi bahasa.',
      'Sementara itu, Sang Kura-kura terus melangkah satu demi satu tanpa mengenal erti penat. Dia berjalan melepasi Sang Arnab yang sedang berdengkur nyenyak dan semakin hampir dengan garisan penamat.',
      'Apabila Sang Arnab terjaga, dia terkejut melihat Sang Kura-kura sedang disambut sorakan gemuruh di garisan penamat. Sejak hari itu, Sang Arnab sedar bahawa sikap sombong hanya membawa kerugian manakala ketekunan membawa kejayaan.'
    ],
    performanceDemos: {
      normal: {
        note: 'Bacaan biasa menjelaskan urutan peristiwa perlumbaan tanpa tenaga watak.',
        lines: [
          'Sang Arnab mengejek Sang Kura-kura kerana berjalan perlahan.',
          'Mereka mengadakan perlumbaan hingga ke puncak bukit.',
          'Sang Arnab tertidur di bawah pokok dan akhirnya tewas.'
        ]
      },
      expressive: {
        note: 'Menonjolkan rentak laju dan angkuh Sang Arnab berbanding suara tenang serta tabah Sang Kura-kura.',
        lines: [
          { text: '“Hahaha! Kamu hendak berlumba dengan aku?”', cue: 'Nada ketawa megah dan penuh keyakinan' },
          { text: '“Langkah demi langkah... aku pasti sampai.”', cue: 'Suara stabil, tenang dan penuh keazaman' },
          { text: '“Alamak! Kura-kura sudah hampir di garisan penamat!”', cue: 'Cemas dan kelam-kabut' }
        ]
      },
      acting: {
        note: 'Sarat dengan aksi fizikal: melompat pantas, aksi tidur berdengkur dan langkah tabah menuju penamat.',
        scenes: [
          { character: 'Sang Arnab', action: 'Melompat penuh gaya sambil menepuk dada', dialogue: '“Tiada siapa dapat menandingi kepantasanku di hutan ini!”' },
          { character: 'Sang Kura-kura', action: 'Melangkah perlahan tetapi tegap tanpa menoleh ke tepi', dialogue: '“Biar lambat asalkan selamat dan tidak berhenti berusaha.”' },
          { character: 'Sang Tupai', action: 'Mengibarkan bendera sambil melompat teruja', dialogue: '“Tahniah Sang Kura-kura! Kamulah juara perlumbaan hari ini!”' }
        ]
      }
    }
  },
  {
    id: 'legenda-mahsuri',
    title: 'Legenda Mahsuri',
    tagline: 'Kejujuran dan keadilan adalah tiang kebenaran.',
    moral: 'Jangan bersikap hasad dengki dan menyebarkan fitnah tanpa usul periksa kerana sesal kemudian tiada gunanya.',
    image: legendaMahsuriImg,
    accentColor: '#0EA5E9',
    sampleLine: '“Ya Tuhanku, aku reda akan matiku jika benar aku bersalah. Tapi jika benar aku dianiaya, sesungguhnya aku haramkan darahku mengalir ke bumi ini.”',
    jedaSentence: {
      words: ['Setelah', 'Mahsuri', 'dewasa,', 'dia', 'telah', 'menjadi', 'gadis', 'yang', 'jelita', 'di', 'kampungnya.'],
      correctPauseIndices: [2],
      explanation: 'Hentian seketika selepas klausa “dewasa,” membantu pembaca menyebut ayat dengan lancar dan jelas.'
    },
    characters: [
      'Mahsuri',
      'Pandak Mayah',
      'Endak Alang',
      'Wan Darus',
      'Wan Hakim',
      'Wan Mahora',
      'Deramang',
      'Datuk Pekerma Jaya'
    ],
    setting: 'Kampung di Langkawi yang mempunyai sawah padi menguning serta tempat hukuman.',
    paragraphs: [
      'Suatu masa dahulu, ada sepasang suami isteri yang bernama Pandak Mayah dan Endak Alang. Mereka baru saja berpindah di Langkawi. Walaupun sudah lama berkahwin, namun pasangan ini tidak mempunyai anak.',
      'Pada suatu hari, sedang Pandak Mayah mengerjakan sawahnya, dia terdengar seperti suara bayi menangis. Dia mencari-cari di manakah punca suara menangis itu. Akhirnya Pandak Mayah terjumpa kerak nasi. Dia yakin suara tangisan tadi berpunca daripada kerak nasi itu. Lalu dia membawa kerak nasi itu pulang.',
      'Endak Alang terkejut apabila Pandak Mayah menceritakan tentang kejadian itu. Lalu Endak Alang berkata, “Eloklah jika kita masukkan sedikit kerak nasi ini ke dalam nasi yang ditanak untuk kita makan. Mungkin ada hikmahnya.”',
      'Tidak berapa lama kemudian, Endak Alang hamil. Semasa hendak melahirkan anaknya, padi di sawah menguning seakan-akan emas yang berkilauan. Maka lahirlah anak perempuan yang diberi nama Mahsuri. Sejak kelahiran Mahsuri, keluarga mereka dilimpahi rezeki yang melimpah-ruah. Pandak Mayah telah menjadi orang kaya di kampungnya.',
      'Setelah Mahsuri dewasa, dia telah menjadi gadis yang jelita. Ramai lelaki yang memuji-muji kecantikannya sehingga menimbulkan rasa iri hati dalam kalangan penduduk kampung tersebut, antaranya ialah isteri Datuk Pekerma Jaya, iaitu Wan Mahora. Disebabkan adik lelakinya, Wan Darus juga menyimpan perasaan terhadap Mahsuri, Datuk Pekerma Jaya telah mengahwinkan adiknya itu dengan Mahsuri.',
      'Suatu hari Wan Darus telah diperintahkan untuk menyertai peperangan menentang Siam. Ketika itu Mahsuri sedang sarat mengandung. Lalu Wan Darus telah menghantar Mahsuri pulang ke rumah ibu bapanya. Mahsuri akhirnya telah melahirkan anak lelaki bernama Wan Hakim.',
      'Ketika ketiadaan Wan Darus, Wan Mahora telah merancang untuk menganiaya Mahsuri. Lalu dia telah membuat fitnah mengatakan bahawa Mahsuri telah melakukan perkara tidak baik dengan Deramang, pekerja ayahnya. Datuk Pekerma Jaya telah mempercayai kata-kata isterinya. Lalu dia telah mengarahkan Mahsuri dan Deramang ditangkap.',
      '“Pergi tangkap Mahsuri dan Deramang dan bawa kedua-duanya ke sini,” arah Datuk Pekerma Jaya.',
      'Tanpa memberi peluang untuk membela diri, Datuk Pekerma Jaya telah menjatuhkan hukuman mati ke atas kedua-duanya. Wan Mahora tersenyum puas.',
      'Pandak Mayah dan Endak Alang segera ke tempat hukuman dan merayu kepada Datuk Pekerma Jaya agar melepaskan Mahsuri.',
      '“Kasihanilah Mahsuri, Datuk. Anaknya masih menyusu lagi,” rayu Pandak Mayah.',
      'Namun rayuan itu tidak diendahkan oleh Datuk Pekerma Jaya. Orang kampung juga telah memenuhi tempat hukuman.',
      'Dengan sebilah tombak, pertanda pun menjalankan hukuman. Pertanda menikam Mahsuri dengan tombak namun tidak memberikan apa-apa kesan kepada Mahsuri. Lalu dia menikam Mahsuri bertubi-tubi. Tidak juga berjaya. Akhirnya Mahsuri memberitahu bahawa hanya sebilah keris pusaka yang dapat memutuskan nyawanya. Lalu Datuk Pekerma Jaya mengarahkan orangnya mengambil keris itu lalu dia sendiri telah menikam Mahsuri menggunakan keris tersebut.',
      'Sebelum mati, Mahsuri telah bersumpah, “Ya Tuhanku, aku reda akan matiku jika benar aku bersalah. Tapi jika benar aku dianiaya, sesungguhnya aku haramkan darahku mengalir ke bumi ini. Dan aku sumpah bumi Langkawi tidak akan aman, berpuakalah menjadi padang jarak padang tekukur selama tujuh keturunan.”',
      'Penduduk kampung sangat terperanjat apabila melihat darah yang mengalir daripada Mahsuri berwarna putih. Ini membuktikan bahawa benar Mahsuri telah dianiaya. Namun semuanya telah terlambat. Mahsuri terkulai menghembuskan nafas terakhir.',
      'Wan Darus kembali ke kampung setelah tewas dalam peperangan. Lebih menghancurkan hatinya apabila mengetahui tentang kematian isterinya. Lalu Wan Darus telah membawa anaknya dan ibu bapa mentuanya meninggalkan Langkawi.',
      'Setelah pemergian mereka, Langkawi telah diserang oleh Siam genap tujuh hari kematian Mahsuri. Datuk Pekerma Jaya dan isterinya telah dibunuh oleh tentera Siam. Angkara hasad dengki dan fitnah, Langkawi menerima padah yang hebat. Sesal kemudian tiada gunanya. Sumpahan Mahsuri kekal menghukum Langkawi untuk tujuh keturunan kemudiannya.'
    ],
    performanceDemos: {
      normal: {
        note: 'Bacaan tersusun dan jelas seperti menyampaikan kronologi peristiwa tanpa penjiwaan dramatik.',
        lines: [
          'Pandak Mayah dan Endak Alang mendapat seorang anak perempuan bernama Mahsuri.',
          'Wan Mahora memfitnah Mahsuri sehingga Datuk Pekerma Jaya menjatuhkan hukuman mati.',
          'Selepas kematian Mahsuri, Langkawi diserang oleh tentera Siam.'
        ]
      },
      expressive: {
        note: 'Menonjolkan perubahan nada antara rayuan sebak Pandak Mayah dengan sumpah tegas dan pilu Mahsuri.',
        lines: [
          { text: '“Eloklah jika kita masukkan sedikit kerak nasi ini ke dalam nasi yang ditanak untuk kita makan.”', cue: 'Nada lembut, tenang dan penuh harapan' },
          { text: '“Kasihanilah Mahsuri, Datuk. Anaknya masih menyusu lagi,”', cue: 'Suara rayuan yang sebak, bergetar dan memilukan' },
          { text: '“Ya Tuhanku, aku reda akan matiku jika benar aku bersalah.”', cue: 'Nada tegas, tulus dan berwibawa' }
        ]
      },
      acting: {
        note: 'Persembahan teater klasik menonjolkan arahan tegas Datuk Pekerma Jaya, rayuan Pandak Mayah dan ketabahan Mahsuri.',
        scenes: [
          { character: 'Datuk Pekerma Jaya', action: 'Memberi arahan tegas sambil menuding jari ke hadapan', dialogue: '“Pergi tangkap Mahsuri dan Deramang dan bawa kedua-duanya ke sini!”' },
          { character: 'Pandak Mayah', action: 'Melangkah ke hadapan pentas dan merayu dengan penuh cemas', dialogue: '“Kasihanilah Mahsuri, Datuk. Anaknya masih menyusu lagi!”' },
          { character: 'Mahsuri', action: 'Berdiri tenang menghadapi ujian sambil menadah tangan', dialogue: '“Tapi jika benar aku dianiaya, sesungguhnya aku haramkan darahku mengalir ke bumi ini.”' }
        ]
      }
    }
  },
  {
    id: 'anjing-dan-tulang',
    title: 'Anjing dan Tulang',
    tagline: 'Sikap tamak hanya akan merugikan diri sendiri.',
    moral: 'Bersyukurlah dengan rezeki yang ada dan elakkan sifat tamak.',
    image: anjingTulangImg,
    accentColor: '#EA580C',
    sampleLine: '“Wah, besarnya tulang di dalam air itu! Aku mesti dapatkannya juga!”',
    jedaSentence: {
      words: ['Ketika', 'menyeberangi', 'titian', 'kayu,', 'anjing', 'itu', 'ternampak', 'bayang-bayangnya', 'di', 'dalam', 'air.'],
      correctPauseIndices: [3],
      explanation: 'Berhenti sebentar selepas tanda koma pada “kayu,” membantu pendengar membayangkan suasana di atas jambatan.'
    },
    characters: ['Si Tompok (Anjing)', 'Pencerita', 'Bayang Air'],
    setting: 'Sebuah titian kayu kecil yang merentangi anak sungai yang jernih dan tenang.',
    paragraphs: [
      'Pada suatu tengah hari, seekor anjing yang bernama Si Tompok menemui seketul tulang yang besar dan enak. Dengan rasa gembira, dia menggonggong tulang itu erat-erat dan bercadang membawanya pulang ke rumah.',
      'Dalam perjalanan pulang, Si Tompok perlu menyeberangi sebuah titian kayu kecil di atas anak sungai yang sangat jernih. Air sungai itu berkilauan disinari cahaya matahari sehingga kelihatan seperti cermin.',
      'Ketika berada di tengah-tengah titian, Si Tompok terhenti lalu menjenguk ke bawah. Dia ternampak seekor anjing lain di dalam air yang turut menggonggong seketul tulang.',
      'Sebenarnya, imej tersebut hanyalah bayang-bayangnya sendiri. Namun, Si Tompok tidak menyedarinya dan menyangka tulang yang dibawa oleh anjing di dalam air itu jauh lebih besar daripada tulangnya.',
      'Timbul perasaan tamak di dalam hati Si Tompok. “Kalau aku dapat merampas tulang itu, tentu aku akan mempunyai dua ketul tulang yang besar!” bisiknya dalam hati dengan penuh rakus.',
      'Tanpa berfikir panjang, Si Tompok membuka mulutnya luas-luas untuk menyalak ke arah bayang-bayang tersebut. “Guk! Guk! Serahkan tulang itu kepadaku!”',
      'Malangnya, sebaik sahaja mulutnya terbuka, tulang yang digonggongnya terus terjatuh ke dalam sungai dan tenggelam ke dasar yang dalam. Bayang-bayang di dalam air itu juga hilang bersama kocakan air.',
      'Si Tompok terkebil-kebil melihat air sungai yang kembali tenang. Dia pulang dengan tangan kosong dan berasa amat menyesal. Kisah ini mengajar kita supaya bersyukur dan tidak bersikap tamak.'
    ],
    performanceDemos: {
      normal: {
        note: 'Bacaan berterus-terang mengikut urutan jalan cerita dengan nada yang sama.',
        lines: [
          'Seekor anjing menggonggong seketul tulang di atas jambatan kayu.',
          'Ia melihat bayang-bayangnya sendiri di dalam air yang jernih.',
          'Apabila ia menyalak, tulangnya jatuh ke dalam sungai.'
        ]
      },
      expressive: {
        note: 'Menunjukkan rasa teruja, sifat tamak yang membuak-buak, dan akhirnya nada kecewa yang ketara.',
        lines: [
          { text: '“Wah... sedapnya tulang ini!”', cue: 'Nada gembira dan bersemangat' },
          { text: '“Eh? Mengapa anjing di bawah sana ada tulang lebih besar?!”', cue: 'Nada hairan bertukar menjadi tamak' },
          { text: '“Oh tidak... tulangku sudah hilang!”', cue: 'Suara menurun perlahan dengan nada kesal' }
        ]
      },
      acting: {
        note: 'Lakonan komedi moral dengan aksi menggonggong, menunduk melihat cermin air dan reaksi terkejut.',
        scenes: [
          { character: 'Si Tompok', action: 'Berjalan megah di atas jambatan sambil mengangguk bangga', dialogue: '“Mmm! Tiada siapa ada tulang seenak ini!”' },
          { character: 'Si Tompok', action: 'Menunduk ke bawah pentas dan mengecilkan mata', dialogue: '“Grrr! Berikan tulang besar kamu itu kepada aku sekarang!”' },
          { character: 'Pencerita', action: 'Membuat bunyi kocakan air dengan tangan dan memandang penonton', dialogue: '“Splash! Dek sifat tamak, yang dikejar tak dapat, yang dikendong berciciran!”' }
        ]
      }
    }
  }
];
