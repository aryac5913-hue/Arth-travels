import { useEffect, useRef, useState } from 'react'
import AdminDashboard, { createAdminSeed } from './AdminDashboard'
import { fetchPublishedTrips, getPublicFile, supabaseReady, type ManagedTrip, type TripCategory } from './lib/supabase'

type Language = 'en' | 'mr'
type Page = 'home' | 'destinations' | 'about' | 'contact' | 'memories' | 'admin'

const COMPANY = { phoneDisplay: '+91 98221 76664', phone: '+919822176664', whatsapp: '919822176664' }
const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${encodeURI(path.replace(/^\/+/, ''))}`

const img = {
  hero: 'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=1800&q=88',
  kerala: 'https://images.unsplash.com/photo-1661174607003-d9d36388c916?auto=format&fit=crop&w=900&q=84',
  rajasthan: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=900&q=84',
  india: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=900&q=84',
  desert: 'https://images.unsplash.com/photo-1616693139578-f1c17deb0d4f?auto=format&fit=crop&w=900&q=84',
  backwater: 'https://images.unsplash.com/photo-1633145284780-c8fda4f11464?auto=format&fit=crop&w=900&q=84',
  bali: 'https://images.unsplash.com/photo-1604999333679-b86d54738315?auto=format&fit=crop&w=900&q=84',
  coast: 'https://images.unsplash.com/photo-1573790387438-4da905039392?auto=format&fit=crop&w=900&q=84',
  temple: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=900&q=84',
  airport: 'https://images.unsplash.com/photo-1503365194569-df4e1d04cec1?auto=format&fit=crop&w=900&q=84',
  terminal: 'https://images.unsplash.com/photo-1532968899863-5b52ef155913?auto=format&fit=crop&w=900&q=84',
  team: 'https://images.unsplash.com/photo-1564632302816-7209ba3d415d?auto=format&fit=crop&w=900&q=84',
  friends: 'https://images.unsplash.com/photo-1590767602124-234d1714ed92?auto=format&fit=crop&w=1200&q=84',
  roadtrip: 'https://images.unsplash.com/photo-1517214179493-097cafdee65f?auto=format&fit=crop&w=900&q=84',
  beach: 'https://images.unsplash.com/photo-1562960032-108a6c6c4896?auto=format&fit=crop&w=900&q=84',
}

const content = {
  en: {
    nav: ['Home', 'Destinations', 'About Us', 'Contact Us'],
    menu: 'Open menu', close: 'Close menu',
    eyebrow: 'Thoughtful journeys, beautifully planned',
    heroTitle: 'Your Journey, Our Passion.',
    heroText: 'We turn the places on your wish list into journeys you will always remember—planned with care, warmth, and local insight.',
    explore: 'Explore destinations', memoriesLink: 'View travel memories',
    introKicker: 'Welcome to Arth Travels', introTitle: 'Thoughtful travel, made simple.',
    introText: 'Tell us what you want to experience. We’ll shape the journey around you, from the first idea to the final stop.',
    videoKicker: 'Travel moments', videoTitle: 'Joy looks good from here.',
    videoText: 'A few moments from our journeys. Explore more in Travel Memories.',
    playWithSound: 'Play with sound',
    travelMemory: 'Travel memory', videoCollection: 'Travel memories videos',
    sampleVideo: 'Sample travel video', preview: 'Preview',
    destinationsKicker: 'Find your next place', destinationsTitle: 'Journeys for every kind of traveller.',
    destinationsText: 'Choose a travel style below to explore itineraries and destinations.',
    domestic: 'Domestic Travel', domesticText: 'Explore every destination in our supplied domestic itinerary collection. Open a poster to view the complete day-by-day plan.',
    international: 'International Travel', internationalText: 'Explore 11 international tour plans, from Thailand and Bhutan to Southeast Asia and Sri Lanka. Choose a destination photo, then open its itinerary; English and Marathi versions are shown where supplied.',
    corporate: 'MICE Travel', corporateText: 'MICE itineraries are coming soon. We are preparing tailored corporate travel experiences for your team—please check back shortly.', comingSoon: 'Coming soon',
    pilgrimage: 'Pilgrimage Tour', pilgrimageText: 'Explore Char Dham, Kashi–Prayagraj–Ayodhya, Gaya, and Chitrakoot routes from the supplied itineraries.',
    itinerary: 'Itinerary', viewItinerary: 'View itinerary', closeItinerary: 'Close itinerary', itineraryLanguage: 'Itinerary language', destinationPhoto: 'Destination photo', suppliedLanguageOnly: 'This itinerary is not available in the selected language; showing the available poster.',
    aboutKicker: 'Our story, since 5 January 2026', aboutTitle: 'Travel that takes you closer to the stories of a place.',
    aboutIntro: 'Arth Travels began on 5 January 2026. Since then, we have welcomed more than 2,000 people on family, couple, solo, group and corporate journeys.',
    founderKicker: 'Meet our founder', founderName: 'Anand Dave', founderRole: 'Founder, Arth Travels · Community leader',
    founderBio: 'A Pune-based public speaker and community figure, Anand is the founding president of Hindu Mahasangh. Since Arth Travels began on 5 January 2026, he has helped welcome more than 2,000 travellers. His interest in people, culture and history shapes journeys that go beyond the usual sightseeing.',
    storyKicker: 'Go beyond the postcard', storyTitle: 'Every place has a story worth hearing.',
    storyText: 'Our journeys are designed to make room for the history behind a destination. At Cellular Jail in the Andaman Islands, Anand shares a talk about Veer Savarkar—so a visit can become a moment of learning and reflection, not just a photo stop.',
    journeyKicker: 'Our journey so far', journeyTitle: '2,000+ people. Countless stories. One journey with Arth.',
    travellersValue: '2,000+', travellersLabel: 'Travellers', travellersCopy: 'Family, couple, solo and group journeys',
    monthsValue: '10', monthsLabel: 'Months', monthsCopy: 'Of creating memorable experiences',
    corporateValue: '5', corporateLabel: 'Corporate trips', corporateCopy: 'Building connections through travel',
    futureValue: '∞', futureLabel: 'More journeys ahead', futureCopy: 'And countless memories yet to create',
    contactKicker: 'Let’s talk travel', contactTitle: 'Your next journey can start with a conversation.',
    contactText: 'Call or message Arth Travels and tell us where you would love to go.',
    phone: 'Phone', call: 'Call us', whatsapp: 'Chat on WhatsApp',
    notConfigured: 'Contact number to be provided by client',
    whatsappMessage: 'Hi Arth Travels, I’m interested in planning a trip. ',
    memoriesKicker: 'Travel memories', memoriesTitle: 'Happy Customers, Beautiful Memories.',
    memoriesText: 'A collection of travel moments captured on the water, on the trail, and along the way.',
    sampleAsset: 'Sample image — replace with approved customer photo', gallery: 'Memory gallery',
    videoCount: '16 videos',
    homeMemoryTitles: ['Andaman tour', 'A Quiet Day on the Water', 'A Boat Ride Together'],
    memoryVideoTitles: ['A Green Escape', 'Walking the Island Trail', 'Views Along the Way', 'A Journey to Remember', 'A Shaded Forest Walk', 'Valley Under the Clouds', 'Along the Pine Trail', 'An Evening Together', 'The Trail Downhill', 'A Quiet Mountain Path', 'A Forest Pause', 'A Riverside Stroll', 'Steps to the Shrine', 'Prayer Flags on the Hillside', 'Misty Mountain Views', 'A Landmark Above the Valley'],
    feedback: 'Customer feedback', feedbackText: 'Reserved for approved customer feedback. No testimonial has been added.',
    videoPlaceholder: 'Approved customer travel video will be added here.',
    footerText: 'Thoughtful journeys, planned with care.', quickLinks: 'Explore', contactLabel: 'Contact',
    memories: 'Travel Memories', rights: 'Arth Travels. All rights reserved.', credit: 'Sample photography from Unsplash',
  },
  mr: {
    nav: ['मुख्यपृष्ठ', 'पर्यटनस्थळे', 'आमच्याबद्दल', 'संपर्क'],
    menu: 'मेनू उघडा', close: 'मेनू बंद करा',
    eyebrow: 'सुंदर नियोजन, मनापासून प्रवास',
    heroTitle: 'तुमचा प्रवास, आमची आवड.',
    heroText: 'तुमच्या इच्छा यादीतील ठिकाणांना आम्ही प्रेमळ नियोजन, स्थानिक माहिती आणि काळजीपूर्वक अविस्मरणीय प्रवासात रूपांतरित करतो.',
    explore: 'पर्यटनस्थळे पाहा', memoriesLink: 'प्रवासाच्या आठवणी पाहा',
    introKicker: 'Arth Travels मध्ये स्वागत आहे', introTitle: 'विचारपूर्वक प्रवास, सहज नियोजन.',
    introText: 'तुम्हाला काय अनुभवायचे आहे ते सांगा. तुमच्या आवडीनुसार आम्ही प्रवास आखू—पहिल्या कल्पनेपासून शेवटच्या ठिकाणापर्यंत.',
    videoKicker: 'प्रवासातील क्षण', videoTitle: 'आनंदाचे क्षण, आठवणींची साथ.',
    videoText: 'प्रवासातील काही सुंदर क्षण. आणखी आठवणी पाहा.',
    playWithSound: 'आवाजासह पाहा',
    travelMemory: 'प्रवासाची आठवण', videoCollection: 'प्रवासाच्या आठवणींचे व्हिडिओ',
    sampleVideo: 'नमुना प्रवास व्हिडिओ', preview: 'पूर्वावलोकन',
    destinationsKicker: 'पुढचे ठिकाण शोधा', destinationsTitle: 'प्रत्येक प्रवाशासाठी खास प्रवास.',
    destinationsText: 'प्रवासाचे नियोजन आणि ठिकाणे पाहण्यासाठी खालील प्रकारांपैकी एक निवडा.',
    domestic: 'देशांतर्गत प्रवास', domesticText: 'उपलब्ध देशांतर्गत प्रवास नियोजनातील सर्व ठिकाणे पाहा. प्रत्येक पोस्टर उघडून दिवसानुसार संपूर्ण कार्यक्रम वाचा.',
    international: 'आंतरराष्ट्रीय प्रवास', internationalText: 'थायलंड आणि भूतानपासून आग्नेय आशिया व श्रीलंकेपर्यंतच्या ११ सहली पाहा. ठिकाणाचे छायाचित्र निवडून प्रवास कार्यक्रम उघडा; उपलब्ध इंग्रजी किंवा मराठी आवृत्ती दाखवली जाईल.',
    corporate: 'MICE प्रवास', corporateText: 'MICE सहलींचे नियोजन लवकरच उपलब्ध होईल. खास कॉर्पोरेट प्रवास अनुभव तयार करत आहोत—कृपया लवकरच पुन्हा भेट द्या.', comingSoon: 'लवकरच येत आहे',
    pilgrimage: 'तीर्थयात्रा', pilgrimageText: 'उपलब्ध नियोजनात चारधाम, काशी–प्रयागराज–अयोध्या, गया आणि चित्रकूट यात्रांचा समावेश आहे.',
    itinerary: 'प्रवास कार्यक्रम', viewItinerary: 'प्रवास कार्यक्रम पाहा', closeItinerary: 'प्रवास कार्यक्रम बंद करा', itineraryLanguage: 'प्रवास कार्यक्रमाची भाषा', destinationPhoto: 'पर्यटनस्थळाचे छायाचित्र', suppliedLanguageOnly: 'निवडलेल्या भाषेतील कार्यक्रम उपलब्ध नाही; उपलब्ध पोस्टर दाखवले आहे.',
    aboutKicker: '५ जानेवारी २०२६ पासूनचा आमचा प्रवास', aboutTitle: 'प्रवास, जो ठिकाणांच्या कथा जवळ आणतो.',
    aboutIntro: 'Arth Travels ची सुरुवात ५ जानेवारी २०२६ रोजी झाली. तेव्हापासून कौटुंबिक, जोडप्यांच्या, एकट्याने, समूह आणि कॉर्पोरेट सहलींमधून २,००० हून अधिक प्रवाशांनी आमच्यासोबत प्रवास केला आहे.',
    founderKicker: 'आमचे संस्थापक', founderName: 'Anand Dave', founderRole: 'संस्थापक, Arth Travels · समाजाभिमुख व्यक्तिमत्त्व',
    founderBio: 'पुण्यातील सार्वजनिक वक्ते आणि समाजाभिमुख व्यक्तिमत्त्व असलेले Anand हे Hindu Mahasangh चे संस्थापक अध्यक्ष आहेत. ५ जानेवारी २०२६ रोजी Arth Travels सुरू झाल्यापासून त्यांनी २,००० हून अधिक प्रवाशांचे स्वागत केले आहे. लोक, संस्कृती आणि इतिहासाविषयीची त्यांची आस्था सहलींना नेहमीच्या पर्यटनापलीकडे घेऊन जाते.',
    storyKicker: 'फक्त दृश्यांपलीकडे', storyTitle: 'प्रत्येक ठिकाणाची एक कथा असते.',
    storyText: 'प्रत्येक स्थळामागचा इतिहास जाणून घेण्यासाठी आमच्या सहलींमध्ये वेळ राखला जातो. अंदमानमधील सेल्युलर जेल येथे Anand वीर सावरकरांवर मनोगत मांडतात—म्हणून ती भेट केवळ फोटोचा थांबा न राहता शिकण्याचा आणि चिंतनाचा अनुभव बनते.',
    journeyKicker: 'आतापर्यंतचा प्रवास', journeyTitle: '२,०००+ प्रवासी. असंख्य कथा. Arth सोबतचा एक प्रवास.',
    travellersValue: '२,०००+', travellersLabel: 'प्रवासी', travellersCopy: 'कुटुंब, जोडपी, एकल आणि समूह सहली',
    monthsValue: '१०', monthsLabel: 'महिने', monthsCopy: 'अविस्मरणीय अनुभव घडवताना',
    corporateValue: '५', corporateLabel: 'कॉर्पोरेट सहली', corporateCopy: 'प्रवासातून नाती दृढ करत',
    futureValue: '∞', futureLabel: 'आणखी अनेक सहली', futureCopy: 'आणि नव्या आठवणी अजून घडायच्या आहेत',
    contactKicker: 'चला, प्रवासाबद्दल बोलूया', contactTitle: 'तुमच्या पुढच्या प्रवासाची सुरुवात एका संवादाने होऊ शकते.',
    contactText: 'Arth Travels ला फोन किंवा संदेश करून तुम्हाला कुठे जायचे आहे ते सांगा.',
    phone: 'फोन', call: 'आम्हाला कॉल करा', whatsapp: 'WhatsApp वर संदेश करा',
    notConfigured: 'संपर्क क्रमांक ग्राहकाकडून मिळणे बाकी आहे',
    whatsappMessage: 'नमस्कार Arth Travels, मला सहलीचे नियोजन करायचे आहे. कृपया ठिकाणे आणि पॅकेजची माहिती पाठवा.',
    memoriesKicker: 'प्रवासाच्या आठवणी', memoriesTitle: 'आनंदी ग्राहक, सुंदर आठवणी.',
    memoriesText: 'पाण्यावर, हिरवळीच्या पायवाटांवर आणि प्रवासात टिपलेले सुंदर क्षण.',
    sampleAsset: 'नमुना चित्र — मान्यताप्राप्त ग्राहक फोटोने बदला', gallery: 'आठवणींची गॅलरी',
    videoCount: '१६ व्हिडिओ',
    homeMemoryTitles: ['अंदमान सहल', 'पाण्यावरचा निवांत दिवस', 'एकत्र केलेली बोट सफर'],
    memoryVideoTitles: ['हिरवाईतली सहल', 'बेटाच्या पायवाटेवर', 'प्रवासातील निसर्गदृश्ये', 'आठवणीत राहणारा प्रवास', 'झाडीतून जाणारी पायवाट', 'ढगांखालील दरी', 'पाइनच्या झाडांमधून', 'एकत्र घालवलेली संध्याकाळ', 'डोंगरउताराची वाट', 'डोंगरातील शांत पायवाट', 'जंगलातील निवांत क्षण', 'नदीकाठची सहल', 'मंदिराकडे जाणाऱ्या पायऱ्या', 'डोंगरावरील प्रार्थना ध्वज', 'धुक्यात हरवलेले डोंगर', 'दरीवरील उंच ठिकाण'],
    feedback: 'ग्राहक अभिप्राय', feedbackText: 'मान्यताप्राप्त ग्राहक अभिप्रायासाठी राखीव. कोणताही बनावट अभिप्राय जोडलेला नाही.',
    videoPlaceholder: 'मान्यताप्राप्त ग्राहक प्रवास व्हिडिओ येथे जोडला जाईल.',
    footerText: 'काळजीपूर्वक नियोजित, मनापासून प्रवास.', quickLinks: 'पाहा', contactLabel: 'संपर्क',
    memories: 'प्रवासाच्या आठवणी', rights: 'Arth Travels. सर्व हक्क राखीव.', credit: 'Unsplash वरील नमुना छायाचित्रे',
  },
}

const destinationNames = {
  en: {
    domestic: ['Maharashtra', 'Rajasthan', 'Kerala', 'Goa', 'Kashmir', 'Himachal Pradesh'],
    international: ['Dubai', 'Bali', 'Singapore', 'Thailand', 'Europe'],

    pilgrimage: ['Yamunotri', 'Gangotri', 'Kedarnath', 'Badrinath'],
  },
  mr: {
    domestic: ['महाराष्ट्र', 'राजस्थान', 'केरळ', 'गोवा', 'काश्मीर', 'हिमाचल प्रदेश'],
    international: ['दुबई', 'बाली', 'सिंगापूर', 'थायलंड', 'युरोप'],

    pilgrimage: ['यमुनोत्री', 'गंगोत्री', 'केदारनाथ', 'बद्रीनाथ'],
  },
}

const destinationImages = {
  domestic: [img.india, img.rajasthan, img.kerala, img.backwater, img.desert, img.hero],
  international: [img.temple, img.bali, img.coast, img.roadtrip, img.rajasthan],

  pilgrimage: [
    'https://upload.wikimedia.org/wikipedia/commons/b/b0/Kedarnathji-mandir.JPG',
    'https://upload.wikimedia.org/wikipedia/commons/2/22/Ganges_river_at_Varanasi_2008.jpeg',
    'https://upload.wikimedia.org/wikipedia/commons/8/8e/Mahabodhi_Temple_Bodh_Gaya_Bihar_India.jpg',
    'https://images.beyondyatra.com/dest/chitrakoot/places/ram-ghat-madhya-pradesh-india_img_1.jpg',
  ],
}

type ItineraryTrip = { id: string; en: string; mr: string; thumbnail: string; english?: string; marathi?: string; published?: boolean; category?: TripCategory }
const domesticTrips: ItineraryTrip[] = [
  { id:'three-sisters', en:'Three Sisters · Assam, Meghalaya & Arunachal Pradesh', mr:'तीन भगिनी · आसाम, मेघालय आणि अरुणाचल प्रदेश', thumbnail:assetUrl('assets/Domestic/thumbnails/three-sisters.png'), english:'Domestic/3 sisters/3 sisters.jpg', marathi:'Domestic/3 sisters/3 sisters(marathi).jpg' },
  { id:'andaman-nicobar', en:'Andaman & Nicobar Islands', mr:'अंदमान आणि निकोबार बेटे', thumbnail:assetUrl('assets/Domestic/thumbnails/andaman-nicobar.png'), english:'Domestic/Andaman and Nicobar/Andaman and nicobar(eng).jpg', marathi:'Domestic/Andaman and Nicobar/Anadaman and nicobar(marathi).jpg' },
  { id:'andaman', en:'Andaman Island Tour', mr:'अंदमान बेट सहल', thumbnail:assetUrl('assets/Domestic/thumbnails/andaman-island.png'), english:'Domestic/Andaman and Nicobar/Andaman(eng).jpg', marathi:'Domestic/Andaman and Nicobar/Andaman (marathi).jpg' },
  { id:'coastal-karnataka', en:'Coastal Karnataka', mr:'किनारी कर्नाटक', thumbnail:assetUrl('assets/Domestic/thumbnails/coastal-karnataka.png'), english:'Domestic/Coastal Karnataka/coastal karnataka(eng).jpg', marathi:'Domestic/Coastal Karnataka/coastal karnataka.jpg' },
  { id:'delhi-agra-jaipur', en:'Delhi · Agra · Jaipur', mr:'दिल्ली · आग्रा · जयपूर', thumbnail:'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=900&q=84', english:'Domestic/Delhi-Agra-jaipur/Delhi-Agra-jaipur(eng).jpg', marathi:'Domestic/Delhi-Agra-jaipur/Delhi-Agra-jaipur.jpg' },
  { id:'delhi-agra-mathura-amritsar', en:'Delhi · Agra · Mathura · Amritsar', mr:'दिल्ली · आग्रा · मथुरा · अमृतसर', thumbnail:assetUrl('assets/Domestic/thumbnails/delhi-agra-mathura.png'), english:'Domestic/Delhi-Agra-Mathura-Amritsar/Delhi-Agra-Mathura-Amritsar (eng).jpg', marathi:'Domestic/Delhi-Agra-Mathura-Amritsar/Delhi-Agra-Mathura-Amritsar.jpg' },
  { id:'hyderabad', en:'Hyderabad', mr:'हैदराबाद', thumbnail:'https://images.unsplash.com/photo-1696941515998-d83f24967aca?auto=format&fit=crop&w=900&q=84', marathi:'Domestic/Hyderabad/Hyderabad.jpg' },
  { id:'kerala', en:'Kerala', mr:'केरळ', thumbnail:img.kerala, english:'Domestic/Kerala/kerala(eng).jpg', marathi:'Domestic/Kerala/kerala(marathi).jpg' },
  { id:'kerala-rameshwaram-madurai', en:'Kerala · Rameshwaram · Madurai', mr:'केरळ · रामेश्वरम · मदुराई', thumbnail:assetUrl('assets/Domestic/thumbnails/kerala-rameshwaram-madurai.png'), english:'Domestic/Kerala-Rameshwaram-Madurai/Kerala-rameshwaram-madurai(eng).jpg', marathi:'Domestic/Kerala-Rameshwaram-Madurai/Kerala-rameshwaram-madurai(marathi).jpg' },
  { id:'lakshadweep', en:'Lakshadweep', mr:'लक्षद्वीप', thumbnail:assetUrl('assets/Domestic/thumbnails/lakshadweep.png'), english:'Domestic/Lakshadweep/Lakshadweep.jpg' },
  { id:'leh-ladakh', en:'Leh Ladakh', mr:'लेह लडाख', thumbnail:assetUrl('assets/Domestic/thumbnails/leh-ladakh.png'), english:'Domestic/Leh Ladakh/Leh Ladakh(eng).jpg', marathi:'Domestic/Leh Ladakh/Leh Ladakh(marathi).jpg' },
  { id:'meghalaya', en:'Meghalaya', mr:'मेघालय', thumbnail:assetUrl('assets/Domestic/thumbnails/meghalaya.png'), english:'Domestic/Meghalya/Meghalya.jpg' },
  { id:'odisha', en:'Odisha', mr:'ओडिशा', thumbnail:assetUrl('assets/Domestic/thumbnails/odisha.png'), english:'Domestic/Odisha/odisha(eng).jpg', marathi:'Domestic/Odisha/odisha.jpg' },
  { id:'pathankot-dalhousie', en:'Pathankot · Dalhousie', mr:'पठाणकोट · डलहौसी', thumbnail:assetUrl('assets/Domestic/thumbnails/pathankot-dalhousie.png'), english:'Domestic/Pathankot Dalhouse/pathankot dalhouse(eng).jpg', marathi:'Domestic/Pathankot Dalhouse/Pathankot dalhouse.jpg' },
  { id:'rajasthan', en:'Rajasthan · Mewar', mr:'राजस्थान · मेवाड', thumbnail:img.rajasthan, english:'Domestic/Rajasthan/Rajasthan.jpg', marathi:'Domestic/Rajasthan/Rajasthan(marathi).jpg' },
  { id:'shimla-kullu-manali', en:'Shimla · Kullu · Manali', mr:'शिमला · कुल्लू · मनाली', thumbnail:'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=84', english:'Domestic/Shimla-kullu-manali/Shimla-kullu-manali(eng).jpg', marathi:'Domestic/Shimla-kullu-manali/Shimla-kullu-manali(marathi).jpg' },
  { id:'sikkim-darjeeling', en:'Sikkim · Darjeeling', mr:'सिक्कीम · दार्जिलिंग', thumbnail:'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=84', english:'Domestic/Sikkim-Darjeeling/Sikkim-Darjeeling.jpg', marathi:'Domestic/Sikkim-Darjeeling/Sikkim-Darjeeling(marathi).jpg' },
  { id:'spiti-valley', en:'Spiti Valley', mr:'स्पिती व्हॅली', thumbnail:assetUrl('assets/Domestic/thumbnails/spiti-valley.png'), english:'Domestic/Spiti Valley/spiti valley.jpg', marathi:'Domestic/Spiti Valley/spiti valley(marathi).jpg' },
]

const internationalTrips: ItineraryTrip[] = [
  { id:'bangkok-pattaya', en:'Bangkok · Pattaya · 4 Nights / 5 Days', mr:'बँकॉक · पटाया · ४ रात्री / ५ दिवस', thumbnail:'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=900&q=84', english:'International/Bangkok-pattaya/Bangkok-pattaya.jpg', marathi:'International/Bangkok-pattaya/Bangkok-pattaya(marathi).jpg' },
  { id:'bhutan', en:'Bhutan · 6 Nights / 7 Days', mr:'भूतान · ६ रात्री / ७ दिवस', thumbnail:'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=84', english:'International/Bhutan/bhutan(eng).jpg', marathi:'International/Bhutan/bhutan(marathi).jpg' },
  { id:'cambodia-vietnam', en:'Cambodia · Vietnam · 10 Nights / 11 Days', mr:'कंबोडिया · व्हिएतनाम · १० रात्री / ११ दिवस', thumbnail:assetUrl('assets/International/thumbnails/cambodia-vietnam.jpg'), english:'International/Vietnam/vietnam(english).jpg', marathi:'International/Cambodia and vietnam/Cambodia and vietnam.jpg' },
  { id:'dubai', en:'Dubai · 4 Nights / 5 Days', mr:'दुबई · ४ रात्री / ५ दिवस', thumbnail:assetUrl('assets/International/thumbnails/dubai.jpg'), english:'International/Dubai/Dubai 4nights 5days (English).png', marathi:'International/Dubai/Dubai(marathi).jpg' },
  { id:'dubai-abu-dhabi', en:'Dubai · Abu Dhabi · 5 Nights / 6 Days', mr:'दुबई · अबू धाबी · ५ रात्री / ६ दिवस', thumbnail:assetUrl('assets/International/thumbnails/dubai-abu-dhabi.jpg'), english:'International/Dubai-abudhabi/Dubai-abudhabi(eng).jpg', marathi:'International/Dubai-abudhabi/Dubai-abudhabi.jpg' },
  { id:'enchanting-vietnam', en:'Enchanting Vietnam · 8 Nights / 9 Days', mr:'एनचॅंटिंग व्हिएतनाम · ८ रात्री / ९ दिवस', thumbnail:assetUrl('assets/International/thumbnails/enchanting-vietnam.jpg'), english:'International/Enchanting vietnam and phuc/enchanting vietnam(eng).jpg', marathi:'International/Enchanting vietnam and phuc/enchanting viet.jpg' },
  { id:'vietnam-phu-quoc', en:'Vietnam with Phu Quoc · 10 Nights / 11 Days', mr:'फु क्वोकसह व्हिएतनाम · १० रात्री / ११ दिवस', thumbnail:assetUrl('assets/International/thumbnails/vietnam-phu-quoc.jpg'), marathi:'International/Enchanting vietnam and phuc/enchanting vietnam.jpg' },
  { id:'singapore-malaysia', en:'Singapore · Malaysia · 7 Nights / 8 Days', mr:'सिंगापूर · मलेशिया · ७ रात्री / ८ दिवस', thumbnail:assetUrl('assets/International/thumbnails/singapore-malaysia.jpg'), english:'International/Singapore & Malaysia/singapore and malayasia(eng).jpg', marathi:'International/Singapore & Malaysia/singapore and malayasia 2.jpg' },
  { id:'singapore-malaysia-short', en:'Singapore · Malaysia · 5 Nights / 6 Days', mr:'सिंगापूर · मलेशिया · ५ रात्री / ६ दिवस', thumbnail:assetUrl('assets/International/thumbnails/singapore-malaysia.jpg'), english:'International/Singapore & Malaysia/Singapore Malaysia 5days 6nights (English).png', marathi:'International/Singapore & Malaysia/Singapore and malaysia(marathi).jpg' },
  { id:'sri-lanka', en:'Sri Lanka · 5 Nights / 6 Days', mr:'श्रीलंका · ५ रात्री / ६ दिवस', thumbnail:assetUrl('assets/International/thumbnails/sri-lanka.jpg'), english:'International/Srilanka/srilanka(eng).jpg', marathi:'International/Srilanka/Srilanka.jpg' },
  { id:'vietnam', en:'Vietnam · 6 Nights / 7 Days', mr:'व्हिएतनाम · ६ रात्री / ७ दिवस', thumbnail:assetUrl('assets/International/thumbnails/vietnam.jpg'), english:'International/Vietnam/Vietnam 6days 7nights (English).png', marathi:'International/Vietnam/Vietnam marathi.jpg' },
]

const pilgrimageTrips: ItineraryTrip[] = [
  { id:'char-dham', en:'Char Dham Yatra · 11 Nights / 12 Days', mr:'चारधाम यात्रा · ११ रात्री / १२ दिवस', thumbnail:assetUrl('assets/Pilgrimage/thumbnails/char-dham-collage.png'), english:'Pilgrimage/Char Dhaam yatra/Char Dhaam yatra(eng).jpg', marathi:'Pilgrimage/Char Dhaam yatra/Char Dhaam yatra(marathi).jpg' },
  { id:'kashi-prayagraj-ayodhya', en:'Kashi · Prayagraj · Ayodhya', mr:'काशी · प्रयागराज · अयोध्या', thumbnail:assetUrl('assets/Pilgrimage/thumbnails/ayodhya-ram-mandir.png'), english:'Pilgrimage/Kashi-prayagraj-ayoydhya/Kashi-prayagraj-ayoydhya(eng).jpg', marathi:'Pilgrimage/Kashi-prayagraj-ayoydhya/Kashi-praygraj-ayoydhya(marathi).jpg' },
  { id:'kashi-prayagraj-ayodhya-gaya', en:'Kashi · Prayagraj · Ayodhya · Gaya', mr:'काशी · प्रयागराज · अयोध्या · गया', thumbnail:destinationImages.pilgrimage[1], english:'Pilgrimage/Kashi-prayagraj-ayoydhya-gaya/Kashi-prayagraj-ayoydhya-gaya(eng).jpg', marathi:'Pilgrimage/Kashi-prayagraj-ayoydhya-gaya/Kashi-prayagraj-ayoydhya-gaya.jpg' },
  { id:'kashi-prayagraj-ayodhya-chitrakoot', en:'Kashi · Prayagraj · Ayodhya · Chitrakoot', mr:'काशी · प्रयागराज · अयोध्या · चित्रकूट', thumbnail:assetUrl('assets/Pilgrimage/thumbnails/varanasi-ghats.png'), english:'Pilgrimage/Kashi-praygraj-ayoydhya-chitrakoot/Kashi-praygraj-ayoydhya-chitrakoot(eng).jpg', marathi:'Pilgrimage/Kashi-praygraj-ayoydhya-chitrakoot/Kashi-praygraj-ayoydhya-chitrakoot(marathi).jpg' },
]

function itineraryFor(trip: ItineraryTrip, language: Language) {
  const path = language === 'mr' ? (trip.marathi || trip.english) : (trip.english || trip.marathi)
  return path ? (/^https?:\/\//i.test(path) ? path : assetUrl(`assets/${path}`)) : ''
}

function managedTripToDisplay(trip: ManagedTrip): ItineraryTrip {
  return {
    id: trip.id, en: trip.name_en, mr: trip.name_mr || trip.name_en,
    thumbnail: getPublicFile(trip.thumbnail_path),
    english: getPublicFile(trip.itinerary_en_path), marathi: getPublicFile(trip.itinerary_mr_path),
    published: trip.published, category: trip.category,
  }
}

function mergeManagedTrips(defaults: ItineraryTrip[], managed: ManagedTrip[], category: TripCategory) {
  const saved = new Map(managed.filter(item => item.category === category).map(item => [item.id, item]))
  const seen = new Set<string>()
  const output = defaults.flatMap(item => {
    seen.add(item.id)
    const replacement = saved.get(item.id)
    if (replacement) return replacement.published ? [managedTripToDisplay(replacement)] : []
    return [item]
  })
  for (const item of managed) if (item.category === category && item.published && !seen.has(item.id)) output.push(managedTripToDisplay(item))
  return output
}

function getPage(): Page {
  const page = window.location.hash.replace('#/', '') as Page
  return ['home', 'destinations', 'about', 'contact', 'memories', 'admin'].includes(page) ? page : 'home'
}

function Link({ page, className = '', children, onClick }: { page: Page; className?: string; children: React.ReactNode; onClick?: () => void }) {
  return <a className={className} href={`#/${page}`} onClick={onClick}>{children}</a>
}
function Arrow() { return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 6l4 4-4 4" /></svg> }

function Brand({ compact = false }: { compact?: boolean }) {
  return <Link page="home" className={`brand ${compact ? 'brand--compact' : ''}`}>
    <span className="brand__mark"><img src={assetUrl('assets/client-logo.png')} alt="" /></span>
    <span className="brand__type"><strong>Arth</strong><small>Travels</small></span>
  </Link>
}

function Header({ language, setLanguage, page }: { language: Language; setLanguage: (l: Language) => void; page: Page }) {
  const [open, setOpen] = useState(false)
  const t = content[language]
  const pages: Page[] = ['home', 'destinations', 'about', 'contact']
  const Switcher = ({ mobile = false }) => <div className={`language ${mobile ? 'mobile-language' : 'desktop-language'}`}>
    <button className={language === 'en' ? 'selected' : ''} onClick={() => setLanguage('en')}>English</button><span>|</span>
    <button className={language === 'mr' ? 'selected' : ''} onClick={() => setLanguage('mr')}>मराठी</button>
  </div>
  return <header className="site-header"><div className="header-inner">
    <Brand />
    <nav className={`main-nav ${open ? 'is-open' : ''}`} aria-label="Main navigation">
      {pages.map((target, i) => <Link key={target} page={target} className={page === target ? 'active' : ''} onClick={() => setOpen(false)}>{t.nav[i]}</Link>)}
      <Switcher mobile />
    </nav>
    <div className="header-actions"><Switcher /><button className={`menu-button ${open ? 'is-open' : ''}`} aria-label={open ? t.close : t.menu} aria-expanded={open} onClick={() => setOpen(!open)}><span /><span /></button></div>
  </div></header>
}

function Footer({ language }: { language: Language }) {
  const t = content[language]
  return <footer className="footer">
    <div className="footer-main">
      <div><Brand compact /><p>{t.footerText}</p></div>
      <div className="footer-column"><strong>{t.quickLinks}</strong><Link page="destinations">{t.nav[1]}</Link><Link page="about">{t.nav[2]}</Link><Link page="memories">{t.memories}</Link></div>
      <div className="footer-column"><strong>{t.contactLabel}</strong>{COMPANY.phone ? <a href={`tel:${COMPANY.phone}`}>{COMPANY.phoneDisplay}</a> : <span>{t.notConfigured}</span>}<Link page="contact">{t.nav[3]}</Link></div>
    </div>
    <div className="footer-base"><span>© {new Date().getFullYear()} {t.rights}</span><span>{t.credit}</span></div>
  </footer>
}

function Heading({ kicker, title, text, center = false }: { kicker: string; title: string; text?: string; center?: boolean }) {
  return <div className={`section-heading ${center ? 'section-heading--center' : ''}`}><span className="kicker">{kicker}</span><h2>{title}</h2>{text && <p>{text}</p>}</div>
}

function VideoCard({ language, large = false }: { language: Language; large?: boolean }) {
  const t = content[language]
  return <div className={`video-card ${large ? 'video-card--large' : ''}`}>
    <img src={img.friends} alt={t.sampleVideo} /><div className="video-shade" /><span className="sample-label">{t.sampleVideo}</span>
    <span className="play-button"><svg viewBox="0 0 24 24"><path d="m9 7 7 5-7 5V7Z" /></svg></span>
    <span className="video-caption">{large ? t.videoPlaceholder : t.preview}</span>
  </div>
}

function TravelVideoCarousel({ language }: { language: Language }) {
  const t = content[language]
  const videos = [1, 2, 3]
  const [playbackBlocked, setPlaybackBlocked] = useState(false)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  useEffect(() => {
    const video = videoRefs.current[0]
    if (!video) return
    video.muted = false
    video.volume = 1
    video.play().then(() => setPlaybackBlocked(false)).catch(() => setPlaybackBlocked(true))
  }, [])
  const playWithSound = () => {
    const video = videoRefs.current[0]
    if (!video) return
    video.muted = false
    video.volume = 1
    video.play().then(() => setPlaybackBlocked(false)).catch(() => setPlaybackBlocked(true))
  }
  return <div className="home-memory-videos" aria-label={t.videoTitle}>
    {videos.map((number, index) => <article className="home-memory-videos__card" key={number}>
      <div className="home-memory-videos__frame">
        <video ref={element => { videoRefs.current[index] = element }} controls autoPlay muted={index !== 0} loop preload={index === 0 ? 'auto' : 'metadata'} playsInline aria-label={t.homeMemoryTitles[index]}>
          <source src={assetUrl(`assets/Travel memories/${number}.mp4`)} type="video/mp4" />
          {t.videoPlaceholder}
        </video>
        {index === 0 && playbackBlocked && <button className="travel-video-carousel__sound" onClick={playWithSound}>{t.playWithSound}</button>}
      </div>
      <h3>{t.homeMemoryTitles[index]}</h3>
    </article>)}
  </div>
}

function Home({ language }: { language: Language }) {
  const t = content[language]
  return <main>
    <section className="hero">
      <img className="hero__image" src={img.hero} alt="Boat journey through green Kerala backwaters" /><div className="hero__overlay" />
      <div className="hero__content"><span className="eyebrow">{t.eyebrow}</span><h1>{t.heroTitle}</h1><p>{t.heroText}</p>
        <div className="hero__actions"><Link page="destinations" className="button button--light">{t.explore}<Arrow /></Link><Link page="memories" className="text-link text-link--light">{t.memoriesLink}<Arrow /></Link></div>
      </div><div className="hero__index"><span>01</span><i /><span>05</span></div>
    </section>
    <section className="intro section"><Heading kicker={t.introKicker} title={t.introTitle} text={t.introText} /><div className="intro__note"><span>AT</span><p>{language === 'en' ? 'Personal planning. Meaningful places. Unhurried moments.' : 'वैयक्तिक नियोजन. अर्थपूर्ण ठिकाणे. निवांत क्षण.'}</p></div></section>
    <section className="video-section section"><div className="video-copy"><Heading kicker={t.videoKicker} title={t.videoTitle} text={t.videoText} /><Link page="memories" className="text-link">{t.memoriesLink}<Arrow /></Link></div><TravelVideoCarousel language={language} /></section>
  </main>
}

function DestinationSection({ title, text, names, images, editable }: { title: string; text: string; names: string[]; images: string[]; editable?: boolean }) {
  return <section className="destination-group">
    <div className="destination-group__heading"><h2>{title}</h2><p>{text}</p></div>
    <div className="destination-grid">{names.map((name, i) => <article className="destination-card" key={name}><img src={images[i]} alt="" /><div className="destination-card__shade" />{editable && <span className="edit-tag">Editable</span>}<h3>{name}</h3></article>)}</div>
  </section>
}

function ItineraryGallery({ language, t, trips, title, text }: { language: Language; t: typeof content.en | typeof content.mr; trips: ItineraryTrip[]; title: string; text: string }) {
  const [activeTrip, setActiveTrip] = useState<ItineraryTrip | null>(null)
  useEffect(() => {
    if (!activeTrip) return
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setActiveTrip(null) }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', closeOnEscape) }
  }, [activeTrip])
  const exactLanguage = (trip: ItineraryTrip) => language === 'mr' ? trip.marathi : trip.english
  return <>
    <section className="destination-group domestic-itineraries">
      <div className="destination-group__heading"><div><span className="kicker">{t.itinerary}</span><h2>{title}</h2></div><p>{text}</p></div>
      <div className="domestic-itinerary-grid">{trips.map(trip => {
        return <article className="domestic-itinerary-card" key={trip.id}>
          <div className="domestic-itinerary-card__photo"><img src={trip.thumbnail} alt={`${trip[language]} — ${t.destinationPhoto}`} loading="lazy" /><span>{t.destinationPhoto}</span></div>
          <div className="domestic-itinerary-card__copy"><h3>{trip[language]}</h3>{!exactLanguage(trip) && <p>{t.suppliedLanguageOnly}</p>}
            <button className="text-link" onClick={() => setActiveTrip(trip)} aria-haspopup="dialog">{t.viewItinerary}<Arrow /></button>
          </div>
        </article>
      })}</div>
    </section>
    {activeTrip && <div className="itinerary-modal" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setActiveTrip(null) }}>
      <section className="itinerary-modal__dialog" role="dialog" aria-modal="true" aria-label={`${activeTrip[language]} — ${t.itinerary}`}>
        <header className="itinerary-modal__header"><div><span className="kicker">{t.itinerary}</span><h2>{activeTrip[language]}</h2></div><button className="itinerary-modal__close" onClick={() => setActiveTrip(null)} aria-label={t.closeItinerary}>×</button></header>
        {!exactLanguage(activeTrip) && <p className="itinerary-modal__note">{t.suppliedLanguageOnly}</p>}
        <div className="itinerary-modal__image"><img src={itineraryFor(activeTrip, language)} alt={`${activeTrip[language]} — ${t.itinerary}`} /></div>
      </section>
    </div>}
  </>
}

