/* =====================================================================
   ورق بحبر — الإعدادات والمحتوى والبيانات التجريبية
   ---------------------------------------------------------------------
   كل ما يحتاج تعديلاً سريعاً (رسوم التوصيل، الفترات، رابط الاستبيان،
   المدن، محتوى المركز الإعلامي) موجود في هذا الملف.
   ===================================================================== */
window.WB = window.WB || {};

/* ---------- الإعدادات العامة ---------- */
WB.config = {
  brand: 'ورق بحبر',
  slogan: 'كتابك يكمل رحلته',
  hashtag: '#كتابك_يكمل_رحلته',
  handle: '@waraqbihibr',

  /* ضع هنا رابط استبيان Google Forms ليظهر زر المشاركة في المنصة */
  surveyUrl: '',

  /* التوصيل المجدول: من الأحد إلى الخميس (0 = الأحد ... 4 = الخميس) */
  delivery: {
    days: [0, 1, 2, 3, 4],
    windows: {
      am: { label: 'الفترة الصباحية', short: 'صباحية', from: 9, to: 14, text: '9:00 ص – 2:00 م' },
      pm: { label: 'الفترة المسائية', short: 'مسائية', from: 15, to: 20, text: '3:00 م – 8:00 م' }
    },
    cutoffHour: 22,   /* آخر موعد للحجز: 10 مساءً من اليوم السابق */
    daysAhead: 5      /* عدد أيام التوصيل المعروضة للحجز */
  },

  /* رسوم التوصيل بالريال السعودي */
  fees: { purchase: 10, exchange: 6, library: 5, donation: 0 },
  routeCostExample: 60,   /* تكلفة تقديرية لمسار واحد، تُستخدم في الرسم التوضيحي فقط */
  libraryLimit: 2,        /* أقصى عدد كتب يطلبها الطالب من مكتبة المنصة في الوقت نفسه */

  cities: ['الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 'الخبر'],

  universities: [
    'الجامعة السعودية الإلكترونية', 'جامعة الملك سعود', 'جامعة الملك عبدالعزيز', 'جامعة طيبة',
    'الجامعة الإسلامية', 'جامعة أم القرى', 'جامعة الإمام محمد بن سعود الإسلامية',
    'جامعة الأميرة نورة بنت عبدالرحمن', 'جامعة الإمام عبدالرحمن بن فيصل',
    'جامعة الملك فهد للبترول والمعادن', 'جامعة الملك خالد', 'جامعة القصيم', 'جامعة أخرى'
  ],

  colleges: {
    business:    { name: 'إدارة الأعمال',      color: '#2F5D50' },
    media:       { name: 'الإعلام والاتصال',   color: '#7A2E3A' },
    computing:   { name: 'الحاسب والمعلومات',  color: '#24426E' },
    health:      { name: 'العلوم الصحية',      color: '#2E6F7A' },
    science:     { name: 'العلوم والرياضيات',  color: '#4B3F72' },
    engineering: { name: 'الهندسة',            color: '#5A4632' },
    languages:   { name: 'اللغات والترجمة',    color: '#8A5A1F' },
    general:     { name: 'المتطلبات العامة',   color: '#3E4A5C' }
  },

  /* سلّم حالة الكتاب: مبني على التظليل والكتابة بالحبر، وهما أكثر ما يغيّر قيمة الكتاب الجامعي */
  conditions: [
    { key: 'likenew',   label: 'كالجديد',  level: 5, ratio: 0.70, desc: 'بلا تظليل ولا كتابة، والغلاف والتجليد سليمان.' },
    { key: 'excellent', label: 'ممتاز',    level: 4, ratio: 0.60, desc: 'تظليل خفيف في صفحات قليلة، ولا تلف.' },
    { key: 'vgood',     label: 'جيد جداً', level: 3, ratio: 0.50, desc: 'تظليل أو ملاحظات بالقلم في بعض الفصول.' },
    { key: 'good',      label: 'جيد',      level: 2, ratio: 0.40, desc: 'تظليل وكتابة بالحبر في فصول كثيرة، والغلاف سليم.' },
    { key: 'fair',      label: 'مقبول',    level: 1, ratio: 0.30, desc: 'آثار استخدام واضحة، وكل الصفحات موجودة.' }
  ],

  types: {
    sale:     { label: 'بيع',         hint: 'تحدد سعراً ويشتريه طالب آخر.' },
    exchange: { label: 'تبادل',       hint: 'تبدّله بكتاب تحتاجه دون دفع ثمن.' },
    both:     { label: 'بيع أو تبادل', hint: 'تستقبل الطلبين وتختار الأنسب.' }
  }
};

/* ---------- البيانات التجريبية (تُنشأ عند أول زيارة) ---------- */
WB.seed = function () {
  var now = Date.now();
  var DAY = 86400000;
  function ago(d) { return new Date(now - d * DAY).toISOString(); }

  var users = [
    { id: 'u-demo', name: 'مستخدم تجريبي', email: 'demo@waraq-bihibr.test', university: 'الجامعة السعودية الإلكترونية', city: 'المدينة المنورة', demo: true, passHash: null, createdAt: ago(60) },
    { id: 'u1',  name: 'هند س.',    city: 'المدينة المنورة', university: 'جامعة طيبة' },
    { id: 'u2',  name: 'عبدالله م.', city: 'المدينة المنورة', university: 'الجامعة الإسلامية' },
    { id: 'u3',  name: 'ريم ع.',    city: 'الرياض',          university: 'جامعة الأميرة نورة بنت عبدالرحمن' },
    { id: 'u4',  name: 'فيصل ح.',   city: 'المدينة المنورة', university: 'الجامعة السعودية الإلكترونية' },
    { id: 'u5',  name: 'سارة ك.',   city: 'الخبر',           university: 'جامعة الإمام عبدالرحمن بن فيصل' },
    { id: 'u6',  name: 'تركي ب.',   city: 'الرياض',          university: 'جامعة الإمام محمد بن سعود الإسلامية' },
    { id: 'u7',  name: 'لمى ر.',    city: 'جدة',             university: 'جامعة الملك عبدالعزيز' },
    { id: 'u8',  name: 'يوسف ش.',   city: 'الرياض',          university: 'جامعة الملك سعود' },
    { id: 'u9',  name: 'جود ن.',    city: 'الدمام',          university: 'جامعة الإمام عبدالرحمن بن فيصل' },
    { id: 'u10', name: 'خالد ز.',   city: 'مكة المكرمة',     university: 'جامعة أم القرى' },
    { id: 'u11', name: 'منيرة ط.',  city: 'الرياض',          university: 'جامعة الملك سعود' },
    { id: 'u12', name: 'بدر أ.',    city: 'المدينة المنورة', university: 'جامعة طيبة' },
    { id: 'u13', name: 'نوف د.',    city: 'جدة',             university: 'جامعة الملك عبدالعزيز' }
  ];

  var books = [
    { id: 'b1',  title: 'Principles of Marketing', author: 'Philip Kotler, Gary Armstrong', edition: 18, course: 'MKT 201', college: 'business', condition: 'excellent', type: 'sale', price: 85, city: 'المدينة المنورة', sellerId: 'u2', notes: true, notesText: 'ملخص بالحبر الأزرق في نهاية كل فصل', daysAgo: 1 },
    { id: 'b2',  title: 'Financial Accounting', author: 'Jerry J. Weygandt, Paul D. Kimmel, Donald E. Kieso', edition: 11, course: 'ACCT 201', college: 'business', condition: 'vgood', type: 'both', price: 70, wants: 'Managerial Accounting (ACCT 202)', city: 'الرياض', sellerId: 'u3', daysAgo: 2 },
    { id: 'b3',  title: 'Principles of Economics', author: 'N. Gregory Mankiw', edition: 9, course: 'ECON 101', college: 'business', condition: 'good', type: 'exchange', wants: 'Statistics for Business (STAT 201)', city: 'المدينة المنورة', sellerId: 'u4', daysAgo: 3 },
    { id: 'b4',  title: 'Consumer Behavior', author: 'Leon G. Schiffman, Joseph Wisenblit', edition: 12, course: 'MKT 310', college: 'business', condition: 'likenew', type: 'sale', price: 95, city: 'الخبر', sellerId: 'u5', daysAgo: 4 },
    { id: 'b5',  title: "McQuail's Media and Mass Communication Theory", author: 'Denis McQuail, Mark Deuze', edition: 7, course: 'MCOM 210', college: 'media', condition: 'excellent', type: 'both', price: 75, wants: 'Marketing Research', city: 'المدينة المنورة', sellerId: 'u1', notes: true, notesText: 'تعريفات النظريات مظللة بالأصفر', daysAgo: 2 },
    { id: 'b6',  title: 'مدخل إلى الإعلام الرقمي', author: 'مجموعة مؤلفين', edition: 1, course: 'MCOM 101', college: 'media', condition: 'vgood', type: 'both', price: 40, wants: 'كتاب في التصوير الصحفي', city: 'الرياض', sellerId: 'u6', daysAgo: 5 },
    { id: 'b7',  title: 'Public Relations: Strategies and Tactics', author: 'Dennis L. Wilcox, Glen T. Cameron, Bryan H. Reber', edition: 12, course: 'PR 220', college: 'media', condition: 'good', type: 'sale', price: 60, city: 'جدة', sellerId: 'u7', notes: true, notesText: 'أمثلة حملات محلية مكتوبة في الهوامش', daysAgo: 6 },
    { id: 'b8',  title: 'Introduction to Algorithms', author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein', edition: 4, course: 'CS 311', college: 'computing', condition: 'excellent', type: 'sale', price: 140, city: 'الرياض', sellerId: 'u8', daysAgo: 3 },
    { id: 'b9',  title: 'Database System Concepts', author: 'Abraham Silberschatz, Henry F. Korth, S. Sudarshan', edition: 7, course: 'IT 241', college: 'computing', condition: 'vgood', type: 'exchange', wants: 'Computer Networking: A Top-Down Approach', city: 'الدمام', sellerId: 'u9', daysAgo: 8 },
    { id: 'b10', title: 'Campbell Biology', author: 'Lisa A. Urry, Michael L. Cain, Steven A. Wasserman', edition: 12, course: 'BIOL 101', college: 'health', condition: 'good', type: 'sale', price: 110, city: 'مكة المكرمة', sellerId: 'u10', daysAgo: 7 },
    { id: 'b11', title: 'Guyton and Hall Textbook of Medical Physiology', author: 'John E. Hall, Michael E. Hall', edition: 14, course: 'PHYS 201', college: 'health', condition: 'excellent', type: 'sale', price: 160, city: 'الرياض', sellerId: 'u11', notes: true, notesText: 'مخططات مرسومة باليد لأجهزة الجسم', daysAgo: 9 },
    { id: 'b12', title: 'Calculus: Early Transcendentals', author: 'James Stewart, Daniel Clegg, Saleem Watson', edition: 9, course: 'MATH 101', college: 'science', condition: 'vgood', type: 'both', price: 90, wants: 'Linear Algebra and Its Applications', city: 'المدينة المنورة', sellerId: 'u12', daysAgo: 4 },
    { id: 'b13', title: 'Physics for Scientists and Engineers', author: 'Raymond A. Serway, John W. Jewett', edition: 10, course: 'PHYS 103', college: 'engineering', condition: 'fair', type: 'sale', price: 45, city: 'جدة', sellerId: 'u13', daysAgo: 10 },
    { id: 'b14', title: 'Interchange 3', author: 'Jack C. Richards', edition: 5, course: 'ENGL 102', college: 'languages', condition: 'likenew', type: 'exchange', wants: 'Interchange 4', city: 'الرياض', sellerId: 'u3', daysAgo: 6 },
    { id: 'b15', title: 'مهارات الاتصال', author: 'مجموعة مؤلفين', edition: 2, course: 'COMM 101', college: 'general', condition: 'good', type: 'sale', price: 25, city: 'المدينة المنورة', sellerId: 'u12', daysAgo: 11 },
    /* كتابان يملكهما الحساب التجريبي */
    { id: 'b16', title: 'Statistics for Business and Economics', author: 'David R. Anderson, Dennis J. Sweeney, Thomas A. Williams', edition: 14, course: 'STAT 201', college: 'business', condition: 'excellent', type: 'sale', price: 65, city: 'المدينة المنورة', sellerId: 'u-demo', daysAgo: 12 },
    { id: 'b17', title: 'Marketing Research: An Applied Orientation', author: 'Naresh K. Malhotra', edition: 7, course: 'MKT 340', college: 'business', condition: 'vgood', type: 'both', price: 55, wants: 'Mass Communication Theory (MCOM 210)', city: 'المدينة المنورة', sellerId: 'u-demo', daysAgo: 12 }
  ];

  var library = [
    { id: 'l1', title: 'Management', author: 'Stephen P. Robbins, Mary Coulter', edition: 14, course: 'MGT 101', college: 'business', condition: 'good', city: 'المدينة المنورة', daysAgo: 3 },
    { id: 'l2', title: 'Business Communication: Process and Product', author: 'Mary Ellen Guffey, Dana Loewy', edition: 9, course: 'BUS 201', college: 'business', condition: 'vgood', city: 'الرياض', daysAgo: 5 },
    { id: 'l3', title: 'Introduction to Mass Communication', author: 'Stanley J. Baran', edition: 10, course: 'MCOM 110', college: 'media', condition: 'good', city: 'المدينة المنورة', daysAgo: 2 },
    { id: 'l4', title: 'Python Crash Course', author: 'Eric Matthes', edition: 3, course: 'CS 101', college: 'computing', condition: 'excellent', city: 'جدة', daysAgo: 8 },
    { id: 'l5', title: 'Fundamentals of Nursing', author: 'Patricia A. Potter, Anne Griffin Perry', edition: 10, course: 'NURS 101', college: 'health', condition: 'fair', city: 'الرياض', daysAgo: 9 },
    { id: 'l6', title: 'مهارات التفكير الناقد', author: 'مجموعة مؤلفين', edition: 1, course: 'GS 102', college: 'general', condition: 'vgood', city: 'المدينة المنورة', daysAgo: 6 },
    { id: 'l7', title: 'Writing Academic English', author: 'Alice Oshima, Ann Hogue', edition: 4, course: 'ENGL 201', college: 'languages', condition: 'good', city: 'الدمام', daysAgo: 12 },
    { id: 'l8', title: 'Essentials of Human Anatomy & Physiology', author: 'Elaine N. Marieb, Suzanne M. Keller', edition: 13, course: 'ANAT 101', college: 'health', condition: 'fair', city: 'مكة المكرمة', daysAgo: 4 }
  ];

  /* طلب تبادل وارد على كتاب الحساب التجريبي، لعرض دورة التبادل كاملة */
  var orders = [
    { id: 'WB-30418', kind: 'exchange', userId: 'u1', ownerId: 'u-demo', bookId: 'b17', offerBookId: 'b5', slot: 'auto', district: 'حي قباء', fee: 6, status: 'pending', message: 'أحتاج Marketing Research لمقرر MKT 340 هذا الفصل، وكتاب McQuail عندي بحالة ممتازة.', createdAt: ago(1) }
  ];

  books.forEach(function (b) {
    b.status = 'available'; b.notes = !!b.notes; b.notesText = b.notesText || ''; b.wants = b.wants || '';
    b.photo = ''; b.createdAt = ago(b.daysAgo); delete b.daysAgo;
  });
  library.forEach(function (b) {
    b.status = 'available'; b.createdAt = ago(b.daysAgo); delete b.daysAgo;
  });

  return { users: users, books: books, library: library, orders: orders };
};

/* ---------- محتوى المركز الإعلامي ---------- */
(function () {
  var C = WB.config;
  WB.content = {

    articles: [
      {
        id: 'pricing', category: 'دليل البائع',
        title: 'كيف تسعّر كتابك الجامعي المستعمل؟',
        excerpt: 'ثلاثة أسئلة تحدد السعر العادل: كم سعره جديداً؟ وما حالته؟ وهل ما زالت طبعته مطلوبة في المقرر؟',
        body: [
          ['p', 'السعر المناسب يبيع الكتاب في أيام، والسعر المبالغ فيه يبقيه على الرف حتى نهاية الفصل. ابدأ دائماً من سعر الكتاب جديداً، ثم اخصم منه بحسب حالته.'],
          ['h3', 'نسب مقترحة حسب الحالة'],
          ['ul', C.conditions.map(function (c) { return c.label + ': نحو ' + Math.round(c.ratio * 100) + '% من سعره جديداً'; })],
          ['p', 'تستخدم المنصة هذه النسب نفسها حين تقترح عليك سعراً في نموذج عرض الكتاب، ولك أن تعدّل السعر كما تشاء.'],
          ['h3', 'الطبعة أهم من الغلاف'],
          ['p', 'إذا كانت طبعتك هي المعتمدة في مقرر هذا الفصل فسعرها يبقى قريباً من النسب أعلاه. أما الطبعة الأقدم فتنخفض قيمتها، لأن أرقام الصفحات والتمارين تختلف بين الطبعات.'],
          ['h3', 'الملاحظات المكتوبة قد ترفع السعر'],
          ['p', 'التظليل الكثيف يقلل قيمة الكتاب عند أغلب المشترين، لكن الملخصات المرتبة في الهوامش قد تكون ميزة لطالب يريد مذاكرة أسرع. اذكرها بوضوح، وفعّل خيار «فيه ملاحظات بخط اليد» عند عرض الكتاب.'],
          ['h3', 'اختر التوقيت'],
          ['p', 'يرتفع الطلب على الكتب في الأسبوعين السابقين لبداية الفصل وفي أسبوعه الأول. اعرض كتابك قبل ذلك بقليل، وأرفق صورة واضحة للغلاف.']
        ]
      },
      {
        id: 'inspect', category: 'دليل المشتري',
        title: 'خمس نقاط تفحصها قبل شراء كتاب مستعمل',
        excerpt: 'من رقم الطبعة إلى رمز الدخول الإلكتروني: تفاصيل صغيرة تحدد إن كان الكتاب سيخدمك طوال الفصل.',
        body: [
          ['p', 'شراء الكتاب المستعمل يوفر عليك جزءاً كبيراً من سعره، بشرط أن يكون هو الكتاب الذي يطلبه مقررك فعلاً. قبل أن ترسل طلب الشراء، راجع هذه النقاط في صفحة الكتاب.'],
          ['ol', [
            'رمز المقرر والطبعة: قارنهما بخطة المقرر، فاختلاف الطبعة قد يعني اختلاف أرقام الصفحات والتمارين.',
            'اكتمال الصفحات: تأكد من عدم وجود صفحات ناقصة أو ممزقة، خصوصاً الفهرس والملاحق.',
            'حجم التظليل: التظليل الخفيف لا يضر، أما التظليل الكثيف فقد يشتت تركيزك.',
            'الغلاف والتجليد: التجليد المفكك يعني أوراقاً تتساقط في منتصف الفصل.',
            'رمز الدخول الإلكتروني: بعض الكتب تأتي برمز لمنصة تمارين، وغالباً يكون قد استُخدم. تأكد إن كان مقررك يحتاجه.'
          ]],
          ['p', 'وعند الاستلام في الفترة المجدولة، تصفح الكتاب أمام المندوب. إن وجدته مختلفاً عن وصفه فلك أن ترفض الاستلام، ويعود الكتاب إلى صاحبه دون أن تدفع شيئاً.']
        ]
      },
      {
        id: 'exchange', category: 'التبادل',
        title: 'بدّل كتب فصلك الماضي بكتب فصلك القادم',
        excerpt: 'التبادل يوفر عليك ثمن الكتاب كاملاً. هذه طريقة ترفع فرصتك في إيجاد من يبادلك.',
        body: [
          ['p', 'في نهاية كل فصل يملك كثير من الطلاب كتباً انتهى مقررها، ويبحث غيرهم عن الكتب نفسها. التبادل يجمع الطرفين: تعطي كتاباً لا تحتاجه، وتأخذ كتاباً تحتاجه، ولا يدفع أحدكما ثمن كتاب.'],
          ['h3', 'اكتب ما تريده بدقة'],
          ['p', 'عند عرض كتابك للتبادل اكتب عنوان الكتاب الذي تحتاجه أو رمز مقرره، مثل STAT 201. تقارن المنصة ما تريده بالكتب المعروضة في مدينتك، وتظهر لك المطابقات في صفحة التبادل.'],
          ['h3', 'اختر «بيع أو تبادل»'],
          ['p', 'إذا لم تكن مستعجلاً، اعرض كتابك للبيع والتبادل معاً. ستصلك طلبات من النوعين وتختار الأنسب لك.'],
          ['h3', 'مسار واحد للطرفين'],
          ['p', 'عند قبول طلب التبادل يُجدول التوصيل للطرفين في الفترة نفسها، ويقتسمان رسومه: ' + C.fees.exchange + ' ريالات على كل طرف.'],
          ['h3', 'تقارب الحالة'],
          ['p', 'التبادل العادل يكون بين كتابين متقاربين في الحالة والقيمة. إن كان الفرق كبيراً فاذكر ذلك في رسالة الطلب، فقد يتفق الطرفان على البيع بدلاً من التبادل.']
        ]
      },
      {
        id: 'donate', category: 'مكتبة المنصة',
        title: 'حين يصبح كتابك منحة لطالب آخر',
        excerpt: 'كيف تعمل مكتبة المنصة، ولماذا يكفي كتاب واحد لتخفيف عبء فصل كامل عن طالب.',
        body: [
          ['p', 'ليس كل طالب قادراً على شراء كل مراجع الفصل. ومن هنا جاءت مكتبة ورق بحبر: كتب تبرّع بها طلاب أنهوا مقرراتهم، وتنتظر طلاباً يحتاجونها.'],
          ['h3', 'كيف يصل تبرعك؟'],
          ['p', 'تختار فترة استلام تناسبك من الأحد إلى الخميس، ويأتي المندوب لاستلام الكتاب دون أي رسوم عليك. يُفحص الكتاب ثم يُضاف إلى مكتبة مدينتك.'],
          ['h3', 'من يستفيد؟'],
          ['p', 'أي طالب مسجل في المنصة يستطيع طلب كتاب من المكتبة مجاناً، ويدفع فقط رسوم توصيل رمزية قدرها ' + C.fees.library + ' ريالات. ولكي تصل الكتب إلى أكبر عدد من الطلاب، يطلب كل طالب كتابين كحد أقصى في الوقت نفسه.'],
          ['h3', 'ورق يبقى في الاستخدام'],
          ['p', 'الكتاب الذي يُتبرع به لا يُخزّن في درج ولا ينتهي في مكب النفايات. ينتقل إلى قارئ جديد، ويحمل معه شيئاً من حبر من سبقه.']
        ]
      }
    ],

    campaign: {
      name: 'كتابك يكمل رحلته',
      summary: 'حملة توعوية رقمية تشجع الطلاب على إعطاء كتبهم الجامعية حياة ثانية بالبيع أو التبادل أو التبرع، وتعرّفهم بمنصة ورق بحبر وخدمة التوصيل المجدول.',
      brief: [
        ['الهدف', 'رفع وعي الطلاب بقيمة إعادة استخدام الكتب الجامعية، وزيادة عدد الكتب المعروضة والمتبرع بها في المنصة.'],
        ['الجمهور المستهدف', 'طلاب الجامعات السعودية وطالباتها، وخصوصاً طلاب السنتين الأولى والثانية لأنهم الأكثر شراءً للكتب.'],
        ['الرسالة الرئيسية', 'كتابك لم ينتهِ دوره بانتهاء المقرر، بل يستطيع أن يبدأ رحلة جديدة مع طالب آخر.'],
        ['القنوات', 'إنستغرام وتيك توك وسناب شات وإكس، ولوحات في الحرم الجامعي برمز QR يقود إلى المنصة، وسفراء للحملة من الأندية الطلابية.'],
        ['التوقيت', 'أسبوعان قبل بداية كل فصل دراسي، ثم أسبوع الاختبارات النهائية حين يقرر الطلاب مصير كتبهم.'],
        ['مؤشرات القياس', 'عدد الكتب المعروضة والمتبرع بها خلال الحملة، والوصول والتفاعل مع الوسم، والزيارات القادمة من روابط الحملة ورموز QR.']
      ],
      phases: [
        { title: 'التشويق', text: 'صور لكتب مكدسة في الأدراج مع سؤال واحد: «وش مصير كتبك بعد الاختبار؟»' },
        { title: 'الإطلاق', text: 'فيديو قصير يتتبع رحلة كتاب واحد بين ثلاثة طلاب، مع الوسم ورابط المنصة.' },
        { title: 'التفاعل', text: 'تحدي «صوّر كتابك»: يشارك الطالب صورة كتاب يريد أن يكمل رحلته، ثم يعرضه في المنصة.' },
        { title: 'التذكير', text: 'منشورات قصيرة بمواعيد التوصيل المجدول، وبعدد الكتب التي انتقلت بين الطلاب خلال الحملة.' }
      ],
      story: [
        { when: 'الفصل الأول', text: 'اشترته طالبة جديداً لمقرر مبادئ التسويق، وظللت فيه تعريفات المزيج التسويقي.' },
        { when: 'نهاية الفصل', text: 'عرضته في ورق بحبر بحالة «ممتاز» مع ملخصاتها في الهوامش.' },
        { when: 'الفصل التالي', text: 'اشتراه طالب في المدينة نفسها، ووصله في الفترة المسائية يوم الثلاثاء.' },
        { when: 'بعد سنة', text: 'بادله بكتاب الإحصاء الذي يحتاجه في المستوى التالي.' },
        { when: 'اليوم', text: 'تبرّع به آخر مالكيه لمكتبة المنصة، وما زال يحمل حبر ثلاثة طلاب.' }
      ],
      posters: [
        { caption: 'منشور مربع لإنستغرام · مرحلة الإطلاق' },
        { caption: 'منشور للتبادل · بداية الفصل' },
        { caption: 'منشور للتبرع · أسبوع الاختبارات' }
      ]
    },

    calendar: [
      { day: 'الأحد',    platform: 'إنستغرام', type: 'كتاب الأسبوع',      idea: 'صورة لكتاب مطلوب في المنصة مع سعره وحالته ورمز مقرره.', format: 'منشور كاروسيل' },
      { day: 'الاثنين',  platform: 'إكس',      type: 'نصيحة دراسية',      idea: 'نصيحة قصيرة في المذاكرة أو تنظيم مراجع الفصل، مع رابط مقال من المركز الإعلامي.', format: 'تغريدة أو سلسلة' },
      { day: 'الثلاثاء', platform: 'تيك توك',  type: 'رحلة كتاب',         idea: 'مقطع يتتبع كتاباً من صاحبه الأول إلى صاحبه الجديد.', format: 'فيديو قصير 30–45 ثانية' },
      { day: 'الأربعاء', platform: 'سناب شات', type: 'تذكير التوصيل',     idea: 'فترات التوصيل المتاحة للأسبوع القادم، وآخر موعد للحجز (10 مساءً من اليوم السابق).', format: 'قصة (ستوري)' },
      { day: 'الخميس',   platform: 'إنستغرام', type: 'تحدي «صوّر كتابك»', idea: 'إعادة نشر مشاركات الطلاب في التحدي مع وسم الحملة.', format: 'ريلز وقصص' }
    ],

    seasons: [
      { when: 'قبل بداية الفصل بأسبوعين', focus: 'البيع والتبادل: «جهّز كتب فصلك الجاي»' },
      { when: 'الأسبوع الأول من الفصل',  focus: 'الشراء: كتب المقررات الأكثر طلباً ومطابقات التبادل' },
      { when: 'أسبوع الاختبارات النهائية', focus: 'التبرع: «لا تخلّيه في الدرج»' }
    ],

    podcast: {
      name: 'بودكاست حبر',
      status: 'الموسم الأول قيد الإعداد',
      format: 'حلقات من 20 إلى 25 دقيقة كل أسبوعين، تُنشر على منصات البودكاست، مع مقاطع قصيرة منها على تيك توك وإنستغرام.',
      episodes: [
        { title: 'كتاب واحد، ثلاثة طلاب', text: 'حوار مع ثلاثة طلاب تداولوا الكتاب نفسه عبر المنصة.', guest: 'طلاب من مستخدمي المنصة' },
        { title: 'ميزانية الفصل', text: 'كيف يخطط الطالب لمصروف الكتب والمراجع في كل فصل.', guest: 'مختص في التخطيط المالي الشخصي' },
        { title: 'ورق أخضر', text: 'إعادة الاستخدام والاستدامة داخل الحرم الجامعي.', guest: 'نادي البيئة الطلابي' },
        { title: 'ملاحظات في الهامش', text: 'هل تفيدك ملاحظات من سبقك؟ حوار عن أساليب المذاكرة.', guest: 'طالب متفوق ومرشد أكاديمي' }
      ]
    },

    brand: {
      story: 'الورق هو الكتاب نفسه، والحبر أثر من استخدمه قبلك: ملاحظاته وتظليله وخبرته. حين ينتقل الكتاب من طالب إلى آخر، ينتقل معه شيء من هذا الحبر.',
      colors: [
        { name: 'حبر جاف',     hex: '#2140B0', role: 'اللون الأساسي: الشعار والأزرار والروابط' },
        { name: 'حبر أسود',    hex: '#141A33', role: 'النصوص' },
        { name: 'ورق',         hex: '#F5F7FB', role: 'الخلفية' },
        { name: 'تظليل أصفر',  hex: '#FFEF5E', role: 'البيع' },
        { name: 'تظليل وردي',  hex: '#FFBFDC', role: 'التبادل' },
        { name: 'تظليل أخضر',  hex: '#B5EDA2', role: 'التبرع ومكتبة المنصة' },
        { name: 'قلم أحمر',    hex: '#CF3434', role: 'الهامش والأختام والتنبيهات' }
      ],
      fonts: [
        { name: 'Markazi Text',         role: 'العناوين',                 sample: 'كتابك يكمل رحلته', cls: 'f-display' },
        { name: 'Aref Ruqaa',           role: 'الشعار والملاحظات بخط اليد', sample: 'ورق بحبر',          cls: 'f-hand' },
        { name: 'IBM Plex Sans Arabic', role: 'النصوص والواجهة',          sample: 'اعرض كتابك واختر فترة التوصيل المناسبة', cls: 'f-ui' }
      ],
      voice: [
        { title: 'واضحون', text: 'نذكر السعر والحالة والموعد كما هي.', yes: 'الكتاب بحالة جيدة، وفيه تظليل في الفصول الثلاثة الأولى.', no: 'كتاب رهيب وبحالة خيالية!' },
        { title: 'قريبون', text: 'نتحدث كما يتحدث طالب مع زميله.', yes: 'خلّصت المقرر؟ خلّ كتابك يكمل رحلته.', no: 'يرجى من الطلاب الكرام المبادرة بعرض كتبهم.' },
        { title: 'مشجعون', text: 'نحتفي بكل كتاب ينتقل إلى طالب جديد.', yes: 'كتابك وصل اليوم لطالب في جدة.', no: 'تمت العملية رقم 4831 بنجاح.' }
      ]
    },

    press: {
      label: 'نموذج بيان صحفي لإطلاق المنصة',
      dateline: 'الرياض',
      headline: 'إطلاق «ورق بحبر»: منصة رقمية لبيع الكتب الجامعية المستعملة وتبادلها والتبرع بها',
      lead: 'أُطلقت منصة «ورق بحبر»، وهي منصة رقمية متخصصة في بيع الكتب الجامعية والمراجع الأكاديمية المستعملة وشرائها وتبادلها بين الطلاب، وتتيح التبرع بالكتب لمكتبة المنصة، مع خدمة توصيل مجدولة منخفضة التكلفة.',
      body: [
        'تتيح المنصة للطالب عرض الكتب التي لم يعد يحتاجها للبيع أو التبادل، والبحث عن الكتب باسمها أو برمز المقرر، وطلب الكتب المتبرع بها مجاناً مقابل رسوم توصيل رمزية.',
        'وتعتمد المنصة نظام توصيل مجدولاً من الأحد إلى الخميس في فترتين: صباحية من التاسعة صباحاً حتى الثانية ظهراً، ومسائية من الثالثة عصراً حتى الثامنة مساءً. وبتجميع طلبات كل حي في الفترة نفسها ضمن مسار واحد، تنخفض تكلفة التوصيل على الطلاب.',
        'ويرافق إطلاق المنصة حملة توعوية رقمية بوسم #كتابك_يكمل_رحلته، تدعو الطلاب إلى إعطاء كتبهم حياة ثانية بدلاً من تخزينها أو رميها.',
        'وقال فريق ورق بحبر: «كل فصل دراسي ينتهي بكتب كثيرة لا يحتاجها أصحابها، ويبدأ بطلاب يبحثون عنها. أردنا أن نختصر المسافة بين الطرفين في منصة واحدة».'
      ],
      about: 'ورق بحبر منصة رقمية طلابية للكتب الجامعية المستعملة، نشأت مشروعَ تخرج في مسار المشاريع الرقمية بقسم الإعلام الإلكتروني في الجامعة السعودية الإلكترونية.'
    },

    socials: [
      { name: 'إنستغرام', use: 'كتاب الأسبوع وتحدي «صوّر كتابك»' },
      { name: 'تيك توك',  use: 'مقاطع «رحلة كتاب»' },
      { name: 'سناب شات', use: 'تذكير مواعيد التوصيل' },
      { name: 'إكس',      use: 'النصائح والإعلانات السريعة' }
    ],

    faq: [
      { q: 'ماذا يحدث إذا لم أكن موجوداً وقت التوصيل؟', a: 'يتصل بك المندوب عند وصوله إلى الحي. وإن تعذّر التسليم يُنقل طلبك إلى الفترة التالية المتاحة دون رسوم إضافية، لمرة واحدة.' },
      { q: 'هل أستطيع تغيير موعد التوصيل؟', a: 'يمكنك إلغاء الطلب من صفحة «حسابي» قبل الساعة 10 مساءً من اليوم السابق للموعد، ثم حجز فترة جديدة.' },
      { q: 'كيف أدفع؟', a: 'تدفع ثمن الكتاب ورسوم التوصيل عند الاستلام، نقداً أو بالبطاقة لدى المندوب، بعد أن تتفحص الكتاب.' },
      { q: 'لماذا لا يوجد توصيل يومي الجمعة والسبت؟', a: 'نستخدم اليومين لتجميع الطلبات الجديدة وتخطيط مسارات الأسبوع، فتنخفض تكلفة كل رحلة.' },
      { q: 'ما المدن المشمولة؟', a: 'في المرحلة الأولى: ' + C.cities.join('، ') + '. والتوصيل داخل المدينة الواحدة.' }
    ]
  };
})();
