import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Language selector component
const LanguageSelector = ({ currentLanguage, onLanguageChange, languages }) => {
  return (
    <div className="language-selector">
      <select
        value={currentLanguage}
        onChange={(e) => onLanguageChange(e.target.value)}
        className="language-dropdown"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.native_name} ({lang.name})
          </option>
        ))}
      </select>
    </div>
  );
};

// Home Dashboard Component
const Dashboard = ({ language, translations, onNavigate }) => {
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    setIsListening(true);
    // Mock voice input - will be replaced with actual STT
    setTimeout(() => {
      setIsListening(false);
      alert(translations[language]?.voice_greeting || "Voice input received!");
    }, 2000);
  };

  return (
    <div className="dashboard">
      <div className="hero-section">
        <h1 className="welcome-text">
          {translations[language]?.welcome || "नमस्ते किसान!"}
          <br />
          <span className="subtitle">
            {translations[language]?.subtitle || "Welcome Farmer!"}
          </span>
        </h1>
        
        <div className="voice-section">
          <button
            className={`voice-button ${isListening ? 'listening' : ''}`}
            onClick={startListening}
          >
            🎙️
            <span>{translations[language]?.speak || "बोलें | Speak"}</span>
          </button>
        </div>
      </div>

      <div className="nav-cards">
        <div className="nav-card disease-card" onClick={() => onNavigate('disease')}>
          <div className="card-icon">🔬</div>
          <h3>{translations[language]?.crop_disease || "Crop Disease Detection"}</h3>
          <p>{translations[language]?.crop_disease_desc || "फसल रोग का पता लगाना"}</p>
        </div>

        <div className="nav-card market-card" onClick={() => onNavigate('market')}>
          <div className="card-icon">📈</div>
          <h3>{translations[language]?.market_prices || "Market Prices"}</h3>
          <p>{translations[language]?.market_prices_desc || "बाजार की कीमतें"}</p>
        </div>

        <div className="nav-card schemes-card" onClick={() => onNavigate('schemes')}>
          <div className="card-icon">🏛️</div>
          <h3>{translations[language]?.govt_schemes || "Government Schemes"}</h3>
          <p>{translations[language]?.govt_schemes_desc || "सरकारी योजनाएं"}</p>
        </div>

        <div className="nav-card farm-card" onClick={() => onNavigate('farm')}>
          <div className="card-icon">🚜</div>
          <h3>{translations[language]?.my_farm || "My Farm"}</h3>
          <p>{translations[language]?.my_farm_desc || "मेरा खेत"}</p>
        </div>
      </div>

      <div className="weather-widget">
        <h4>🌤️ {translations[language]?.weather || "Weather | मौसम"}</h4>
        <p>28°C - Partly Cloudy | आंशिक बादल</p>
      </div>
    </div>
  );
};

