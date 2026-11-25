export type Language = 'en' | 'mr'

export type AboutCopy = {
  founderKicker: string
  founderName: string
  founderRole: string
  founderBio: string
  storyKicker: string
  storyTitle: string
  storyText: string
  historyPoints: { place: string; detail: string }[]
}

export type AboutContent = {
  id: 'main'
  en: AboutCopy
  mr: AboutCopy
  photos: { main: string; second: string; third: string }
}

export type AboutSection = {
  id: string
  type: 'text' | 'testimonial'
  title_en: string
  title_mr: string
  body_en: string
  body_mr: string
  author_en: string
  author_mr: string
  image_path: string
  sort_order: number
  published: boolean
  created_at?: string
}

export const defaultAbout: AboutContent = {
  id: 'main',
  en: {
    founderKicker: 'Meet our founder', founderName: 'Anand Dave', founderRole: 'Founder, Arth Travels',
    founderBio: 'Since Arth Travels began on 5 January 2026, more than 2,000 travellers have joined our family, couple, solo, group and corporate journeys. Anand believes every trip can offer more than sightseeing—it can bring the stories of a place to life.',
    storyKicker: 'Go beyond the postcard', storyTitle: 'Every place has a story worth hearing.',
    storyText: 'We explore the landmarks and make time for the history, people and events that give each place its meaning.',
    historyPoints: [
      { place: 'Andaman', detail: 'At Cellular Jail, learn about Veer Savarkar and the history of India’s freedom struggle through Anand’s talk.' },
      { place: 'Agra', detail: 'Look beyond the Taj Mahal to discover the stories of Agra Fort and the Mughal era.' },
      { place: 'Delhi', detail: 'Explore the Red Fort and Qutub Minar to trace the many eras that shaped India’s capital.' },
      { place: 'Kashi', detail: 'Walk along Varanasi’s historic ghats and learn about the city’s living heritage.' },
      { place: 'Every destination', detail: 'Local heritage and context turn sightseeing into a richer travel experience.' },
    ],
  },
  mr: {
    founderKicker: 'आमचे संस्थापक', founderName: 'Anand Dave', founderRole: 'संस्थापक, Arth Travels',
    founderBio: '५ जानेवारी २०२६ रोजी Arth Travels सुरू झाल्यापासून २,००० हून अधिक प्रवाशांनी कौटुंबिक, जोडप्यांच्या, एकल, समूह आणि कॉर्पोरेट सहली केल्या आहेत. प्रत्येक सहल केवळ पर्यटनापुरती न राहता त्या ठिकाणच्या कथा आणि इतिहास जवळून समजून घेण्याचा अनुभव असावा, असा Anand यांचा विश्वास आहे.',
    storyKicker: 'फक्त दृश्यांपलीकडे', storyTitle: 'प्रत्येक ठिकाणाची एक कथा असते.',
    storyText: 'आम्ही स्थळे पाहतोच; पण त्या प्रत्येक ठिकाणाला अर्थ देणारा इतिहास, माणसे आणि घटना जाणून घेण्यासाठीही वेळ देतो.',
    historyPoints: [
      { place: 'अंदमान', detail: 'सेल्युलर जेलमध्ये Anand यांच्या मनोगतातून वीर सावरकर आणि भारतीय स्वातंत्र्यलढ्याचा इतिहास जाणून घ्या.' },
      { place: 'आग्रा', detail: 'ताजमहालासोबत आग्रा किल्ला आणि मुघलकालीन काळाच्या कथा समजून घ्या.' },
      { place: 'दिल्ली', detail: 'लाल किल्ला आणि कुतुबमिनार पाहताना भारताच्या राजधानीला आकार देणारे विविध ऐतिहासिक कालखंड जाणून घ्या.' },
      { place: 'काशी', detail: 'वाराणसीच्या ऐतिहासिक घाटांवर फिरताना शहराचा जिवंत वारसा आणि इतिहास जाणून घ्या.' },
      { place: 'प्रत्येक ठिकाणी', detail: 'स्थानिक वारसा आणि संदर्भामुळे पर्यटनाचा अनुभव अधिक अर्थपूर्ण होतो.' },
    ],
  },
  photos: {
    main: 'site-assets:assets/founder photos/anand-dave.jpg',
    second: 'site-assets:assets/founder photos/3.jpg',
    third: 'site-assets:assets/founder photos/5.jpg',
  },
}

export const aboutFields: { key: keyof Omit<AboutCopy, 'historyPoints'>; label: string }[] = [
  { key: 'founderKicker', label: 'Founder section label' },
  { key: 'founderName', label: 'Founder name' },
  { key: 'founderRole', label: 'Founder role' },
  { key: 'founderBio', label: 'Founder introduction' },
  { key: 'storyKicker', label: 'History section label' },
  { key: 'storyTitle', label: 'History section heading' },
  { key: 'storyText', label: 'History section introduction' },
]
