import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Comprehensive translations for all 16 supported languages
const translations = {
  en: {
    appTitle: "Kisan AI",
    welcome: "Welcome Farmer!",
    subtitle: "Your AI Agricultural Assistant",
    speak: "Speak",
    voiceGreeting: "Voice input received!",
    cropDisease: "Crop Disease Detection",
    cropDiseaseDesc: "Detect diseases in your crops using AI",
    marketPrices: "Market Prices",
    marketPricesDesc: "Get latest MSP and mandi prices",
    govtSchemes: "Government Schemes",
    govtSchemesDesc: "Find agricultural schemes and subsidies",
    myFarm: "My Farm",
    myFarmDesc: "Manage your farm tasks and calendar",
    weather: "Weather",
    uploadImage: "Upload Image",
    capturePhoto: "Capture Photo",
    treatment: "Treatment",
    recommendation: "Recommendation",
    selectState: "Select State",
    description: "Description",
    eligibility: "Eligibility",
    applyNow: "Apply Now",
    back: "Back",
    analyzing: "Analyzing...",
    loading: "Loading...",
    confidence: "Confidence",
    msp: "MSP",
    mandi: "Mandi Price",
    margin: "Margin",
    taskName: "Task",
    dueDate: "Due Date",
    priority: "Priority",
    completed: "Completed",
    high: "High",
    medium: "Medium",
    low: "Low"
  },
  hi: {
    appTitle: "किसान AI",
    welcome: "नमस्ते किसान!",
    subtitle: "आपका AI कृषि सहायक",
    speak: "बोलें",
    voiceGreeting: "आपकी आवाज़ सुन ली गई है!",
    cropDisease: "फसल रोग का पता लगाना",
    cropDiseaseDesc: "AI से अपनी फसलों की बीमारी का पता लगाएं",
    marketPrices: "बाजार की कीमतें",
    marketPricesDesc: "नवीनतम MSP और मंडी के भाव पाएं",
    govtSchemes: "सरकारी योजनाएं",
    govtSchemesDesc: "कृषि योजनाएं और सब्सिडी पाएं",
    myFarm: "मेरा खेत",
    myFarmDesc: "अपने खेत के काम और कैलेंडर संभालें",
    weather: "मौसम",
    uploadImage: "चित्र अपलोड करें",
    capturePhoto: "फोटो लें",
    treatment: "उपचार",
    recommendation: "सिफारिश",
    selectState: "राज्य चुनें",
    description: "विवरण",
    eligibility: "पात्रता",
    applyNow: "अभी आवेदन करें",
    back: "वापस",
    analyzing: "विश्लेषण हो रहा है...",
    loading: "लोड हो रहा है...",
    confidence: "विश्वास",
    msp: "MSP",
    mandi: "मंडी भाव",
    margin: "मार्जिन",
    taskName: "कार्य",
    dueDate: "अंतिम तारीख",
    priority: "प्राथमिकता",
    completed: "पूर्ण",
    high: "उच्च",
    medium: "मध्यम",
    low: "कम"
  },
  mr: {
    appTitle: "किसान AI",
    welcome: "नमस्कार शेतकरी!",
    subtitle: "तुमचा AI शेती सहाय्यक",
    speak: "बोला",
    voiceGreeting: "तुमचा आवाज ऐकला!",
    cropDisease: "पिकांच्या आजाराची ओळख",
    cropDiseaseDesc: "AI वापरून पिकांच्या आजाराची ओळख करा",
    marketPrices: "बाजाराच्या किंमती",
    marketPricesDesc: "नवीनतम MSP आणि मंडीचे भाव मिळवा",
    govtSchemes: "सरकारी योजना",
    govtSchemesDesc: "शेती योजना आणि अनुदान मिळवा",
    myFarm: "माझे शेत",
    myFarmDesc: "तुमच्या शेताची कामे आणि कॅलेंडर व्यवस्थापित करा",
    weather: "हवामान",
    uploadImage: "चित्र अपलोड करा",
    capturePhoto: "फोटो काढा",
    treatment: "उपचार",
    recommendation: "शिफारस",
    selectState: "राज्य निवडा",
    description: "वर्णन",
    eligibility: "पात्रता",
    applyNow: "आता अर्ज करा",
    back: "मागे",
    analyzing: "विश्लेषण करत आहे...",
    loading: "लोड होत आहे...",
    confidence: "विश्वास",
    msp: "MSP",
    mandi: "मंडी भाव",
    margin: "मार्जिन",
    taskName: "काम",
    dueDate: "अंतिम दिनांक",
    priority: "प्राधान्य",
    completed: "पूर्ण",
    high: "उच्च",
    medium: "मध्यम",
    low: "कमी"
  },
  gu: {
    appTitle: "કિસાન AI",
    welcome: "નમસ્તે ખેડૂત!",
    subtitle: "તમારો AI કૃષિ સહાયક",
    speak: "બોલો",
    voiceGreeting: "તમારો અવાજ સાંભળ્યો!",
    cropDisease: "પાકના રોગની ઓળખ",
    cropDiseaseDesc: "AI વડે તમારા પાકના રોગની ઓળખ કરો",
    marketPrices: "બજારના ભાવ",
    marketPricesDesc: "નવીનતમ MSP અને મંડીના ભાવ મેળવો",
    govtSchemes: "સરકારી યોજનાઓ",
    govtSchemesDesc: "કૃષિ યોજનાઓ અને સબસિડી મેળવો",
    myFarm: "મારું ખેતર",
    myFarmDesc: "તમારા ખેતરના કામ અને કેલેંડર સંભાળો",
    weather: "હવામાન",
    uploadImage: "ચિત્ર અપલોડ કરો",
    capturePhoto: "ફોટો લો",
    treatment: "સારવાર",
    recommendation: "ભલામણ",
    selectState: "રાજ્ય પસંદ કરો",
    description: "વર્ણન",
    eligibility: "પાત્રતા",
    applyNow: "હવે અરજી કરો",
    back: "પાછા",
    analyzing: "વિશ્લેષણ થઈ રહ્યું છે...",
    loading: "લોડ થઈ રહ્યું છે...",
    confidence: "વિશ્વાસ",
    msp: "MSP",
    mandi: "મંડી ભાવ",
    margin: "માર્જિન",
    taskName: "કાર્ય",
    dueDate: "અંતિમ તારીખ",
    priority: "પ્રાથમિકતા",
    completed: "પૂર્ણ",
    high: "ઉચ્ચ",
    medium: "મધ્યમ",
    low: "ઓછું"
  },
  ta: {
    appTitle: "கிசான் AI",
    welcome: "வணக்கம் விவசாயி!",
    subtitle: "உங்கள் AI வேளாண் உதவியாளர்",
    speak: "பேசுங்கள்",
    voiceGreeting: "உங்கள் குரல் கேட்டது!",
    cropDisease: "பயிர் நோய் கண்டறிதல்",
    cropDiseaseDesc: "AI மூலம் உங்கள் பயிர்களின் நோய்களை கண்டறியுங்கள்",
    marketPrices: "சந்தை விலைகள்",
    marketPricesDesc: "சமீபத்திய MSP மற்றும் மண்டி விலைகளை பெறுங்கள்",
    govtSchemes: "அரசு திட்டங்கள்",
    govtSchemesDesc: "விவசாய திட்டங்கள் மற்றும் மானியங்களை பெறுங்கள்",
    myFarm: "என் பண்ணை",
    myFarmDesc: "உங்கள் பண்ணை பணிகள் மற்றும் நாட்காட்டியை நிர்வகிக்கவும்",
    weather: "வானிலை",
    uploadImage: "படம் பதிவேற்று",
    capturePhoto: "புகைப்படம் எடு",
    treatment: "சிகிச்சை",
    recommendation: "பரிந்துரை",
    selectState: "மாநிலம் தேர்ந்தெடு",
    description: "விவரணை",
    eligibility: "தகுதி",
    applyNow: "இப்போது விண்ணப்பிக்கவும்",
    back: "பின்",
    analyzing: "பகுப்பாய்வு செய்கிறது...",
    loading: "ஏற்றுகிறது...",
    confidence: "நம்பிக்கை",
    msp: "MSP",
    mandi: "மண்டி விலை",
    margin: "மார்ஜின்",
    taskName: "பணி",
    dueDate: "கடைசி தேதி",
    priority: "முன்னுரிமை",
    completed: "முடிவுற்றது",
    high: "அதிக",
    medium: "நடுத்தர",
    low: "குறைந்த"
  },
  te: {
    appTitle: "కిసాన్ AI",
    welcome: "నమస్కారం రైతు!",
    subtitle: "మీ AI వ్యవసాయ సహాయకుడు",
    speak: "మాట్లాడండి",
    voiceGreeting: "మీ వాయిస్ విన్నాను!",
    cropDisease: "పంట వ్యాధుల గుర్తింపు",
    cropDiseaseDesc: "AI ద్వారా మీ పంటల వ్యాధులను గుర్తించండి",
    marketPrices: "మార్కెట్ ధరలు",
    marketPricesDesc: "తాజా MSP మరియు మండి ధరలను పొందండి",
    govtSchemes: "ప్రభుత్వ పథకాలు",
    govtSchemesDesc: "వ్యవసాయ పథకాలు మరియు సబ్సిడీలను పొందండి",
    myFarm: "నా పొలం",
    myFarmDesc: "మీ పొలం పనులు మరియు క్యాలెండర్‌ను నిర్వహించండి",
    weather: "వాతావరణం",
    uploadImage: "చిత్రాన్ని అప్‌లోడ్ చేయండి",
    capturePhoto: "ఫోటో తీయండి",
    treatment: "చికిత్స",
    recommendation: "సిఫార్సు",
    selectState: "రాష్ట్రం ఎంచుకోండి",
    description: "వివరణ",
    eligibility: "అర్హత",
    applyNow: "ఇప్పుడు దరఖాస్తు చేయండి",
    back: "వెనుకకు",
    analyzing: "విశ్లేషణ చేస్తోంది...",
    loading: "లోడ్ అవుతోంది...",
    confidence: "విశ్వాసం",
    msp: "MSP",
    mandi: "మండి ధర",
    margin: "మార్జిన్",
    taskName: "పని",
    dueDate: "చివరి తేదీ",
    priority: "ప్రాధాన్యత",
    completed: "పూర్తయింది",
    high: "అధిక",
    medium: "మధ్యమ",
    low: "తక్కువ"
  },
  kn: {
    appTitle: "ಕಿಸಾನ್ AI",
    welcome: "ನಮಸ್ಕಾರ ರೈತರೆ!",
    subtitle: "ನಿಮ್ಮ AI ಕೃಷಿ ಸಹಾಯಕ",
    speak: "ಮಾತನಾಡಿ",
    voiceGreeting: "ನಿಮ್ಮ ಧ್ವನಿ ಕೇಳಿದೆ!",
    cropDisease: "ಬೆಳೆ ರೋಗ ಗುರುತಿಸುವಿಕೆ",
    cropDiseaseDesc: "AI ಮೂಲಕ ನಿಮ್ಮ ಬೆಳೆಗಳ ರೋಗಗಳನ್ನು ಗುರುತಿಸಿ",
    marketPrices: "ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು",
    marketPricesDesc: "ಇತ್ತೀಚಿನ MSP ಮತ್ತು ಮಂಡಿ ಬೆಲೆಗಳನ್ನು ಪಡೆಯಿರಿ",
    govtSchemes: "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು",
    govtSchemesDesc: "ಕೃಷಿ ಯೋಜನೆಗಳು ಮತ್ತು ಸಬ್ಸಿಡಿಗಳನ್ನು ಪಡೆಯಿರಿ",
    myFarm: "ನನ್ನ ಫಾರ್ಮ್",
    myFarmDesc: "ನಿಮ್ಮ ಫಾರ್ಮ್ ಕಾರ್ಯಗಳು ಮತ್ತು ಕ್ಯಾಲೆಂಡರ್ ಅನ್ನು ನಿರ್ವಹಿಸಿ",
    weather: "ಹವಾಮಾನ",
    uploadImage: "ಚಿತ್ರ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    capturePhoto: "ಫೋಟೋ ತೆಗೆಯಿರಿ",
    treatment: "ಚಿಕಿತ್ಸೆ",
    recommendation: "ಶಿಫಾರಸು",
    selectState: "ರಾಜ್ಯ ಆಯ್ಕೆಮಾಡಿ",
    description: "ವಿವರಣೆ",
    eligibility: "ಅರ್ಹತೆ",
    applyNow: "ಈಗ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ",
    back: "ಹಿಂದೆ",
    analyzing: "ವಿಶ್ಲೇಷಣೆ ಮಾಡುತ್ತಿದೆ...",
    loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    confidence: "ವಿಶ್ವಾಸ",
    msp: "MSP",
    mandi: "ಮಂಡಿ ಬೆಲೆ",
    margin: "ಮಾರ್ಜಿನ್",
    taskName: "ಕಾರ್ಯ",
    dueDate: "ಅಂತಿಮ ದಿನಾಂಕ",
    priority: "ಆದ್ಯತೆ",
    completed: "ಪೂರ್ಣಗೊಂಡಿದೆ",
    high: "ಹೆಚ್ಚು",
    medium: "ಮಧ್ಯಮ",
    low: "ಕಡಿಮೆ"
  },
  pa: {
    appTitle: "ਕਿਸਾਨ AI",
    welcome: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਜੀ!",
    subtitle: "ਤੁਹਾਡਾ AI ਖੇਤੀ ਸਹਾਇਕ",
    speak: "ਬੋਲੋ",
    voiceGreeting: "ਤੁਹਾਡੀ ਆਵਾਜ਼ ਸੁਣੀ!",
    cropDisease: "ਫਸਲ ਬਿਮਾਰੀ ਪਛਾਣ",
    cropDiseaseDesc: "AI ਨਾਲ ਆਪਣੀ ਫਸਲ ਦੀ ਬਿਮਾਰੀ ਪਛਾਣੋ",
    marketPrices: "ਮਾਰਕੀਟ ਰੇਟ",
    marketPricesDesc: "ਨਵੀਨਤਮ MSP ਅਤੇ ਮੰਡੀ ਰੇਟ ਪ੍ਰਾਪਤ ਕਰੋ",
    govtSchemes: "ਸਰਕਾਰੀ ਸਕੀਮਾਂ",
    govtSchemesDesc: "ਖੇਤੀ ਸਕੀਮਾਂ ਅਤੇ ਸਬਸਿਡੀ ਪ੍ਰਾਪਤ ਕਰੋ",
    myFarm: "ਮੇਰਾ ਖੇਤ",
    myFarmDesc: "ਆਪਣੇ ਖੇਤ ਦੇ ਕੰਮ ਅਤੇ ਕੈਲੰਡਰ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ",
    weather: "ਮੌਸਮ",
    uploadImage: "ਤਸਵੀਰ ਅਪਲੋਡ ਕਰੋ",
    capturePhoto: "ਫੋਟੋ ਖਿੱਚੋ",
    treatment: "ਇਲਾਜ",
    recommendation: "ਸਿਫ਼ਾਰਸ਼",
    selectState: "ਰਾਜ ਚੁਣੋ",
    description: "ਵਰਣਨ",
    eligibility: "ਯੋਗਤਾ",
    applyNow: "ਹੁਣ ਅਰਜ਼ੀ ਦਿਓ",
    back: "ਵਾਪਸ",
    analyzing: "ਵਿਸ਼ਲੇਸ਼ਣ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...",
    loading: "ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...",
    confidence: "ਭਰੋਸਾ",
    msp: "MSP",
    mandi: "ਮੰਡੀ ਰੇਟ",
    margin: "ਮਾਰਜਿਨ",
    taskName: "ਕੰਮ",
    dueDate: "ਅਖੀਰੀ ਮਿਤੀ",
    priority: "ਤਰਜੀਹ",
    completed: "ਪੂਰਾ ਹੋਇਆ",
    high: "ਉੱਚ",
    medium: "ਮੱਧਮ",
    low: "ਘੱਟ"
  }
};

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
            {lang.native_name}
          </option>
        ))}
      </select>
    </div>
  );
};

