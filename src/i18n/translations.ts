import type { Language } from '../types';

export interface TranslationBundle {
  subtitle: string;
  navSos: string;
  navDoctor: string;
  navMedicalId: string;
  callAmbulance: string;
  callNational: string;
  sosTitle: string;
  sosInstruction: string;
  tapHelp: string;
  gpsFetching: string;
  gpsReady: string;
  gpsAccuracy: string;
  gpsErrorDenied: string;
  gpsErrorUnavailable: string;
  whatsappSos: string;
  smsAlert: string;
  copySos: string;
  copiedToast: string;
  findHospital: string;
  hospitalHelperTitle: string;
  openMapsHospitals: string;
  openMapsAmbulance: string;
  doctorSubtitle: string;
  startVoiceCall: string;
  endVoiceCall: string;
  connectingVoice: string;
  voiceLiveStatus: string;
  voiceListening: string;
  voiceSpeaking: string;
  readAloudOn: string;
  readAloudOff: string;
  playAudio: string;
  stopAudio: string;
  symptomChestPain: string;
  symptomBleeding: string;
  symptomUnconscious: string;
  symptomChoking: string;
  symptomBurn: string;
  initialGreeting: string;
  inputPlaceholder: string;
  recordingVoice: string;
  transcribingVoice: string;
  sendLabel: string;
  speakLabel: string;
  thinkingLabel: string;
  medicalIdTitle: string;
  medicalIdOfflineNote: string;
  saveBtn: string;
  editBtn: string;
  namePlaceholder: string;
  bloodPlaceholder: string;
  contactPlaceholder: string;
  allergyPlaceholder: string;
  nameLabel: string;
  bloodLabel: string;
  contactLabel: string;
  allergyLabel: string;
  saveToast: string;
  notProvided: string;
  disclaimerTitle: string;
  disclaimerBody: string;
  sosMessagePrefix: string;
  sosMedicalHeader: string;
  sosLocationUnavailable: string;
  mobileNavSos: string;
  mobileNavDoctor: string;
  mobileNavId: string;
  mobileNavCall: string;
}