function Destinations({ language, managedTrips }: { language: Language; managedTrips: ManagedTrip[] }) {
  const t = content[language], names = destinationNames[language]
  const domestic = mergeManagedTrips(domesticTrips, managedTrips, 'domestic')
  const international = mergeManagedTrips(internationalTrips, managedTrips, 'international')
  const pilgrimage = mergeManagedTrips(pilgrimageTrips, managedTrips, 'pilgrimage')
  const [activeCategory, setActiveCategory] = useState<'domestic' | 'international' | 'mice' | 'pilgrimage'>('domestic')
  const categories = [
    { id:'domestic' as const, label:t.domestic },
    { id:'international' as const, label:t.international },
    { id:'mice' as const, label:t.corporate },
    { id:'pilgrimage' as const, label:t.pilgrimage },
  ]
  return <main>
    <section className="page-intro"><Heading kicker={t.destinationsKicker} title={t.destinationsTitle} text={t.destinationsText} center /></section>
    <div className="destinations-wrap">
      <div className="destination-tabs" role="tablist" aria-label={t.destinationsKicker}>
        {categories.map((category, index) => <button key={category.id} id={`destination-tab-${category.id}`} className={activeCategory === category.id ? 'destination-tab is-active' : 'destination-tab'} role="tab" aria-selected={activeCategory === category.id} aria-controls="destination-tab-panel" tabIndex={activeCategory === category.id ? 0 : -1} onClick={() => setActiveCategory(category.id)}>
          <span className="destination-tab__number">0{index + 1}</span><span>{category.label}</span><Arrow />
        </button>)}
      </div>
      <div className="destination-tab-panel" id="destination-tab-panel" role="tabpanel" aria-labelledby={`destination-tab-${activeCategory}`}>
        {activeCategory === 'domestic' && <ItineraryGallery language={language} t={t} trips={domestic} title={t.domestic} text={t.domesticText} />}
        {activeCategory === 'international' && <ItineraryGallery language={language} t={t} trips={international} title={t.international} text={t.internationalText} />}
        {activeCategory === 'mice' && <section className="destination-group"><div className="mice-coming-soon" role="status"><span className="kicker">{t.corporate}</span><h2>{t.comingSoon}</h2><p>{t.corporateText}</p></div></section>}
        {activeCategory === 'pilgrimage' && <ItineraryGallery language={language} t={t} trips={pilgrimage} title={t.pilgrimage} text={t.pilgrimageText} />}
      </div>
    </div>
  </main>
}

