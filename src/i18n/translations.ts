import type { Language } from '../types';

export interface TranslationBundle {
  subtitle: string;
  navSos: string;
  navDoctor: string;
  navHospitals: string;
  navMedicalId: string;
  navAdmin: string;
  backToHome: string;
  featuresGridTitle: string;
  featureSosTitle: string;
  featureSosDesc: string;
  featureDoctorTitle: string;
  featureDoctorDesc: string;
  featureMapTitle: string;
  featureMapDesc: string;
  featureAiInformTitle: string;
  featureAiInformDesc: string;
  featureMedIdTitle: string;
  featureMedIdDesc: string;
  featureAdminTitle: string;
  featureAdminDesc: string;
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
  hospitalsSectionTitle: string;
  hospitalsSectionDesc: string;
  searchCityPlaceholder: string;
  searchHospitalsBtn: string;
  useMyGpsBtn: string;
  loadingHospitals: string;
  noHospitalsFound: string;
  verifiedCenterLabel: string;
  googlePlacesLabel: string;
  aiInformBtn: string;
  aiInformNearestBtn: string;
  aiInforming: string;
  aiInformSuccess: string;
  aiInformSymptomPlaceholder: string;
  sendHospitalWhatsApp: string;
  sendHospitalSms: string;
  callHospitalBtn: string;
  directionsBtn: string;
  icuBedsLabel: string;
  emergency24x7Label: string;
  ambulanceReadyLabel: string;
  dispatchLogSaved: string;
  dispatchLocalOnly: string;
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
  mobileNavMap: string;
  mobileNavAdmin: string;
  adminTitle: string;
  adminSubtitle: string;
  signInGoogle: string;
  signOutBtn: string;
  adminAccessRequired: string;
  signedInAs: string;
  tabDispatches: string;
  tabHospitals: string;
  importFromGoogle: string;
  addManualHospital: string;
  hospitalNameLabel: string;
  hospitalCategoryLabel: string;
  hospitalAddressLabel: string;
  hospitalPhoneLabel: string;
  hospitalLatLabel: string;
  hospitalLngLabel: string;
  icuBedsInputLabel: string;
  saveHospitalBtn: string;
  deleteBtn: string;
  verifiedLabel: string;
  pendingLabel: string;
  statusSent: string;
  statusAcknowledged: string;
  statusDispatched: string;
  statusResolved: string;
  noDispatchesYet: string;
}

