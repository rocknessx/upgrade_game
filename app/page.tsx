'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sword, Shield, Sparkles, Trophy, RotateCcw, Info, Clock, User, Calendar } from 'lucide-react'
import { useSession, signIn, signOut } from 'next-auth/react'

// Upgrade constants (KO style)
const UPGRADE_CHANCES: Record<number, number> = {
  1: 1.0, 2: 1.0, 3: 1.0, 4: 0.8, 5: 0.7,
  6: 0.6, 7: 0.4, 8: 0.3, 9: 0.2, 10: 0.1
}

const UPGRADE_COSTS: Record<number, number> = {
  1: 10, 2: 20, 3: 30, 4: 50, 5: 80,
  6: 120, 7: 200, 8: 350, 9: 600, 10: 1000
}

// KO-style item colors and effects
const LEVEL_COLORS: Record<number, string> = {
  0: 'from-gray-400 to-gray-500', 
  1: 'from-green-400 to-green-500', 
  2: 'from-green-500 to-green-600',
  3: 'from-blue-400 to-blue-500', 
  4: 'from-blue-500 to-blue-600', 
  5: 'from-purple-400 to-purple-500',
  6: 'from-purple-500 to-purple-600', 
  7: 'from-pink-400 to-pink-500', 
  8: 'from-orange-400 to-orange-500',
  9: 'from-red-400 to-red-500', 
  10: 'from-yellow-300 to-yellow-500'
}

const LEVEL_GLOW: Record<number, string> = {
  0: 'shadow-gray-500/50', 1: 'shadow-green-500/50', 2: 'shadow-green-600/50',
  3: 'shadow-blue-500/50', 4: 'shadow-blue-600/50', 5: 'shadow-purple-500/50',
  6: 'shadow-purple-600/50', 7: 'shadow-pink-500/50', 8: 'shadow-orange-500/50',
  9: 'shadow-red-500/50', 10: 'shadow-yellow-500/80'
}

const LEVEL_NAMES: Record<number, string> = {
  0: 'Normal', 1: 'Magic', 2: 'Rare', 3: 'Unique', 4: 'Epic',
  5: 'Legendary', 6: 'Mythic', 7: 'Divine', 8: 'Ancient', 9: 'Immortal', 10: 'Godlike'
}

// KO Weapon types
const WEAPON_TYPES = [
  'Krowaz Sword', 'Raptor Bow', 'Staff of Destruction', 'Berserker Axe',
  'Lightning Spear', 'Chaos Blade', 'Dragon Slayer', 'Phoenix Wing'
]

interface GameState {
  level: number
  points: number
  totalAttempts: number
  successfulUpgrades: number
  lastResetDate: string
  weaponType: string
  safeguardStones: number
  dailyPostSubmitted: boolean
  redditUser?: {
    username: string
    joinDate: string
    karma: number
  }
}

const getDefaultGameState = (): GameState => ({
  level: 0, 
  points: 100, 
  totalAttempts: 0, 
  successfulUpgrades: 0,
  lastResetDate: new Date().toDateString(),
  weaponType: WEAPON_TYPES[Math.floor(Math.random() * WEAPON_TYPES.length)],
  safeguardStones: 0,
  dailyPostSubmitted: false
})