function About({ language }: { language: Language }) {
  const t = content[language]
  const stats = [
    { value: t.travellersValue, label: t.travellersLabel, copy: t.travellersCopy },
    { value: t.monthsValue, label: t.monthsLabel, copy: t.monthsCopy },
    { value: t.corporateValue, label: t.corporateLabel, copy: t.corporateCopy },
    { value: t.futureValue, label: t.futureLabel, copy: t.futureCopy },
  ]
  return <main>
    <section className="founder-feature section">
      <div className="founder-gallery" aria-label={language === 'en' ? 'Photos of Anand Dave' : 'Anand Dave यांची छायाचित्रे'}>
        <figure className="founder-gallery__main"><img src={assetUrl('assets/founder photos/1.jpg')} alt={language === 'en' ? 'Anand Dave seated at a public event' : 'सार्वजनिक कार्यक्रमात बसलेले Anand Dave'} /><figcaption><strong>Anand Dave</strong><span>{language === 'en' ? 'Founder, Arth Travels' : 'संस्थापक, Arth Travels'}</span></figcaption></figure>
        <div className="founder-gallery__secondary">
          <figure><img src={assetUrl('assets/founder photos/3.jpg')} alt={language === 'en' ? 'Anand Dave addressing an audience' : 'श्रोत्यांना संबोधित करताना Anand Dave'} /><figcaption>{language === 'en' ? 'Sharing ideas with an audience' : 'श्रोत्यांशी विचारांची देवाणघेवाण'}</figcaption></figure>
          <figure><img src={assetUrl('assets/founder photos/5.jpg')} alt={language === 'en' ? 'Anand Dave at a public recognition event' : 'सार्वजनिक सत्कार समारंभात Anand Dave'} /><figcaption>{language === 'en' ? 'A moment from a community event' : 'समुदायिक कार्यक्रमातील एक क्षण'}</figcaption></figure>
        </div>
      </div>
      <div className="founder-feature__copy"><span className="kicker">{t.founderKicker}</span><h2>{t.founderName}</h2><span className="founder-feature__role">{t.founderRole}</span><p>{t.founderBio}</p>
        <aside className="founder-feature__story"><span>{t.storyKicker}</span><h3>{t.storyTitle}</h3><p>{t.storyText}</p></aside>
      </div>
    </section>
    <section className="journey-stats-wrap"><div className="journey-stats"><span className="journey-stats__kicker">{t.journeyKicker}</span><div className="journey-stats__grid">{stats.map(stat => <article className="journey-stat" key={stat.label}><strong>{stat.value}</strong><h3>{stat.label}</h3><p>{stat.copy}</p></article>)}</div><div className="journey-stats__footer">{t.journeyTitle}</div></div></section>
  </main>
}