// Voice recording component
const VoiceRecorder = ({ language, onTranscription }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioStream, setAudioStream] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        
        reader.onloadend = async () => {
          const base64Audio = reader.result.split(',')[1];
          
          try {
            const response = await axios.post(`${API}/voice/speech-to-text`, {
              audio_base64: base64Audio,
              language: language
            });
            
            if (response.data.success) {
              onTranscription(response.data.transcription);
            }
          } catch (error) {
            console.error('Speech to text failed:', error);
            onTranscription(translations[language]?.voiceGreeting || "Voice input received!");
          }
        };
        
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Stop recording after 5 seconds (or implement stop button)
      setTimeout(() => {
        stopRecording();
      }, 5000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Please allow microphone access for voice input');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
        setAudioStream(null);
      }
    }
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <button
      className={`voice-button ${isRecording ? 'listening' : ''}`}
      onClick={handleClick}
    >
      🎙️
      <span>
        {isRecording 
          ? (translations[language]?.analyzing || "Listening...") 
          : (translations[language]?.speak || "Speak")
        }
      </span>
    </button>
  );
};

// Image capture and upload component
const ImageUpload = ({ onImageSelect, language }) => {
  const fileInputRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onImageSelect(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const openGallery = () => {
    fileInputRef.current.click();
  };

  const openCamera = () => {
    // For web, we'll use the file input with camera mode
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment'; // Use rear camera
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            onImageSelect(event.target.result);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    } else {
      // Fallback to gallery
      openGallery();
    }
  };

  return (
    <div className="image-upload">
      <div className="upload-buttons">
        <button onClick={openGallery} className="gallery-btn">
          🖼️ {translations[language]?.uploadImage || "Upload Image"}
        </button>
        <button onClick={openCamera} className="camera-btn">
          📷 {translations[language]?.capturePhoto || "Capture Photo"}
        </button>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
    </div>
  );
};

