import { ref } from 'vue'

const currentLocale = ref('en')

// Hydrate from localStorage if in browser environment
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    const saved = localStorage.getItem('showcase_lang')
    if (saved === 'hi' || saved === 'en') {
      currentLocale.value = saved
    }
  } catch (e) {
    // Graceful fallback
  }
}

export const translations = {
  en: {
    nav: {
      discover: 'Dashboard',
      genres: 'Genres',
      watchlist: 'Watchlist',
      searchPlaceholder: 'Search shows, actors, or genres...',
      selectGenre: 'Select Genre',
      browseGenre: 'Browse by Genre',
      topRated: 'Top-Rated'
    },
    hero: {
      spotlight: 'Featured Popular Show',
      details: 'View Details',
      addWatchlist: 'Add to Watchlist',
      inWatchlist: 'In Watchlist',
      rating: 'Rating',
      premiered: 'Premiered'
    },
    dashboard: {
      topRatedTitle: 'Top Rated TV Shows',
      genreShowsTitle: '{genre} Shows',
      viewAll: 'View All',
      emptyTitle: 'Failed to Load TV Shows',
      retry: 'Retry'
    },
    genreView: {
      back: 'Back to Dashboard',
      spotlight: 'Genre Spotlight',
      title: '{genre} TV Shows',
      topRatedTitle: 'Top Rated TV Shows',
      desc: 'Browse the highest-rated and most popular {genre} series curated from TVMaze.',
      topRatedDesc: 'Browse the highest-rated television masterpieces of all time curated from TVMaze.',
      switchGenre: 'Switch Genre:',
      sortBy: 'Sort By:',
      sortRating: 'Rating (Highest first)',
      sortPopularity: 'Popularity / Weight',
      sortYear: 'Release Year (Newest)',
      sortName: 'Title (A–Z)',
      showingCount: 'Showing {count} TV shows',
      loadMore: 'Load More {genre} Shows',
      loadingMore: 'Loading more {genre} shows...',
      loadedMoreToast: '✓ Loaded {count} more {genre} shows!',
      allLoaded: 'All available {genre} shows loaded from TVMaze catalog',
      empty: 'No shows currently loaded under "{genre}".',
      viewDrama: 'View Drama Shows',
      fetchNextPages: 'Search Next Pages for {genre} Shows',
      pageSubtextInitial: 'Showing {count} {genre} shows • Initial Page 0 catalog',
      pageSubtextLoaded: 'Showing {count} {genre} shows • +{extra} loaded across pages 1–{page}'
    },
    search: {
      title: 'Search TV Shows & People',
      subtitle: 'Find your favorite series, cast members, and genres across the TVMaze database',
      placeholder: 'Search shows, actors, or genres...',
      all: 'All',
      shows: 'Shows',
      people: 'Actors',
      genres: 'Genres',
      resultsFound: '{count} result found',
      noResults: 'No shows or actors match "{query}"',
      noResultsSub: 'Try searching with a different keyword or explore our curated genres.',
      viewGenre: 'View Genre Collection',
      searchFor: 'Search for "{query}"',
      recentSearches: 'Recent Searches',
      actorSpotlight: 'Actor Spotlight',
      starringActor: 'Shows starring {name}',
      actorBio: '{country} • Born {birthday}',
      actorShowsCount: '{count} TV shows starring {name}',
      searchTypeAll: 'All Categories',
      searchTypeShows: 'TV Shows',
      searchTypeActors: 'Actors',
      searchTypeGenres: 'Genres',
      placeholderShows: 'Search TV show titles (e.g. Breaking Bad)...',
      placeholderActors: 'Search actor or cast name (e.g. Bryan Cranston)...',
      placeholderGenres: 'Search genre (e.g. Drama, Action, Comedy)...',
      genreSpotlight: 'Genre Spotlight',
      exploreGenreBtn: 'View Full {genre} Collection',
      selectActorPrompt: 'Matching Actors:'
    },
    watchlist: {
      title: 'My Watchlist',
      subtitle: 'Your personal collection of saved shows to watch later',
      countPill: '{count} saved show | {count} saved shows',
      clearAll: 'Clear All',
      clearConfirm: 'Are you sure you want to clear your entire watchlist?',
      emptyTitle: 'Your watchlist is empty',
      emptyDesc: 'Browse popular shows and click the bookmark icon on any card to save it for later.',
      discoverBtn: 'Discover Popular Shows',
      removeBtn: 'Remove from Watchlist'
    },
    showDetail: {
      back: 'Back to Dashboard',
      inWatchlist: 'In Watchlist',
      addWatchlist: 'Add to Watchlist',
      rating: 'Rating',
      premiered: 'Premiered Date',
      status: 'Status',
      runtime: 'Runtime',
      schedule: 'Schedule',
      network: 'Network / Channel',
      language: 'Language',
      genres: 'Genres',
      synopsis: 'Overview',
      topCast: 'Top Cast',
      episodes: 'Episodes',
      episodesTotal: '({count} total)',
      seasonSelect: 'Season:',
      seasonOption: 'Season {season} ({count} eps)',
      season: 'Season',
      officialSite: 'Visit Official Site',
      tvmaze: 'View on TVMaze',
      imdb: 'IMDb',
      moreLikeThis: 'More Shows You Might Like',
      noSynopsis: 'No summary provided for this TV show.',
      notFound: 'Show Not Found'
    },
    dataSaver: {
      lite: 'LITE',
      hd: 'HD',
      lowResOn: '⚡ Low-Res Mode ON: Show images replaced with lightweight placeholders',
      highResOn: '🖼️ High-Res Mode ON: Original show images restored',
      disableTitle: 'Disable Data Saver (Load full images)',
      enableTitle: 'Enable Data Saver (Use low-res placeholders)',
      ariaActive: 'Data saver active. Click to load high-res images.',
      ariaInactive: 'Data saver inactive. Click to use low-res placeholders.',
      tooltipDisable: 'Turn off low-res mode',
      tooltipEnable: 'Replace images with placeholders'
    },
    footer: {
      tagline: 'Discover the world\'s most captivating television series and curated genres.',
      attribution: 'Powered by the free & open TVMaze API. Built for entertainment lovers.',
      allRights: 'ShowCase TV. All rights reserved.'
    },
    genres: {
      'Drama': 'Drama',
      'Action': 'Action',
      'Science-Fiction': 'Science-Fiction',
      'Comedy': 'Comedy',
      'Thriller': 'Thriller',
      'Crime': 'Crime',
      'Anime': 'Anime',
      'Adventure': 'Adventure',
      'Mystery': 'Mystery',
      'Romance': 'Romance',
      'Supernatural': 'Supernatural',
      'Horror': 'Horror',
      'Top-Rated': 'Top-Rated'
    }
  },
  hi: {
    nav: {
      discover: 'डैशबोर्ड',
      genres: 'शैलियां',
      watchlist: 'वॉचलिस्ट',
      searchPlaceholder: 'शो, कलाकार या शैली खोजें...',
      selectGenre: 'शैली चुनें',
      browseGenre: 'शैली अनुसार खोजें',
      topRated: 'टॉप रेटेड'
    },
    hero: {
      spotlight: 'विशेष लोकप्रिय शो',
      details: 'विवरण देखें',
      addWatchlist: 'वॉचलिस्ट में जोड़ें',
      inWatchlist: 'वॉचलिस्ट में शामिल',
      rating: 'रेटिंग',
      premiered: 'प्रसारण शुरू'
    },
    dashboard: {
      topRatedTitle: 'टॉप रेटेड टीवी शो',
      genreShowsTitle: '{genre} टीवी शो',
      viewAll: 'सभी देखें',
      emptyTitle: 'टीवी शो लोड करने में विफल',
      retry: 'पुनः प्रयास करें'
    },
    genreView: {
      back: 'डैशबोर्ड पर वापस जाएं',
      spotlight: 'शैली की झलक',
      title: '{genre} टीवी शो',
      topRatedTitle: 'टॉप रेटेड टीवी शो',
      desc: 'TVMaze से संकलित उच्चतम-रेटेड और सबसे लोकप्रिय {genre} धारावाहिक ब्राउज़ करें।',
      topRatedDesc: 'TVMaze से संकलित अब तक के सर्वश्रेष्ठ टीवी धारावाहिक ब्राउज़ करें।',
      switchGenre: 'शैली बदलें:',
      sortBy: 'क्रमबद्ध करें:',
      sortRating: 'रेटिंग (उच्चतम पहले)',
      sortPopularity: 'लोकप्रियता',
      sortYear: 'रिलीज़ वर्ष (नवीनतम)',
      sortName: 'शीर्षक (A–Z)',
      showingCount: '{count} टीवी शो दिखाए जा रहे हैं',
      loadMore: 'और {genre} शो लोड करें',
      loadingMore: 'और {genre} शो लोड हो रहे हैं...',
      loadedMoreToast: '✓ {count} और {genre} शो लोड किए गए!',
      allLoaded: 'TVMaze कैटलॉग से सभी उपलब्ध {genre} शो लोड हो चुके हैं',
      empty: 'वर्तमान में "{genre}" के तहत कोई शो नहीं मिला।',
      viewDrama: 'ड्रामा शो देखें',
      fetchNextPages: 'अगले पेजों में {genre} शो खोजें',
      pageSubtextInitial: '{count} {genre} शो दिखाए जा रहे हैं • प्रारंभिक पेज 0 कैटलॉग',
      pageSubtextLoaded: '{count} {genre} शो दिखाए जा रहे हैं • पेज 1–{page} से +{extra} नए शो'
    },
    search: {
      title: 'टीवी शो और कलाकार खोजें',
      subtitle: 'TVMaze डेटाबेस से अपने पसंदीदा धारावाहिक, कलाकार और शैलियां खोजें',
      placeholder: 'शो का नाम, अभिनेता या शैली टाइप करें...',
      all: 'सभी',
      shows: 'टीवी शो',
      people: 'कलाकार',
      genres: 'शैलियां',
      resultsFound: '{count} परिणाम मिले',
      noResults: '"{query}" के लिए कोई शो या कलाकार नहीं मिला',
      noResultsSub: 'कृपया किसी अन्य कीवर्ड से खोजें या हमारी चुनिंदा शैलियों को देखें।',
      viewGenre: 'शैली संग्रह देखें',
      searchFor: '"{query}" खोजें',
      recentSearches: 'हाल की खोजें',
      actorSpotlight: 'कलाकार की झलक',
      starringActor: '{name} द्वारा अभिनीत टीवी शो',
      actorBio: '{country} • जन्म {birthday}',
      actorShowsCount: '{name} द्वारा अभिनीत {count} टीवी शो',
      searchTypeAll: 'सभी श्रेणियां',
      searchTypeShows: 'टीवी शो',
      searchTypeActors: 'कलाकार',
      searchTypeGenres: 'शैलियां',
      placeholderShows: 'टीवी शो का नाम खोजें (जैसे Breaking Bad)...',
      placeholderActors: 'कलाकार का नाम खोजें (जैसे Bryan Cranston)...',
      placeholderGenres: 'शैली खोजें (जैसे ड्रामा, एक्शन, कॉमेडी)...',
      genreSpotlight: 'शैली की झलक',
      exploreGenreBtn: 'पूरा {genre} संग्रह देखें',
      selectActorPrompt: 'संबंधित कलाकार:'
    },
    watchlist: {
      title: 'मेरी वॉचलिस्ट',
      subtitle: 'बाद में देखने के लिए आपके द्वारा सहेजे गए टीवी शो',
      countPill: '{count} सहेजे गए शो',
      clearAll: 'सभी हटाएं',
      clearConfirm: 'क्या आप वाकई अपनी पूरी वॉचलिस्ट खाली करना चाहते हैं?',
      emptyTitle: 'आपकी वॉचलिस्ट खाली है',
      emptyDesc: 'लोकप्रिय शो ब्राउज़ करें और उन्हें बाद में देखने के लिए बुकमार्क आइकन पर क्लिक करें।',
      discoverBtn: 'लोकप्रिय शो खोजें',
      removeBtn: 'वॉचलिस्ट से हटाएं'
    },
    showDetail: {
      back: 'डैशबोर्ड पर वापस जाएं',
      inWatchlist: 'वॉचलिस्ट में शामिल',
      addWatchlist: 'वॉचलिस्ट में जोड़ें',
      rating: 'रेटिंग',
      premiered: 'प्रसारण तिथि',
      status: 'स्थिति',
      runtime: 'अवधि',
      schedule: 'प्रसारण समय',
      network: 'नेटवर्क / चैनल',
      language: 'भाषा',
      genres: 'शैलियां',
      synopsis: 'अवलोकन / सारांश',
      topCast: 'मुख्य कलाकार',
      episodes: 'एपिसोड',
      episodesTotal: '({count} कुल)',
      seasonSelect: 'सीज़न:',
      seasonOption: 'सीज़न {season} ({count} एपिसोड)',
      season: 'सीज़न',
      officialSite: 'आधिकारिक वेबसाइट पर जाएं',
      tvmaze: 'TVMaze पर देखें',
      imdb: 'आईएमडीबी (IMDb)',
      moreLikeThis: 'इस जैसे और शो',
      noSynopsis: 'इस टीवी शो के लिए कोई सारांश उपलब्ध नहीं है।',
      notFound: 'शो नहीं मिला'
    },
    dataSaver: {
      lite: 'लाइट',
      hd: 'एचडी',
      lowResOn: '⚡ डेटा सेवर चालू: पोस्टर छवियों को हल्के प्लेसहोल्डर्स से बदला गया',
      highResOn: '🖼️ हाई-रेज मोड चालू: मूल पोस्टर छवियां पुनर्स्थापित की गईं',
      disableTitle: 'डेटा सेवर बंद करें (पूरी छवियां लोड करें)',
      enableTitle: 'डेटा सेवर चालू करें (हल्के प्लेसहोल्डर्स का उपयोग करें)',
      ariaActive: 'डेटा सेवर सक्रिय है। उच्च-रिज़ॉल्यूशन छवियां लोड करने के लिए क्लिक करें।',
      ariaInactive: 'डेटा सेवर निष्क्रिय है। हल्के प्लेसहोल्डर्स का उपयोग करने के लिए क्लिक करें।',
      tooltipDisable: 'डेटा सेवर मोड बंद करें',
      tooltipEnable: 'छवियों को प्लेसहोल्डर्स से बदलें'
    },
    footer: {
      tagline: 'दुनिया के सबसे मनोरंजक टीवी धारावाहिकों और शैलियों को खोजें।',
      attribution: 'मुफ्त और खुले TVMaze API द्वारा संचालित। मनोरंजन प्रेमियों के लिए निर्मित।',
      allRights: 'ShowCase TV. सर्वाधिकार सुरक्षित।'
    },
    genres: {
      'Drama': 'ड्रामा',
      'Action': 'एक्शन',
      'Science-Fiction': 'साइंस-फिक्शन',
      'Comedy': 'कॉमेडी',
      'Thriller': 'थ्रिलर',
      'Crime': 'क्राइम',
      'Anime': 'एनिमे',
      'Adventure': 'एडवेंचर',
      'Mystery': 'मिस्ट्री',
      'Romance': 'रोमांस',
      'Supernatural': 'सुपरनैचुरल',
      'Horror': 'हॉरर',
      'Top-Rated': 'टॉप-रेटेड'
    }
  }
}