function Contact({ language }: { language: Language }) {
  const t = content[language]
  return <main className="contact-page"><section className="contact-card">
    <div className="contact-card__brand"><Brand compact /></div><Heading kicker={t.contactKicker} title={t.contactTitle} text={t.contactText} center />
    <div className="contact-actions">
      {COMPANY.whatsapp ? <a className="button button--outline" href={`https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent(t.whatsappMessage)}`} target="_blank" rel="noreferrer">{t.whatsapp}<Arrow /></a> : <span className="button button--disabled">{t.whatsapp}</span>}
      {COMPANY.phone ? <a className="button button--dark" href={`tel:${COMPANY.phone}`}>{t.call}<Arrow /></a> : <span className="button button--disabled">{t.call}</span>}
    </div>
    <div className="contact-detail"><span>{t.phone}</span><a className="contact-detail__phone" href={`tel:${COMPANY.phone}`}>{COMPANY.phoneDisplay}</a></div>
  </section></main>
}

function Memories({ language }: { language: Language }) {
  const t = content[language], videos = Array.from({ length: 16 }, (_, index) => index + 4)
  return <main>
    <section className="page-intro memories-intro"><Heading kicker={t.memoriesKicker} title={t.memoriesTitle} text={t.memoriesText} center /></section>
    <section className="memory-video-collection section"><div className="gallery-heading"><h2>{t.videoCollection}</h2><span>{t.videoCount}</span></div><div className="memory-video-grid">{videos.map((number, index) => {
      const video = assetUrl(`assets/Travel memories/${number === 5 ? '5 (1)' : number}.mp4`)
      const title = t.memoryVideoTitles[index]
      return <article className="memory-video-card" key={number}><video controls preload="metadata" playsInline aria-label={title}><source src={video} type="video/mp4" />{t.videoPlaceholder}</video><div className="memory-video-card__caption"><span>{String(number).padStart(2, '0')}</span><h3>{title}</h3></div></article>
    })}</div></section>
  </main>
}