// Disease Detection Component
const DiseaseDetection = ({ language, translations }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image_base64', selectedImage.split(',')[1]); // Remove data:image/jpeg;base64,
      formData.append('language', language);

      const response = await axios.post(`${API}/analyze-crop-disease`, formData);
      setAnalysis(response.data.analysis);
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="disease-detection">
      <h2>{translations[language]?.crop_disease || "Crop Disease Detection | फसल रोग का पता लगाना"}</h2>
      
      <div className="upload-section">
        <div className="upload-buttons">
          <button onClick={() => fileInputRef.current.click()} className="upload-btn">
            📁 {translations[language]?.upload_image || "Upload Image | चित्र अपलोड करें"}
          </button>
          <button className="camera-btn">
            📷 {translations[language]?.capture_photo || "Capture Photo | फोटो लें"}
          </button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
      </div>

      {imagePreview && (
        <div className="image-preview">
          <img src={imagePreview} alt="Crop" className="preview-image" />
          <button onClick={analyzeImage} disabled={loading} className="analyze-btn">
            {loading ? '🔄 Analyzing...' : '🔍 Analyze Disease | रोग का विश्लेषण करें'}
          </button>
        </div>
      )}

      {analysis && (
        <div className="analysis-results">
          <h3>📋 Analysis Results | विश्लेषण परिणाम</h3>
          <div className="result-card">
            <div className="disease-info">
              <h4>🦠 {analysis.disease_name}</h4>
              <div className="confidence">
                Confidence: {analysis.confidence}% | विश्वास: {analysis.confidence}%
              </div>
            </div>
            <div className="treatment-info">
              <h4>💊 {translations[language]?.treatment || "Treatment | उपचार"}</h4>
              <p>{analysis.treatment_local}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Market Prices Component
const MarketPrices = ({ language, translations }) => {
  const [selectedState, setSelectedState] = useState('Maharashtra');
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(false);

  const states = ['Maharashtra', 'Punjab', 'Bihar'];

  const fetchMarketPrices = async (state) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/market-prices/${state}?language=${language}`);
      setMarketData(response.data);
    } catch (error) {
      console.error('Failed to fetch market prices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketPrices(selectedState);
  }, [selectedState, language]);

  return (
    <div className="market-prices">
      <h2>{translations[language]?.market_prices || "Market & MSP Prices | बाजार और MSP कीमतें"}</h2>
      
      <div className="state-selector">
        <label>{translations[language]?.select_state || "Select State | राज्य चुनें"}: </label>
        <select 
          value={selectedState} 
          onChange={(e) => setSelectedState(e.target.value)}
          className="state-dropdown"
        >
          {states.map(state => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
      </div>

      {loading && <div className="loading">Loading prices... कीमतें लोड हो रही हैं...</div>}

      {marketData && (
        <div className="price-cards">
          {marketData.prices.map((crop, index) => (
            <div key={index} className="price-card">
              <h3>🌾 {crop.crop_name} | {crop.crop_name_local}</h3>
              <div className="price-details">
                <div className="price-row">
                  <span>MSP: ₹{crop.msp_price}/quintal</span>
                </div>
                <div className="price-row">
                  <span>Mandi: ₹{crop.mandi_price}/quintal</span>
                </div>
                <div className={`profit-margin ${crop.profit_margin >= 0 ? 'positive' : 'negative'}`}>
                  Margin: {crop.profit_margin}%
                </div>
              </div>
              <div className="recommendation">
                <strong>💡 {translations[language]?.recommendation || "Recommendation | सिफारिश"}:</strong>
                <p>{crop.recommendation}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Government Schemes Component
const GovernmentSchemes = ({ language, translations }) => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/government-schemes?language=${language}`);
      setSchemes(response.data.schemes);
    } catch (error) {
      console.error('Failed to fetch schemes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, [language]);

  const speakScheme = (text) => {
    // Mock TTS - will be replaced with actual Vertex AI TTS
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="government-schemes">
      <h2>{translations[language]?.govt_schemes || "Government Schemes | सरकारी योजनाएं"}</h2>
      
      {loading && <div className="loading">Loading schemes... योजनाएं लोड हो रही हैं...</div>}

      <div className="schemes-list">
        {schemes.map((scheme, index) => (
          <div key={index} className="scheme-card">
            <div className="scheme-header">
              <h3>🏛️ {scheme.name_local}</h3>
              <button 
                onClick={() => speakScheme(scheme.description)}
                className="speak-btn"
              >
                🔊
              </button>
            </div>
            <div className="scheme-content">
              <div className="scheme-description">
                <strong>{translations[language]?.description || "Description | विवरण"}:</strong>
                <p>{scheme.description}</p>
              </div>
              <div className="scheme-eligibility">
                <strong>{translations[language]?.eligibility || "Eligibility | पात्रता"}:</strong>
                <p>{scheme.eligibility}</p>
              </div>
              <a href={scheme.link} target="_blank" rel="noopener noreferrer" className="scheme-link">
                📱 {translations[language]?.apply_now || "Apply Now | अभी आवेदन करें"}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// My Farm Component  
const MyFarm = ({ language, translations }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/farm-tasks?language=${language}`);
      setTasks(response.data.tasks);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [language]);

  const toggleTask = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  return (
    <div className="my-farm">
      <h2>{translations[language]?.my_farm || "My Farm Calendar | मेरा खेत कैलेंडर"}</h2>
      
      {loading && <div className="loading">Loading tasks... कार्य लोड हो रहे हैं...</div>}

      <div className="tasks-list">
        {tasks.map((task) => (
          <div key={task.id} className={`task-card ${task.completed ? 'completed' : ''} ${task.priority}`}>
            <div className="task-header">
              <h3>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                />
                {task.task_name_local}
              </h3>
              <span className={`priority-badge ${task.priority}`}>
                {task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'}
              </span>
            </div>
            <div className="task-content">
              <p>{task.description_local}</p>
              <div className="task-date">
                📅 Due: {new Date(task.due_date).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [currentLanguage, setCurrentLanguage] = useState('hi');
  const [languages, setLanguages] = useState([]);
  const [translations, setTranslations] = useState({});

  // Basic translations (will be expanded with Google Translate API)
  const baseTranslations = {
    hi: {
      welcome: "नमस्ते किसान!",
      subtitle: "Welcome Farmer!",
      speak: "बोलें",
      voice_greeting: "आपकी आवाज़ सुन ली गई है!",
      crop_disease: "फसल रोग का पता लगाना",
      crop_disease_desc: "Crop Disease Detection",
      market_prices: "बाजार की कीमतें",
      market_prices_desc: "Market Prices",
      govt_schemes: "सरकारी योजनाएं",
      govt_schemes_desc: "Government Schemes",
      my_farm: "मेरा खेत",
      my_farm_desc: "My Farm",
      weather: "मौसम",
      upload_image: "चित्र अपलोड करें",
      capture_photo: "फोटो लें",
      treatment: "उपचार",
      recommendation: "सिफारिश",
      select_state: "राज्य चुनें",
      description: "विवरण",
      eligibility: "पात्रता",
      apply_now: "अभी आवेदन करें"
    },
    en: {
      welcome: "Welcome Farmer!",
      subtitle: "नमस्ते किसान!",
      speak: "Speak",
      voice_greeting: "Voice input received!",
      crop_disease: "Crop Disease Detection",
      crop_disease_desc: "फसल रोग का पता लगाना",
      market_prices: "Market Prices", 
      market_prices_desc: "बाजार की कीमतें",
      govt_schemes: "Government Schemes",
      govt_schemes_desc: "सरकारी योजनाएं",
      my_farm: "My Farm",
      my_farm_desc: "मेरा खेत",
      weather: "Weather",
      upload_image: "Upload Image",
      capture_photo: "Capture Photo",
      treatment: "Treatment",
      recommendation: "Recommendation",
      select_state: "Select State",
      description: "Description",
      eligibility: "Eligibility",
      apply_now: "Apply Now"
    }
  };

  useEffect(() => {
    // Initialize languages
    fetchLanguages();
    setTranslations(baseTranslations);
  }, []);

  const fetchLanguages = async () => {
    try {
      const response = await axios.get(`${API}/languages`);
      setLanguages(response.data.languages);
    } catch (error) {
      console.error('Failed to fetch languages:', error);
      // Fallback to basic languages
      setLanguages([
        { code: 'hi', name: 'Hindi', native_name: 'हिंदी' },
        { code: 'en', name: 'English', native_name: 'English' }
      ]);
    }
  };

  const handleLanguageChange = (newLanguage) => {
    setCurrentLanguage(newLanguage);
    // Here you could fetch translations for the new language
  };

  const navigate = (screen) => {
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'disease':
        return <DiseaseDetection language={currentLanguage} translations={translations} />;
      case 'market':
        return <MarketPrices language={currentLanguage} translations={translations} />;
      case 'schemes':
        return <GovernmentSchemes language={currentLanguage} translations={translations} />;
      case 'farm':
        return <MyFarm language={currentLanguage} translations={translations} />;
      default:
        return <Dashboard language={currentLanguage} translations={translations} onNavigate={navigate} />;
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            🌾 Kisan AI
          </h1>
          <LanguageSelector
            currentLanguage={currentLanguage}
            onLanguageChange={handleLanguageChange}
            languages={languages}
          />
        </div>
        {currentScreen !== 'dashboard' && (
          <button 
            className="back-btn"
            onClick={() => navigate('dashboard')}
          >
            ← {translations[currentLanguage]?.back || "Back | वापस"}
          </button>
        )}
      </header>

      <main className="app-main">
        {renderScreen()}
      </main>

      <footer className="app-footer">
        <p>🤝 Made for Indian Farmers | भारतीय किसानों के लिए बनाया गया</p>
      </footer>
    </div>
  );
}

export default App;