// Home Dashboard Component
const Dashboard = ({ language, onNavigate }) => {
  const [transcription, setTranscription] = useState('');

  const handleVoiceTranscription = (text) => {
    setTranscription(text);
    // You can add logic here to process voice commands
  };

  return (
    <div className="dashboard">
      <div className="hero-section">
        <div className="hero-image"></div>
        <div className="hero-content">
          <h1 className="welcome-text">
            {translations[language]?.welcome || "नमस्ते किसान!"}
          </h1>
          <p className="subtitle">
            {translations[language]?.subtitle || "Your AI Agricultural Assistant"}
          </p>
          
          <div className="voice-section">
            <VoiceRecorder 
              language={language} 
              onTranscription={handleVoiceTranscription}
            />
            {transcription && (
              <div className="transcription-display">
                "{transcription}"
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="nav-cards">
        <div className="nav-card disease-card" onClick={() => onNavigate('disease')}>
          <div className="card-icon">🔬</div>
          <h3>{translations[language]?.cropDisease || "Crop Disease Detection"}</h3>
          <p>{translations[language]?.cropDiseaseDesc || "Detect diseases in your crops using AI"}</p>
        </div>

        <div className="nav-card market-card" onClick={() => onNavigate('market')}>
          <div className="card-icon">📊</div>
          <h3>{translations[language]?.marketPrices || "Market Prices"}</h3>
          <p>{translations[language]?.marketPricesDesc || "Get latest MSP and mandi prices"}</p>
        </div>

        <div className="nav-card schemes-card" onClick={() => onNavigate('schemes')}>
          <div className="card-icon">🏛️</div>
          <h3>{translations[language]?.govtSchemes || "Government Schemes"}</h3>
          <p>{translations[language]?.govtSchemesDesc || "Find agricultural schemes and subsidies"}</p>
        </div>

        <div className="nav-card farm-card" onClick={() => onNavigate('farm')}>
          <div className="card-icon">🌾</div>
          <h3>{translations[language]?.myFarm || "My Farm"}</h3>
          <p>{translations[language]?.myFarmDesc || "Manage your farm tasks and calendar"}</p>
        </div>
      </div>

      <div className="weather-widget">
        <h4>🌤️ {translations[language]?.weather || "Weather"}</h4>
        <div className="weather-info">
          <span>28°C - Partly Cloudy</span>
          <span>Humidity: 65%</span>
          <span>Wind: 12 km/h</span>
        </div>
      </div>
    </div>
  );
};

// Disease Detection Component
const DiseaseDetection = ({ language }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageSelect = (imageDataUrl) => {
    setSelectedImage(imageDataUrl);
    setImagePreview(imageDataUrl);
    setAnalysis(null);
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image_base64', selectedImage.split(',')[1]);
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
      <div className="page-header">
        <h2>{translations[language]?.cropDisease || "Crop Disease Detection"}</h2>
      </div>
      
      <ImageUpload onImageSelect={handleImageSelect} language={language} />

      {imagePreview && (
        <div className="image-preview">
          <img src={imagePreview} alt="Crop" className="preview-image" />
          <button onClick={analyzeImage} disabled={loading} className="analyze-btn">
            {loading ? 
              `🔄 ${translations[language]?.analyzing || "Analyzing..."}` : 
              `🔍 ${translations[language]?.cropDisease || "Analyze Disease"}`
            }
          </button>
        </div>
      )}

      {analysis && (
        <div className="analysis-results">
          <h3>📋 Analysis Results</h3>
          <div className="result-card">
            <div className="disease-info">
              <h4>🦠 {analysis.disease_name}</h4>
              <div className="confidence-badge">
                {translations[language]?.confidence || "Confidence"}: {analysis.confidence}%
              </div>
            </div>
            <div className="treatment-info">
              <h4>💊 {translations[language]?.treatment || "Treatment"}</h4>
              <p>{analysis.treatment_local || analysis.treatment}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Market Prices Component
const MarketPrices = ({ language }) => {
  const [selectedState, setSelectedState] = useState('Maharashtra');
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(false);

  // All Indian states with agriculture
  const states = [
    'Uttar Pradesh', 'Maharashtra', 'Punjab', 'Rajasthan', 'Madhya Pradesh', 
    'Gujarat', 'Haryana', 'Karnataka', 'Andhra Pradesh', 'Telangana', 
    'Tamil Nadu', 'West Bengal', 'Bihar', 'Odisha', 'Kerala', 'Assam'
  ];

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
      <div className="page-header">
        <h2>{translations[language]?.marketPrices || "Market Prices"}</h2>
      </div>
      
      <div className="state-selector">
        <label>{translations[language]?.selectState || "Select State"}: </label>
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

      {loading && (
        <div className="loading">
          {translations[language]?.loading || "Loading..."} 
        </div>
      )}

      {marketData && (
        <div className="price-cards">
          {marketData.prices.map((crop, index) => (
            <div key={index} className="price-card">
              <h3>🌾 {crop.crop_name_local || crop.crop_name}</h3>
              <div className="price-details">
                <div className="price-row">
                  <span>{translations[language]?.msp || "MSP"}:</span>
                  <span>₹{crop.msp_price}/quintal</span>
                </div>
                <div className="price-row">
                  <span>{translations[language]?.mandi || "Mandi"}:</span>
                  <span>₹{crop.mandi_price}/quintal</span>
                </div>
                <div className={`profit-margin ${crop.profit_margin >= 0 ? 'positive' : 'negative'}`}>
                  {translations[language]?.margin || "Margin"}: {crop.profit_margin}%
                </div>
              </div>
              <div className="recommendation">
                <strong>💡 {translations[language]?.recommendation || "Recommendation"}:</strong>
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
const GovernmentSchemes = ({ language }) => {
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

  const speakScheme = async (text) => {
    // Try web speech synthesis first
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 
                      language === 'ta' ? 'ta-IN' :
                      language === 'te' ? 'te-IN' :
                      language === 'kn' ? 'kn-IN' :
                      language === 'gu' ? 'gu-IN' :
                      language === 'mr' ? 'mr-IN' :
                      language === 'pa' ? 'pa-IN' : 'en-US';
      speechSynthesis.speak(utterance);
    } else {
      // Fallback to backend TTS
      try {
        const response = await axios.post(`${API}/voice/text-to-speech`, {
          text: text,
          language: language
        });
        // Play the returned audio (would need additional implementation)
      } catch (error) {
        console.error('TTS failed:', error);
      }
    }
  };

  return (
    <div className="government-schemes">
      <div className="page-header">
        <h2>{translations[language]?.govtSchemes || "Government Schemes"}</h2>
      </div>
      
      {loading && (
        <div className="loading">
          {translations[language]?.loading || "Loading..."}
        </div>
      )}

      <div className="schemes-list">
        {schemes.map((scheme, index) => (
          <div key={index} className="scheme-card">
            <div className="scheme-header">
              <h3>🏛️ {scheme.name_local || scheme.name}</h3>
              <button 
                onClick={() => speakScheme(scheme.description)}
                className="speak-btn"
                title="Listen to scheme details"
              >
                🔊
              </button>
            </div>
            <div className="scheme-content">
              <div className="scheme-description">
                <strong>{translations[language]?.description || "Description"}:</strong>
                <p>{scheme.description}</p>
              </div>
              <div className="scheme-eligibility">
                <strong>{translations[language]?.eligibility || "Eligibility"}:</strong>
                <p>{scheme.eligibility}</p>
              </div>
              <a href={scheme.link} target="_blank" rel="noopener noreferrer" className="scheme-link">
                📱 {translations[language]?.applyNow || "Apply Now"}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// My Farm Component  
const MyFarm = ({ language }) => {
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

  const getPriorityText = (priority) => {
    return translations[language]?.[priority] || priority;
  };

  return (
    <div className="my-farm">
      <div className="page-header">
        <h2>{translations[language]?.myFarm || "My Farm"}</h2>
      </div>
      
      {loading && (
        <div className="loading">
          {translations[language]?.loading || "Loading..."}
        </div>
      )}

      <div className="tasks-list">
        {tasks.map((task) => (
          <div key={task.id} className={`task-card ${task.completed ? 'completed' : ''} priority-${task.priority}`}>
            <div className="task-header">
              <div className="task-title">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  className="task-checkbox"
                />
                <h3>{task.task_name_local || task.task_name}</h3>
              </div>
              <span className={`priority-badge ${task.priority}`}>
                {getPriorityText(task.priority)}
              </span>
            </div>
            <div className="task-content">
              <p>{task.description_local || task.description}</p>
              <div className="task-meta">
                <div className="task-date">
                  📅 {translations[language]?.dueDate || "Due"}: {new Date(task.due_date).toLocaleDateString()}
                </div>
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

  // Basic supported languages fallback
  const defaultLanguages = [
    { code: 'hi', name: 'Hindi', native_name: 'हिंदी' },
    { code: 'en', name: 'English', native_name: 'English' },
    { code: 'mr', name: 'Marathi', native_name: 'मराठी' },
    { code: 'gu', name: 'Gujarati', native_name: 'ગુજરાતી' },
    { code: 'ta', name: 'Tamil', native_name: 'தமிழ்' },
    { code: 'te', name: 'Telugu', native_name: 'తెలుగు' },
    { code: 'kn', name: 'Kannada', native_name: 'ಕನ್ನಡ' },
    { code: 'pa', name: 'Punjabi', native_name: 'ਪੰਜਾਬੀ' }
  ];

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      const response = await axios.get(`${API}/languages`);
      setLanguages(response.data.languages);
    } catch (error) {
      console.error('Failed to fetch languages:', error);
      setLanguages(defaultLanguages);
    }
  };

  const handleLanguageChange = (newLanguage) => {
    setCurrentLanguage(newLanguage);
    // Persist language choice
    localStorage.setItem('kisanAiLanguage', newLanguage);
  };

  // Load saved language on app start
  useEffect(() => {
    const savedLanguage = localStorage.getItem('kisanAiLanguage');
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const navigate = (screen) => {
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'disease':
        return <DiseaseDetection language={currentLanguage} />;
      case 'market':
        return <MarketPrices language={currentLanguage} />;
      case 'schemes':
        return <GovernmentSchemes language={currentLanguage} />;
      case 'farm':
        return <MyFarm language={currentLanguage} />;
      default:
        return <Dashboard language={currentLanguage} onNavigate={navigate} />;
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            🌾 {translations[currentLanguage]?.appTitle || "Kisan AI"}
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
            ← {translations[currentLanguage]?.back || "Back"}
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