// Knight Online Upgrade System Constants

export const UPGRADE_CHANCES: Record<number, number> = {
  1: 1.0,    // %100
  2: 1.0,    // %100  
  3: 1.0,    // %100
  4: 0.8,    // %80
  5: 0.7,    // %70
  6: 0.6,    // %60
  7: 0.4,    // %40
  8: 0.3,    // %30
  9: 0.2,    // %20
  10: 0.1    // %10
}

export const UPGRADE_COSTS: Record<number, number> = {
  1: 10, 2: 20, 3: 30, 4: 50, 5: 80,
  6: 120, 7: 200, 8: 350, 9: 600, 10: 1000
}

// Point kazanma sistemi
export const POINTS = {
  UPVOTE_RECEIVED: 5,
  POST_CREATED: 2,
  COMMENT_CREATED: 1,
}

// Upgrade level renkleri (Tailwind sınıfları)
export const UPGRADE_COLORS: Record<number, string> = {
  0: 'text-gray-400',
  1: 'text-green-500',
  2: 'text-green-600',
  3: 'text-blue-500',
  4: 'text-blue-600',
  5: 'text-purple-500',
  6: 'text-purple-600',
  7: 'text-pink-500',
  8: 'text-orange-500',
  9: 'text-red-500',
  10: 'text-yellow-500 animate-pulse', // Özel efekt
}

export const UPGRADE_NAMES: Record<number, string> = {
  0: 'Yeni Savaşçı',
  1: 'Acemi',
  2: 'Çırak',
  3: 'Savaşçı',
  4: 'Usta',
  5: 'Uzman',
  6: 'Elit',
  7: 'Kahraman',
  8: 'Efsane',
  9: 'Destansı',
  10: 'İmmortal'
}
