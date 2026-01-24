import React, { useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import CanvasBoard from '@/components/Canvas/CanvasBoard';
import CharacterGrid from '@/components/UI/CharacterGrid';
import Hanamaru from '@/components/UI/Hanamaru';

function App() {
  const [selectedChar, setSelectedChar] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);

  // Reset feedback when char changes or refresh
  React.useEffect(() => {
    setShowFeedback(false);
  }, [selectedChar, refreshKey]);

  const canvasRef = React.useRef(null);

  const handleBack = () => {
    setSelectedChar(null);
  };

  const handleDone = () => {
    if (canvasRef.current) {
      const isValid = canvasRef.current.validate();
      if (isValid) {
        setShowFeedback(true);
      } else {
        alert('はみださないように かいてみよう！');
      }
    }
  };

  return (
    <MainLayout title={selectedChar ? `「${selectedChar}」のれんしゅう` : 'ひらがなれんしゅう'}>
      {selectedChar ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', position: 'relative' }}>
          {showFeedback && <Hanamaru />}
          <CanvasBoard
            ref={canvasRef}
            key={`${selectedChar}-${refreshKey}`}
            width={320}
            height={320}
            strokeColor="#4a148c"
            strokeWidth={12}
            character={selectedChar}
          />
          <div style={{ display: 'flex', gap: '15px' }}>
            <button
              style={{
                padding: '10px 20px', fontSize: '1.1rem', borderRadius: '30px', border: 'none',
                background: '#4db6ac', color: 'white', cursor: 'pointer'
              }}
              onClick={() => setRefreshKey(prev => prev + 1)}
            >
              かきなおす
            </button>
            <button
              style={{
                padding: '10px 20px', fontSize: '1.1rem', borderRadius: '30px', border: 'none',
                background: '#ff6f00', color: 'white', cursor: 'pointer',
                boxShadow: '0 4px 0 #e65100'
              }}
              onClick={handleDone}
            >
              できた！
            </button>
            <button
              style={{
                padding: '10px 20px', fontSize: '1.1rem', borderRadius: '30px', border: 'none',
                background: '#ec407a', color: 'white', cursor: 'pointer'
              }}
              onClick={handleBack}
            >
              もどる
            </button>
          </div>
        </div>
      ) : (
        <CharacterGrid onSelect={setSelectedChar} />
      )}
    </MainLayout>
  );
}

export default App;