export const TRANSLATIONS: Record<Language, TranslationBundle> = {
  gu: {
    subtitle: 'મેડિકલ SOS, Google હોસ્પિટલ મેપ અને AI ફર્સ્ટ-એઇડ',
    navSos: 'ઇમરજન્સી SOS',
    navDoctor: 'ડૉક્ટર દુબંગ AI',
    navHospitals: 'હોસ્પિટલ મેપ',
    navMedicalId: 'મેડિકલ ID',
    navAdmin: 'એડમિન પેનલ',
    backToHome: 'હોમ પર પાછા જાઓ',
    featuresGridTitle: 'બધી ઇમરજન્સી સુવિધાઓ',
    featureSosTitle: 'SOS અને GPS',
    featureSosDesc: 'લાઇવ લોકેશન શેર કરો',
    featureDoctorTitle: 'વૉઇસ AI ડૉક્ટર',
    featureDoctorDesc: 'લાઇવ ફર્સ્ટ-એઇડ મદદ',
    featureMapTitle: 'Google હોસ્પિટલ',
    featureMapDesc: 'નજીકના સેન્ટર જુઓ',
    featureAiInformTitle: 'AI હોસ્પિટલ એલર્ટ',
    featureAiInformDesc: 'દર્દી માટે તાત્કાલિક જાણ',
    featureMedIdTitle: 'મેડિકલ ID કાર્ડ',
    featureMedIdDesc: 'બ્લડ ગ્રુપ અને એલર્જી',
    featureAdminTitle: 'એડમિન પેનલ',
    featureAdminDesc: 'હોસ્પિટલ અને ડિસ્પેચ',
    callAmbulance: '108 એમ્બ્યુલન્સ કૉલ',
    callNational: '112 ઇમરજન્સી કૉલ',
    sosTitle: 'લાઇવ ઇમરજન્સી SOS',
    sosInstruction: 'લાઇવ GPS લોકેશન મોકલવા અને ડૉક્ટર દુબંગ સાથે વાત કરવા SOS દબાવો',
    tapHelp: 'મદદ માટે દબાવો',
    gpsFetching: 'GPS લોકેશન મેળવી રહ્યા છીએ...',
    gpsReady: 'લાઇવ GPS લોકેશન તૈયાર છે',
    gpsAccuracy: 'ચોકસાઈ',
    gpsErrorDenied: 'લોકેશનની પરવાનગી નથી. બ્રાઉઝરમાં GPS ચાલુ કરો અથવા સીધો 108/112 કૉલ કરો.',
    gpsErrorUnavailable: 'GPS ઉપલબ્ધ નથી. તમે હજી પણ WhatsApp અથવા SMS દ્વારા SOS સંદેશ મોકલી શકો છો.',
    whatsappSos: 'WhatsApp SOS',
    smsAlert: 'SMS એલર્ટ',
    copySos: 'સંદેશ કૉપિ કરો',
    copiedToast: 'SOS સંદેશ ક્લિપબોર્ડ પર કૉપિ થયો',
    findHospital: 'નજીકની હોસ્પિટલ અને એમ્બ્યુલન્સ શોધો',
    hospitalHelperTitle: 'નજીકની કટોકટી સેવાઓ (Google Maps)',
    openMapsHospitals: 'નજીકની ઇમરજન્સી હોસ્પિટલ ખોલો',
    openMapsAmbulance: 'નજીકની એમ્બ્યુલન્સ સેવા શોધો',
    hospitalsSectionTitle: 'Google હોસ્પિટલ મેપ અને AI હોસ્પિટલ જાણ',
    hospitalsSectionDesc: 'નજીકની Google હોસ્પિટલ અને વેરિફાઇડ હેલ્થ સેન્ટર જુઓ તથા દર્દીની સ્થિતિની તાત્કાલિક જાણ કરો',
    searchCityPlaceholder: 'શહેર અથવા વિસ્તાર લખો (દા.ત. અમદાવાદ, સુરત)...',
    searchHospitalsBtn: 'શોધો',
    useMyGpsBtn: 'મારું GPS વાપરો',
    loadingHospitals: 'Google પરથી નજીકની હોસ્પિટલ શોધી રહ્યા છીએ...',
    noHospitalsFound: 'નજીકની હોસ્પિટલ જોવા માટે "મારું GPS વાપરો" દબાવો અથવા શહેર શોધો.',
    verifiedCenterLabel: 'વેરિફાઇડ સેન્ટર',
    googlePlacesLabel: 'Google Maps',
    aiInformBtn: 'આ હોસ્પિટલને AI જાણ કરો',
    aiInformNearestBtn: 'AI દ્વારા નજીકની હોસ્પિટલને તાત્કાલિક જાણ કરો',
    aiInforming: 'AI હોસ્પિટલ માટે ઇમરજન્સી રિપોર્ટ બનાવી રહ્યું છે...',
    aiInformSuccess: 'AI ઇમરજન્સી હોસ્પિટલ ડિસ્પેચ તૈયાર છે',
    aiInformSymptomPlaceholder: 'દર્દીની તાત્કાલિક સ્થિતિ લખો (દા.ત. છાતીમાં દુખાવો, અકસ્માત)...',
    sendHospitalWhatsApp: 'હોસ્પિટલ WhatsApp',
    sendHospitalSms: 'હોસ્પિટલ SMS',
    callHospitalBtn: 'હોસ્પિટલ કૉલ',
    directionsBtn: 'રસ્તો જુઓ',
    icuBedsLabel: 'ICU બેડ',
    emergency24x7Label: '24/7 ઇમરજન્સી',
    ambulanceReadyLabel: 'એમ્બ્યુલન્સ ઉપલબ્ધ',
    dispatchLogSaved: 'એડમિન ડિસ્પેચ કન્સોલમાં લાઇવ નોંધાયેલ છે.',
    dispatchLocalOnly: 'નીચેના બટનથી સીધો કૉલ અથવા WhatsApp/SMS મોકલો (ડિસ્પેચ સેવ કરવા સાઇન-ઇન કરો).',
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
    thinkingLabel: 'ડૉક્ટર દુબંગ વિચારી રહ્યા છીએ...',
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
    mobileNavMap: 'હોસ્પિટલ',
    mobileNavAdmin: 'એડમિન',
    adminTitle: 'ડૉક્ટર દુબંગ એડમિન પેનલ',
    adminSubtitle: 'વેરિફાઇડ હોસ્પિટલ ડેટા, Google Maps ઇમ્પોર્ટ અને લાઇવ AI ડિસ્પેચ કન્સોલ',
    signInGoogle: 'Google સાથે એડમિન લૉગિન',
    signOutBtn: 'સાઇન આઉટ',
    adminAccessRequired: 'આ વિભાગ ફક્ત અધિકૃત એડમિન માટે છે.',
    signedInAs: 'લૉગિન એકાઉન્ટ:',
    tabDispatches: 'લાઇવ AI ડિસ્પેચ',
    tabHospitals: 'હોસ્પિટલ ડેટા મેનેજર',
    importFromGoogle: 'Google Maps પરથી હોસ્પિટલ શોધી ઉમેરો',
    addManualHospital: 'નવી હોસ્પિટલ / હેલ્થ સેન્ટર ઉમેરો',
    hospitalNameLabel: 'હોસ્પિટલનું નામ',
    hospitalCategoryLabel: 'પ્રકાર',
    hospitalAddressLabel: 'સરનામું',
    hospitalPhoneLabel: 'ઇમરજન્સી ફોન',
    hospitalLatLabel: 'Latitude',
    hospitalLngLabel: 'Longitude',
    icuBedsInputLabel: 'ICU બેડ',
    saveHospitalBtn: 'હોસ્પિટલ સાચવો',
    deleteBtn: 'કાઢી નાખો',
    verifiedLabel: 'વેરિફાઇડ',
    pendingLabel: 'અનવેરિફાઇડ',
    statusSent: 'મોકલાયેલ',
    statusAcknowledged: 'સ્વીકારાયેલ',
    statusDispatched: 'એમ્બ્યુલન્સ રવાના',
    statusResolved: 'પૂર્ણ',
    noDispatchesYet: 'હજી સુધી કોઈ AI ઇમરજન્સી ડિસ્પેચ એલર્ટ નથી.',
  },
  hi: {
    subtitle: 'मेडिकल SOS, Google अस्पताल मैप और AI प्राथमिक उपचार',
    navSos: 'आपातकालीन SOS',
    navDoctor: 'डॉक्टर दुबंग AI',
    navHospitals: 'अस्पताल मैप',
    navMedicalId: 'मेडिकल ID',
    navAdmin: 'एडमिन पैनल',
    backToHome: 'होम पर वापस जाएं',
    featuresGridTitle: 'सभी आपातकालीन सुविधाएं',
    featureSosTitle: 'SOS और GPS',
    featureSosDesc: 'लाइव लोकेशन भेजें',
    featureDoctorTitle: 'वॉइस AI डॉक्टर',
    featureDoctorDesc: 'लाइव प्राथमिक उपचार',
    featureMapTitle: 'Google अस्पताल',
    featureMapDesc: 'नज़दीकी केंद्र देखें',
    featureAiInformTitle: 'AI अस्पताल अलर्ट',
    featureAiInformDesc: 'मरीज़ की तुरंत सूचना',
    featureMedIdTitle: 'मेडिकल ID कार्ड',
    featureMedIdDesc: 'ब्लड ग्रुप और एलर्जी',
    featureAdminTitle: 'एडमिन पैनल',
    featureAdminDesc: 'अस्पताल और डिस्पैच',
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
    hospitalsSectionTitle: 'Google अस्पताल मैप और AI अस्पताल सूचना',
    hospitalsSectionDesc: 'नज़दीकी Google अस्पताल और सत्यापित स्वास्थ्य केंद्र देखें व मरीज़ की तुरंत सूचना भेजें',
    searchCityPlaceholder: 'शहर या क्षेत्र लिखें (जैसे अहमदाबाद, दिल्ली)...',
    searchHospitalsBtn: 'खोजें',
    useMyGpsBtn: 'मेरा GPS उपयोग करें',
    loadingHospitals: 'Google से नज़दीकी अस्पताल लोड हो रहे हैं...',
    noHospitalsFound: 'अस्पताल देखने के लिए "मेरा GPS उपयोग करें" दबाएं या शहर खोजें।',
    verifiedCenterLabel: 'सत्यापित केंद्र',
    googlePlacesLabel: 'Google Maps',
    aiInformBtn: 'इस अस्पताल को AI से सूचित करें',
    aiInformNearestBtn: 'AI से नज़दीकी अस्पताल को तुरंत सूचित करें',
    aiInforming: 'AI अस्पताल के लिए आपातकालीन रिपोर्ट तैयार कर रहा है...',
    aiInformSuccess: 'AI इमरजेंसी अस्पताल सूचना तैयार है',
    aiInformSymptomPlaceholder: 'आपातकालीन स्थिति लिखें (जैसे सीने में दर्द, दुर्घटना)...',
    sendHospitalWhatsApp: 'अस्पताल WhatsApp',
    sendHospitalSms: 'अस्पताल SMS',
    callHospitalBtn: 'अस्पताल कॉल',
    directionsBtn: 'रास्ता देखें',
    icuBedsLabel: 'ICU बेड',
    emergency24x7Label: '24/7 इमरजेंसी',
    ambulanceReadyLabel: 'एम्बुलेंस उपलब्ध',
    dispatchLogSaved: 'एडमिन डिस्पैच कंसोल में लाइव सहेजा गया।',
    dispatchLocalOnly: 'नीचे दिए बटन से सीधे कॉल या WhatsApp/SMS भेजें (डिस्पैच सेव करने के लिए साइन-इन करें)।',
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
    mobileNavMap: 'अस्पताल',
    mobileNavAdmin: 'एडमिन',
    adminTitle: 'डॉक्टर दुबंग एडमिन पैनल',
    adminSubtitle: 'सत्यापित अस्पताल डेटा, Google Maps इम्पोर्ट और लाइव AI डिस्पैच कंसोल',
    signInGoogle: 'Google से एडमिन लॉगिन',
    signOutBtn: 'साइन आउट',
    adminAccessRequired: 'यह अनुभाग केवल अधिकृत एडमिन के लिए है।',
    signedInAs: 'लॉगिन अकाउंट:',
    tabDispatches: 'लाइव AI डिस्पैच',
    tabHospitals: 'अस्पताल डेटा प्रबंधक',
    importFromGoogle: 'Google Maps से अस्पताल खोजकर जोड़ें',
    addManualHospital: 'नया अस्पताल / स्वास्थ्य केंद्र जोड़ें',
    hospitalNameLabel: 'अस्पताल का नाम',
    hospitalCategoryLabel: 'श्रेणी',
    hospitalAddressLabel: 'पता',
    hospitalPhoneLabel: 'आपातकालीन फोन',
    hospitalLatLabel: 'Latitude',
    hospitalLngLabel: 'Longitude',
    icuBedsInputLabel: 'ICU बेड',
    saveHospitalBtn: 'अस्पताल सहेजें',
    deleteBtn: 'हटाएं',
    verifiedLabel: 'सत्यापित',
    pendingLabel: 'असत्यापित',
    statusSent: 'भेजा गया',
    statusAcknowledged: 'स्वीकृत',
    statusDispatched: 'एम्बुलेंस रवाना',
    statusResolved: 'पूर्ण',
    noDispatchesYet: 'अभी तक कोई AI आपातकालीन डिस्पैच अलर्ट नहीं है।',
  },
  en: {
    subtitle: 'Medical SOS, Google Hospital Map & AI First-Aid',
    navSos: 'Emergency SOS',
    navDoctor: 'Doctor Dubang AI',
    navHospitals: 'Hospitals Map',
    navMedicalId: 'Medical ID',
    navAdmin: 'Admin Panel',
    backToHome: 'Back to Emergency Home',
    featuresGridTitle: 'All Emergency Features',
    featureSosTitle: 'SOS & Live GPS',
    featureSosDesc: 'Send coordinates fast',
    featureDoctorTitle: 'Voice AI Doctor',
    featureDoctorDesc: 'Two-way first aid',
    featureMapTitle: 'Google Hospital Map',
    featureMapDesc: 'Live ER & clinics',
    featureAiInformTitle: 'AI Self-Inform ER',
    featureAiInformDesc: 'Pre-arrival alert',
    featureMedIdTitle: 'Offline Medical ID',
    featureMedIdDesc: 'Blood & allergy card',
    featureAdminTitle: 'Admin Panel',
    featureAdminDesc: 'Hospitals & dispatch',
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
    hospitalsSectionTitle: 'Google Hospital Map & AI Hospital Self-Inform',
    hospitalsSectionDesc: 'View live Google hospitals & verified health centers and let AI prepare an instant pre-arrival patient alert',
    searchCityPlaceholder: 'Search city or area (e.g. Ahmedabad, Mumbai)...',
    searchHospitalsBtn: 'Search',
    useMyGpsBtn: 'Use My GPS',
    loadingHospitals: 'Loading nearby Google hospitals...',
    noHospitalsFound: 'Tap "Use My GPS" or search a city to load live hospital data.',
    verifiedCenterLabel: 'Verified Center',
    googlePlacesLabel: 'Google Maps',
    aiInformBtn: 'AI Inform This Hospital',
    aiInformNearestBtn: 'AI Self-Inform Nearest Hospital Now',
    aiInforming: 'AI is generating emergency hospital brief...',
    aiInformSuccess: 'AI Hospital Pre-Arrival Brief Ready',
    aiInformSymptomPlaceholder: 'Describe patient emergency (e.g. chest pain, road trauma)...',
    sendHospitalWhatsApp: 'WhatsApp Hospital',
    sendHospitalSms: 'SMS Hospital',
    callHospitalBtn: 'Call Hospital',
    directionsBtn: 'Directions',
    icuBedsLabel: 'ICU Beds',
    emergency24x7Label: '24/7 Emergency',
    ambulanceReadyLabel: 'Ambulance Ready',
    dispatchLogSaved: 'Logged live in the Admin Dispatch Console.',
    dispatchLocalOnly: 'Use the direct call or WhatsApp/SMS actions below (sign in to sync logs to Admin Panel).',
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
    mobileNavMap: 'Hospitals',
    mobileNavAdmin: 'Admin',
    adminTitle: 'Doctor Dubang Admin Panel',
    adminSubtitle: 'Verified hospital directory, Google Places import & live AI dispatch console',
    signInGoogle: 'Sign in with Google (Admin)',
    signOutBtn: 'Sign Out',
    adminAccessRequired: 'Admin privileges are required to manage hospitals and live dispatches.',
    signedInAs: 'Signed in as:',
    tabDispatches: 'Live AI Dispatches',
    tabHospitals: 'Hospital Directory',
    importFromGoogle: 'Search & Import from Google Maps',
    addManualHospital: 'Add Hospital / Health Center',
    hospitalNameLabel: 'Hospital Name',
    hospitalCategoryLabel: 'Category',
    hospitalAddressLabel: 'Address',
    hospitalPhoneLabel: 'Emergency Phone',
    hospitalLatLabel: 'Latitude',
    hospitalLngLabel: 'Longitude',
    icuBedsInputLabel: 'ICU Beds',
    saveHospitalBtn: 'Save Hospital',
    deleteBtn: 'Delete',
    verifiedLabel: 'Verified',
    pendingLabel: 'Unverified',
    statusSent: 'Sent',
    statusAcknowledged: 'Acknowledged',
    statusDispatched: 'Ambulance Dispatched',
    statusResolved: 'Resolved',
    noDispatchesYet: 'No AI emergency dispatches logged yet.',
  },
  es: {
    subtitle: 'SOS Médico, Mapa de Hospitales Google y Primeros Auxilios IA',
    navSos: 'SOS Emergencia',
    navDoctor: 'Doctor Dubang IA',
    navHospitals: 'Mapa Hospitales',
    navMedicalId: 'ID Médico',
    navAdmin: 'Panel Admin',
    backToHome: 'Volver al Inicio',
    featuresGridTitle: 'Todas las Funciones de Emergencia',
    featureSosTitle: 'SOS y GPS en Vivo',
    featureSosDesc: 'Enviar ubicación rápida',
    featureDoctorTitle: 'Doctor Voz IA',
    featureDoctorDesc: 'Primeros auxilios',
    featureMapTitle: 'Mapa Google',
    featureMapDesc: 'Hospitales cercanos',
    featureAiInformTitle: 'IA Aviso Hospital',
    featureAiInformDesc: 'Alerta pre-llegada',
    featureMedIdTitle: 'ID Médico Offline',
    featureMedIdDesc: 'Sangre y alergias',
    featureAdminTitle: 'Panel Admin',
    featureAdminDesc: 'Hospitales y alertas',
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
    hospitalsSectionTitle: 'Mapa de Hospitales Google y Aviso IA al Hospital',
    hospitalsSectionDesc: 'Explora hospitales en Google Maps y centros verificados, y genera un aviso clínico inmediato con IA',
    searchCityPlaceholder: 'Buscar ciudad o zona (ej. Madrid, Barcelona)...',
    searchHospitalsBtn: 'Buscar',
    useMyGpsBtn: 'Usar mi GPS',
    loadingHospitals: 'Cargando hospitales cercanos de Google...',
    noHospitalsFound: 'Toca "Usar mi GPS" o busca una ciudad para cargar hospitales.',
    verifiedCenterLabel: 'Centro Verificado',
    googlePlacesLabel: 'Google Maps',
    aiInformBtn: 'Avisar a este Hospital con IA',
    aiInformNearestBtn: 'IA: Avisar al Hospital Más Cercano',
    aiInforming: 'La IA está redactando la alerta médica...',
    aiInformSuccess: 'Alerta Pre-Llegada al Hospital Lista',
    aiInformSymptomPlaceholder: 'Describe la emergencia del paciente...',
    sendHospitalWhatsApp: 'WhatsApp Hospital',
    sendHospitalSms: 'SMS Hospital',
    callHospitalBtn: 'Llamar Hospital',
    directionsBtn: 'Cómo llegar',
    icuBedsLabel: 'Camas UCI',
    emergency24x7Label: 'Urgencias 24/7',
    ambulanceReadyLabel: 'Ambulancia Lista',
    dispatchLogSaved: 'Registrado en vivo en el Panel Admin.',
    dispatchLocalOnly: 'Usa los botones de llamada o WhatsApp/SMS abajo (inicia sesión para sincronizar con Admin).',
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
    mobileNavMap: 'Hospitales',
    mobileNavAdmin: 'Admin',
    adminTitle: 'Panel de Administración Doctor Dubang',
    adminSubtitle: 'Directorio de hospitales verificados, importación de Google Maps y despachos IA',
    signInGoogle: 'Iniciar Sesión con Google (Admin)',
    signOutBtn: 'Cerrar Sesión',
    adminAccessRequired: 'Se requieren permisos de administrador para gestionar hospitales y alertas.',
    signedInAs: 'Conectado como:',
    tabDispatches: 'Alertas IA en Vivo',
    tabHospitals: 'Directorio de Hospitales',
    importFromGoogle: 'Buscar e Importar de Google Maps',
    addManualHospital: 'Agregar Hospital / Centro de Salud',
    hospitalNameLabel: 'Nombre del Hospital',
    hospitalCategoryLabel: 'Categoría',
    hospitalAddressLabel: 'Dirección',
    hospitalPhoneLabel: 'Teléfono de Urgencias',
    hospitalLatLabel: 'Latitud',
    hospitalLngLabel: 'Longitud',
    icuBedsInputLabel: 'Camas UCI',
    saveHospitalBtn: 'Guardar Hospital',
    deleteBtn: 'Eliminar',
    verifiedLabel: 'Verificado',
    pendingLabel: 'Pendiente',
    statusSent: 'Enviado',
    statusAcknowledged: 'Recibido',
    statusDispatched: 'Ambulancia en Camino',
    statusResolved: 'Resuelto',
    noDispatchesYet: 'Aún no hay alertas de emergencia IA registradas.',
  },
};
