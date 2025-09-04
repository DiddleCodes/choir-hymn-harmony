export interface Song {
  id: string;
  title: string;
  author?: string;
  composer?: string;
  category: 'traditional' | 'contemporary' | 'seasonal' | 'psalms';
  lyrics: string[];
  verses: number;
  year?: number;
  tags: string[];
}

export const songs: Song[] = [
  {
    id: '1',
    title: 'Amazing Grace',
    author: 'John Newton',
    composer: 'William Walker',
    category: 'traditional',
    year: 1779,
    verses: 6,
    tags: ['grace', 'redemption', 'classic'],
    lyrics: [
      'Amazing grace! How sweet the sound\nThat saved a wretch like me!\nI once was lost, but now am found;\nWas blind, but now I see.',
      '\'Twas grace that taught my heart to fear,\nAnd grace my fears relieved;\nHow precious did that grace appear\nThe hour I first believed.',
      'Through many dangers, toils and snares,\nI have already come;\n\'Tis grace hath brought me safe thus far,\nAnd grace will lead me home.',
      'The Lord has promised good to me,\nHis Word my hope secures;\nHe will my Shield and Portion be,\nAs long as life endures.',
      'Yea, when this flesh and heart shall fail,\nAnd mortal life shall cease,\nI shall possess, within the veil,\nA life of joy and peace.',
      'When we\'ve been there ten thousand years,\nBright shining as the sun,\nWe\'ve no less days to sing God\'s praise\nThan when we\'d first begun.'
    ]
  },
  {
    id: '2',
    title: 'How Great Thou Art',
    author: 'Carl Boberg',
    composer: 'Swedish Folk Melody',
    category: 'traditional',
    year: 1885,
    verses: 4,
    tags: ['praise', 'creation', 'worship'],
    lyrics: [
      'O Lord my God, when I in awesome wonder\nConsider all the worlds Thy hands have made,\nI see the stars, I hear the rolling thunder,\nThy power throughout the universe displayed!',
      'Then sings my soul, my Savior God, to Thee:\nHow great Thou art! How great Thou art!\nThen sings my soul, my Savior God, to Thee:\nHow great Thou art! How great Thou art!',
      'When through the woods and forest glades I wander\nAnd hear the birds sing sweetly in the trees,\nWhen I look down from lofty mountain grandeur\nAnd hear the brook and feel the gentle breeze:',
      'And when I think that God, His Son not sparing,\nSent Him to die, I scarce can take it in;\nThat on the cross, my burden gladly bearing,\nHe bled and died to take away my sin:'
    ]
  },
  {
    id: '3',
    title: 'Be Thou My Vision',
    author: 'Ancient Irish',
    composer: 'Irish Melody',
    category: 'traditional',
    year: 700,
    verses: 5,
    tags: ['prayer', 'devotion', 'irish', 'ancient'],
    lyrics: [
      'Be Thou my vision, O Lord of my heart;\nNaught be all else to me, save that Thou art.\nThou my best thought, by day or by night,\nWaking or sleeping, Thy presence my light.',
      'Be Thou my wisdom, and Thou my true word;\nI ever with Thee and Thou with me, Lord;\nThou my great Father; I Thy true son,\nThou in me dwelling, and I with Thee one.',
      'Riches I heed not, nor man\'s empty praise,\nThou mine inheritance, now and always:\nThou and Thou only, first in my heart,\nHigh King of Heaven, my treasure Thou art.',
      'High King of Heaven, my victory won,\nMay I reach Heaven\'s joys, O bright Heav\'n\'s Sun!\nHeart of my own heart, whatever befall,\nStill be my vision, O Ruler of all.'
    ]
  },
  {
    id: '4',
    title: 'Holy, Holy, Holy',
    author: 'Reginald Heber',
    composer: 'John B. Dykes',
    category: 'traditional',
    year: 1826,
    verses: 4,
    tags: ['trinity', 'worship', 'holy'],
    lyrics: [
      'Holy, holy, holy! Lord God Almighty!\nEarly in the morning our song shall rise to Thee;\nHoly, holy, holy, merciful and mighty!\nGod in three Persons, blessed Trinity!',
      'Holy, holy, holy! All the saints adore Thee,\nCasting down their golden crowns around the glassy sea;\nCherubim and seraphim falling down before Thee,\nWhich wert, and art, and evermore shall be.',
      'Holy, holy, holy! though the darkness hide Thee,\nThough the eye of sinful man Thy glory may not see;\nOnly Thou art holy; there is none beside Thee,\nPerfect in power, in love, and purity.',
      'Holy, holy, holy! Lord God Almighty!\nAll Thy works shall praise Thy Name, in earth, and sky, and sea;\nHoly, holy, holy; merciful and mighty!\nGod in three Persons, blessed Trinity!'
    ]
  },
  {
    id: '5',
    title: 'O Come, O Come Emmanuel',
    author: 'Latin Hymn',
    composer: 'Plainsong',
    category: 'seasonal',
    year: 800,
    verses: 7,
    tags: ['advent', 'christmas', 'anticipation', 'ancient'],
    lyrics: [
      'O come, O come, Emmanuel,\nAnd ransom captive Israel,\nThat mourns in lonely exile here\nUntil the Son of God appear.',
      'Rejoice! Rejoice! Emmanuel\nShall come to thee, O Israel!',
      'O come, Thou Rod of Jesse, free\nThine own from Satan\'s tyranny;\nFrom depths of hell Thy people save,\nAnd give them victory over the grave.',
      'O come, Thou Day-spring, come and cheer\nOur spirits by Thine advent here;\nDisperse the gloomy clouds of night,\nAnd death\'s dark shadows put to flight.'
    ]
  },
  {
    id: '6',
    title: 'Blessed Assurance',
    author: 'Fanny Crosby',
    composer: 'Phoebe Knapp',
    category: 'traditional',
    year: 1873,
    verses: 3,
    tags: ['assurance', 'faith', 'testimony'],
    lyrics: [
      'Blessed assurance, Jesus is mine!\nO what a foretaste of glory divine!\nHeir of salvation, purchase of God,\nBorn of His Spirit, washed in His blood.',
      'This is my story, this is my song,\nPraising my Savior all the day long;\nThis is my story, this is my song,\nPraising my Savior all the day long.',
      'Perfect submission, perfect delight,\nVisions of rapture now burst on my sight;\nAngels descending bring from above\nEchoes of mercy, whispers of love.',
      'Perfect submission, all is at rest;\nI in my Savior am happy and blest,\nWatching and waiting, looking above,\nFilled with His goodness, lost in His love.'
    ]
  }
];

export const categories = [
  { id: 'all', name: 'All Songs', count: songs.length },
  { id: 'traditional', name: 'Traditional Hymns', count: songs.filter(s => s.category === 'traditional').length },
  { id: 'contemporary', name: 'Contemporary', count: songs.filter(s => s.category === 'contemporary').length },
  { id: 'seasonal', name: 'Seasonal', count: songs.filter(s => s.category === 'seasonal').length },
  { id: 'psalms', name: 'Psalms', count: songs.filter(s => s.category === 'psalms').length }
];