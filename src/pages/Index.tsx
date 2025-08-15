import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

const SmileyFisherOnline = () => {
  const [currentSection, setCurrentSection] = useState('hero');
  const [gameState, setGameState] = useState('waiting'); // waiting, fishing, caught
  const [fishingProgress, setFishingProgress] = useState(0);
  const [caughtFish, setCaughtFish] = useState<any[]>([]);
  const [coins, setCoins] = useState(150);
  const [chatMessages, setChatMessages] = useState([
    { user: '😊 РыбакПро', message: 'Привет всем! Кто поймал что-то крутое?', time: '14:23' },
    { user: '🎣 МастерУдочки', message: 'Только что поймал Радужного Пузырька!', time: '14:25' },
    { user: '🐠 НептунчикFish', message: 'У меня есть Смеющийся Судак на обмен', time: '14:27' },
  ]);
  const [newMessage, setNewMessage] = useState('');

  const funnyFishNames = [
    'Смеющийся Судак', 'Веселый Окунь', 'Танцующий Тунец', 'Поющая Селедка',
    'Радужный Пузырек', 'Хихикающая Щука', 'Прыгучий Карп', 'Улыбчивая Треска',
    'Веселая Камбала', 'Игривый Лосось', 'Счастливая Скумбрия', 'Озорной Минтай'
  ];

  const fishRarities = ['🥉 Обычная', '🥈 Редкая', '🥇 Эпическая', '💎 Легендарная'];

  const startFishing = () => {
    setGameState('fishing');
    setFishingProgress(0);
    
    const interval = setInterval(() => {
      setFishingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          const newFish = {
            name: funnyFishNames[Math.floor(Math.random() * funnyFishNames.length)],
            rarity: fishRarities[Math.floor(Math.random() * fishRarities.length)],
            value: Math.floor(Math.random() * 100) + 10,
            emoji: ['🐠', '🐡', '🦈', '🐟', '🦑'][Math.floor(Math.random() * 5)]
          };
          setCaughtFish(prev => [...prev, newFish]);
          setCoins(prev => prev + newFish.value);
          setGameState('caught');
          setTimeout(() => setGameState('waiting'), 3000);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      setChatMessages(prev => [...prev, {
        user: '😊 Ты',
        message: newMessage,
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
      }]);
      setNewMessage('');
    }
  };

  const sections = [
    { id: 'hero', label: 'Главная', icon: 'Home' },
    { id: 'game', label: 'Играть', icon: 'Fish' },
    { id: 'characters', label: 'Персонажи', icon: 'Users' },
    { id: 'tournaments', label: 'Турниры', icon: 'Trophy' },
    { id: 'shop', label: 'Магазин', icon: 'ShoppingCart' },
    { id: 'community', label: 'Сообщество', icon: 'MessageCircle' },
    { id: 'news', label: 'Новости', icon: 'Newspaper' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 via-blue-100 to-white">
      {/* Navigation */}
      <nav className="bg-ocean/90 backdrop-blur-sm shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🎣</div>
              <h1 className="text-2xl font-bold text-white">Smiley Fisher Online</h1>
            </div>
            <div className="hidden md:flex space-x-6">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setCurrentSection(section.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    currentSection === section.id 
                      ? 'bg-white text-ocean' 
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  <Icon name={section.icon} size={18} />
                  <span>{section.label}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="bg-sunshine text-black">
                💰 {coins}
              </Badge>
              <Button variant="outline" className="text-ocean border-white bg-white hover:bg-white/90">
                Войти
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      {currentSection === 'hero' && (
        <section className="py-20 text-center">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <img 
                src="/img/80d3a0d4-77a3-4958-a642-ed84b7dfcedb.jpg" 
                alt="Smiley Fisher Hero"
                className="mx-auto mb-8 w-64 h-64 object-cover rounded-full shadow-2xl animate-bounce"
              />
              <h2 className="text-5xl font-bold mb-6 text-ocean">
                Добро пожаловать в Smiley Fisher Online! 😊🎣
              </h2>
              <p className="text-xl mb-8 text-gray-700 max-w-2xl mx-auto">
                Самая веселая онлайн-игра про рыбалку! Играй за смайлика, лови редкую рыбу, 
                соревнуйся с друзьями и создавай свою рыболовную империю!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="transform hover:scale-105 transition-transform">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-center">
                      🎮 <span className="ml-2">Играй онлайн</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Соревнуйся с игроками со всего мира в реальном времени</p>
                  </CardContent>
                </Card>
                <Card className="transform hover:scale-105 transition-transform">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-center">
                      🐠 <span className="ml-2">Собирай рыб</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Более 100 видов уникальных рыб с забавными названиями</p>
                  </CardContent>
                </Card>
                <Card className="transform hover:scale-105 transition-transform">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-center">
                      ⚡ <span className="ml-2">Кастомизация</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Настрой своего смайлика и улучшай рыболовные снасти</p>
                  </CardContent>
                </Card>
              </div>
              <Button 
                size="lg" 
                className="bg-coral hover:bg-coral/90 text-white text-xl px-8 py-4"
                onClick={() => setCurrentSection('game')}
              >
                🎣 Начать рыбалку!
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Game Section */}
      {currentSection === 'game' && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Fishing Game */}
              <div className="lg:col-span-2">
                <Card className="h-96 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-blue-300 to-blue-600">
                    <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-blue-800 to-transparent"></div>
                  </div>
                  <CardContent className="relative z-10 p-8 h-full flex flex-col justify-center items-center text-white">
                    {gameState === 'waiting' && (
                      <div className="text-center">
                        <div className="text-6xl mb-4 animate-bounce">🎣</div>
                        <h3 className="text-2xl font-bold mb-4">Готов к рыбалке?</h3>
                        <Button 
                          size="lg"
                          className="bg-sunshine hover:bg-sunshine/90 text-black"
                          onClick={startFishing}
                        >
                          Забросить удочку!
                        </Button>
                      </div>
                    )}
                    
                    {gameState === 'fishing' && (
                      <div className="text-center w-full max-w-md">
                        <div className="text-4xl mb-4 animate-pulse">🎣</div>
                        <h3 className="text-xl font-bold mb-4">Ловим рыбу...</h3>
                        <Progress value={fishingProgress} className="mb-4" />
                        <p className="text-sm opacity-90">Жди поклевку!</p>
                      </div>
                    )}
                    
                    {gameState === 'caught' && caughtFish.length > 0 && (
                      <div className="text-center">
                        <div className="text-6xl mb-4 animate-bounce">{caughtFish[caughtFish.length - 1].emoji}</div>
                        <h3 className="text-2xl font-bold mb-2">Поймана рыба!</h3>
                        <p className="text-xl mb-2">{caughtFish[caughtFish.length - 1].name}</p>
                        <Badge variant="secondary" className="mb-2">
                          {caughtFish[caughtFish.length - 1].rarity}
                        </Badge>
                        <p className="text-lg">+{caughtFish[caughtFish.length - 1].value} монет</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Caught Fish Collection */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Icon name="Package" className="mr-2" />
                      Твой улов ({caughtFish.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-32">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {caughtFish.map((fish, index) => (
                          <div key={index} className="text-center p-2 bg-blue-50 rounded-lg">
                            <div className="text-2xl mb-1">{fish.emoji}</div>
                            <p className="text-xs font-semibold">{fish.name}</p>
                            <p className="text-xs text-gray-600">{fish.value}💰</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Chat */}
              <div>
                <Card className="h-96">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Icon name="MessageCircle" className="mr-2" />
                      Чат рыбаков 💬
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col h-80">
                    <ScrollArea className="flex-1 mb-4">
                      <div className="space-y-3">
                        {chatMessages.map((msg, index) => (
                          <div key={index} className="bg-blue-50 p-3 rounded-lg">
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
          </div>
        </section>
      )}

      {/* Characters Section */}
      {currentSection === 'characters' && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8 text-ocean">Персонажи</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['😊', '😎', '🤠', '👑', '🎓', '🎭'].map((emoji, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="text-6xl mb-4">{emoji}</div>
                    <h3 className="text-xl font-bold mb-2">Смайлик {index + 1}</h3>
                    <p className="text-gray-600 mb-4">Уникальный персонаж с особыми способностями</p>
                    <Button variant="outline">Выбрать</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Other sections would go here */}
      {currentSection === 'tournaments' && (
        <section className="py-12">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-8 text-ocean">🏆 Турниры</h2>
            <p className="text-xl text-gray-700">Соревнуйся с лучшими рыбаками мира!</p>
          </div>
        </section>
      )}

      {currentSection === 'shop' && (
        <section className="py-12">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-8 text-ocean">🛍️ Магазин</h2>
            <p className="text-xl text-gray-700">Улучшай снасти и покупай новые острова!</p>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-ocean text-white py-8 mt-20">
        <div className="container mx-auto px-4 text-center">
          <div className="text-2xl mb-4">🎣😊</div>
          <p className="mb-4">Smiley Fisher Online - Самая веселая игра про рыбалку!</p>
          <div className="flex justify-center space-x-6">
            <a href="#" className="hover:text-sunshine transition-colors">О игре</a>
            <a href="#" className="hover:text-sunshine transition-colors">Поддержка</a>
            <a href="#" className="hover:text-sunshine transition-colors">Сообщество</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SmileyFisherOnline;