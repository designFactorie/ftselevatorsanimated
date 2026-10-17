(() => {
  'use strict';

  // ---------- Config ----------
  const TOTAL_FRAMES = 293;
  const FRAME_PATH = (i) => `screenshots/ezgif-frame-${String(i).padStart(3, '0')}.jpg`;
  const isNarrowViewport = window.matchMedia('(max-width: 767px)').matches;
  const savesData = Boolean(navigator.connection?.saveData);
  // Show the page after this many frames are loaded — enough for the first
  // ~viewport of scroll. The rest stream in the background.
  const PRIME_FRAMES = isNarrowViewport ? 12 : 24;
  const BACKGROUND_FRAME_STEP = savesData ? 5 : (isNarrowViewport ? 3 : 1);

  // ---------- Elements ----------
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const stage = document.getElementById('scroll-stage');
  const stickyWrap = document.querySelector('.sticky-wrap');
  const overlays = Array.from(document.querySelectorAll('.overlay-frame'));
  const nav = document.getElementById('nav');
  const menuToggle = document.getElementById('menu-toggle');
  const primaryNavigation = document.getElementById('primary-navigation');
  const scrollHint = document.getElementById('scroll-hint');
  const loader = document.getElementById('loader');
  const loaderFill = document.getElementById('loader-fill');
  const loaderPercent = document.getElementById('loader-percent');
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // ---------- Language ----------
  const englishCopy = {};
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    englishCopy[element.dataset.i18n] = element.textContent;
  });
  document.querySelectorAll('[data-i18n-html]').forEach((element) => {
    englishCopy[element.dataset.i18nHtml] = element.innerHTML;
  });
  document.querySelectorAll('[data-i18n-alt]').forEach((element) => {
    englishCopy[element.dataset.i18nAlt] = element.getAttribute('alt');
  });

  const translations = {
    en: englishCopy,
    ar: {
      'brand.elevators': 'مصاعد وسلالم متحركة',
      'nav.about': 'عن FTS',
      'nav.services': 'الخدمات',
      'nav.products': 'المنتجات',
      'nav.why': 'لماذا FTS',
      'nav.process': 'كيف نعمل',
      'nav.contact': 'تواصل معنا',
      'hero.eyebrow': 'مصاعد وسلالم متحركة من FTS',
      'hero.title': 'حلول متكاملة<br/><em>للنقل الرأسي.</em>',
      'hero.lede': 'خبرة مقرها دبي في المصاعد والسلالم المتحركة، تجمع بين الهندسة المعتمدة والمكونات الأصلية وخدمة ما بعد البيع المنضبطة في جميع أنحاء الإمارات.',
      'supply.eyebrow': 'التوريد والتركيب',
      'supply.title': 'مواصفات واضحة.<br/><em>وتركيب آمن.</em>',
      'supply.lede': 'توريد وتركيب متكامل لمصاعد الركاب والفلل والبانوراما والمستشفيات والبضائع والمصاعد الهيدروليكية.',
      'maintenance.eyebrow': 'الصيانة السنوية',
      'maintenance.title': 'عناية مجدولة.<br/><em>وموثقة بالكامل.</em>',
      'maintenance.lede': 'زيارات صيانة وقائية ضمن عقود AMC، وفحوص سلامة، وتشحيم، وقطع غيار أصلية، وتقارير مفصلة.',
      'modernization.eyebrow': 'التحديث',
      'modernization.title': 'نعيد المصاعد القديمة<br/><em>إلى الحياة.</em>',
      'modernization.lede': 'محركات VVVF وكبائن حديثة ولوحات تحكم تعمل باللمس وإضاءة موفرة وأنظمة سلامة محدثة.',
      'callouts.eyebrow': 'الإصلاح والبلاغات على مدار الساعة',
      'callouts.title': 'الطوارئ لا<br/><em>تنتظر في قائمة.</em>',
      'callouts.lede': 'تتعامل فرق الاستجابة السريعة مع إنقاذ الركاب وتشخيص الأعطال والإصلاح في الزيارة نفسها حيثما أمكن.',
      'common.scroll': 'مرّر',
      'about.eyebrow': 'عن الشركة',
      'about.title': 'من<br/><em>نحن.</em>',
      'about.copy': 'FTS للمصاعد والسلالم المتحركة (فيكسبل للخدمات الفنية ذ.م.م) شركة مقرها دبي تقدم حلولاً متكاملة للنقل الرأسي في أنحاء الإمارات. من مصاعد الفلل الأنيقة إلى المشاريع التجارية عالية الاستخدام، نجمع بين الهندسة المعتمدة والمكونات الأصلية والعناية المنضبطة بعد البيع ليبقى مبناك في حركة دائمة.',
      'stats.genuine': 'قطع أصلية وعمل معتمد',
      'stats.response': 'خط الاستجابة للأعطال',
      'stats.emirates': 'تغطية جميع الإمارات',
      'stats.contact': 'جهة اتصال واحدة من البداية إلى النهاية',
      'services.eyebrow': 'خدماتنا',
      'services.title': 'في مواقع العمل،<br/><em>في أنحاء الإمارات.</em>',
      'services.supply.title': 'التوريد والتركيب',
      'services.supply.copy': 'توريد وتركيب متكامل لمصاعد الركاب والفلل والبانوراما والبضائع. محركات VVVF بدون تروس وتصاميم MRL أو بغرفة ماكينة، مع الرسومات الهندسية والامتثال لمتطلبات الجهات المختصة.',
      'services.amc.title': 'الصيانة السنوية',
      'services.amc.copy': 'خطط AMC وقائية تشمل زيارات مجدولة وفحوص السلامة والتشحيم وقطع الغيار الأصلية. وتُبقي تقارير الزيارات المفصلة الملاك وإدارة المبنى على اطلاع كامل.',
      'services.modernization.title': 'التحديث',
      'services.modernization.copy': 'محركات VVVF جديدة وكبائن حديثة ولوحات COP/LOP تعمل باللمس وإضاءة موفرة للطاقة وأنظمة سلامة محدثة - من دون إعادة بناء البئر.',
      'services.callouts.title': 'الإصلاح والبلاغات 24/7',
      'services.callouts.copy': 'دعم للأعطال على مدار الساعة في أنحاء الإمارات، يشمل إنقاذ الركاب وتشخيص الأعطال والإصلاح في الزيارة نفسها حيثما أمكن.',
      'products.eyebrow': 'منتجاتنا',
      'products.title': 'مصعد مناسب<br/><em>لكل مبنى.</em>',
      'products.view': 'عرض التفاصيل',
      'products.passenger.tag': 'بدون غرفة ماكينة / بغرفة ماكينة',
      'products.passenger.title': 'مصاعد الركاب',
      'products.passenger.copy': 'أنظمة MRL وبغرفة ماكينة بسعات 450-2,000 كجم للأبراج السكنية والتجارية.',
      'products.villa.tag': 'بئر مدمج',
      'products.villa.title': 'مصاعد الفلل',
      'products.villa.copy': 'مصاعد بسعات 260-400 كجم للآبار المدمجة، مع كبائن تتناسق مع تصميمك الداخلي.',
      'products.panoramic.tag': 'كابينة زجاجية',
      'products.panoramic.title': 'مصاعد بانورامية / مشاهدة',
      'products.panoramic.copy': 'كبائن زجاجية وآبار مشاهدة بتكوينات دائرية أو نصف دائرية.',
      'products.hospital.tag': 'مجهز للنقالات',
      'products.hospital.title': 'مصاعد المستشفيات',
      'products.hospital.copy': 'كبائن مجهزة للنقالات بسعات 1,600-2,000 كجم لرحلة سلسة وخالية من الاهتزاز.',
      'products.freight.tag': 'استخدام شاق',
      'products.freight.title': 'مصاعد البضائع والشحن',
      'products.freight.copy': 'أنظمة بسعات 630-10,000 كجم للمستودعات ومتاجر التجزئة والمباني الصناعية.',
      'products.hydraulic.tag': 'مبانٍ منخفضة الارتفاع',
      'products.hydraulic.title': 'المصاعد الهيدروليكية',
      'products.hydraulic.copy': 'حلول بمحركات بسيطة ومتينة للمباني منخفضة الارتفاع والاستخدامات الشاقة.',
      'cabins.eyebrow': 'مجموعة تصميم الكبائن',
      'cabins.title': 'صمم رحلتك.',
      'cabins.copy': 'يُنجز كل مصعد من FTS وفق ذوقك. ويمكن تخصيص جدران الكابينة والسقف والأرضية والدرابزين وأدوات التحكم اللمسية بالكامل لتتناسب مع تصميمك الداخلي.',
      'cabins.gold': 'مجموعة الذهبي والشمبانيا',
      'cabins.g01': 'المرآة الذهبية',
      'cabins.g02': 'الذهبي الإمبراطوري',
      'cabins.g03': 'قوس الشمبانيا',
      'cabins.g04': 'الدمشقي الملكي',
      'cabins.g05': 'زهر الورد',
      'cabins.steel': 'الخشب والفولاذ المعاصر',
      'cabins.w01': 'خط الجوز',
      'cabins.w02': 'الشلال البرونزي',
      'cabins.s01': 'فولاذ لينيا',
      'cabins.s02': 'فولاذ أوربت',
      'cabins.s03': 'الخط الفضي',
      'why.eyebrow': 'لماذا FTS',
      'why.title': 'لماذا يختار ملاك المباني<br/><em>شركة FTS.</em>',
      'why.survey.title': 'معاينة مجانية للموقع',
      'why.survey.copy': 'يزور مهندسونا الموقع ويجرون القياسات والتقييم من دون تكلفة، ثم نقدم عرضاً واضحاً ومفصلاً من دون أي التزام.',
      'why.safety.title': 'السلامة أولاً، دائماً',
      'why.safety.copy': 'تتبع كل زيارة تركيب وصيانة معايير السلامة الدولية، مع توثيق كامل لعمليات التفتيش الرسمية.',
      'why.pricing.title': 'أسعار شفافة',
      'why.pricing.copy': 'قيم عقود ثابتة ومراحل دفع واضحة ومن دون رسوم خفية. ما نقدمه في العرض هو ما تدفعه.',
      'why.response.title': 'فرق استجابة سريعة',
      'why.response.copy': 'تتعامل فرق البلاغات المخصصة في دبي والشارقة وعجمان مع حالات احتجاز الركاب والأعطال كطوارئ لا كتذاكر دعم.',
      'why.brands.title': 'خدمة جميع العلامات',
      'why.brands.copy': 'نصون ونصلح ونحدث مصاعد جميع العلامات الرئيسية، فلا تبقى مقيداً بالشركة المصنعة الأصلية.',
      'why.bilingual.title': 'عقود ثنائية اللغة',
      'why.bilingual.copy': 'اتفاقيات AMC احترافية بالإنجليزية والعربية تلبي متطلبات الملاك وإدارة المباني والجهات الحكومية.',
      'process.eyebrow': 'كيف نعمل',
      'process.title': 'من الزيارة الأولى<br/><em>إلى العناية طويلة الأمد.</em>',
      'process.survey.title': 'معاينة الموقع',
      'process.survey.copy': 'زيارة مجانية وقياسات وتقييم فني يجريه مهندسونا.',
      'process.proposal.title': 'العرض',
      'process.proposal.copy': 'عرض سعر مفصل بمواصفات واضحة وجدول زمني ومراحل دفع محددة.',
      'process.delivery.title': 'التنفيذ',
      'process.delivery.copy': 'تنفيذ التركيب أو الخدمة بواسطة فرق معتمدة مع توثيق كامل للسلامة.',
      'process.care.title': 'رعاية AMC',
      'process.care.copy': 'التسليم والتدريب وخطة صيانة سنوية توفر لك التغطية المستمرة.',
      'amc.eyebrow': 'عقد الصيانة السنوية',
      'amc.title': 'وقّع عقد AMC - وتوقف عن القلق.',
      'amc.copy': 'يغطي عقد سنوي واحد الصيانة المجدولة وفحوص السلامة وأولوية الاستجابة والتوثيق النظامي. وتصدر الاتفاقيات الثنائية اللغة خلال 24 ساعة من التأكيد.',
      'job.technicians': 'فنيون معتمدون بزي موحد',
      'job.parts': 'قطع غيار أصلية 100%',
      'job.survey': 'معاينة وعرض سعر مجاناً',
      'job.safety': 'توثيق كامل للسلامة',
      'job.brands': 'خدمة جميع علامات المصاعد',
      'job.contracts': 'عقود بالإنجليزية والعربية',
      'modal.eyebrow': 'تفاصيل المنتج',
      'modal.overview': 'نظرة عامة',
      'modal.specifications': 'المواصفات الرئيسية',
      'modal.features': 'ما تقدمه FTS',
      'modal.cta': 'ناقش هذا المنتج معنا',
      'contact.eyebrow': 'معاينة مجانية للموقع',
      'contact.title': 'دعنا نقيّم<br/><em>مبناك.</em>',
      'contact.copy': 'احجز زيارة مجانية للموقع. سيجري مهندسونا القياسات والتقييم ويقدمون عرض سعر واضحاً ومفصلاً من دون أي التزام.',
      'contact.quote': 'اطلب معاينة مجانية',
      'whatsapp.contact': 'تواصل معنا',
      'footer.tagline': 'فيكسبل للخدمات الفنية ذ.م.م. حلول متكاملة للمصاعد والسلالم المتحركة في أنحاء الإمارات.',
      'footer.services': 'الخدمات',
      'footer.modernization': 'التحديث',
      'footer.callouts': 'بلاغات الطوارئ 24/7',
      'footer.company': 'الشركة',
      'footer.contact': 'تواصل معنا',
      'footer.reach': 'بيانات التواصل',
      'footer.address': 'برج ذا ون - شارع الشيخ زايد - الثنية الأولى - مدينة دبي للإنترنت - دبي - الإمارات العربية المتحدة',
      'footer.copyright': 'فيكسبل للخدمات الفنية ذ.م.م. جميع الحقوق محفوظة.',
      'footer.dubai': 'مقرنا دبي ونخدم الإمارات السبع.'
    }
  };

  const productDetails = {
    passenger: {
      image: 'assets/products/passenger-elevator.webp',
      en: {
        title: 'Passenger Elevators',
        tag: 'MRL / Machine room',
        overview: 'Flexible passenger lift systems designed around the building, expected traffic and architectural finish. FTS supports the project from the first shaft survey through installation, commissioning and long-term care.',
        specs: [
          ['Capacity', '450-2,000 kg'],
          ['Configuration', 'MRL or machine room'],
          ['Drive', 'VVVF gearless'],
          ['Applications', 'Residential and commercial towers']
        ],
        features: [
          'Site survey and shaft assessment',
          'Custom cabin finishes and control panels',
          'Engineering drawings and authority documentation',
          'Installation, commissioning and AMC handover'
        ]
      },
      ar: {
        title: 'مصاعد الركاب',
        tag: 'بدون غرفة ماكينة / بغرفة ماكينة',
        overview: 'أنظمة مرنة لمصاعد الركاب تُصمم وفق المبنى وحركة الاستخدام المتوقعة والطابع المعماري. تدعم FTS المشروع من معاينة البئر الأولى حتى التركيب والتشغيل والعناية طويلة الأمد.',
        specs: [
          ['السعة', '450-2,000 كجم'],
          ['التكوين', 'MRL أو بغرفة ماكينة'],
          ['نظام الحركة', 'VVVF بدون تروس'],
          ['الاستخدامات', 'الأبراج السكنية والتجارية']
        ],
        features: [
          'معاينة الموقع وتقييم البئر',
          'تشطيبات كبائن ولوحات تحكم مخصصة',
          'رسومات هندسية ووثائق الجهات المختصة',
          'التركيب والتشغيل والتسليم مع خطة AMC'
        ]
      }
    },
    villa: {
      image: 'assets/products/villa-elevator.webp',
      en: {
        title: 'Villa Elevators',
        tag: 'Compact shaft',
        overview: 'Space-conscious home lifts that bring comfortable vertical access to private residences without compromising the interior. Each cabin can be coordinated with the villa’s materials, lighting and design language.',
        specs: [
          ['Capacity', '260-400 kg'],
          ['Shaft', 'Compact configuration'],
          ['Cabin', 'Interior-matched finish'],
          ['Applications', 'Villas and private residences']
        ],
        features: [
          'Free measurement and technical survey',
          'Space-efficient project configuration',
          'Custom walls, ceilings, flooring and controls',
          'Owner training and annual maintenance options'
        ]
      },
      ar: {
        title: 'مصاعد الفلل',
        tag: 'بئر مدمج',
        overview: 'مصاعد منزلية موفرة للمساحة تمنح المساكن الخاصة وصولاً رأسياً مريحاً دون التأثير في التصميم الداخلي. ويمكن تنسيق كل كابينة مع مواد الفيلا وإضاءتها وهويتها التصميمية.',
        specs: [
          ['السعة', '260-400 كجم'],
          ['البئر', 'تكوين مدمج'],
          ['الكابينة', 'تشطيب متناسق مع الديكور'],
          ['الاستخدامات', 'الفلل والمساكن الخاصة']
        ],
        features: [
          'قياسات ومعاينة فنية مجانية',
          'تكوين يناسب المساحات المحدودة',
          'تخصيص الجدران والسقف والأرضية والتحكم',
          'تدريب المالك وخيارات الصيانة السنوية'
        ]
      }
    },
    panoramic: {
      image: 'assets/products/panoramic-elevator.webp',
      en: {
        title: 'Panoramic / Observation',
        tag: 'Glass cabin',
        overview: 'Architectural glass elevators that turn vertical travel into part of the experience. Circular and semi-circular configurations can be tailored to the available shaft and the visual character of the property.',
        specs: [
          ['Cabin', 'Glazed observation design'],
          ['Shaft options', 'Circular or semi-circular'],
          ['Design focus', 'Open views and architectural impact'],
          ['Applications', 'Feature spaces and public areas']
        ],
        features: [
          'Site-led glass and structure configuration',
          'Cabin finishes coordinated with the building',
          'Lighting and control-panel customization',
          'Installation and documented safety checks'
        ]
      },
      ar: {
        title: 'مصاعد بانورامية / مشاهدة',
        tag: 'كابينة زجاجية',
        overview: 'مصاعد زجاجية معمارية تجعل التنقل الرأسي جزءاً من التجربة. ويمكن تكييف التكوينات الدائرية ونصف الدائرية وفق البئر المتاح والطابع البصري للمبنى.',
        specs: [
          ['الكابينة', 'تصميم زجاجي للمشاهدة'],
          ['خيارات البئر', 'دائري أو نصف دائري'],
          ['التركيز التصميمي', 'رؤية مفتوحة وحضور معماري'],
          ['الاستخدامات', 'المساحات المميزة والعامة']
        ],
        features: [
          'تكوين الزجاج والهيكل وفق الموقع',
          'تشطيبات متناسقة مع تصميم المبنى',
          'تخصيص الإضاءة ولوحات التحكم',
          'تركيب وفحوص سلامة موثقة'
        ]
      }
    },
    hospital: {
      image: 'assets/products/hospital-elevator.webp',
      en: {
        title: 'Hospital Elevators',
        tag: 'Stretcher-ready',
        overview: 'Stretcher-ready lift cars planned for dependable movement in healthcare buildings. The configuration prioritizes usable cabin space and a smooth, vibration-conscious ride for patients and clinical teams.',
        specs: [
          ['Capacity', '1,600-2,000 kg'],
          ['Cabin', 'Stretcher-ready'],
          ['Ride priority', 'Smooth and vibration-conscious'],
          ['Applications', 'Hospitals and healthcare facilities']
        ],
        features: [
          'Site assessment around clinical movement needs',
          'Durable, practical cabin-finish options',
          'Safety inspections and documented commissioning',
          'Preventive AMC and rapid callout support'
        ]
      },
      ar: {
        title: 'مصاعد المستشفيات',
        tag: 'مجهز للنقالات',
        overview: 'كبائن مصاعد مجهزة للنقالات ومخططة للحركة الموثوقة في منشآت الرعاية الصحية. يركز التكوين على مساحة الكابينة العملية ورحلة سلسة تراعي تقليل الاهتزاز للمرضى والفرق الطبية.',
        specs: [
          ['السعة', '1,600-2,000 كجم'],
          ['الكابينة', 'مجهزة للنقالات'],
          ['أولوية الحركة', 'سلاسة وتقليل الاهتزاز'],
          ['الاستخدامات', 'المستشفيات والمنشآت الصحية']
        ],
        features: [
          'تقييم الموقع وفق احتياجات الحركة الطبية',
          'خيارات تشطيب عملية ومتينة',
          'فحوص سلامة وتشغيل موثق',
          'صيانة AMC وقائية ودعم سريع للبلاغات'
        ]
      }
    },
    freight: {
      image: 'assets/products/freight-elevator.webp',
      en: {
        title: 'Goods / Freight Elevators',
        tag: 'Heavy duty',
        overview: 'Robust goods-lift systems configured around load type, movement frequency and building operations. FTS covers projects from retail stock movement to warehouse and industrial handling requirements.',
        specs: [
          ['Capacity', '630-10,000 kg'],
          ['Duty', 'Heavy-duty goods movement'],
          ['Configuration', 'Project-specific sizing'],
          ['Applications', 'Warehouses, retail and industry']
        ],
        features: [
          'Load and operational-needs assessment',
          'Practical cabin and entrance configuration',
          'Clear engineering and payment milestones',
          'Maintenance plans with genuine spare parts'
        ]
      },
      ar: {
        title: 'مصاعد البضائع والشحن',
        tag: 'استخدام شاق',
        overview: 'أنظمة متينة لمصاعد البضائع تُهيأ وفق نوع الحمولة وتكرار الحركة وعمليات المبنى. تغطي FTS المشاريع من نقل مخزون التجزئة إلى متطلبات المستودعات والمناولة الصناعية.',
        specs: [
          ['السعة', '630-10,000 كجم'],
          ['الاستخدام', 'نقل بضائع شاق'],
          ['التكوين', 'مقاسات خاصة بالمشروع'],
          ['التطبيقات', 'المستودعات والتجزئة والصناعة']
        ],
        features: [
          'تقييم الحمولة والاحتياجات التشغيلية',
          'تكوين عملي للكابينة والمداخل',
          'مراحل هندسية ومالية واضحة',
          'خطط صيانة بقطع غيار أصلية'
        ]
      }
    },
    hydraulic: {
      image: 'assets/products/hydraulic-lift.webp',
      en: {
        title: 'Hydraulic Lifts',
        tag: 'Low rise',
        overview: 'Simple, robust hydraulic solutions for low-rise buildings and demanding applications. Each system is configured around the available space, required duty and practical service access.',
        specs: [
          ['Drive', 'Hydraulic'],
          ['Building type', 'Low rise'],
          ['Duty', 'Standard or heavy duty'],
          ['Capacity', 'Configured to project needs']
        ],
        features: [
          'Technical survey and application review',
          'Space-aware equipment configuration',
          'Certified installation and safety documentation',
          'Scheduled maintenance and breakdown support'
        ]
      },
      ar: {
        title: 'المصاعد الهيدروليكية',
        tag: 'مبانٍ منخفضة الارتفاع',
        overview: 'حلول هيدروليكية بسيطة ومتينة للمباني منخفضة الارتفاع والاستخدامات الصعبة. يُهيأ كل نظام وفق المساحة المتاحة وطبيعة التشغيل وسهولة الوصول للصيانة.',
        specs: [
          ['نظام الحركة', 'هيدروليكي'],
          ['نوع المبنى', 'منخفض الارتفاع'],
          ['طبيعة التشغيل', 'عادي أو شاق'],
          ['السعة', 'وفق احتياجات المشروع']
        ],
        features: [
          'معاينة فنية ومراجعة الاستخدام',
          'تكوين للمعدات يراعي المساحة',
          'تركيب معتمد ووثائق سلامة',
          'صيانة مجدولة ودعم للأعطال'
        ]
      }
    }
  };

  const productModal = document.getElementById('product-modal');
  const productModalDialog = document.querySelector('.product-modal-dialog');
  const productModalClose = document.getElementById('product-modal-close');
  const productModalImage = document.getElementById('product-modal-image');
  const productModalTag = document.getElementById('product-modal-tag');
  const productModalTitle = document.getElementById('product-modal-title');
  const productModalOverview = document.getElementById('product-modal-overview');
  const productModalSpecs = document.getElementById('product-modal-specs');
  const productModalFeatures = document.getElementById('product-modal-features');
  const productModalCta = document.getElementById('product-modal-cta');
  let activeProduct = null;
  let lastProductTrigger = null;

  const languageToggle = document.getElementById('language-toggle');
  const languageToggleLabel = document.getElementById('language-toggle-label');

  function setLanguage(language, persist = true) {
    const selected = language === 'ar' ? 'ar' : 'en';
    const copy = translations[selected];
    const isArabic = selected === 'ar';

    document.documentElement.lang = selected;
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
    document.title = isArabic
      ? 'شركة مصاعد في دبي | تركيب وصيانة المصاعد | FTS'
      : 'Elevator Company Dubai | Installation & Maintenance | FTS';

    const description = document.querySelector('meta[name="description"]');
    if (description) {
      description.content = isArabic
        ? 'تقدم FTS تركيب المصاعد وعقود الصيانة السنوية والتحديث والإصلاح على مدار الساعة في دبي وجميع أنحاء الإمارات.'
        : 'FTS provides elevator installation, AMC maintenance, modernization and 24/7 lift repair across Dubai and the UAE. Book a free site survey.';
    }

    document.querySelectorAll('[data-i18n]').forEach((element) => {
      const value = copy[element.dataset.i18n];
      if (value !== undefined) element.textContent = value;
    });
    document.querySelectorAll('[data-i18n-html]').forEach((element) => {
      const value = copy[element.dataset.i18nHtml];
      if (value !== undefined) element.innerHTML = value;
    });
    document.querySelectorAll('[data-i18n-alt]').forEach((element) => {
      const value = copy[element.dataset.i18nAlt];
      if (value !== undefined) element.setAttribute('alt', value);
    });

    const primaryNav = document.querySelector('.nav-links');
    if (primaryNav) primaryNav.setAttribute('aria-label', isArabic ? 'التنقل الرئيسي' : 'Primary');
    if (stage) stage.setAttribute('aria-label', isArabic ? 'عرض المصاعد والسلالم المتحركة' : 'Elevator and escalator showcase');
    if (languageToggle && languageToggleLabel) {
      languageToggleLabel.textContent = isArabic ? 'English' : 'العربية';
      languageToggle.setAttribute('aria-label', isArabic ? 'Switch to English' : 'Switch to Arabic');
    }
    if (menuToggle) {
      const isOpen = nav?.classList.contains('menu-open');
      menuToggle.setAttribute('aria-label', isArabic
        ? (isOpen ? 'إغلاق قائمة التنقل' : 'فتح قائمة التنقل')
        : (isOpen ? 'Close navigation menu' : 'Open navigation menu'));
    }
    if (productModalClose) {
      productModalClose.setAttribute('aria-label', isArabic ? 'إغلاق تفاصيل المنتج' : 'Close product details');
    }
    document.querySelectorAll('.product-card[data-product]').forEach((card) => {
      const detail = productDetails[card.dataset.product]?.[selected];
      if (detail) {
        card.setAttribute('aria-label', isArabic ? `عرض تفاصيل ${detail.title}` : `View details for ${detail.title}`);
      }
    });
    if (activeProduct) renderProductModal(activeProduct);

    if (persist) {
      try { localStorage.setItem('fts-language', selected); } catch (_) { /* Storage may be unavailable. */ }
    }

    currentFrame = -1;
    render();
  }

  function setupLanguage() {
    let initialLanguage = 'en';
    try {
      if (localStorage.getItem('fts-language') === 'ar') initialLanguage = 'ar';
    } catch (_) { /* Use English when storage is unavailable. */ }

    setLanguage(initialLanguage, false);
    if (languageToggle) {
      languageToggle.addEventListener('click', () => {
        setLanguage(document.documentElement.lang === 'ar' ? 'en' : 'ar');
      });
    }
  }

  // ---------- Mobile navigation ----------
  function setMobileMenu(open) {
    if (!nav || !menuToggle) return;
    nav.classList.toggle('menu-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    const isArabic = document.documentElement.lang === 'ar';
    menuToggle.setAttribute('aria-label', isArabic
      ? (open ? 'إغلاق قائمة التنقل' : 'فتح قائمة التنقل')
      : (open ? 'Close navigation menu' : 'Open navigation menu'));
  }

  function setupMobileNavigation() {
    if (!nav || !menuToggle || !primaryNavigation) return;

    menuToggle.addEventListener('click', () => {
      setMobileMenu(!nav.classList.contains('menu-open'));
    });

    primaryNavigation.querySelectorAll('a, button').forEach((element) => {
      element.addEventListener('click', () => setMobileMenu(false));
    });

    document.addEventListener('click', (event) => {
      if (nav.classList.contains('menu-open') && !nav.contains(event.target)) {
        setMobileMenu(false);
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && nav.classList.contains('menu-open')) {
        setMobileMenu(false);
        menuToggle.focus();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 860) setMobileMenu(false);
    }, { passive: true });
  }

  // ---------- Product details modal ----------
  function renderProductModal(productId) {
    const language = document.documentElement.lang === 'ar' ? 'ar' : 'en';
    const product = productDetails[productId];
    const detail = product?.[language];
    if (!product || !detail) return;

    productModalImage.src = product.image;
    productModalImage.alt = detail.title;
    productModalTag.textContent = detail.tag;
    productModalTitle.textContent = detail.title;
    productModalOverview.textContent = detail.overview;
    productModalSpecs.replaceChildren();
    productModalFeatures.replaceChildren();

    detail.specs.forEach(([label, value]) => {
      const row = document.createElement('div');
      const term = document.createElement('dt');
      const description = document.createElement('dd');
      term.textContent = label;
      description.textContent = value;
      row.append(term, description);
      productModalSpecs.append(row);
    });

    detail.features.forEach((feature) => {
      const item = document.createElement('li');
      item.textContent = feature;
      productModalFeatures.append(item);
    });

    const subject = language === 'ar'
      ? `استفسار عن ${detail.title}`
      : `FTS enquiry - ${detail.title}`;
    productModalCta.href = `mailto:contact@getfixable.com?subject=${encodeURIComponent(subject)}`;
  }

  function openProductModal(productId, trigger) {
    if (!productModal || !productDetails[productId]) return;
    activeProduct = productId;
    lastProductTrigger = trigger;
    renderProductModal(productId);
    productModal.setAttribute('aria-hidden', 'false');
    productModal.classList.add('is-open');
    document.body.classList.add('modal-open');
    if (productModalDialog) productModalDialog.scrollTop = 0;
    const productModalContent = productModal.querySelector('.product-modal-content');
    if (productModalContent) productModalContent.scrollTop = 0;
    requestAnimationFrame(() => productModalClose?.focus());
  }

  function closeProductModal() {
    if (!productModal?.classList.contains('is-open')) return;
    productModal.classList.remove('is-open');
    productModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    activeProduct = null;
    if (lastProductTrigger) lastProductTrigger.focus({ preventScroll: true });
  }

  function setupProductModal() {
    document.querySelectorAll('.product-card[data-product]').forEach((card) => {
      card.addEventListener('click', () => openProductModal(card.dataset.product, card));
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openProductModal(card.dataset.product, card);
        }
      });
    });

    document.querySelectorAll('[data-modal-close]').forEach((element) => {
      element.addEventListener('click', closeProductModal);
    });

    document.addEventListener('keydown', (event) => {
      if (!productModal?.classList.contains('is-open')) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        closeProductModal();
        return;
      }
      if (event.key !== 'Tab' || !productModalDialog) return;

      const focusable = Array.from(productModalDialog.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])'))
        .filter((element) => !element.hasAttribute('disabled'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  // ---------- Image loading ----------
  const images = new Array(TOTAL_FRAMES);
  let loadedCount = 0;
  let primed = false;

  function updateLoader() {
    const pct = Math.min(100, Math.round((loadedCount / PRIME_FRAMES) * 100));
    if (loaderFill) loaderFill.style.width = pct + '%';
    if (loaderPercent) loaderPercent.textContent = pct;
  }

  function hideLoader() {
    if (!loader || loader.classList.contains('hidden')) return;
    loader.classList.add('hidden');
  }

  function loadFrame(i, priority = 'low') {
    return new Promise((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      img.fetchPriority = priority;
      img.onload = () => {
        loadedCount++;
        images[i - 1] = img;
        if (!primed && loadedCount >= PRIME_FRAMES) {
          primed = true;
          updateLoader();
          // Tiny breath so the bar visibly hits 100%.
          setTimeout(() => { hideLoader(); render(); }, 180);
        } else if (!primed) {
          updateLoader();
        }
        resolve();
      };
      img.onerror = () => { loadedCount++; resolve(); };
      img.src = FRAME_PATH(i);
    });
  }

  async function preloadAll() {
    // Load the prime set first (sequential, so progress feels deterministic).
    for (let i = 1; i <= Math.min(PRIME_FRAMES, TOTAL_FRAMES); i++) {
      await loadFrame(i, i === 1 ? 'high' : 'auto');
    }
    // Then the rest in parallel, no await — they fill in the background.
    for (let i = PRIME_FRAMES + 1; i <= TOTAL_FRAMES; i += BACKGROUND_FRAME_STEP) {
      loadFrame(i);
    }
    // Safety: if PRIME_FRAMES > TOTAL_FRAMES, hide anyway.
    if (!primed) { primed = true; hideLoader(); render(); }
  }

  // ---------- Canvas sizing ----------
  function sizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Reset so render() always redraws after a resize (resize clears the canvas)
    currentFrame = -1;
    render();
  }

  // ---------- Render ----------
  let currentProgress = 0;
  let currentFrame = -1;

  function drawImageCover(img) {
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    ctx.fillStyle = '#f6f4ef';
    ctx.fillRect(0, 0, cw, ch);

    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    if (!iw || !ih) return;

    const canvasRatio = cw / ch;
    const imgRatio = iw / ih;
    let dw, dh, dx, dy;

    // Always use "cover" — fill the canvas, crop the excess.
    if (imgRatio > canvasRatio) {
      // Image is wider than canvas — match height, crop sides
      dh = ch; dw = dh * imgRatio;
      dx = (cw - dw) / 2; dy = 0;
    } else {
      // Image is taller than canvas — match width, crop top/bottom
      dw = cw; dh = dw / imgRatio;
      dx = 0; dy = (ch - dh) / 2;
    }

    // Desktop: shift elevator right so text overlay has clean space on the left
    if (cw >= 980) {
      const direction = document.documentElement.dir === 'rtl' ? -1 : 1;
      dx += cw * 0.15 * direction;
    }
    // Mobile: push the image down slightly so text at the top is clear
    if (cw < 980) {
      dy += ch * 0.12;
    }

    ctx.drawImage(img, dx, dy, dw, dh);
  }

  function render() {
    const frameIndex = Math.max(0, Math.min(TOTAL_FRAMES - 1,
      Math.round(currentProgress * (TOTAL_FRAMES - 1))));

    // Find nearest loaded frame at or before the target — avoids flashes
    // during early streaming.
    let idx = frameIndex;
    while (idx > 0 && !images[idx]) idx--;
    const img = images[idx] || images[0];
    if (!img) return;

    if (idx === currentFrame) return;
    currentFrame = idx;
    drawImageCover(img);
  }

  // ---------- Scroll handling ----------
  let pendingFrame = false;
  function onScroll() {
    if (pendingFrame) return;
    pendingFrame = true;
    requestAnimationFrame(() => {
      pendingFrame = false;
      updateProgress();
      updateNav();
      updateHint();
    });
  }

  function updateProgress() {
    const rect = stage.getBoundingClientRect();
    const total = stage.offsetHeight - window.innerHeight;
    const scrolled = -rect.top;
    const p = total > 0 ? Math.max(0, Math.min(1, scrolled / total)) : 0;
    currentProgress = p;
    render();
    updateOverlays(p);
    if (stickyWrap) {
      const scrimThreshold = window.innerWidth < 980 ? 0.02 : 0.15;
      if (p > scrimThreshold) stickyWrap.classList.add('scrim-on');
      else stickyWrap.classList.remove('scrim-on');
    }
  }

  function updateOverlays(p) {
    for (const el of overlays) {
      const from = parseFloat(el.dataset.from);
      const to = parseFloat(el.dataset.to);
      const active = p >= from && p <= to;
      if (active && !el.classList.contains('is-active')) el.classList.add('is-active');
      else if (!active && el.classList.contains('is-active')) el.classList.remove('is-active');
    }
  }

  function updateNav() {
    if (window.scrollY > 32) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }

  function updateHint() {
    if (!scrollHint) return;
    if (currentProgress > 0.03) scrollHint.classList.add('hidden');
    else scrollHint.classList.remove('hidden');
  }

  // ---------- Count-up animation ----------
  function animateCount(el) {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const decimals = parseInt(el.dataset.decimal) || 0;
    const useComma = el.dataset.comma === 'true';
    const duration = 1800;
    const start = performance.now();

    function formatNum(n) {
      let str = decimals > 0 ? n.toFixed(decimals) : Math.round(n).toString();
      if (useComma) {
        const parts = str.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        str = parts.join('.');
      }
      return str + suffix;
    }

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;
      el.textContent = formatNum(current);
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  function setupCountUp() {
    const statNums = document.querySelectorAll('.stat-num[data-target]');
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          animateCount(e.target);
          io.unobserve(e.target);
        }
      }
    }, { threshold: 0.3 });
    statNums.forEach(el => io.observe(el));
  }

  // ---------- Reveal on scroll ----------
  function setupReveal() {
    const els = document.querySelectorAll('.section-head, .service, .why-card, .eng-text, .product-card, .collection-intro, .cabin-group, .process-step, .amc-panel, .contact-inner');
    els.forEach(el => el.classList.add('reveal'));
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      }
    }, { threshold: 0.12 });
    els.forEach(el => io.observe(el));
  }

  // ---------- Init ----------
  function init() {
    setupLanguage();
    setupMobileNavigation();
    setupProductModal();
    sizeCanvas();
    window.addEventListener('resize', sizeCanvas, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    setupReveal();
    setupCountUp();
    updateProgress();
    updateNav();
    preloadAll();

    // Keep slow mobile connections from being trapped behind the loader.
    const loaderTimeout = isNarrowViewport ? 4000 : 8000;
    setTimeout(() => { if (!primed) { primed = true; hideLoader(); render(); } }, loaderTimeout);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