export const TRANSLATIONS: Record<Language, TranslationBundle> = {
  gu: {
    subtitle: 'મેડિકલ SOS અને AI ફર્સ્ટ-એઇડ',
    navSos: 'ઇમરજન્સી SOS',
    navDoctor: 'ડૉક્ટર દુબંગ AI',
    navMedicalId: 'મેડિકલ ID',
    callAmbulance: '108 એમ્બ્યુલન્સ કૉલ',
    callNational: '112 ઇમરજન્સી કૉલ',
    sosTitle: 'લાઇવ ઇમરજન્સી SOS',
    sosInstruction: 'લાઇવ GPS લોકેશન મોકલવા અને ડૉક્ટર દુબંગ સાથે વાત કરવા SOS દબાવો',
    tapHelp: 'મદદ માટે દબાવો',
    gpsFetching: 'GPS લોકેશન મેળવી રહ્યા છીએ...',
    gpsReady: 'લાઇવ GPS લોકેશન તૈયાર છે',
    gpsAccuracy: 'ચોકસાઈ',
    gpsErrorDenied: 'લોકેશનની પરવાનગી નથી. કૃપા કરીને બ્રાઉઝરમાં GPS ચાલુ કરો અથવા સીધો 108/112 કૉલ કરો.',
    gpsErrorUnavailable: 'GPS ઉપલબ્ધ નથી. તમે હજી પણ WhatsApp અથવા SMS દ્વારા SOS સંદેશ મોકલી શકો છો.',
    whatsappSos: 'WhatsApp SOS',
    smsAlert: 'SMS એલર્ટ',
    copySos: 'સંદેશ કૉપિ કરો',
    copiedToast: 'SOS સંદેશ ક્લિપબોર્ડ પર કૉપિ થયો',
    findHospital: 'નજીકની હોસ્પિટલ અને એમ્બ્યુલન્સ શોધો',
    hospitalHelperTitle: 'નજીકની કટોકટી સેવાઓ (Google Maps)',
    openMapsHospitals: 'નજીકની ઇમરજન્સી હોસ્પિટલ ખોલો',
    openMapsAmbulance: 'નજીકની એમ્બ્યુલન્સ સેવા શોધો',
    doctorSubtitle: 'AI ઇમરજન્સી ફર્સ્ટ-એઇડ સહાયક',
    startVoiceCall: 'વૉઇસ કૉલ શરૂ કરો',
    endVoiceCall: 'વૉઇસ કૉલ બંધ કરો',
    connectingVoice: 'ડૉક્ટર દુબંગ સાથે જોડાઈ રહ્યું છે...',
    voiceLiveStatus: 'લાઇવ ટુ-વે વૉઇસ સક્રિય',
    voiceListening: 'સાંભળી રહ્યા છીએ... હવે બોલો',
    voiceSpeaking: 'ડૉક્ટર દુબંગ બોલી રહ્યા છે...',
    readAloudOn: 'ઑડિયો જવાબ ચાલુ',
    readAloudOff: 'ઑડિયો જવાબ બંધ',
    playAudio: 'સાંભળો',
    stopAudio: 'રોકો',
    symptomChestPain: 'છાતીમાં દુખાવો / હાર્ટ અટેક',
    symptomBleeding: 'ભારે રક્તસ્રાવ / અકસ્માત',
    symptomUnconscious: 'બેભાન / શ્વાસ બંધ',
    symptomChoking: 'ગળામાં ફસાવું (Choking)',
    symptomBurn: 'ગંભીર દાઝવું (Burn)',
    initialGreeting:
      'નમસ્તે, હું ડૉક્ટર દુબંગ છું. ગભરાશો નહીં, મને જણાવો કે શું ઇમરજન્સી છે? હું તમને તાત્કાલિક ફર્સ્ટ-એઇડનાં પગલાં જણાવીશ.',
    inputPlaceholder: 'ઇમરજન્સી લખો અથવા માઇક દબાવીને બોલો...',
    recordingVoice: 'રેકોર્ડિંગ ચાલુ છે... બંધ કરવા ફરી દબાવો',
    transcribingVoice: 'અવાજ સમજી રહ્યા છીએ...',
    sendLabel: 'મોકલો',
    speakLabel: 'બોલો',
    thinkingLabel: 'ડૉક્ટર દુબંગ વિચારી રહ્યા છે...',
    medicalIdTitle: 'ડિજિટલ મેડિકલ ID (ઑફલાઇન તૈયાર)',
    medicalIdOfflineNote: 'આ ડિવાઇસ પર સુરક્ષિત રીતે સચવાયેલ',
    saveBtn: 'ID સાચવો',
    editBtn: 'ફેરફાર કરો',
    namePlaceholder: 'પૂરું નામ',
    bloodPlaceholder: 'બ્લડ ગ્રુપ (દા.ત. B+)',
    contactPlaceholder: 'ઇમરજન્સી સંપર્ક નંબર',
    allergyPlaceholder: 'એલર્જી / બીમારી (દા.ત. ડાયાબિટીસ, અસ્થમા)',
    nameLabel: 'નામ',
    bloodLabel: 'બ્લડ ગ્રુપ',
    contactLabel: 'ઇમરજન્સી નંબર',
    allergyLabel: 'એલર્જી / સ્થિતિ',
    saveToast: 'મેડિકલ ID આ ડિવાઇસ પર ઑફલાઇન સાચવવામાં આવ્યું છે.',
    notProvided: 'ઉપલબ્ધ નથી',
    disclaimerTitle: 'તબીબી ચેતવણી (Medical Disclaimer)',
    disclaimerBody:
      'ડૉક્ટર દુબંગ તાત્કાલિક પરિસ્થિતિમાં પ્રાથમિક સારવાર (First-Aid) માટે AI-આધારિત માર્ગદર્શન આપે છે. તે વ્યાવસાયિક ડૉક્ટર, નિદાન અથવા હોસ્પિટલની સારવારનો વિકલ્પ નથી. જીવલેણ કટોકટીમાં તરત જ 108 અથવા 112 પર કૉલ કરો.',
    sosMessagePrefix: '🚨 મેડિકલ SOS મદદ જોઈએ છે! મારું લાઇવ GPS લોકેશન:',
    sosMedicalHeader: 'દર્દીની મેડિકલ વિગતો:',
    sosLocationUnavailable: 'GPS ઉપલબ્ધ નથી — કૃપા કરીને તરત સંપર્ક કરો.',
    mobileNavSos: 'SOS',
    mobileNavDoctor: 'ડૉક્ટર AI',
    mobileNavId: 'મેડિકલ ID',
    mobileNavCall: '108 કૉલ',
  },
  hi: {
    subtitle: 'मेडिकल SOS और AI प्राथमिक उपचार',
    navSos: 'आपातकालीन SOS',
    navDoctor: 'डॉक्टर दुबंग AI',
    navMedicalId: 'मेडिकल ID',
    callAmbulance: '108 एम्बुलेंस कॉल',
    callNational: '112 आपातकालीन कॉल',
    sosTitle: 'लाइव इमरजेंसी SOS',
    sosInstruction: 'लाइव GPS लोकेशन भेजने और डॉक्टर दुबंग से बात करने के लिए SOS दबाएं',
    tapHelp: 'मदद के लिए दबाएं',
    gpsFetching: 'GPS लोकेशन प्राप्त की जा रही है...',
    gpsReady: 'लाइव GPS लोकेशन तैयार है',
    gpsAccuracy: 'सटीकता',
    gpsErrorDenied: 'लोकेशन की अनुमति नहीं मिली। ब्राउज़र में GPS चालू करें या तुरंत 108/112 पर कॉल करें।',
    gpsErrorUnavailable: 'GPS उपलब्ध नहीं है। आप फिर भी WhatsApp या SMS से SOS अलर्ट भेज सकते हैं।',
    whatsappSos: 'WhatsApp SOS',
    smsAlert: 'SMS अलर्ट',
    copySos: 'संदेश कॉपी करें',
    copiedToast: 'SOS संदेश कॉपी हो गया',
    findHospital: 'नज़दीकी अस्पताल और एम्बुलेंस खोजें',
    hospitalHelperTitle: 'नज़दीकी आपातकालीन सेवाएं (Google Maps)',
    openMapsHospitals: 'नज़दीकी इमरजेंसी अस्पताल खोलें',
    openMapsAmbulance: 'नज़दीकी एम्बुलेंस सेवा खोजें',
    doctorSubtitle: 'AI आपातकालीन प्राथमिक उपचार सहायक',
    startVoiceCall: 'वॉइस कॉल शुरू करें',
    endVoiceCall: 'वॉइस कॉल बंद करें',
    connectingVoice: 'डॉक्टर दुबंग से जुड़ रहे हैं...',
    voiceLiveStatus: 'लाइव टू-वे वॉइस सक्रिय',
    voiceListening: 'सुन रहे हैं... अब बोलें',
    voiceSpeaking: 'डॉक्टर दुबंग बोल रहे हैं...',
    readAloudOn: 'ऑडियो उत्तर चालू',
    readAloudOff: 'ऑडियो उत्तर बंद',
    playAudio: 'सुनें',
    stopAudio: 'रोकें',
    symptomChestPain: 'सीने में दर्द / हार्ट अटैक',
    symptomBleeding: 'तेज़ खून बहना / दुर्घटना',
    symptomUnconscious: 'बेहोश / सांस न चलना',
    symptomChoking: 'गले में अटकना (Choking)',
    symptomBurn: 'गंभीर जलना (Burn)',
    initialGreeting:
      'नमस्ते, मैं डॉक्टर दुबंग हूँ। घबराएं नहीं, मुझे बताएं क्या आपात स्थिति है? मैं आपको तुरंत प्राथमिक उपचार के चरण बताऊँगा।',
    inputPlaceholder: 'आपात स्थिति लिखें या माइक दबाकर बोलें...',
    recordingVoice: 'रिकॉर्डिंग चालू है... बंद करने के लिए फिर दबाएं',
    transcribingVoice: 'आवाज़ समझी जा रही है...',
    sendLabel: 'भेजें',
    speakLabel: 'बोलें',
    thinkingLabel: 'डॉक्टर दुबंग मार्गदर्शन तैयार कर रहे हैं...',
    medicalIdTitle: 'डिजिटल मेडिकल ID (ऑफ़लाइन तैयार)',
    medicalIdOfflineNote: 'इस डिवाइस पर सुरक्षित रूप से सहेजा गया',
    saveBtn: 'ID सहेजें',
    editBtn: 'संपादित करें',
    namePlaceholder: 'पूरा नाम',
    bloodPlaceholder: 'ब्लड ग्रुप (जैसे B+)',
    contactPlaceholder: 'आपातकालीन संपर्क नंबर',
    allergyPlaceholder: 'एलर्जी / बीमारी (जैसे शुगर, अस्थमा)',
    nameLabel: 'नाम',
    bloodLabel: 'ब्लड ग्रुप',
    contactLabel: 'आपातकालीन नंबर',
    allergyLabel: 'एलर्जी / स्थिति',
    saveToast: 'मेडिकल ID इस डिवाइस पर ऑफ़लाइन सहेज ली गई है।',
    notProvided: 'उपलब्ध नहीं',
    disclaimerTitle: 'चिकित्सा अस्वीकरण (Medical Disclaimer)',
    disclaimerBody:
      'डॉक्टर दुबंग आपातकालीन स्थितियों में प्राथमिक उपचार (First-Aid) के लिए AI-सहायता प्राप्त मार्गदर्शन प्रदान करता है। यह किसी डॉक्टर, चिकित्सकीय निदान या अस्पताल की देखभाल का विकल्प नहीं है। जानलेवा स्थिति में तुरंत 108 या 112 पर कॉल करें।',
    sosMessagePrefix: '🚨 मेडिकल SOS मदद चाहिए! मेरी लाइव GPS लोकेशन:',
    sosMedicalHeader: 'मरीज़ की मेडिकल जानकारी:',
    sosLocationUnavailable: 'GPS उपलब्ध नहीं — कृपया तुरंत संपर्क करें।',
    mobileNavSos: 'SOS',
    mobileNavDoctor: 'डॉक्टर AI',
    mobileNavId: 'मेडिकल ID',
    mobileNavCall: '108 कॉल',
  },
  en: {
    subtitle: 'Medical SOS & AI First-Aid',
    navSos: 'Emergency SOS',
    navDoctor: 'Doctor Dubang AI',
    navMedicalId: 'Medical ID',
    callAmbulance: 'Call 108 Ambulance',
    callNational: 'Call 112 Emergency',
    sosTitle: 'Live Emergency SOS',
    sosInstruction: 'Tap SOS to capture your live GPS location and speak with Doctor Dubang',
    tapHelp: 'Tap for Help',
    gpsFetching: 'Fetching live GPS coordinates...',
    gpsReady: 'Live GPS location locked',
    gpsAccuracy: 'Accuracy',
    gpsErrorDenied: 'Location access denied. Enable GPS in your browser or call 108/112 immediately.',
    gpsErrorUnavailable: 'GPS unavailable right now. You can still send an SOS via WhatsApp or SMS.',
    whatsappSos: 'WhatsApp SOS',
    smsAlert: 'SMS Alert',
    copySos: 'Copy SOS Text',
    copiedToast: 'SOS message copied to clipboard',
    findHospital: 'Find Nearest Hospital & Ambulance',
    hospitalHelperTitle: 'Nearest Emergency Care (Google Maps)',
    openMapsHospitals: 'Open Nearest Emergency Hospitals',
    openMapsAmbulance: 'Search Ambulance Dispatch Nearby',
    doctorSubtitle: 'AI Emergency First-Aid Assistant',
    startVoiceCall: 'Start Voice Call',
    endVoiceCall: 'End Voice Call',
    connectingVoice: 'Connecting live audio to Doctor Dubang...',
    voiceLiveStatus: 'Live Two-Way Voice Active',
    voiceListening: 'Listening... Speak clearly now',
    voiceSpeaking: 'Doctor Dubang is speaking...',
    readAloudOn: 'Voice Read-Aloud On',
    readAloudOff: 'Voice Read-Aloud Off',
    playAudio: 'Listen',
    stopAudio: 'Stop',
    symptomChestPain: 'Chest Pain / Heart Attack',
    symptomBleeding: 'Heavy Bleeding / Trauma',
    symptomUnconscious: 'Unconscious / Not Breathing',
    symptomChoking: 'Choking',
    symptomBurn: 'Severe Burn',
    initialGreeting:
      'Hello, I am Doctor Dubang. Stay calm and tell me what happened. I will guide you step-by-step with immediate first aid.',
    inputPlaceholder: 'Type emergency or tap microphone to speak...',
    recordingVoice: 'Recording voice... Tap mic again to send',
    transcribingVoice: 'Transcribing your voice...',
    sendLabel: 'Send',
    speakLabel: 'Speak',
    thinkingLabel: 'Doctor Dubang is preparing first-aid steps...',
    medicalIdTitle: 'Digital Medical ID (Offline Ready)',
    medicalIdOfflineNote: 'Stored locally on this device',
    saveBtn: 'Save ID',
    editBtn: 'Edit',
    namePlaceholder: 'Full Name',
    bloodPlaceholder: 'Blood Group (e.g. B+)',
    contactPlaceholder: 'Emergency Contact No.',
    allergyPlaceholder: 'Allergies / Medical Conditions',
    nameLabel: 'Full Name',
    bloodLabel: 'Blood Group',
    contactLabel: 'Emergency Contact',
    allergyLabel: 'Allergies / Conditions',
    saveToast: 'Medical ID saved locally on this device.',
    notProvided: 'Not specified',
    disclaimerTitle: 'Medical Disclaimer',
    disclaimerBody:
      'Doctor Dubang provides AI-assisted first-aid guidance for urgent situations. It is not a substitute for professional medical diagnosis, treatment, or emergency dispatch. In life-threatening emergencies, immediately call 108, 112, or your local emergency number.',
    sosMessagePrefix: '🚨 MEDICAL SOS! I need urgent help. My live GPS location:',
    sosMedicalHeader: 'Patient Medical ID:',
    sosLocationUnavailable: 'GPS coordinates unavailable — please call me immediately.',
    mobileNavSos: 'SOS',
    mobileNavDoctor: 'Doctor AI',
    mobileNavId: 'Medical ID',
    mobileNavCall: 'Call 108',
  },
  es: {
    subtitle: 'SOS Médico y Primeros Auxilios IA',
    navSos: 'SOS Emergencia',
    navDoctor: 'Doctor Dubang IA',
    navMedicalId: 'ID Médico',
    callAmbulance: 'Llamar 108 Ambulancia',
    callNational: 'Llamar 112 Emergencias',
    sosTitle: 'SOS de Emergencia en Vivo',
    sosInstruction: 'Toca SOS para enviar tu ubicación GPS en vivo y hablar con Doctor Dubang',
    tapHelp: 'Toca para Ayuda',
    gpsFetching: 'Obteniendo ubicación GPS en vivo...',
    gpsReady: 'Ubicación GPS en vivo lista',
    gpsAccuracy: 'Precisión',
    gpsErrorDenied: 'Permiso de ubicación denegado. Activa el GPS o llama al 108/112 de inmediato.',
    gpsErrorUnavailable: 'GPS no disponible. Aún puedes enviar un SOS por WhatsApp o SMS.',
    whatsappSos: 'WhatsApp SOS',
    smsAlert: 'Alerta SMS',
    copySos: 'Copiar SOS',
    copiedToast: 'Mensaje SOS copiado al portapapeles',
    findHospital: 'Buscar Hospital y Ambulancia Cercanos',
    hospitalHelperTitle: 'Atención de Emergencia Cercana (Google Maps)',
    openMapsHospitals: 'Abrir Hospitales de Emergencia Cercanos',
    openMapsAmbulance: 'Buscar Servicio de Ambulancia Cercano',
    doctorSubtitle: 'Asistente IA de Primeros Auxilios',
    startVoiceCall: 'Iniciar Llamada de Voz',
    endVoiceCall: 'Finalizar Llamada',
    connectingVoice: 'Conectando audio en vivo con Doctor Dubang...',
    voiceLiveStatus: 'Voz Bidireccional en Vivo Activa',
    voiceListening: 'Escuchando... Habla ahora',
    voiceSpeaking: 'Doctor Dubang está hablando...',
    readAloudOn: 'Lectura por Voz Activa',
    readAloudOff: 'Lectura por Voz Inactiva',
    playAudio: 'Escuchar',
    stopAudio: 'Detener',
    symptomChestPain: 'Dolor de Pecho / Infarto',
    symptomBleeding: 'Hemorragia Grave / Accidente',
    symptomUnconscious: 'Inconsciente / No Respira',
    symptomChoking: 'Atragantamiento',
    symptomBurn: 'Quemadura Grave',
    initialGreeting:
      'Hola, soy el Doctor Dubang. Mantén la calma y dime qué ocurrió. Te guiaré paso a paso con primeros auxilios inmediatos.',
    inputPlaceholder: 'Escribe la emergencia o toca el micrófono para hablar...',
    recordingVoice: 'Grabando voz... Toca el micrófono otra vez para enviar',
    transcribingVoice: 'Transcribiendo tu voz...',
    sendLabel: 'Enviar',
    speakLabel: 'Hablar',
    thinkingLabel: 'Doctor Dubang está preparando las instrucciones...',
    medicalIdTitle: 'ID Médico Digital (Listo sin Conexión)',
    medicalIdOfflineNote: 'Guardado localmente en este dispositivo',
    saveBtn: 'Guardar ID',
    editBtn: 'Editar',
    namePlaceholder: 'Nombre Completo',
    bloodPlaceholder: 'Grupo Sanguíneo (ej. B+)',
    contactPlaceholder: 'Teléfono de Emergencia',
    allergyPlaceholder: 'Alergias / Condiciones Médicas',
    nameLabel: 'Nombre',
    bloodLabel: 'Grupo Sanguíneo',
    contactLabel: 'Contacto Emergencia',
    allergyLabel: 'Alergias / Condiciones',
    saveToast: 'ID Médico guardado localmente en este dispositivo.',
    notProvided: 'No especificado',
    disclaimerTitle: 'Aviso Médico',
    disclaimerBody:
      'Doctor Dubang ofrece orientación de primeros auxilios asistida por IA en situaciones urgentes. No sustituye el diagnóstico médico profesional ni los servicios de emergencia. Ante una emergencia vital, llama inmediatamente al 108, 112 o a tu número local de emergencias.',
    sosMessagePrefix: '🚨 ¡SOS MÉDICO! Necesito ayuda urgente. Mi ubicación GPS en vivo:',
    sosMedicalHeader: 'ID Médico del Paciente:',
    sosLocationUnavailable: 'Coordenadas GPS no disponibles — por favor llámame de inmediato.',
    mobileNavSos: 'SOS',
    mobileNavDoctor: 'Doctor IA',
    mobileNavId: 'ID Médico',
    mobileNavCall: 'Llamar 108',
  },
};