export default function App() {
  const [page, setPage] = useState<Page>(getPage)
  const [managedTrips, setManagedTrips] = useState<ManagedTrip[]>([])
  const [language, setLanguageState] = useState<Language>(() => localStorage.getItem('earther-language') === 'mr' ? 'mr' : 'en')
  const [showLoader, setShowLoader] = useState(true)
  useEffect(() => {
    const update = () => { setPage(getPage()); window.scrollTo({ top: 0, behavior: 'smooth' }) }
    addEventListener('hashchange', update); return () => removeEventListener('hashchange', update)
  }, [])
  useEffect(() => {
    if (!supabaseReady) return
    fetchPublishedTrips().then(setManagedTrips).catch(error => console.error('Could not load managed trips:', error))
  }, [])
  useEffect(() => {
    const timer = window.setTimeout(() => setShowLoader(false), 1000)
    return () => window.clearTimeout(timer)
  }, [])
  const setLanguage = (next: Language) => { setLanguageState(next); localStorage.setItem('earther-language', next); document.documentElement.lang = next }
  const adminInitialTrips = createAdminSeed([
    { category: 'domestic', items: domesticTrips },
    { category: 'international', items: internationalTrips },
    { category: 'pilgrimage', items: pilgrimageTrips },
  ])
  if (page === 'admin') return <AdminDashboard initialTrips={adminInitialTrips} />
  return <>
    <div className="site-shell"><Header language={language} setLanguage={setLanguage} page={page} />
      {page === 'home' && <Home language={language} />}{page === 'destinations' && <Destinations language={language} managedTrips={managedTrips} />}{page === 'about' && <About language={language} />}{page === 'contact' && <Contact language={language} />}{page === 'memories' && <Memories language={language} />}
      <Footer language={language} />
    </div>
    {showLoader && <div className="site-loader" role="status" aria-label="Loading Arth Travels"><div className="site-loader__mark"><img src={assetUrl('assets/client-logo.png')} alt="Arth Travels" /></div><span className="site-loader__name">Arth Travels</span><span className="site-loader__line" /></div>}
  </>
}