export function useI18n() {
  function setLocale(locale) {
    if (locale === 'hi' || locale === 'en') {
      currentLocale.value = locale
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          localStorage.setItem('showcase_lang', locale)
        } catch (e) {
          // Ignore localStorage error
        }
      }
    }
  }

  function toggleLocale() {
    const next = currentLocale.value === 'en' ? 'hi' : 'en'
    setLocale(next)
    return next
  }

  function t(path, params = {}) {
    const lang = currentLocale.value
    const keys = path.split('.')
    let current = translations[lang]

    for (const k of keys) {
      if (current && current[k] !== undefined) {
        current = current[k]
      } else {
        // Fallback to English if not found
        current = null
        break
      }
    }

    if (!current && lang !== 'en') {
      current = translations['en']
      for (const k of keys) {
        if (current && current[k] !== undefined) {
          current = current[k]
        } else {
          current = null
          break
        }
      }
    }

    if (typeof current !== 'string') {
      return path
    }

    // Replace {placeholder} with param value
    let result = current
    for (const [pKey, pVal] of Object.entries(params)) {
      result = result.replaceAll(`{${pKey}}`, String(pVal))
    }

    return result
  }

  function translateGenre(genreName) {
    if (!genreName) return ''
    const lang = currentLocale.value
    if (translations[lang]?.genres?.[genreName]) {
      return translations[lang].genres[genreName]
    }
    return genreName
  }

  return {
    currentLocale,
    setLocale,
    toggleLocale,
    t,
    translateGenre
  }
}
