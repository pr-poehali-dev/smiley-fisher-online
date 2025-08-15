import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';


// Types
interface User {
  id: string;
  nickname: string;
  level: number;
  totalFish: number;
  coins: number;
  achievements: string[];
  isOnline: boolean;
  currentLocation: string;
  avatar: string;
}

interface Fish {
  id: string;
  name: string;
  emoji: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  value: number;
  location: string;
  size: number;
}

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  time: string;
  type: 'user' | 'system' | 'rare_catch';
}

interface Tournament {
  id: string;
  name: string;
  description: string;
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  participants: number;
  prize: number;
}

interface Location {
  id: string;
  name: string;
  emoji: string;
  description: string;
  fishTypes: string[];
  difficulty: number;
  unlockLevel: number;
}

const SmileyFisherOnline = () => {
  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({ nickname: '', password: '' });

  // Game State
  const [currentSection, setCurrentSection] = useState('world');
  const [gameState, setGameState] = useState<'waiting' | 'fishing' | 'caught'>('waiting');
  const [fishingProgress, setFishingProgress] = useState(0);
  const [castPower, setCastPower] = useState([50]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [caughtFish, setCaughtFish] = useState<Fish[]>([]);

  // Multiplayer State
  const [onlinePlayers, setOnlinePlayers] = useState<User[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeTournament, setActiveTournament] = useState<Tournament | null>(null);
  const [leaderboard, setLeaderboard] = useState<User[]>([]);

  // Game Data
  const locations: Location[] = [
    {
      id: 'lake',
      name: 'Мирное Озеро',
      emoji: '🏞️',
      description: 'Спокойные воды для начинающих рыбаков',
      fishTypes: ['Веселый Окунь', 'Смеющийся Карп', 'Игривая Плотва'],
      difficulty: 1,
      unlockLevel: 1
    },
    {
      id: 'river',
      name: 'Быстрая Река',
      emoji: '🏔️',
      description: 'Горная река с сильным течением',
      fishTypes: ['Прыгучий Лосось', 'Танцующий Хариус', 'Веселая Форель'],
      difficulty: 2,
      unlockLevel: 5
    },
    {
      id: 'ocean',
      name: 'Открытый Океан',
      emoji: '🌊',
      description: 'Бескрайние водные просторы',
      fishTypes: ['Улыбчивый Тунец', 'Счастливая Скумбрия', 'Хихикающая Акула'],
      difficulty: 3,
      unlockLevel: 10
    },
    {
      id: 'arctic',
      name: 'Арктические Воды',
      emoji: '🧊',
      description: 'Ледяные воды с редкими видами',
      fishTypes: ['Морозный Палтус', 'Ледяной Треска', 'Северный Нарвал'],
      difficulty: 4,
      unlockLevel: 15
    }
  ];

  const fishDatabase = {
    'Веселый Окунь': { emoji: '🐟', rarity: 'common' as const, baseValue: 15 },
    'Смеющийся Карп': { emoji: '🐠', rarity: 'common' as const, baseValue: 20 },
    'Игривая Плотва': { emoji: '🐡', rarity: 'common' as const, baseValue: 18 },
    'Прыгучий Лосось': { emoji: '🍣', rarity: 'rare' as const, baseValue: 45 },
    'Танцующий Хариус': { emoji: '🐟', rarity: 'rare' as const, baseValue: 40 },
    'Веселая Форель': { emoji: '🐠', rarity: 'rare' as const, baseValue: 50 },
    'Улыбчивый Тунец': { emoji: '🦈', rarity: 'epic' as const, baseValue: 85 },
    'Счастливая Скумбрия': { emoji: '🐟', rarity: 'epic' as const, baseValue: 80 },
    'Хихикающая Акула': { emoji: '🦈', rarity: 'legendary' as const, baseValue: 150 },
    'Морозный Палтус': { emoji: '🐟', rarity: 'epic' as const, baseValue: 90 },
    'Ледяной Треска': { emoji: '🐠', rarity: 'rare' as const, baseValue: 55 },
    'Северный Нарвал': { emoji: '🐋', rarity: 'legendary' as const, baseValue: 200 }
  };

  const rarityColors = {
    common: 'bg-gray-100 text-gray-800',
    rare: 'bg-blue-100 text-blue-800',
    epic: 'bg-purple-100 text-purple-800',
    legendary: 'bg-yellow-100 text-yellow-800'
  };

  // Initialize mock data
  useEffect(() => {
    initializeMockData();
  }, []);

  const initializeMockData = () => {
    // Mock online players
    const mockPlayers: User[] = [
      {
        id: '1',
        nickname: 'РыбакПро',
        level: 12,
        totalFish: 245,
        coins: 1850,
        achievements: ['Первый улов', 'Мастер озера'],
        isOnline: true,
        currentLocation: 'ocean',
        avatar: '😎'
      },
      {
        id: '2',
        nickname: 'МастерУдочки',
        level: 8,
        totalFish: 156,
        coins: 980,
        achievements: ['Первый улов'],
        isOnline: true,
        currentLocation: 'river',
        avatar: '🤠'
      },
      {
        id: '3',
        nickname: 'НептунчикFish',
        level: 15,
        totalFish: 378,
        coins: 2750,
        achievements: ['Первый улов', 'Мастер озера', 'Покоритель океана'],
        isOnline: true,
        currentLocation: 'arctic',
        avatar: '👑'
      }
    ];

    setOnlinePlayers(mockPlayers);
    setLeaderboard([...mockPlayers].sort((a, b) => b.totalFish - a.totalFish));

    // Mock chat messages
    const mockMessages: ChatMessage[] = [
      {
        id: '1',
        user: '😎 РыбакПро',
        message: 'Привет всем! Кто поймал что-то крутое сегодня?',
        time: '14:23',
        type: 'user'
      },
      {
        id: '2',
        user: 'СИСТЕМА',
        message: '🌟 МастерУдочки поймал редкую Веселую Форель!',
        time: '14:25',
        type: 'rare_catch'
      },
      {
        id: '3',
        user: '🤠 МастерУдочки',
        message: 'Ура! Наконец-то поймал что-то стоящее!',
        time: '14:26',
        type: 'user'
      },
      {
        id: '4',
        user: '👑 НептунчикFish',
        message: 'У меня есть лишняя Хихикающая Щука на обмен',
        time: '14:27',
        type: 'user'
      }
    ];

    setChatMessages(mockMessages);

    // Mock active tournament
    const mockTournament: Tournament = {
      id: '1',
      name: 'Летний Кубок Рыбаков',
      description: 'Поймай больше всех рыбы за 2 часа!',
      startTime: new Date(Date.now() - 30 * 60 * 1000), // Started 30 mins ago
      endTime: new Date(Date.now() + 90 * 60 * 1000), // Ends in 90 mins
      isActive: true,
      participants: 47,
      prize: 5000
    };

    setActiveTournament(mockTournament);
  };

  // Authentication
  const handleAuth = () => {
    if (authForm.nickname.trim()) {
      const newUser: User = {
        id: Math.random().toString(36),
        nickname: authForm.nickname,
        level: 1,
        totalFish: 0,
        coins: 100,
        achievements: [],
        isOnline: true,
        currentLocation: 'lake',
        avatar: '😊'
      };
      
      setCurrentUser(newUser);
      setIsLoggedIn(true);
      setShowAuthModal(false);
      setAuthForm({ nickname: '', password: '' });
      
      // Add system message
      addSystemMessage(`🎉 ${newUser.nickname} присоединился к игре!`);
    }
  };

  const handleGuest = () => {
    const guestUser: User = {
      id: 'guest',
      nickname: 'Гость',
      level: 1,
      totalFish: 0,
      coins: 50,
      achievements: [],
      isOnline: true,
      currentLocation: 'lake',
      avatar: '👤'
    };
    
    setCurrentUser(guestUser);
    setIsLoggedIn(true);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    if (currentUser) {
      addSystemMessage(`👋 ${currentUser.nickname} покинул игру!`);
    }
    setCurrentUser(null);
    setIsLoggedIn(false);
    setCaughtFish([]);
    setCurrentSection('world');
  };

  // Chat System
  const addSystemMessage = (message: string) => {
    const newMsg: ChatMessage = {
      id: Math.random().toString(36),
      user: 'СИСТЕМА',
      message,
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      type: 'system'
    };
    setChatMessages(prev => [...prev, newMsg]);
  };

  const sendMessage = () => {
    if (newMessage.trim() && currentUser) {
      const newMsg: ChatMessage = {
        id: Math.random().toString(36),
        user: `${currentUser.avatar} ${currentUser.nickname}`,
        message: newMessage,
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        type: 'user'
      };
      setChatMessages(prev => [...prev, newMsg]);
      setNewMessage('');
    }
  };

  // Fishing Mechanics
  const startFishing = () => {
    if (!selectedLocation || !currentUser) return;
    
    setGameState('fishing');
    setFishingProgress(0);
    
    const castDistance = castPower[0];
    const baseDuration = 3000 - (castDistance * 20); // More power = faster fishing
    
    const interval = setInterval(() => {
      setFishingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          catchFish(castDistance);
          return 100;
        }
        return prev + (100 / (baseDuration / 50));
      });
    }, 50);
  };

  const catchFish = (castDistance: number) => {
    if (!selectedLocation || !currentUser) return;
    
    // Calculate catch chances based on cast power and location difficulty
    const baseChance = Math.max(0.1, (castDistance / 100) - (selectedLocation.difficulty * 0.1));
    const fishType = selectedLocation.fishTypes[Math.floor(Math.random() * selectedLocation.fishTypes.length)];
    const fishData = fishDatabase[fishType as keyof typeof fishDatabase];
    
    if (fishData) {
      // Determine rarity based on chance
      let finalRarity = fishData.rarity;
      const rarityRoll = Math.random();
      
      if (rarityRoll < 0.05 && castDistance > 80) finalRarity = 'legendary';
      else if (rarityRoll < 0.15 && castDistance > 60) finalRarity = 'epic';
      else if (rarityRoll < 0.35 && castDistance > 40) finalRarity = 'rare';
      
      const sizeMultiplier = 0.5 + (castDistance / 100);
      const newFish: Fish = {
        id: Math.random().toString(36),
        name: fishType,
        emoji: fishData.emoji,
        rarity: finalRarity,
        value: Math.floor(fishData.baseValue * sizeMultiplier * (finalRarity === 'legendary' ? 3 : finalRarity === 'epic' ? 2 : finalRarity === 'rare' ? 1.5 : 1)),
        location: selectedLocation.id,
        size: Math.floor(20 + (castDistance * 2) + Math.random() * 30)
      };
      
      setCaughtFish(prev => [...prev, newFish]);
      setCurrentUser(prev => prev ? { ...prev, coins: prev.coins + newFish.value, totalFish: prev.totalFish + 1 } : null);
      
      // Announce rare catches
      if (finalRarity === 'legendary' || finalRarity === 'epic') {
        const rarityText = finalRarity === 'legendary' ? '✨ ЛЕГЕНДАРНУЮ' : '🌟 ЭПИЧЕСКУЮ';
        addSystemMessage(`${rarityText} рыбу поймал ${currentUser.nickname}: ${newFish.name}!`);
      }
      
      setGameState('caught');
      setTimeout(() => setGameState('waiting'), 3000);
    }
  };

  // Tournament Timer
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTournamentTimeLeft = () => {
    if (!activeTournament) return 0;
    return Math.max(0, activeTournament.endTime.getTime() - Date.now());
  };

  // Navigation sections
  const sections = [
    { id: 'world', label: 'Карта Мира', icon: 'Map' },
    { id: 'fishing', label: 'Рыбалка', icon: 'Fish' },
    { id: 'tournaments', label: 'Турниры', icon: 'Trophy' },
    { id: 'profile', label: 'Профиль', icon: 'User' },
    { id: 'trading', label: 'Торговля', icon: 'ArrowRightLeft' },
    { id: 'community', label: 'Сообщество', icon: 'Users' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 via-blue-100 to-white font-comic-neue">
      {/* Navigation */}
      <nav className="bg-ocean/90 backdrop-blur-sm shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl animate-bounce">🎣</div>
              <h1 className="text-2xl font-bold text-white">Smiley Fisher Online</h1>
              {activeTournament && (
                <Badge className="bg-yellow-500 text-black animate-pulse">
                  🏆 {formatTime(getTournamentTimeLeft())}
                </Badge>
              )}
            </div>
            
            <div className="hidden md:flex space-x-4">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setCurrentSection(section.id)}
                  disabled={!isLoggedIn && section.id !== 'world'}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                    currentSection === section.id 
                      ? 'bg-white text-ocean' 
                      : isLoggedIn ? 'text-white hover:bg-white/20' : 'text-white/50'
                  }`}
                >
                  <Icon name={section.icon} size={16} />
                  <span className="text-sm">{section.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-3">
              {isLoggedIn && currentUser ? (
                <>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-sunshine text-black">
                      💰 {currentUser.coins}
                    </Badge>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Lv.{currentUser.level}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2 text-white">
                    <span className="text-lg">{currentUser.avatar}</span>
                    <span className="hidden sm:block">{currentUser.nickname}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleLogout} className="text-ocean border-white bg-white hover:bg-white/90">
                    Выйти
                  </Button>
                </>
              ) : (
                <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="text-ocean border-white bg-white hover:bg-white/90">
                      Войти
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle className="text-center text-2xl">
                        🎣 Добро пожаловать!
                      </DialogTitle>
                    </DialogHeader>
                    <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as 'login' | 'register')}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">Вход</TabsTrigger>
                        <TabsTrigger value="register">Регистрация</TabsTrigger>
                      </TabsList>
                      <TabsContent value="login" className="space-y-4">
                        <div>
                          <Label htmlFor="nickname">Никнейм</Label>
                          <Input
                            id="nickname"
                            value={authForm.nickname}
                            onChange={(e) => setAuthForm({...authForm, nickname: e.target.value})}
                            placeholder="Введи свой никнейм"
                          />
                        </div>
                        <div>
                          <Label htmlFor="password">Пароль</Label>
                          <Input
                            id="password"
                            type="password"
                            value={authForm.password}
                            onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                            placeholder="Введи пароль"
                          />
                        </div>
                        <div className="space-y-2">
                          <Button onClick={handleAuth} className="w-full bg-ocean hover:bg-ocean/90">
                            Войти в игру
                          </Button>
                          <Button onClick={handleGuest} variant="outline" className="w-full">
                            Играть как гость
                          </Button>
                        </div>
                      </TabsContent>
                      <TabsContent value="register" className="space-y-4">
                        <div>
                          <Label htmlFor="reg-nickname">Никнейм</Label>
                          <Input
                            id="reg-nickname"
                            value={authForm.nickname}
                            onChange={(e) => setAuthForm({...authForm, nickname: e.target.value})}
                            placeholder="Придумай никнейм"
                          />
                        </div>
                        <div>
                          <Label htmlFor="reg-password">Пароль</Label>
                          <Input
                            id="reg-password"
                            type="password"
                            value={authForm.password}
                            onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                            placeholder="Создай пароль"
                          />
                        </div>
                        <Button onClick={handleAuth} className="w-full bg-ocean hover:bg-ocean/90">
                          Создать аккаунт
                        </Button>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* World Map Section */}
      {currentSection === 'world' && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-4 text-ocean">🗺️ Карта Мира</h2>
              <p className="text-lg text-gray-700">Выбери место для рыбалки и начни свое приключение!</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {locations.map(location => (
                <Card 
                  key={location.id} 
                  className={`cursor-pointer transform hover:scale-105 transition-all ${
                    selectedLocation?.id === location.id ? 'ring-2 ring-ocean' : ''
                  } ${!isLoggedIn || (currentUser && currentUser.level < location.unlockLevel) ? 'opacity-50' : ''}`}
                  onClick={() => {
                    if (isLoggedIn && currentUser && currentUser.level >= location.unlockLevel) {
                      setSelectedLocation(location);
                      setCurrentSection('fishing');
                    }
                  }}
                >
                  <CardHeader className="text-center">
                    <div className="text-4xl mb-2">{location.emoji}</div>
                    <CardTitle className="text-lg">{location.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-gray-600 mb-3">{location.description}</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center space-x-1">
                        {Array.from({length: location.difficulty}).map((_, i) => (
                          <Icon key={i} name="Star" className="h-4 w-4 text-yellow-500 fill-current" />
                        ))}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Уровень {location.unlockLevel}+
                      </Badge>
                    </div>
                    {!isLoggedIn ? (
                      <p className="text-xs text-gray-500 mt-2">Войди в игру</p>
                    ) : currentUser && currentUser.level < location.unlockLevel ? (
                      <p className="text-xs text-red-500 mt-2">Заблокировано</p>
                    ) : (
                      <div className="mt-2">
                        {onlinePlayers.filter(p => p.currentLocation === location.id).length > 0 && (
                          <div className="flex justify-center space-x-1 mb-2">
                            {onlinePlayers.filter(p => p.currentLocation === location.id).slice(0, 3).map(player => (
                              <div key={player.id} className="text-lg animate-pulse" title={player.nickname}>
                                {player.avatar}
                              </div>
                            ))}
                          </div>
                        )}
                        <Button size="sm" className="bg-ocean hover:bg-ocean/90">
                          Рыбачить здесь
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {!isLoggedIn && (
              <Card className="max-w-2xl mx-auto bg-gradient-to-r from-ocean/10 to-blue-100">
                <CardContent className="text-center py-8">
                  <div className="text-6xl mb-4">😊🎣</div>
                  <h3 className="text-2xl font-bold mb-4 text-ocean">Добро пожаловать в Smiley Fisher Online!</h3>
                  <p className="text-lg mb-6 text-gray-700">
                    Самая веселая онлайн-игра про рыбалку! Играй с друзьями, лови редкую рыбу и соревнуйся в турнирах!
                  </p>
                  <Button onClick={() => setShowAuthModal(true)} size="lg" className="bg-coral hover:bg-coral/90 text-white">
                    🎣 Начать приключение!
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      )}

      {/* Fishing Section */}
      {currentSection === 'fishing' && isLoggedIn && selectedLocation && (
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              
              {/* Fishing Area */}
              <div className="lg:col-span-2">
                <Card className="mb-6">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">
                        {selectedLocation.emoji} {selectedLocation.name}
                      </CardTitle>
                      <Badge variant="outline">
                        Игроков: {onlinePlayers.filter(p => p.currentLocation === selectedLocation.id).length}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 relative overflow-hidden rounded-lg bg-gradient-to-b from-blue-300 to-blue-700 mb-4">
                      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent"></div>
                      <div className="relative z-10 h-full flex flex-col justify-center items-center text-white">
                        
                        {gameState === 'waiting' && (
                          <div className="text-center">
                            <div className="text-4xl mb-3 animate-bounce">🎣</div>
                            <h3 className="text-xl font-bold mb-3">Готов к рыбалке?</h3>
                            <div className="mb-4">
                              <Label className="text-white mb-2 block">Сила заброса: {castPower[0]}%</Label>
                              <Slider
                                value={castPower}
                                onValueChange={setCastPower}
                                max={100}
                                step={1}
                                className="w-48"
                              />
                            </div>
                            <Button 
                              onClick={startFishing}
                              className="bg-sunshine hover:bg-sunshine/90 text-black"
                            >
                              Забросить удочку!
                            </Button>
                          </div>
                        )}
                        
                        {gameState === 'fishing' && (
                          <div className="text-center w-full max-w-sm">
                            <div className="text-4xl mb-3 animate-pulse">🎣</div>
                            <h3 className="text-lg font-bold mb-3">Ловим рыбу...</h3>
                            <Progress value={fishingProgress} className="mb-3 bg-white/20" />
                            <p className="text-sm opacity-90">Сила заброса: {castPower[0]}%</p>
                          </div>
                        )}
                        
                        {gameState === 'caught' && caughtFish.length > 0 && (
                          <div className="text-center">
                            <div className="text-5xl mb-3 animate-bounce">
                              {caughtFish[caughtFish.length - 1].emoji}
                            </div>
                            <h3 className="text-xl font-bold mb-2">Поймана рыба!</h3>
                            <p className="text-lg mb-2">{caughtFish[caughtFish.length - 1].name}</p>
                            <Badge className={rarityColors[caughtFish[caughtFish.length - 1].rarity]}>
                              {caughtFish[caughtFish.length - 1].rarity.toUpperCase()}
                            </Badge>
                            <p className="text-lg mt-2">
                              Размер: {caughtFish[caughtFish.length - 1].size}см | 
                              +{caughtFish[caughtFish.length - 1].value}💰
                            </p>
                          </div>
                        )}
                        
                      </div>
                      
                      {/* Animated players */}
                      <div className="absolute bottom-4 left-4 flex space-x-2">
                        {onlinePlayers.filter(p => p.currentLocation === selectedLocation.id).slice(0, 4).map(player => (
                          <div 
                            key={player.id}
                            className="text-2xl animate-bounce"
                            style={{ animationDelay: `${Math.random() * 2}s` }}
                            title={`${player.nickname} (Lv.${player.level})`}
                          >
                            {player.avatar}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Location Fish Types */}
                    <div>
                      <h4 className="font-semibold mb-2">Рыба в этой локации:</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedLocation.fishTypes.map(fishType => {
                          const fishData = fishDatabase[fishType as keyof typeof fishDatabase];
                          return (
                            <Badge key={fishType} variant="outline" className="text-xs">
                              {fishData?.emoji} {fishType}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Caught Fish */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Icon name="Package" className="mr-2" />
                      Твой улов ({caughtFish.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-40">
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                        {caughtFish.map((fish, index) => (
                          <div key={index} className="text-center p-2 bg-blue-50 rounded-lg">
                            <div className="text-2xl mb-1">{fish.emoji}</div>
                            <p className="text-xs font-semibold truncate">{fish.name}</p>
                            <Badge className={`${rarityColors[fish.rarity]} text-xs`}>
                              {fish.rarity}
                            </Badge>
                            <p className="text-xs text-gray-600">{fish.size}см | {fish.value}💰</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Online Players */}
              <div>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Icon name="Users" className="mr-2" />
                      Игроки онлайн ({onlinePlayers.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-40">
                      <div className="space-y-2">
                        {onlinePlayers.map(player => (
                          <div key={player.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{player.avatar}</span>
                              <div>
                                <p className="text-sm font-semibold">{player.nickname}</p>
                                <p className="text-xs text-gray-600">
                                  Lv.{player.level} | {locations.find(l => l.id === player.currentLocation)?.emoji}
                                </p>
                              </div>
                            </div>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Tournament Info */}
                {activeTournament && (
                  <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                    <CardHeader>
                      <CardTitle className="flex items-center text-orange-800">
                        🏆 Активный турнир
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <h4 className="font-bold mb-2">{activeTournament.name}</h4>
                      <p className="text-sm text-gray-700 mb-3">{activeTournament.description}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Участников:</span>
                          <span className="font-semibold">{activeTournament.participants}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Приз:</span>
                          <span className="font-semibold">💰 {activeTournament.prize}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Осталось:</span>
                          <span className="font-semibold text-red-600">
                            {formatTime(getTournamentTimeLeft())}
                          </span>
                        </div>
                      </div>
                      <Button size="sm" className="w-full mt-3 bg-yellow-500 hover:bg-yellow-600 text-black">
                        Участвовать
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Chat */}
              <div>
                <Card className="h-96">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Icon name="MessageCircle" className="mr-2" />
                      Чат 💬
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col h-80">
                    <ScrollArea className="flex-1 mb-4">
                      <div className="space-y-2">
                        {chatMessages.map((msg) => (
                          <div 
                            key={msg.id} 
                            className={`p-2 rounded-lg text-sm ${
                              msg.type === 'system' 
                                ? 'bg-green-50 text-green-800' 
                                : msg.type === 'rare_catch'
                                ? 'bg-yellow-50 text-yellow-800'
                                : 'bg-blue-50'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-semibold text-xs">{msg.user}</span>
                              <span className="text-xs text-gray-500">{msg.time}</span>
                            </div>
                            <p className="text-xs">{msg.message}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Напиши сообщение..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        className="flex-1 text-sm"
                      />
                      <Button onClick={sendMessage} size="sm">
                        <Icon name="Send" size={14} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tournaments Section */}
      {currentSection === 'tournaments' && isLoggedIn && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8 text-ocean">🏆 Турниры</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Active Tournament */}
              {activeTournament && (
                <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300">
                  <CardHeader>
                    <CardTitle className="text-center text-2xl text-orange-800">
                      🏆 {activeTournament.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-6xl mb-4">⏰</div>
                    <div className="text-3xl font-bold text-red-600 mb-4">
                      {formatTime(getTournamentTimeLeft())}
                    </div>
                    <p className="text-lg mb-6">{activeTournament.description}</p>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-white/50 p-3 rounded-lg">
                        <p className="text-2xl font-bold">{activeTournament.participants}</p>
                        <p className="text-sm">Участников</p>
                      </div>
                      <div className="bg-white/50 p-3 rounded-lg">
                        <p className="text-2xl font-bold">💰 {activeTournament.prize}</p>
                        <p className="text-sm">Главный приз</p>
                      </div>
                    </div>
                    <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black">
                      Участвовать в турнире
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Leaderboard */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">📊 Турнирная таблица</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leaderboard.slice(0, 10).map((player, index) => (
                      <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            index === 0 ? 'bg-yellow-400 text-black' :
                            index === 1 ? 'bg-gray-400 text-white' :
                            index === 2 ? 'bg-orange-400 text-white' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {index + 1}
                          </div>
                          <span className="text-lg">{player.avatar}</span>
                          <div>
                            <p className="font-semibold">{player.nickname}</p>
                            <p className="text-xs text-gray-600">Уровень {player.level}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{player.totalFish} 🐟</p>
                          <p className="text-xs text-gray-600">{player.coins} 💰</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Tournaments */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-center">🗓️ Предстоящие турниры</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl mb-2">🌊</div>
                    <h4 className="font-bold mb-2">Океанский Вызов</h4>
                    <p className="text-sm text-gray-600 mb-2">Завтра в 15:00</p>
                    <Badge variant="outline">Приз: 10,000💰</Badge>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl mb-2">🏔️</div>
                    <h4 className="font-bold mb-2">Горный Турнир</h4>
                    <p className="text-sm text-gray-600 mb-2">В воскресенье</p>
                    <Badge variant="outline">Приз: 15,000💰</Badge>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-3xl mb-2">🧊</div>
                    <h4 className="font-bold mb-2">Арктическая Битва</h4>
                    <p className="text-sm text-gray-600 mb-2">Через неделю</p>
                    <Badge variant="outline">Приз: 25,000💰</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Profile Section */}
      {currentSection === 'profile' && isLoggedIn && currentUser && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="mb-8">
                <CardHeader className="text-center">
                  <div className="text-6xl mb-4">{currentUser.avatar}</div>
                  <CardTitle className="text-3xl">{currentUser.nickname}</CardTitle>
                  <p className="text-gray-600">Уровень {currentUser.level} • {currentUser.totalFish} рыб поймано</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-2xl font-bold">{currentUser.coins}</p>
                      <p className="text-sm text-gray-600">💰 Монеты</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-2xl font-bold">{currentUser.totalFish}</p>
                      <p className="text-sm text-gray-600">🐟 Всего рыбы</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-2xl font-bold">{caughtFish.filter(f => f.rarity === 'legendary').length}</p>
                      <p className="text-sm text-gray-600">✨ Легендарных</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-2xl font-bold">{currentUser.achievements.length}</p>
                      <p className="text-sm text-gray-600">🏆 Достижений</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Achievements */}
                <Card>
                  <CardHeader>
                    <CardTitle>🏆 Достижения</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl mr-3">🎣</div>
                        <div>
                          <p className="font-semibold">Первый улов</p>
                          <p className="text-sm text-gray-600">Поймай свою первую рыбу</p>
                        </div>
                      </div>
                      {currentUser.achievements.includes('Мастер озера') && (
                        <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl mr-3">🏞️</div>
                          <div>
                            <p className="font-semibold">Мастер озера</p>
                            <p className="text-sm text-gray-600">Поймай 50 рыб в озере</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg opacity-50">
                        <div className="text-2xl mr-3">🌊</div>
                        <div>
                          <p className="font-semibold">Покоритель океана</p>
                          <p className="text-sm text-gray-600">Поймай 100 рыб в океане</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Fish Collection */}
                <Card>
                  <CardHeader>
                    <CardTitle>🐠 Коллекция рыб</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(fishDatabase).map(([name, data]) => {
                          const caught = caughtFish.find(f => f.name === name);
                          return (
                            <div 
                              key={name} 
                              className={`p-3 rounded-lg border-2 ${
                                caught ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <div className="text-center">
                                <div className="text-2xl mb-1">{data.emoji}</div>
                                <p className="text-xs font-semibold truncate">{name}</p>
                                {caught ? (
                                  <Badge className={`${rarityColors[caught.rarity]} text-xs mt-1`}>
                                    ✓ Поймана
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs mt-1">
                                    Не поймана
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Trading Section */}
      {currentSection === 'trading' && isLoggedIn && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8 text-ocean">🔄 Торговля</h2>
            
            <div className="max-w-4xl mx-auto">
              <Card className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <CardHeader className="text-center">
                  <div className="text-4xl mb-2">🚧</div>
                  <CardTitle className="text-2xl text-green-800">Скоро появится!</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-lg text-green-700 mb-4">
                    Система торговли находится в разработке. Скоро ты сможешь:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div className="bg-white/50 p-4 rounded-lg">
                      <h4 className="font-bold mb-2">🔄 Обмениваться рыбой</h4>
                      <p className="text-sm">Меняйся уловом с другими игроками</p>
                    </div>
                    <div className="bg-white/50 p-4 rounded-lg">
                      <h4 className="font-bold mb-2">💰 Продавать на рынке</h4>
                      <p className="text-sm">Выставляй редкую рыбу на аукцион</p>
                    </div>
                    <div className="bg-white/50 p-4 rounded-lg">
                      <h4 className="font-bold mb-2">🎁 Дарить друзьям</h4>
                      <p className="text-sm">Отправляй подарки товарищам</p>
                    </div>
                    <div className="bg-white/50 p-4 rounded-lg">
                      <h4 className="font-bold mb-2">📈 Следить за ценами</h4>
                      <p className="text-sm">Отслеживай стоимость разных видов</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mock Trading Interface */}
              <Card>
                <CardHeader>
                  <CardTitle>💼 Твой инвентарь</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                      {caughtFish.map((fish, index) => (
                        <div key={index} className="text-center p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                          <div className="text-2xl mb-1">{fish.emoji}</div>
                          <p className="text-xs font-semibold truncate">{fish.name}</p>
                          <Badge className={`${rarityColors[fish.rarity]} text-xs mb-1`}>
                            {fish.rarity}
                          </Badge>
                          <p className="text-xs text-gray-600">{fish.value}💰</p>
                          <Button size="sm" variant="outline" className="text-xs mt-2" disabled>
                            Продать
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Community Section */}
      {currentSection === 'community' && isLoggedIn && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8 text-ocean">👥 Сообщество</h2>
            
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Online Players List */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Icon name="Users" className="mr-2" />
                        Игроки онлайн ({onlinePlayers.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {onlinePlayers.map(player => (
                          <div key={player.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-2xl mr-3">{player.avatar}</span>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <p className="font-semibold">{player.nickname}</p>
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              </div>
                              <p className="text-sm text-gray-600">
                                Уровень {player.level} • {player.totalFish} рыб
                              </p>
                              <p className="text-xs text-gray-500">
                                📍 {locations.find(l => l.id === player.currentLocation)?.name}
                              </p>
                            </div>
                            <div className="text-right">
                              <Button size="sm" variant="outline">
                                Профиль
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Global Chat */}
                <div>
                  <Card className="h-[600px]">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Icon name="MessageCircle" className="mr-2" />
                        Глобальный чат
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col h-[500px]">
                      <ScrollArea className="flex-1 mb-4">
                        <div className="space-y-2">
                          {chatMessages.map((msg) => (
                            <div 
                              key={msg.id} 
                              className={`p-3 rounded-lg ${
                                msg.type === 'system' 
                                  ? 'bg-green-50 text-green-800' 
                                  : msg.type === 'rare_catch'
                                  ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                                  : 'bg-blue-50'
                              }`}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-semibold text-sm">{msg.user}</span>
                                <span className="text-xs text-gray-500">{msg.time}</span>
                              </div>
                              <p className="text-sm">{msg.message}</p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Напиши сообщение..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                          className="flex-1"
                        />
                        <Button onClick={sendMessage} size="sm">
                          <Icon name="Send" size={16} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Community Stats */}
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="text-center">📊 Статистика сообщества</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-3xl font-bold">1,247</p>
                      <p className="text-sm text-gray-600">Всего игроков</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-3xl font-bold">{onlinePlayers.length}</p>
                      <p className="text-sm text-gray-600">Сейчас онлайн</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-3xl font-bold">15,842</p>
                      <p className="text-sm text-gray-600">Рыб поймано сегодня</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-3xl font-bold">3</p>
                      <p className="text-sm text-gray-600">Активных турнира</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-ocean text-white py-8 mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="text-3xl mb-4">🎣😊</div>
            <h3 className="text-2xl font-bold mb-2">Smiley Fisher Online</h3>
            <p className="mb-6">Самая веселая онлайн-игра про рыбалку с мультиплеером!</p>
            <div className="flex justify-center space-x-8 mb-6">
              <a href="#" className="hover:text-sunshine transition-colors">О игре</a>
              <a href="#" className="hover:text-sunshine transition-colors">Поддержка</a>
              <a href="#" className="hover:text-sunshine transition-colors">Сообщество</a>
              <a href="#" className="hover:text-sunshine transition-colors">Правила</a>
            </div>
            <div className="border-t border-white/20 pt-4">
              <p className="text-sm opacity-75">
                © 2024 Smiley Fisher Online. Все права защищены.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SmileyFisherOnline;