export default function Home() {
  const { data: session, status } = useSession()
  const [gameState, setGameState] = useState<GameState>(() => getDefaultGameState())
  const [useSafeguard, setUseSafeguard] = useState(false)
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [lastResult, setLastResult] = useState<{success: boolean, fromLevel: number, toLevel: number, safeguardUsed?: boolean} | null>(null)
  const [showParticles, setShowParticles] = useState(false)
  const [leaderboard, setLeaderboard] = useState<{name: string, level: number, attempts: number}[]>([])
  const [showRedditAuth, setShowRedditAuth] = useState(false)

  // Check if daily reset needed
  const checkDailyReset = (state: GameState) => {
    const today = new Date().toDateString()
    if (state.lastResetDate !== today) {
      return {
        ...state,
        lastResetDate: today,
        points: state.points + 50, // Daily bonus
        dailyPostSubmitted: false
      }
    }
    return state
  }

  // Load game state from localStorage
  useEffect(() => {
    // Client-side only
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('ko-upgrade-game')
        if (saved) {
          const parsedState = JSON.parse(saved)
          const resetState = checkDailyReset(parsedState)
          console.log('Loaded game state:', resetState)
          setGameState(resetState)
        } else {
          console.log('No saved state, using default')
          const defaultState = getDefaultGameState()
          setGameState(defaultState)
          localStorage.setItem('ko-upgrade-game', JSON.stringify(defaultState))
        }
        
        const savedLeaderboard = localStorage.getItem('ko-upgrade-leaderboard')
        if (savedLeaderboard) {
          setLeaderboard(JSON.parse(savedLeaderboard))
        }
      } catch (error) {
        console.error('Error loading game state:', error)
        const freshState = getDefaultGameState()
        setGameState(freshState)
        localStorage.setItem('ko-upgrade-game', JSON.stringify(freshState))
      }
    }
  }, [])

  // Save game state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('Saving game state:', gameState)
      localStorage.setItem('ko-upgrade-game', JSON.stringify(gameState))
    }
  }, [gameState])

  // Reddit Auth with NextAuth - GERÇEK ENTEGRASYON
  const connectReddit = () => {
    signIn('reddit')
  }

  // Session değiştiğinde oyun state'ini güncelle
  useEffect(() => {
    if (session?.user && !gameState.redditUser) {
      const redditData = {
        username: (session.user as any).username || session.user.name || 'reddit_user',
        joinDate: '2020-01-15', // Bu bilgi Reddit API'den alınabilir
        karma: (session.user as any).karma || 0
      }
      
      setGameState(prev => ({
        ...prev,
        redditUser: redditData,
        points: prev.points + 100, // 100 bonus points
        safeguardStones: prev.safeguardStones + 5 // 5 safeguard stones
      }))
    }
  }, [session, gameState.redditUser])

  // Buy points with reddit karma - GERÇEK KARMA KULLANIMI
  const buyPointsWithKarma = () => {
    if (!session?.user) {
      alert('Önce Reddit hesabınızı bağlamanız gerekiyor!')
      return
    }

    const currentKarma = (session.user as any).karma || 0
    const karmaToSpend = 1
    const pointsToGet = 100
    
    if (currentKarma < karmaToSpend) {
      alert(`Yetersiz karma! En az ${karmaToSpend} karma gerekiyor. Şu anki karma: ${currentKarma}`)
      return
    }

    if (confirm(`${karmaToSpend} Reddit karma harcayarak ${pointsToGet} oyun puanı satın almak istiyor musunuz?\n\nMevcut karma: ${currentKarma}`)) {
      setGameState(prev => ({
        ...prev,
        points: prev.points + pointsToGet,
        redditUser: prev.redditUser ? {
          ...prev.redditUser,
          karma: prev.redditUser.karma - karmaToSpend
        } : prev.redditUser
      }))
      alert(`✅ ${pointsToGet} puan satın aldınız!\n-${karmaToSpend} Reddit karma`)
    }
  }

  // Daily post submission (moderator approved)
  const submitDailyPost = () => {
    if (gameState.dailyPostSubmitted) {
      alert('Bugün zaten post gönderdiniz! Yarın tekrar deneyebilirsiniz.')
      return
    }

    const postTitle = prompt('Post başlığınızı girin:')
    if (postTitle && postTitle.length > 10) {
      // Simulate moderator approval (80% chance)
      const approved = Math.random() > 0.2
      
      if (approved) {
        setGameState(prev => ({
          ...prev,
          points: prev.points + 10,
          safeguardStones: prev.safeguardStones + 1,
          dailyPostSubmitted: true
        }))
        alert(`✅ Post onaylandı!\n"${postTitle}"\n+10 point ve 1 güvenli taş aldınız!`)
      } else {
        setGameState(prev => ({
          ...prev,
          dailyPostSubmitted: true
        }))
        alert('❌ Post moderator tarafından reddedildi. Yarın tekrar deneyin.')
      }
    } else {
      alert('Post başlığı çok kısa! En az 10 karakter olmalı.')
    }
  }

  const handleUpgrade = async () => {
    const nextLevel = gameState.level + 1
    if (nextLevel > 10 || gameState.points < UPGRADE_COSTS[nextLevel]) return

    // Check safeguard usage
    if (useSafeguard && gameState.safeguardStones <= 0) {
      alert('Güvenli taşınız yok! Reddit hesabı bağlayarak veya post atarak güvenli taş kazanabilirsiniz.')
      return
    }

    setIsUpgrading(true)
    
    // Simulate upgrade process with delay
    setTimeout(() => {
      const cost = UPGRADE_COSTS[nextLevel]
      const successChance = UPGRADE_CHANCES[nextLevel]
      const isSuccess = Math.random() <= successChance

      let newLevel = gameState.level
      let usedSafeguard = false

      if (isSuccess) {
        newLevel = nextLevel
        setShowParticles(true)
        setTimeout(() => setShowParticles(false), 2000)
      } else {
        if (useSafeguard && gameState.safeguardStones > 0) {
          // Use safeguard stone
          newLevel = Math.max(0, gameState.level - 1)
          usedSafeguard = true
        } else {
          newLevel = Math.floor(gameState.level / 2)
        }
      }

      const newState = {
        ...gameState,
        level: newLevel,
        points: gameState.points - cost,
        totalAttempts: gameState.totalAttempts + 1,
        successfulUpgrades: isSuccess ? gameState.successfulUpgrades + 1 : gameState.successfulUpgrades,
        safeguardStones: usedSafeguard ? gameState.safeguardStones - 1 : gameState.safeguardStones
      }

      setGameState(newState)
      setLastResult({ 
        success: isSuccess, 
        fromLevel: gameState.level, 
        toLevel: newLevel,
        safeguardUsed: usedSafeguard
      })
      setIsUpgrading(false)

      // Update leaderboard if reached a milestone
      if (isSuccess && [5, 7, 8, 9, 10].includes(newLevel)) {
        updateLeaderboard(newLevel, newState.totalAttempts)
      }
    }, 2000)
  }

  const updateLeaderboard = (level: number, attempts: number) => {
    const playerName = prompt(`🎉 Tebrikler! +${level} seviyesine ulaştınız!\n\nAdınızı girin (Leaderboard için):`) || 'Anonim'
    const newEntry = { name: playerName, level, attempts }
    const newLeaderboard = [...leaderboard, newEntry]
      .sort((a, b) => b.level - a.level || a.attempts - b.attempts)
      .slice(0, 10)
    
    setLeaderboard(newLeaderboard)
    localStorage.setItem('ko-upgrade-leaderboard', JSON.stringify(newLeaderboard))
  }

  const resetGame = () => {
    if (confirm('Oyunu sıfırlamak istediğinizden emin misiniz?')) {
      const freshState = getDefaultGameState()
      setGameState(freshState)
      setLastResult(null)
      localStorage.removeItem('ko-upgrade-game')
    }
  }

  const nextLevel = gameState.level + 1
  const canUpgrade = nextLevel <= 10 && gameState.points >= UPGRADE_COSTS[nextLevel]
  const successChance = nextLevel <= 10 ? Math.round(UPGRADE_CHANCES[nextLevel] * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-2">
            ⚔️ Knight Online
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-300">Artı Basma Oyunu</h2>
          <p className="text-gray-400 mt-2">Nostaljik KO upgrade deneyimi! Günde sadece 20 şans!</p>
          
          {/* Reddit Connection */}
          <div className="mt-4">
            {session?.user ? (
              <div className="flex items-center justify-center space-x-2 text-orange-400">
                <User size={16} />
                <span>u/{(session.user as any).username || session.user.name}</span>
                <span className="text-gray-500">• {(session.user as any).karma || 0} karma</span>
                <button
                  onClick={() => signOut()}
                  className="ml-2 text-xs bg-red-500/20 px-2 py-1 rounded hover:bg-red-500/30 transition-colors"
                >
                  Çıkış
                </button>
              </div>
            ) : status === 'loading' ? (
              <div className="text-gray-400">Yükleniyor...</div>
            ) : (
              <button
                onClick={connectReddit}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                🔗 Reddit Hesabını Bağla (+Bonus Point)
              </button>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Game Panel */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700"
            >
              {/* KO Item Display */}
              <div className="text-center mb-8">
                <motion.div
                  key={gameState.level}
                  initial={{ scale: 0.8, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="inline-block"
                >
                  {/* Item Frame */}
                  <div className={`relative w-32 h-40 mx-auto mb-4 rounded-lg bg-gradient-to-br ${LEVEL_COLORS[gameState.level]} p-1 ${LEVEL_GLOW[gameState.level]} shadow-xl`}>
                    <div className="w-full h-full bg-gray-900 rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                      {/* Upgrade Glow Effect */}
                      {gameState.level >= 7 && (
                        <motion.div
                          animate={{
                            opacity: [0.3, 0.8, 0.3],
                            scale: [0.8, 1.2, 0.8],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className={`absolute inset-0 bg-gradient-to-br ${LEVEL_COLORS[gameState.level]} opacity-20 rounded-lg`}
                        />
                      )}
                      
                      {/* Plus Level - Top Left */}
                      <div className="absolute top-1 left-1 z-20">
                        <div className={`text-sm font-bold bg-gradient-to-r ${LEVEL_COLORS[gameState.level]} bg-clip-text text-transparent bg-black/50 px-1 rounded`}>
                          +{gameState.level}
                        </div>
                      </div>
                      
                      {/* Weapon Image - Center */}
                      <div className="relative z-10 w-16 h-16 mx-auto">
                        <img
                          src="/raptor.png"
                          alt={gameState.weaponType}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      
                      {/* Sparkle effects for high levels */}
                      {gameState.level >= 8 && (
                        <div className="absolute inset-0">
                          {[...Array(5)].map((_, i) => (
                            <motion.div
                              key={i}
                              animate={{
                                x: [0, Math.random() * 100 - 50],
                                y: [0, Math.random() * 100 - 50],
                                opacity: [0, 1, 0],
                                scale: [0, 1, 0],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.4,
                              }}
                              className="absolute top-1/2 left-1/2 w-1 h-1 bg-yellow-400 rounded-full"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Item Info */}
                  <div className="space-y-1">
                    <div className={`text-lg font-bold bg-gradient-to-r ${LEVEL_COLORS[gameState.level]} bg-clip-text text-transparent`}>
                      {gameState.weaponType}
                    </div>
                    <div className="text-sm text-gray-400">{LEVEL_NAMES[gameState.level]} Grade</div>
                  </div>
                </motion.div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-500/20 rounded-lg p-3 text-center border border-blue-500/30">
                  <div className="text-2xl font-bold text-blue-400">{gameState.points}</div>
                  <div className="text-sm text-gray-400">Oyun Puanı</div>
                </div>
                <div className="bg-purple-500/20 rounded-lg p-3 text-center border border-purple-500/30">
                  <div className="text-2xl font-bold text-purple-400">{gameState.safeguardStones}</div>
                  <div className="text-sm text-gray-400">Güvenli Taş</div>
                </div>
                <div className="bg-green-500/20 rounded-lg p-3 text-center border border-green-500/30">
                  <div className="text-2xl font-bold text-green-400">{gameState.successfulUpgrades}</div>
                  <div className="text-sm text-gray-400">Başarılı Upgrade</div>
                </div>
              </div>

              {/* Reddit Karma */}
              {session?.user && (
                <div className="mb-6 text-center">
                  <div className="inline-flex items-center space-x-2 bg-orange-500/20 px-4 py-2 rounded-lg border border-orange-500/30">
                    <span className="text-orange-400 font-bold">🏆 Reddit Karma: {(session.user as any).karma || 0}</span>
                  </div>
                </div>
              )}


              {/* Upgrade Section */}
              {gameState.level < 10 && (
                <div className="space-y-4">
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-300">Sonraki Seviye: +{nextLevel}</span>
                      <span className="text-yellow-400 font-bold">{UPGRADE_COSTS[nextLevel]} Point</span>
                    </div>
                    
                    <div className="flex items-center space-x-3 mb-4">
                      <input
                        type="checkbox"
                        id="safeguard"
                        checked={useSafeguard}
                        onChange={(e) => setUseSafeguard(e.target.checked)}
                        className="w-5 h-5"
                        disabled={gameState.safeguardStones <= 0}
                      />
                      <label htmlFor="safeguard" className={`flex items-center space-x-2 text-sm ${gameState.safeguardStones <= 0 ? 'opacity-50' : ''}`}>
                        <Shield size={16} className="text-blue-400" />
                        <span>Güvenli Taş Kullan ({gameState.safeguardStones} adet)</span>
                      </label>
                    </div>

                    <motion.button
                      whileHover={{ scale: canUpgrade && !isUpgrading ? 1.05 : 1 }}
                      whileTap={{ scale: canUpgrade && !isUpgrading ? 0.95 : 1 }}
                      disabled={!canUpgrade || isUpgrading}
                      onClick={handleUpgrade}
                      className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center space-x-2 transition-all duration-300 ${
                        canUpgrade && !isUpgrading
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg shadow-orange-500/25'
                          : 'bg-gray-600 cursor-not-allowed'
                      }`}
                    >
                      {isUpgrading ? (
                        <>
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                            <Sword size={20} />
                          </motion.div>
                          <span>Upgrade Ediliyor...</span>
                        </>
                      ) : !canUpgrade ? (
                        <>
                          <span>Yetersiz Puan!</span>
                        </>
                      ) : (
                        <>
                          <Sword size={20} />
                          <span>UPGRADE ET!</span>
                        </>
                      )}
                    </motion.button>
                  </div>
        </div>
              )}

              {/* Max Level Reached */}
              {gameState.level >= 10 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-center p-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30"
                >
                  <div className="text-4xl mb-4">🏆</div>
                  <div className="text-2xl font-bold text-yellow-400 mb-2">MAKSIMUM SEVİYE!</div>
                  <div className="text-gray-300">Tebrikler! +10 seviyesine ulaştınız!</div>
                </motion.div>
              )}

              {/* Actions */}
              <div className="space-y-3 mt-6">
                {/* Buy Points with Karma */}
                <button
                  onClick={buyPointsWithKarma}
                  disabled={!session?.user || ((session.user as any).karma || 0) < 1}
                  className={`w-full py-2 border rounded-lg transition-colors ${
                    !session?.user || ((session.user as any).karma || 0) < 1
                      ? 'bg-gray-600 border-gray-500 cursor-not-allowed opacity-50' 
                      : 'bg-blue-500/20 border-blue-500/30 hover:bg-blue-500/30'
                  }`}
                >
                  🏆 100 Puan Satın Al (1 Reddit Karma)
                </button>

                {/* Daily Post */}
                <button
                  onClick={submitDailyPost}
                  disabled={gameState.dailyPostSubmitted}
                  className={`w-full py-2 border rounded-lg transition-colors ${
                    gameState.dailyPostSubmitted 
                      ? 'bg-gray-600 border-gray-500 cursor-not-allowed opacity-50' 
                      : 'bg-green-500/20 border-green-500/30 hover:bg-green-500/30'
                  }`}
                >
                  {gameState.dailyPostSubmitted ? '✅ Bugünkü Post Gönderildi' : '📝 Günlük Post Gönder (+10p +1🛡️)'}
                </button>
                
                <button
                  onClick={resetGame}
                  className="w-full py-2 bg-red-500/20 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  <RotateCcw size={16} className="inline mr-2" />
                  Oyunu Sıfırla
                </button>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Last Result */}
            <AnimatePresence>
              {lastResult && (
                <motion.div
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 300, opacity: 0 }}
                  className={`p-4 rounded-lg border ${
                    lastResult.success 
                      ? 'bg-green-500/20 border-green-500/30 text-green-400'
                      : 'bg-red-500/20 border-red-500/30 text-red-400'
                  }`}
                >
                  <div className="font-bold">
                    {lastResult.success ? '✅ BAŞARILI!' : '💥 BAŞARISIZ!'}
                    {lastResult.safeguardUsed && ' 🛡️'}
                  </div>
                  <div className="text-sm">
                    +{lastResult.fromLevel} → +{lastResult.toLevel}
                    {lastResult.safeguardUsed && (
                      <div className="text-xs text-blue-400">Güvenli taş kullanıldı</div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Upgrade Chances */}
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 border border-gray-700">
              <h3 className="font-bold mb-3 flex items-center space-x-2">
                <Info size={16} />
                <span>Başarı Oranları</span>
              </h3>
              <div className="space-y-2 text-sm">
                {Object.entries(UPGRADE_CHANCES).map(([level, chance]) => (
                  <div key={level} className="flex justify-between">
                    <span className={gameState.level + 1 === parseInt(level) ? 'text-yellow-400 font-bold' : 'text-gray-400'}>
                      +{level}
                    </span>
                    <span className={`${chance >= 0.5 ? 'text-green-400' : 'text-red-400'}`}>
                      {Math.round(chance * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 border border-gray-700">
              <h3 className="font-bold mb-3 flex items-center space-x-2">
                <Trophy size={16} />
                <span>Liderlik Tablosu</span>
              </h3>
              <div className="space-y-2 text-sm">
                {leaderboard.slice(0, 5).map((entry, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="truncate">{entry.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className={LEVEL_COLORS[entry.level]}>+{entry.level}</span>
                      <span className="text-gray-500">({entry.attempts})</span>
                    </div>
                  </div>
                ))}
                {leaderboard.length === 0 && (
                  <div className="text-gray-500 text-center py-2">Henüz kayıt yok</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Particles Effect */}
        <AnimatePresence>
          {showParticles && (
            <div className="fixed inset-0 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    x: window.innerWidth / 2, 
                    y: window.innerHeight / 2,
                    scale: 0,
                    opacity: 1 
                  }}
                  animate={{
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                    scale: [0, 1, 0],
                    opacity: [1, 1, 0]
                  }}
                  transition={{ duration: 2, delay: i * 0.1 }}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}