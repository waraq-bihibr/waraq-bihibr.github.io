/* =====================================================================
   ورق بحبر — منطق المنصة
   ---------------------------------------------------------------------
   نموذج أولي يعمل بالكامل في المتصفح (HTML + CSS + JavaScript بلا مكتبات).
   الحسابات والكتب والطلبات تُحفظ في التخزين المحلي (localStorage) لهذا
   المتصفح فقط. عند الإطلاق الفعلي تُستبدل طبقة التخزين بقاعدة بيانات.
   ===================================================================== */
(function () {
  'use strict';

  var C = WB.config;
  var CT = WB.content;
  var DAY = 86400000;

  document.documentElement.lang = 'ar';
  document.documentElement.dir = 'rtl';

  /* =================================================================
     أدوات مساعدة
     ================================================================= */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }
  function bd(s) { return '<bdi>' + esc(s) + '</bdi>'; }
  function isAr(s) { return /[؀-ۿ]/.test(s || ''); }
  function norm(s) {
    return String(s || '').toLowerCase()
      .replace(/[ً-ْـ]/g, '')
      .replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي')
      .replace(/[^a-z0-9؀-ۿ]+/g, '');
  }
  function words(s) {
    return String(s || '').toLowerCase().split(/[^a-z0-9؀-ۿ]+/).map(norm).filter(function (w) { return w.length >= 4; });
  }
  function nowIso() { return new Date().toISOString(); }
  function initial(name) { return (String(name || '؟').trim().charAt(0)) || '؟'; }
  function firstName(name) { return String(name || '').split(' ')[0]; }
  function money(n) { return '<span class="num">' + n + '</span> ر.س'; }
  function district(d) { d = String(d || '').trim(); return /^حي\s/.test(d) ? d : 'حي ' + d; }
  function countOf(n, one, two, few, many) {
    if (n === 0) return 'لا ' + few;
    if (n === 1) return one;
    if (n === 2) return two;
    if (n <= 10) return n + ' ' + few;
    return n + ' ' + many;
  }
  function booksCount(n) { return n === 0 ? 'لا كتب' : countOf(n, 'كتاب واحد', 'كتابان', 'كتب', 'كتاباً'); }
  function ordersCount(n) { return countOf(n, 'طلب واحد', 'طلبان', 'طلبات', 'طلباً'); }
  function agoText(iso) {
    var d = Math.floor((Date.now() - new Date(iso).getTime()) / DAY);
    if (d <= 0) return 'اليوم';
    if (d === 1) return 'أمس';
    if (d === 2) return 'قبل يومين';
    if (d <= 10) return 'قبل ' + d + ' أيام';
    return 'قبل ' + d + ' يوماً';
  }
  function edLabel(b) {
    if (!b.edition) return '';
    if (isAr(b.title)) return 'الطبعة ' + b.edition;
    var n = b.edition, s = 'th';
    if (n % 100 < 11 || n % 100 > 13) s = ({ 1: 'st', 2: 'nd', 3: 'rd' })[n % 10] || 'th';
    return n + s + ' ed.';
  }
  function readMinutes(article) {
    var text = article.body.map(function (b) { return Array.isArray(b[1]) ? b[1].join(' ') : b[1]; }).join(' ');
    return Math.max(1, Math.round(text.split(/\s+/).length / 130));
  }
  function readLabel(article) {
    var n = readMinutes(article);
    if (n === 1) return 'قراءة دقيقة';
    if (n === 2) return 'قراءة دقيقتين';
    return 'قراءة ' + n + (n <= 10 ? ' دقائق' : ' دقيقة');
  }

  /* ---------- أيقونات ---------- */
  var ICONS = {
    check: '<path d="M5 12.5l4.2 4.2L19 7"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.6v.4"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    truck: '<path d="M3 6.5h11v9.5H3zM14 10h3.8L21 13.2V16h-7"/><circle cx="7" cy="17.6" r="1.7"/><circle cx="17.4" cy="17.6" r="1.7"/>',
    swap: '<path d="M6 8h12l-3.5-3.5M18 16H6l3.5 3.5"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66L12 6.3"/><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"/>',
    arrow: '<path d="M15 6l-6 6 6 6"/>'
  };
  function icon(n) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[n] + '</svg>';
  }
  var LOGO = '<svg class="brand-mark" viewBox="0 0 40 40" aria-hidden="true">' +
    '<path d="M31 4.5H15.5L8 12v23.5h23z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>' +
    '<path d="M15.5 4.5V12H8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>' +
    '<path d="M19.5 15.2s-6.2 6.7-6.2 10.4a6.2 6.2 0 0 0 12.4 0c0-3.7-6.2-10.4-6.2-10.4z" fill="currentColor"/></svg>';

  /* =================================================================
     التخزين المحلي
     ================================================================= */
  var KEY = 'waraq-bihibr:v1';
  function readStore() {
    try {
      var raw = window.localStorage.getItem(KEY);
      if (!raw) return null;
      var d = JSON.parse(raw);
      return d && d.v === 1 ? d : null;
    } catch (e) { return null; }
  }
  function freshDB() {
    var s = WB.seed();
    return { v: 1, users: s.users, books: s.books, library: s.library, orders: s.orders, subscribers: [], session: null, returnTo: null, notice: true };
  }
  function save() {
    try { window.localStorage.setItem(KEY, JSON.stringify(db)); return true; } catch (e) { return false; }
  }
  var db = readStore() || freshDB();

  function hashPw(email, pw) {
    var data = String(email).toLowerCase() + '::waraq::' + pw;
    try {
      if (window.crypto && window.crypto.subtle && window.TextEncoder) {
        return window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(data)).then(function (buf) {
          return Array.prototype.map.call(new Uint8Array(buf), function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
        }).catch(function () { return fnv(data); });
      }
    } catch (e) { /* يكمل بالبديل */ }
    return Promise.resolve(fnv(data));
  }
  function fnv(s) {
    var h = 0x811c9dc5;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
    return 'f' + (h >>> 0).toString(16);
  }

  /* =================================================================
     البحث عن البيانات
     ================================================================= */
  function col(k) { return C.colleges[k] || C.colleges.general; }
  function cond(k) { return C.conditions.find(function (c) { return c.key === k; }) || C.conditions[2]; }
  function userById(id) { return db.users.find(function (u) { return u.id === id; }); }
  function me() { return (db.session && userById(db.session)) || null; }
  function findBook(id) {
    return db.books.find(function (b) { return b.id === id; }) || db.library.find(function (b) { return b.id === id; });
  }
  function isLib(b) { return !!b && db.library.indexOf(b) !== -1; }
  function byNewest(a, b) { return new Date(b.createdAt) - new Date(a.createdAt); }
  function setStatus(list, id, st) { var b = list.find(function (x) { return x.id === id; }); if (b) b.status = st; }
  function orderId() {
    var id;
    do { id = 'WB-' + (10000 + Math.floor(Math.random() * 89999)); } while (db.orders.some(function (o) { return o.id === id; }));
    return id;
  }

  /* =================================================================
     التواريخ وفترات التوصيل
     ================================================================= */
  function fmt(opts, cal) {
    try { return new Intl.DateTimeFormat('ar-SA-u-ca-' + (cal || 'gregory') + '-nu-latn', opts); }
    catch (e) { return new Intl.DateTimeFormat('ar', opts); }
  }
  var fWeekday = fmt({ weekday: 'long' });
  var fDayMonth = fmt({ day: 'numeric', month: 'long' });
  var fFull = fmt({ day: 'numeric', month: 'long', year: 'numeric' });
  var fHijri = (function () { try { return fmt({ day: 'numeric', month: 'long' }, 'islamic-umalqura'); } catch (e) { return null; } })();
  function hijri(d) { try { return fHijri ? fHijri.format(d) : ''; } catch (e) { return ''; } }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parseYmd(s) { var p = s.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); }

  /* الأيام المتاحة للحجز: من الغد (أو بعد الغد بعد الساعة 10 مساءً)، الأحد إلى الخميس فقط */
  function upcomingDays(n) {
    n = n || C.delivery.daysAhead;
    var now = new Date(), out = [];
    var d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    if (now.getHours() >= C.delivery.cutoffHour) d.setDate(d.getDate() + 1);
    while (out.length < n) {
      if (C.delivery.days.indexOf(d.getDay()) !== -1) out.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return out;
  }
  function slotKey(d, w) { return ymd(d) + '|' + w; }
  function slotInfo(key) {
    var p = String(key).split('|'), d = parseYmd(p[0]), w = C.delivery.windows[p[1]] || C.delivery.windows.am;
    var start = new Date(d); start.setHours(w.from, 0, 0, 0);
    var end = new Date(d); end.setHours(w.to, 0, 0, 0);
    return { d: d, w: w, start: start, end: end, day: fWeekday.format(d) + ' ' + fDayMonth.format(d), label: fWeekday.format(d) + ' ' + fDayMonth.format(d) + ' · ' + w.label + ' (' + w.text + ')' };
  }
  function canModify(o) {
    var s = slotInfo(o.slot), cut = new Date(s.d);
    cut.setDate(cut.getDate() - 1); cut.setHours(C.delivery.cutoffHour, 0, 0, 0);
    return Date.now() < cut.getTime();
  }
  function nextSlotLabel() { var d = upcomingDays(1)[0]; return slotInfo(slotKey(d, 'am')).day; }

  function slotPicker(prefix) {
    return '<div class="slots" role="radiogroup" aria-label="فترات التوصيل المتاحة">' + upcomingDays().map(function (d) {
      var dk = ymd(d), h = hijri(d);
      return '<div class="slot-day"><div class="slot-date"><b>' + esc(fWeekday.format(d)) + '</b><small>' + esc(fDayMonth.format(d)) + (h ? ' · ' + esc(h) : '') + '</small></div>' +
        ['am', 'pm'].map(function (w) {
          var id = prefix + '-slot-' + dk + '-' + w, win = C.delivery.windows[w];
          return '<label class="slot" for="' + id + '"><input type="radio" id="' + id + '" name="slot" value="' + dk + '|' + w + '"><b>' + win.label + '</b><span>' + win.text + '</span></label>';
        }).join('') + '</div>';
    }).join('') + '</div>';
  }

  /* =================================================================
     حالة الطلبات
     ================================================================= */
  var KIND = { purchase: 'شراء', exchange: 'تبادل', library: 'من مكتبة المنصة', donation: 'تبرع' };
  function orderState(o) {
    if (o.status === 'cancelled') return { key: 'cancelled', label: 'ملغى', cls: 'st-muted' };
    if (o.status === 'declined') return { key: 'declined', label: 'اعتُذر عنه', cls: 'st-muted' };
    if (o.status === 'pending') return { key: 'pending', label: 'بانتظار موافقة صاحب الكتاب', cls: 'st-warn' };
    var s = slotInfo(o.slot), t = Date.now();
    if (t < s.start.getTime()) return { key: 'scheduled', label: 'مجدول', cls: 'st-info' };
    if (t <= s.end.getTime()) return { key: 'route', label: 'في المسار الآن', cls: 'st-warn' };
    var done = { donation: 'تم الاستلام', exchange: 'تم التبادل' }[o.kind] || 'تم التسليم';
    return { key: 'done', label: done, cls: 'st-ok' };
  }
  function isLive(o) { var k = orderState(o).key; return k === 'scheduled' || k === 'route' || k === 'pending'; }

  /* تحديث حالة الكتب بعد مرور موعد التوصيل */
  function sync() {
    var changed = false;
    db.orders.forEach(function (o) {
      if ((o.status !== 'scheduled' && o.status !== 'accepted') || o.closed) return;
      if (orderState(o).key !== 'done') return;
      o.closed = true; changed = true;
      if (o.kind === 'purchase') setStatus(db.books, o.bookId, 'sold');
      if (o.kind === 'library') setStatus(db.library, o.bookId, 'given');
      if (o.kind === 'exchange') { setStatus(db.books, o.bookId, 'exchanged'); setStatus(db.books, o.offerBookId, 'exchanged'); }
      if (o.kind === 'donation') setStatus(db.library, o.bookId, 'available');
    });
    if (changed) save();
  }
  function releaseBooks(o) {
    if (o.kind === 'purchase') setStatus(db.books, o.bookId, 'available');
    if (o.kind === 'library') setStatus(db.library, o.bookId, 'available');
    if (o.kind === 'exchange' && o.status === 'accepted') { setStatus(db.books, o.bookId, 'available'); setStatus(db.books, o.offerBookId, 'available'); }
    if (o.kind === 'donation') { db.library = db.library.filter(function (b) { return b.id !== o.bookId; }); }
  }

  /* =================================================================
     مكونات العرض
     ================================================================= */
  var STAMP = { reserved: 'محجوز', sold: 'مُباع', exchanged: 'تم التبادل', given: 'سُلّم', incoming: 'يصل قريباً' };
  function cover(b, opt) {
    opt = opt || {};
    var st = (opt.stamp !== false && b.status !== 'available' && STAMP[b.status]) ? '<span class="stamp">' + STAMP[b.status] + '</span>' : '';
    if (b.photo) {
      return '<div class="cover-wrap"><img class="cover-photo" src="' + esc(b.photo) + '" alt="صورة كتاب ' + esc(b.title) + '">' + st + '</div>';
    }
    var dir = isAr(b.title) ? 'rtl' : 'ltr';
    var by = (b.author || '') + (b.edition ? ' · ' + edLabel(b) : '');
    return '<div class="cover-wrap"><div class="cover" dir="' + dir + '" style="--c:' + col(b.college).color + '" role="img" aria-label="غلاف ' + esc(b.title) + '">' +
      '<span class="cover-code">' + esc(b.course || col(b.college).name) + '</span>' +
      '<span class="cover-title">' + esc(b.title) + '</span>' +
      '<span class="cover-by">' + esc(by) + '</span></div>' + st + '</div>';
  }
  function meter(k) {
    var c = cond(k), s = '';
    for (var i = 1; i <= 5; i++) s += '<i' + (i <= c.level ? ' class="on"' : '') + '></i>';
    return '<span class="meter" role="img" aria-label="الحالة: ' + c.label + '" title="الحالة: ' + c.label + '">' + s + '</span>';
  }
  function typeChips(b) {
    if (isLib(b)) return '<span class="chip chip-free">مجاني</span>';
    var out = '';
    if (b.type !== 'exchange') out += '<span class="chip chip-sale">بيع</span>';
    if (b.type !== 'sale') out += '<span class="chip chip-exchange">تبادل</span>';
    return out;
  }
  function priceHtml(b) {
    if (isLib(b)) return 'مجاناً';
    if (b.type === 'exchange') return '<span class="muted">للتبادل فقط</span>';
    if (!b.price) return '<span class="muted">السعر</span>';
    return money(b.price);
  }
  function bookItem(b) {
    return '<a class="book" href="#book-' + b.id + '">' + cover(b) +
      '<div class="book-meta"><div class="chips">' + typeChips(b) + (b.notes ? '<span class="chip chip-ink">بخط اليد</span>' : '') + '</div>' +
      '<h3 class="book-title">' + bd(b.title) + '</h3>' +
      '<p class="book-sub" dir="auto">' + esc(b.author || '') + '</p>' +
      '<div class="book-row"><span class="price">' + priceHtml(b) + '</span>' + meter(b.condition) + '</div>' +
      '<p class="book-loc">' + esc(b.city) + (b.course ? ' · ' + bd(b.course) : '') + '</p></div></a>';
  }
  function emptyBox(title, text, cta) {
    return '<div class="empty"><h3>' + title + '</h3><p class="muted">' + text + '</p>' + (cta || '') + '</div>';
  }
  function info(text, warn) { return '<div class="info' + (warn ? ' warn' : '') + '">' + icon('info') + '<div>' + text + '</div></div>'; }
  function optCards(name, prefix, list, selected) {
    return '<div class="opts">' + list.map(function (o) {
      var id = prefix + '-' + o.key, on = o.key === selected;
      return '<label class="opt' + (on ? ' on' : '') + (o.cls ? ' ' + o.cls : '') + '" for="' + id + '"><input type="radio" id="' + id + '" name="' + name + '" value="' + o.key + '"' + (on ? ' checked' : '') + '>' +
        '<b>' + o.label + '</b>' + (o.extra || '') + (o.desc ? '<small>' + o.desc + '</small>' : '') + '</label>';
    }).join('') + '</div>';
  }
  function condOpts(prefix, selected) {
    return optCards('condition', prefix, C.conditions.map(function (c) { return { key: c.key, label: c.label, desc: c.desc, extra: meter(c.key) }; }), selected);
  }
  function collegeOptions(selected, withAll) {
    return (withAll ? '<option value="all">كل الكليات</option>' : '<option value="">اختر الكلية</option>') +
      Object.keys(C.colleges).map(function (k) { return '<option value="' + k + '"' + (k === selected ? ' selected' : '') + '>' + C.colleges[k].name + '</option>'; }).join('');
  }
  function cityOptions(selected, withAll) {
    return (withAll ? '<option value="all">كل المدن</option>' : '') +
      C.cities.map(function (c) { return '<option' + (c === selected ? ' selected' : '') + '>' + c + '</option>'; }).join('');
  }

  /* =================================================================
     الرأس والتذييل
     ================================================================= */
  var NAV = [['books', 'تصفح الكتب'], ['exchange', 'التبادل'], ['donate', 'التبرع'], ['library', 'مكتبة المنصة'], ['delivery', 'التوصيل المجدول'], ['media', 'المركز الإعلامي']];
  function navKey(r) {
    if (r.name === 'book') { var b = findBook(r.id); return b && isLib(b) ? 'library' : 'books'; }
    if (r.name === 'article') return 'media';
    return r.name;
  }
  function renderChrome(r) {
    var u = me(), active = navKey(r);
    var links = function (extra) {
      return NAV.concat(extra || []).map(function (n) {
        return '<a href="#' + n[0] + '"' + (active === n[0] ? ' aria-current="page"' : '') + '>' + n[1] + '</a>';
      }).join('');
    };
    $('#notice').innerHTML = db.notice ?
      '<div class="notice"><div class="wrap"><p>نموذج أولي لمشروع تخرج: الكتب والحسابات المعروضة بيانات تجريبية، وما تضيفه يُحفظ في متصفحك فقط.</p>' +
      '<button type="button" data-action="dismiss-notice" aria-label="إخفاء التنبيه">' + icon('close').replace('<svg', '<svg width="16" height="16"') + '</button></div></div>' : '';
    $('#header').innerHTML =
      '<div class="wrap header-row">' +
      '<a class="brand" href="#home" aria-label="ورق بحبر، الصفحة الرئيسية">' + LOGO + '<span class="brand-word">ورق بحبر</span></a>' +
      '<nav class="main-nav" aria-label="القائمة الرئيسية">' + links() + '</nav>' +
      '<div class="header-actions">' +
      '<a class="btn btn-primary btn-sm hide-sm" href="#sell">' + icon('plus') + 'اعرض كتابك</a>' +
      (u ? '<a class="btn btn-ghost btn-sm acct-btn" href="#account"' + (active === 'account' ? ' aria-current="page"' : '') + '><span class="acct-dot" aria-hidden="true">' + esc(initial(u.name)) + '</span>حسابي</a>'
        : '<a class="btn btn-ghost btn-sm" href="#login">دخول</a>') +
      '<button class="btn btn-ghost btn-sm icon-btn menu-btn" type="button" data-action="menu" aria-expanded="false" aria-controls="mobile-nav" aria-label="فتح القائمة">' + icon('menu') + '</button>' +
      '</div></div>' +
      '<nav id="mobile-nav" class="mobile-nav" aria-label="القائمة" hidden><div class="wrap">' + links() +
      '<a class="btn btn-primary" href="#sell">' + icon('plus') + 'اعرض كتابك</a></div></nav>';
  }
  function renderFooter() {
    $('#footer').innerHTML =
      '<div class="wrap foot-grid">' +
      '<div class="foot-brand"><a class="brand" href="#home">' + LOGO + '<span class="brand-word">ورق بحبر</span></a>' +
      '<p>منصة رقمية لبيع الكتب الجامعية والمراجع الأكاديمية المستعملة وشرائها وتبادلها والتبرع بها، مع توصيل مجدول منخفض التكلفة.</p>' +
      '<p class="foot-tag">' + C.hashtag + '</p></div>' +
      '<div class="foot-col"><h2>المنصة</h2><ul><li><a href="#books">تصفح الكتب</a></li><li><a href="#sell">اعرض كتابك</a></li><li><a href="#exchange">التبادل</a></li><li><a href="#donate">التبرع</a></li><li><a href="#library">مكتبة المنصة</a></li></ul></div>' +
      '<div class="foot-col"><h2>المساعدة</h2><ul><li><a href="#delivery">التوصيل المجدول</a></li><li><a href="#article-inspect">قبل أن تشتري</a></li><li><a href="#article-pricing">كيف تسعّر كتابك</a></li><li><a href="#account">حسابي</a></li></ul></div>' +
      '<div class="foot-col"><h2>المركز الإعلامي</h2><ul><li><a href="#media">الحملة والمقالات</a></li><li><button type="button" data-action="go-media" data-target="m-brand">الهوية البصرية</button></li><li><button type="button" data-action="go-media" data-target="m-press">البيان الصحفي</button></li></ul></div>' +
      '</div>' +
      '<div class="wrap"><div class="foot-bottom"><span>مشروع تخرج · قسم الإعلام الإلكتروني · الجامعة السعودية الإلكترونية · ' + new Date().getFullYear() + '</span>' +
      '<span class="foot-col"><button type="button" data-action="reset-demo">إعادة ضبط البيانات التجريبية</button></span></div></div>';
  }

  /* =================================================================
     الصفحات
     ================================================================= */

  /* ---------- الرئيسية ---------- */
  function pageHome() {
    var avail = db.books.filter(function (b) { return b.status === 'available'; });
    var nSale = avail.filter(function (b) { return b.type !== 'exchange'; }).length;
    var nEx = avail.filter(function (b) { return b.type !== 'sale'; }).length;
    var nLib = db.library.filter(function (b) { return b.status === 'available'; }).length;
    var latest = avail.slice().sort(byNewest).slice(0, 6);
    var art = ['b12', 'b5', 'b1'].map(function (id) { return db.books.find(function (b) { return b.id === id; }); }).filter(Boolean);
    var libs = db.library.filter(function (b) { return b.status === 'available'; }).slice(0, 4);
    var w = C.delivery.windows;

    return '' +
    '<section class="hero"><div class="wrap"><div class="hero-grid">' +
      '<div class="hero-copy">' +
        '<p class="hero-note">من طالب، إلى طالب</p>' +
        '<h1>كتابك الجامعي <span class="hl">يكمل رحلته</span> عند طالب آخر</h1>' +
        '<p class="lede">بِع كتبك ومراجعك المستعملة، أو بدّلها بما تحتاجه في الفصل القادم، أو تبرّع بها لمكتبة المنصة. ونوصلها في فترات مجدولة تخفّض تكلفة التوصيل على الجميع.</p>' +
        '<form class="hero-search" data-form="hero-search" role="search"><label class="sr-only" for="hero-q">ابحث عن كتاب</label>' +
          '<input id="hero-q" name="q" type="search" placeholder="العنوان أو رمز المقرر، مثل MKT 201" autocomplete="off">' +
          '<button class="btn btn-primary" type="submit">' + icon('search') + 'ابحث</button></form>' +
        '<div class="paths">' +
          '<a class="path path-sale" href="#books"><b class="hl">اشترِ</b><span>' + booksCount(nSale) + ' للبيع</span></a>' +
          '<a class="path path-ex" href="#exchange"><b class="hl">بدّل</b><span>' + booksCount(nEx) + ' للتبادل</span></a>' +
          '<a class="path path-don" href="#donate"><b class="hl">تبرّع</b><span>' + booksCount(nLib) + ' في المكتبة</span></a>' +
        '</div>' +
      '</div>' +
      '<div class="hero-art" aria-hidden="true">' +
        (art[0] ? '<div class="fan fan-1">' + cover(art[0], { stamp: false }) + '</div>' : '') +
        (art[1] ? '<div class="fan fan-2">' + cover(art[1], { stamp: false }) + '</div>' : '') +
        (art[2] ? '<div class="fan fan-3">' + cover(art[2], { stamp: false }) + '</div>' : '') +
        '<div class="sticky"><span class="ltr">MKT 201</span><span>ممتاز، وفيه ملخصات</span><span>85 ر.س</span></div>' +
        '<svg class="scribble" viewBox="0 0 120 70" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M104 66C100 42 78 22 46 10"/><path d="M58 4L45 10l9 12"/></svg>' +
        '<span class="margin-note">نفس المقرر،<br>بسعر طالب</span>' +
      '</div>' +
    '</div></div></section>' +

    '<section class="section"><div class="wrap">' +
      '<div class="sec-head"><div><p class="kicker">كيف تعمل المنصة</p><h2>أربع خطوات من رفّك إلى طالب يحتاج كتابك</h2></div></div>' +
      '<ol class="steps" style="list-style:none;padding:0">' +
        '<li class="step"><span class="step-n">1</span><h3>اعرض كتابك</h3><p>صوّره، واختر حالته، وحدّد سعره أو الكتاب الذي تريده مقابله.</p></li>' +
        '<li class="step"><span class="step-n">2</span><h3>يصلك طلب</h3><p>طلب شراء أو تبادل من طالب في مدينتك يحتاج الكتاب نفسه.</p></li>' +
        '<li class="step"><span class="step-n">3</span><h3>اختر فترة التوصيل</h3><p>من الأحد إلى الخميس، في الفترة الصباحية أو المسائية.</p></li>' +
        '<li class="step"><span class="step-n">4</span><h3>نستلم ونسلّم</h3><p>يستلم المندوب الكتاب ويسلّمه في المسار نفسه، والدفع عند الاستلام.</p></li>' +
      '</ol>' +
    '</div></section>' +

    '<section class="section band"><div class="wrap">' +
      '<div class="sec-head"><div><p class="kicker">وصل حديثاً</p><h2>أحدث الكتب المعروضة</h2></div><a class="btn btn-ghost" href="#books">تصفح كل الكتب</a></div>' +
      '<div class="books">' + latest.map(bookItem).join('') + '</div>' +
    '</div></section>' +

    '<section class="section"><div class="wrap split">' +
      '<div class="stack" style="--gap:18px"><p class="kicker">التوصيل المجدول</p><h2>نجمع الطلبات في مسار واحد، فتقل التكلفة عليك</h2>' +
        '<p class="muted">بدلاً من رحلة لكل كتاب، نجمع طلبات كل حي في الفترة نفسها. احجز فترتك قبل الساعة 10 مساءً من اليوم السابق.</p>' +
        '<div class="days-line" aria-label="أيام التوصيل"><span>الأحد</span><span>الاثنين</span><span>الثلاثاء</span><span>الأربعاء</span><span>الخميس</span><span class="off">الجمعة</span><span class="off">السبت</span></div>' +
        '<div><a class="btn btn-primary" href="#delivery">' + icon('truck') + 'تفاصيل التوصيل والرسوم</a></div></div>' +
      '<div class="stack" style="--gap:14px">' +
        '<div class="windows"><div class="window-card"><b>' + w.am.label + '</b><span>' + w.am.text + '</span></div><div class="window-card"><b>' + w.pm.label + '</b><span>' + w.pm.text + '</span></div></div>' +
        '<dl class="fee-list"><dt>شراء كتاب</dt><dd>' + money(C.fees.purchase) + '</dd><dt>تبادل (على كل طرف)</dt><dd>' + money(C.fees.exchange) + '</dd><dt>كتاب من مكتبة المنصة</dt><dd>' + money(C.fees.library) + '</dd><dt>استلام تبرعك</dt><dd>مجاناً</dd></dl>' +
      '</div>' +
    '</div></section>' +

    '<section class="section band"><div class="wrap">' +
      '<div class="sec-head"><div><p class="kicker">من المركز الإعلامي</p><h2>' + esc(C.hashtag) + '</h2><p>حملة المنصة التوعوية، ومقالات تساعدك في البيع والشراء والتبادل.</p></div><a class="btn btn-ghost" href="#media">زر المركز الإعلامي</a></div>' +
      '<div class="media-teaser">' + poster(0) +
        '<div class="a-list">' + CT.articles.slice(0, 3).map(articleItem).join('') + '</div></div>' +
    '</div></section>' +

    '<section class="section"><div class="wrap lib-teaser">' +
      '<div class="stack" style="--gap:16px"><p class="kicker">مكتبة المنصة</p><h2>كتب تبرّع بها طلاب، <span class="hl hl-green">مجاناً</span> لمن يحتاجها</h2>' +
        '<p class="muted">تبرّع بكتابك ويستلمه المندوب من بابك دون رسوم. ويطلبه طالب آخر مجاناً مقابل رسوم توصيل رمزية قدرها ' + C.fees.library + ' ريالات.</p>' +
        '<div class="row-wrap"><a class="btn btn-primary" href="#donate">تبرّع بكتاب</a><a class="btn btn-ghost" href="#library">تصفح المكتبة</a></div></div>' +
      '<div class="mini-shelf">' + libs.map(function (b) { return '<a href="#book-' + b.id + '" aria-label="' + esc(b.title) + '">' + cover(b) + '</a>'; }).join('') + '</div>' +
    '</div></section>';
  }

  /* ---------- تصفح الكتب ---------- */
  var F = { q: '', type: 'all', college: 'all', city: 'all', cond: [], notes: false, sort: 'new' };
  function filterBooks(list, f, lib) {
    var q = norm(f.q);
    var out = list.filter(function (b) {
      if (lib ? (b.status === 'given') : (b.status !== 'available' && b.status !== 'reserved')) return false;
      if (q && norm(b.title + b.author + b.course).indexOf(q) === -1) return false;
      if (!lib && f.type === 'sale' && b.type === 'exchange') return false;
      if (!lib && f.type === 'exchange' && b.type === 'sale') return false;
      if (f.college !== 'all' && b.college !== f.college) return false;
      if (f.city !== 'all' && b.city !== f.city) return false;
      if (f.cond && f.cond.length && f.cond.indexOf(b.condition) === -1) return false;
      if (f.notes && !b.notes) return false;
      return true;
    });
    var lvl = function (b) { return cond(b.condition).level; };
    out.sort(function (a, b) {
      var avA = a.status === 'available' ? 0 : 1, avB = b.status === 'available' ? 0 : 1;
      if (avA !== avB) return avA - avB;
      if (f.sort === 'cheap') return (a.price || 9999) - (b.price || 9999);
      if (f.sort === 'pricey') return (b.price || 0) - (a.price || 0);
      if (f.sort === 'cond') return lvl(b) - lvl(a);
      return byNewest(a, b);
    });
    return out;
  }
  function pageBooks() {
    return '<div class="wrap"><header class="page-head"><p class="kicker">السوق</p><h1>تصفح الكتب المستعملة</h1>' +
      '<p class="lede">ابحث بعنوان الكتاب أو اسم المؤلف أو رمز المقرر. كل الكتب تصلك عبر التوصيل المجدول داخل مدينتك.</p></header>' +
      '<div class="browse" style="padding-bottom:64px">' +
      '<details class="filters" id="filters" open><summary>تصفية النتائج</summary><div class="filters-body">' +
        '<div class="field"><label for="f-q">بحث</label><input id="f-q" class="input" type="search" data-filter="q" value="' + esc(F.q) + '" placeholder="العنوان أو المؤلف أو رمز المقرر" autocomplete="off"></div>' +
        '<div class="field"><label for="f-type">نوع العرض</label><select id="f-type" class="select" data-filter="type"><option value="all">الكل</option><option value="sale"' + (F.type === 'sale' ? ' selected' : '') + '>للبيع</option><option value="exchange"' + (F.type === 'exchange' ? ' selected' : '') + '>للتبادل</option></select></div>' +
        '<div class="field"><label for="f-college">الكلية</label><select id="f-college" class="select" data-filter="college">' + collegeOptions(F.college, true) + '</select></div>' +
        '<div class="field"><label for="f-city">المدينة</label><select id="f-city" class="select" data-filter="city">' + cityOptions(F.city, true) + '</select></div>' +
        '<fieldset><legend>الحالة</legend><div class="stack" style="--gap:6px">' + C.conditions.map(function (c) {
          return '<label class="check" for="f-cond-' + c.key + '"><input type="checkbox" id="f-cond-' + c.key + '" data-filter="cond" value="' + c.key + '"' + (F.cond.indexOf(c.key) !== -1 ? ' checked' : '') + '><span>' + c.label + '</span></label>';
        }).join('') + '</div></fieldset>' +
        '<label class="check" for="f-notes"><input type="checkbox" id="f-notes" data-filter="notes"' + (F.notes ? ' checked' : '') + '><span>فيه ملاحظات أو ملخصات بخط اليد</span></label>' +
        '<button type="button" class="btn btn-quiet btn-sm" data-action="clear-filters" style="align-self:flex-start">مسح التصفية</button>' +
      '</div></details>' +
      '<div><div class="results-head"><p id="r-count" aria-live="polite"></p>' +
        '<label class="row-wrap" for="f-sort" style="gap:8px"><span class="muted" style="font-size:var(--fs-sm)">ترتيب</span><select id="f-sort" class="select" data-filter="sort">' +
        [['new', 'الأحدث'], ['cheap', 'الأقل سعراً'], ['pricey', 'الأعلى سعراً'], ['cond', 'الأفضل حالة']].map(function (o) { return '<option value="' + o[0] + '"' + (F.sort === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') +
        '</select></label></div><div id="results"></div></div>' +
      '</div></div>';
  }
  function renderResults() {
    var box = $('#results'); if (!box) return;
    var list = filterBooks(db.books, F, false);
    $('#r-count').textContent = list.length ? booksCount(list.length) : '';
    box.className = list.length ? 'books' : '';
    box.innerHTML = list.length ? list.map(bookItem).join('') :
      emptyBox('لا توجد كتب تطابق بحثك', 'جرّب رمز مقرر آخر أو خفّف التصفية. ويمكنك أيضاً تصفح مكتبة المنصة المجانية.', '<div class="row-wrap"><button class="btn btn-ghost" type="button" data-action="clear-filters">مسح التصفية</button><a class="btn btn-quiet" href="#library">مكتبة المنصة</a></div>');
  }

  /* ---------- صفحة الكتاب ---------- */
  function pageBook(id) {
    var b = findBook(id);
    if (!b) return pageNotFound('لم نجد هذا الكتاب، ربما حُذف من المنصة.');
    var lib = isLib(b), u = me(), c = cond(b.condition);
    var seller = lib ? null : userById(b.sellerId);
    var mine = !!(u && !lib && b.sellerId === u.id);
    var away = !!(u && !mine && b.city !== u.city);
    var avail = b.status === 'available';
    var related = (lib ? db.library : db.books).filter(function (x) {
      return x.id !== b.id && x.status === 'available' && (x.course === b.course || x.college === b.college);
    }).slice(0, 4);

    var deal = '';
    if (lib) {
      deal = '<div class="deal-box"><div class="chips">' + typeChips(b) + '</div><div class="big-price">مجاناً</div>' +
        '<p class="muted">تدفع رسوم توصيل رمزية فقط: ' + money(C.fees.library) + '. لكل طالب كتابان كحد أقصى في الوقت نفسه.</p>' +
        (avail && !away ? '<button class="btn btn-primary btn-block" type="button" data-action="lib-request" data-id="' + b.id + '">اطلب الكتاب</button>' : '') + '</div>';
    } else {
      var btns = '';
      if (avail && !mine && !away) {
        if (b.type !== 'exchange') btns += '<button class="btn btn-primary btn-block" type="button" data-action="buy" data-id="' + b.id + '">اطلب الشراء</button>';
        if (b.type !== 'sale') btns += '<button class="btn ' + (b.type === 'exchange' ? 'btn-primary' : 'btn-ghost') + ' btn-block" type="button" data-action="swap" data-id="' + b.id + '">' + icon('swap') + 'اطلب تبادلاً</button>';
      }
      deal = '<div class="deal-box"><div class="chips">' + typeChips(b) + '</div>' +
        (b.type !== 'exchange' ? '<div class="big-price"><span class="num">' + b.price + '</span> <small>ر.س</small></div>' : '<div class="big-price" style="font-size:2rem">للتبادل</div>') +
        (b.type !== 'sale' && b.wants ? '<div class="wants"><b>يريد مقابله</b><span>' + bd(b.wants) + '</span></div>' : '') +
        (btns ? '<div class="stack" style="--gap:8px">' + btns + '</div>' : '') +
        (mine ? info('هذا كتابك. تديره من <a href="#account">صفحة حسابك</a>.') : '') + '</div>';
    }
    var notices = '';
    if (!avail) notices += info(lib && b.status === 'incoming' ? 'هذا الكتاب في طريقه إلى المكتبة، ويُتاح للطلب بعد استلامه وفحصه.' : 'هذا الكتاب محجوز حالياً لطلب قائم. تصفح كتباً مشابهة في الأسفل.', true);
    if (away && avail) notices += info('الكتاب في ' + esc(b.city) + '، والتوصيل المجدول حالياً داخل المدينة الواحدة. <a href="#books" data-action="filter-city" data-city="' + esc(u.city) + '">اعرض كتب ' + esc(u.city) + '</a>', true);

    return '<div class="wrap"><div class="detail">' +
      '<div class="detail-cover">' + cover(b) + '</div>' +
      '<div class="detail-main">' +
        '<nav class="crumbs" aria-label="مسار الصفحة"><a href="#home">الرئيسية</a><span>/</span><a href="' + (lib ? '#library' : '#books') + '">' + (lib ? 'مكتبة المنصة' : 'تصفح الكتب') + '</a><span>/</span><span>' + esc(col(b.college).name) + '</span></nav>' +
        '<div class="stack" style="--gap:8px"><h1>' + bd(b.title) + '</h1><p class="muted">' + bd(b.author || 'مؤلف غير محدد') + '</p></div>' +
        notices + deal +
        (b.notes ? '<div class="ink-note">فيه ملاحظات بخط اليد' + (b.notesText ? ': ' + esc(b.notesText) : '') + '</div>' : '') +
        '<dl class="facts">' +
          (b.edition ? '<dt>الطبعة</dt><dd>' + bd(edLabel(b)) + '</dd>' : '') +
          (b.course ? '<dt>رمز المقرر</dt><dd>' + bd(b.course) + '</dd>' : '') +
          '<dt>الكلية</dt><dd>' + esc(col(b.college).name) + '</dd>' +
          '<dt>الحالة</dt><dd><span class="row-wrap" style="gap:8px">' + c.label + ' ' + meter(b.condition) + '</span><span class="muted" style="display:block;font-size:var(--fs-sm)">' + c.desc + '</span></dd>' +
          '<dt>المدينة</dt><dd>' + esc(b.city) + '</dd>' +
          (lib ? '<dt>المصدر</dt><dd>تبرّع به طالب لمكتبة المنصة</dd>' : '<dt>صاحب الكتاب</dt><dd>' + esc(seller ? seller.name : 'طالب') + (seller && seller.university ? ' · ' + esc(seller.university) : '') + '</dd>') +
          '<dt>' + (lib ? 'أضيف للمكتبة' : 'عُرض') + '</dt><dd>' + agoText(b.createdAt) + '</dd>' +
          '<dt>أقرب توصيل</dt><dd>' + esc(nextSlotLabel()) + '، صباحاً أو مساءً</dd>' +
        '</dl>' +
        info('تصفح الكتاب عند الاستلام أمام المندوب. إن وجدته مختلفاً عن وصفه فلك أن ترفض الاستلام دون أن تدفع شيئاً. <a href="#article-inspect">ماذا أفحص؟</a>') +
      '</div></div>' +
      (related.length ? '<section class="section-tight" style="border-top:1px solid var(--line);margin-bottom:56px"><div class="sec-head"><div><h2 style="font-size:1.9rem">كتب مشابهة</h2></div></div><div class="books">' + related.map(bookItem).join('') + '</div></section>' : '') +
      '</div>';
  }

  /* ---------- عرض كتاب للبيع أو التبادل ---------- */
  var sellPhoto = null;
  var pendingSellType = null;
  function gate(title, text, back) {
    return '<div class="wrap section"><div class="gate"><p class="kicker">تحتاج حساباً</p><h2>' + title + '</h2><p class="muted">' + text + '</p>' +
      '<div class="row-wrap"><a class="btn btn-primary" href="#login" data-action="remember" data-back="' + back + '">تسجيل الدخول</a><a class="btn btn-ghost" href="#register" data-action="remember" data-back="' + back + '">إنشاء حساب</a></div></div></div>';
  }
  function pageSell() {
    var u = me();
    if (!u) return gate('سجّل دخولك لتعرض كتابك', 'نطلب الحساب لنعرف مدينتك ونرسل لك طلبات الشراء والتبادل. يستغرق إنشاؤه أقل من دقيقة.', '#sell');
    var type = pendingSellType || 'sale';
    pendingSellType = null;
    var typeList = Object.keys(C.types).map(function (k) {
      return { key: k, label: C.types[k].label, desc: C.types[k].hint, cls: k === 'sale' ? 'opt-sale' : (k === 'exchange' ? 'opt-ex' : 'opt-both') };
    });
    return '<div class="wrap"><header class="page-head"><p class="kicker">اعرض كتابك</p><h1>خلّ كتابك يكمل رحلته</h1>' +
      '<p class="lede">اكتب بيانات الكتاب كما هي. الوصف الدقيق للحالة يبيع الكتاب أسرع، ويجنّبك رفضه عند الاستلام.</p></header>' +
      '<div class="sell" style="padding-bottom:64px">' +
      '<form id="form-sell" data-form="sell" novalidate>' +
        '<section class="form-sec"><h2>بيانات الكتاب</h2><div class="form-grid">' +
          '<div class="field span-2"><label for="sell-title">عنوان الكتاب <span class="req">*</span></label><input id="sell-title" name="title" class="input" autocomplete="off" placeholder="مثال: Principles of Marketing"><p class="err" id="err-sell-title"></p></div>' +
          '<div class="field"><label for="sell-author">المؤلف</label><input id="sell-author" name="author" class="input" autocomplete="off"></div>' +
          '<div class="field"><label for="sell-edition">الطبعة</label><input id="sell-edition" name="edition" class="input" type="number" min="1" max="40" inputmode="numeric" placeholder="مثال: 18"></div>' +
          '<div class="field"><label for="sell-course">رمز المقرر</label><input id="sell-course" name="course" class="input ltr-input" autocomplete="off" placeholder="MKT 201"><p class="hint">يساعد الطلاب في الوصول إلى كتابك عند البحث برمز المقرر.</p></div>' +
          '<div class="field"><label for="sell-college">الكلية <span class="req">*</span></label><select id="sell-college" name="college" class="select">' + collegeOptions('', false) + '</select><p class="err" id="err-sell-college"></p></div>' +
        '</div></section>' +
        '<section class="form-sec"><h2>حالة الكتاب</h2><fieldset><legend class="sr-only">حالة الكتاب</legend>' + condOpts('sell-cond', '') + '<p class="err" id="err-sell-cond"></p></fieldset>' +
          '<label class="check" for="sell-notes"><input type="checkbox" id="sell-notes" name="notes"><span>فيه ملاحظات أو ملخصات بخط اليد <span class="muted">(يبحث عنها بعض الطلاب)</span></span></label>' +
          '<div class="field" id="notes-field" hidden><label for="sell-notesText">صف الملاحظات باختصار</label><input id="sell-notesText" name="notesText" class="input" maxlength="80" placeholder="مثال: ملخص لكل فصل في آخره"></div>' +
        '</section>' +
        '<section class="form-sec"><h2>نوع العرض</h2><fieldset><legend class="sr-only">نوع العرض</legend>' + optCards('type', 'sell-type', typeList, type) + '</fieldset>' +
          '<div class="form-grid">' +
            '<div class="field" id="price-field"><label for="sell-price">السعر بالريال <span class="req">*</span></label><input id="sell-price" name="price" class="input" type="number" min="1" max="2000" inputmode="numeric"><p class="err" id="err-sell-price"></p></div>' +
            '<div class="field" id="newprice-field"><label for="sell-newprice">سعره جديداً (اختياري)</label><input id="sell-newprice" name="newprice" class="input" type="number" min="1" inputmode="numeric"><p class="hint">نقترح عليك سعراً عادلاً حسب الحالة.</p></div>' +
            '<div class="suggest span-2" id="suggest" hidden></div>' +
            '<div class="field span-2" id="wants-field"><label for="sell-wants">ماذا تريد مقابله؟ <span class="req">*</span></label><input id="sell-wants" name="wants" class="input" autocomplete="off" placeholder="عنوان الكتاب أو رمز المقرر، مثل STAT 201"><p class="err" id="err-sell-wants"></p></div>' +
          '</div></section>' +
        '<section class="form-sec"><h2>الصورة والمدينة</h2><div class="form-grid">' +
          '<div class="field span-2"><label for="sell-photo">صورة الغلاف (اختياري)</label><div class="photo-pick"><input id="sell-photo" class="file-input" type="file" accept="image/*"><span id="photo-preview"></span></div><p class="hint">إن لم ترفع صورة، نصمم للكتاب غلافاً بلون كليته.</p></div>' +
          '<div class="field"><label for="sell-city">المدينة</label><select id="sell-city" name="city" class="select">' + cityOptions(u.city) + '</select></div>' +
        '</div>' +
          '<label class="check" for="sell-original"><input type="checkbox" id="sell-original" name="original"><span>أقرّ بأن الكتاب نسخة أصلية مطبوعة، وليس نسخة مصوّرة. <span class="req">*</span></span></label><p class="err" id="err-sell-original"></p>' +
        '</section>' +
        '<div class="row-wrap"><button class="btn btn-primary" type="submit">انشر الكتاب</button><a class="btn btn-quiet" href="#article-pricing">كيف أسعّر كتابي؟</a></div>' +
      '</form>' +
      '<aside class="sell-preview" aria-label="معاينة"><span class="label">هكذا سيظهر كتابك</span><div id="sell-preview-card"></div></aside>' +
      '</div></div>';
  }
  function readSellForm(f) {
    var g = function (n) { var el = f.elements.namedItem(n); return el ? String(el.value || '').trim() : ''; };
    var r = function (n) { var el = f.querySelector('input[name="' + n + '"]:checked'); return el ? el.value : ''; };
    return {
      title: g('title'), author: g('author'), edition: parseInt(g('edition'), 10) || null, course: g('course').toUpperCase().replace(/\s+/g, ' '),
      college: g('college'), condition: r('condition'), type: r('type'), price: parseInt(g('price'), 10) || 0, newprice: parseInt(g('newprice'), 10) || 0,
      wants: g('wants'), city: g('city'), notes: f.elements.namedItem('notes').checked, notesText: g('notesText'), original: f.elements.namedItem('original').checked
    };
  }
  function updateSell() {
    var f = $('#form-sell'); if (!f) return;
    var v = readSellForm(f);
    $('#price-field').hidden = v.type === 'exchange';
    $('#newprice-field').hidden = v.type === 'exchange';
    $('#wants-field').hidden = v.type === 'sale' || !v.type;
    $('#notes-field').hidden = !v.notes;
    var sug = $('#suggest');
    if (v.type !== 'exchange' && v.newprice > 0 && v.condition) {
      var c = cond(v.condition), s = Math.max(5, Math.round(v.newprice * c.ratio / 5) * 5);
      sug.hidden = false;
      /* لا نعيد رسم الاقتراح إن لم يتغير، حتى لا يختفي الزر تحت مؤشر المستخدم */
      if (sug.getAttribute('data-key') !== c.key + s) {
        sug.setAttribute('data-key', c.key + s);
        sug.innerHTML = '<span>السعر المقترح لحالة «' + c.label + '»: <b class="hl">' + money(s) + '</b></span><button type="button" class="btn btn-ghost btn-sm" data-action="use-suggested" data-price="' + s + '">استخدم هذا السعر</button>';
      }
    } else { sug.hidden = true; sug.innerHTML = ''; sug.removeAttribute('data-key'); }
    var preview = {
      id: 'preview', title: v.title || 'عنوان كتابك', author: v.author || 'اسم المؤلف', edition: v.edition, course: v.course,
      college: v.college || 'general', condition: v.condition || 'vgood', type: v.type || 'sale', price: v.price || 0,
      city: v.city, notes: v.notes, photo: sellPhoto || '', status: 'available'
    };
    $('#sell-preview-card').innerHTML = bookItem(preview).replace('href="#book-preview"', 'href="#sell" tabindex="-1" aria-hidden="true"');
  }
  function readPhoto(file) {
    return new Promise(function (resolve, reject) {
      if (!file || !/^image\//.test(file.type)) { reject(new Error('type')); return; }
      var reader = new FileReader();
      reader.onerror = function () { reject(new Error('read')); };
      reader.onload = function () {
        var img = new Image();
        img.onerror = function () { reject(new Error('decode')); };
        img.onload = function () {
          var max = 480, scale = Math.min(1, max / Math.max(img.width, img.height));
          var cv = document.createElement('canvas');
          cv.width = Math.round(img.width * scale); cv.height = Math.round(img.height * scale);
          cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
          resolve(cv.toDataURL('image/jpeg', 0.72));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  /* ---------- التبادل ---------- */
  function matchText(wants, book) {
    var w = norm(wants); if (!w) return false;
    var t = norm(book.title), c = norm(book.course);
    if (c && w.indexOf(c) !== -1) return true;
    if (t && w.length >= 6 && (t.indexOf(w) !== -1 || w.indexOf(t) !== -1)) return true;
    var tw = words(book.title), shared = words(wants).filter(function (x) { return tw.indexOf(x) !== -1; });
    return shared.length >= 2;
  }
  function exchangeMatches(u) {
    var mine = db.books.filter(function (b) { return b.sellerId === u.id && b.status === 'available'; });
    var out = [];
    db.books.forEach(function (o) {
      if (o.sellerId === u.id || o.status !== 'available' || o.type === 'sale' || o.city !== u.city) return;
      var theyWant = mine.find(function (m) { return o.wants && matchText(o.wants, m); });
      var iWant = mine.find(function (m) { return m.type !== 'sale' && m.wants && matchText(m.wants, o); });
      if (theyWant || iWant) out.push({ book: o, mine: theyWant || iWant, mutual: !!(theyWant && iWant), theyWant: !!theyWant });
    });
    return out.sort(function (a, b) { return (b.mutual ? 1 : 0) - (a.mutual ? 1 : 0); });
  }
  function pageExchange() {
    var u = me();
    var list = db.books.filter(function (b) { return b.type !== 'sale' && (b.status === 'available' || b.status === 'reserved'); }).sort(byNewest);
    var matches = u ? exchangeMatches(u) : [];
    var matchHtml = '';
    if (u) {
      matchHtml = '<section class="section-tight"><div class="sec-head"><div><p class="kicker">مطابقات لك في ' + esc(u.city) + '</p><h2 style="font-size:2rem">طلاب يريدون كتبك أو يملكون ما تريده</h2></div></div>' +
        (matches.length ? '<div class="rows">' + matches.map(function (m) {
          var owner = userById(m.book.sellerId);
          var why = m.mutual ? '<span class="chip chip-exchange">تبادل مثالي</span> كلٌّ منكما يريد كتاب الآخر' :
            (m.theyWant ? 'صاحبه يريد مقابله كتابك ' + bd(m.mine.title) : 'يطابق ما تريده مقابل كتابك ' + bd(m.mine.title));
          return '<div class="item-row">' + cover(m.book) + '<div class="item-main"><b>' + bd(m.book.title) + '</b><small>' + why + '</small><small>مع ' + esc(owner ? owner.name : 'طالب') + ' · ' + esc(m.book.city) + '</small></div>' +
            '<div class="item-actions"><a class="btn btn-ghost btn-sm" href="#book-' + m.book.id + '">التفاصيل</a><button class="btn btn-primary btn-sm" type="button" data-action="swap" data-id="' + m.book.id + '">اطلب تبادلاً</button></div></div>';
        }).join('') + '</div>' : emptyBox('لا مطابقات بعد', 'اعرض كتاباً للتبادل واكتب ما تريده مقابله بدقة، وستظهر المطابقات هنا.', '<a class="btn btn-primary" href="#sell" data-action="sell-type" data-type="exchange">اعرض كتاباً للتبادل</a>')) +
        '</section>';
    }
    return '<div class="wrap"><header class="page-head"><p class="kicker">التبادل</p><h1>بدّل كتاباً لا تحتاجه <span class="hl hl-pink">بكتاب تحتاجه</span></h1>' +
      '<p class="lede">لا يدفع أحد الطرفين ثمن كتاب. تقتسمان رسوم التوصيل فقط: ' + money(C.fees.exchange) + ' على كل طرف، ويُسلَّم الكتابان في الفترة نفسها.</p>' +
      '<div class="row-wrap"><a class="btn btn-primary" href="#sell" data-action="sell-type" data-type="exchange">' + icon('swap') + 'اعرض كتاباً للتبادل</a><a class="btn btn-quiet" href="#article-exchange">نصائح للتبادل</a></div></header>' +
      '<ol class="steps" style="list-style:none;padding:0;margin-bottom:24px">' +
        '<li class="step"><span class="step-n">1</span><h3>اعرض كتابك</h3><p>اختر «تبادل» أو «بيع أو تبادل»، واكتب الكتاب الذي تريده مقابله.</p></li>' +
        '<li class="step"><span class="step-n">2</span><h3>أرسل طلباً</h3><p>اختر كتاباً معروضاً للتبادل، وحدد الكتاب الذي تعرضه مقابله.</p></li>' +
        '<li class="step"><span class="step-n">3</span><h3>انتظر الموافقة</h3><p>يصل الطلب لصاحب الكتاب، ويقبله أو يعتذر عنه من حسابه.</p></li>' +
        '<li class="step"><span class="step-n">4</span><h3>مسار واحد للطرفين</h3><p>يستلم المندوب الكتابين ويسلّمهما في الفترة التي اقترحتها.</p></li>' +
      '</ol>' +
      matchHtml +
      '<section class="section-tight" style="padding-bottom:72px"><div class="sec-head"><div><h2 style="font-size:2rem">كتب متاحة للتبادل</h2><p>' + booksCount(list.filter(function (b) { return b.status === 'available'; }).length) + ' في كل المدن</p></div></div>' +
      (list.length ? '<div class="books">' + list.map(bookItem).join('') + '</div>' : emptyBox('لا كتب للتبادل حالياً', 'كن أول من يعرض كتاباً للتبادل.', '')) +
      '</section></div>';
  }

  /* ---------- التبرع ---------- */
  var lastDonation = null;
  function pageDonate() {
    var u = me();
    var form;
    if (!u) {
      form = '<div class="gate"><h2>سجّل دخولك لتتبرع</h2><p class="muted">نحتاج حسابك لنعرف مدينتك ونجدول استلام الكتاب من بابك.</p><div class="row-wrap"><a class="btn btn-primary" href="#login" data-action="remember" data-back="#donate">تسجيل الدخول</a><a class="btn btn-ghost" href="#register" data-action="remember" data-back="#donate">إنشاء حساب</a></div></div>';
    } else if (lastDonation) {
      var o = db.orders.find(function (x) { return x.id === lastDonation; }), lb = o && findBook(o.bookId);
      form = '<div class="gate"><span class="done-icon">' + icon('check') + '</span><h2>شكراً لك، سيكمل كتابك رحلته</h2>' +
        (o ? '<p>يستلم المندوب ' + bd(lb ? lb.title : 'الكتاب') + ' من ' + esc(district(o.district)) + ' يوم <b>' + esc(slotInfo(o.slot).label) + '</b>، دون أي رسوم.</p><p class="muted">يُضاف الكتاب إلى مكتبة ' + esc(u.city) + ' بعد استلامه وفحصه. رقم الطلب: <span class="order-no">' + o.id + '</span></p>' : '') +
        '<div class="row-wrap"><button class="btn btn-primary" type="button" data-action="donate-again">تبرّع بكتاب آخر</button><a class="btn btn-ghost" href="#account" data-action="acct-tab" data-tab="donations">تبرعاتي</a></div></div>';
    } else {
      form = '<form id="form-donate" data-form="donate" class="stack" style="--gap:0" novalidate>' +
        '<section class="form-sec"><h2>بيانات الكتاب</h2><div class="form-grid">' +
          '<div class="field span-2"><label for="don-title">عنوان الكتاب <span class="req">*</span></label><input id="don-title" name="title" class="input" autocomplete="off"><p class="err" id="err-don-title"></p></div>' +
          '<div class="field"><label for="don-author">المؤلف</label><input id="don-author" name="author" class="input" autocomplete="off"></div>' +
          '<div class="field"><label for="don-course">رمز المقرر</label><input id="don-course" name="course" class="input ltr-input" autocomplete="off" placeholder="CS 101"></div>' +
          '<div class="field"><label for="don-college">الكلية <span class="req">*</span></label><select id="don-college" name="college" class="select">' + collegeOptions('', false) + '</select><p class="err" id="err-don-college"></p></div>' +
          '<div class="field"><label for="don-edition">الطبعة</label><input id="don-edition" name="edition" class="input" type="number" min="1" max="40" inputmode="numeric"></div>' +
        '</div></section>' +
        '<section class="form-sec"><h2>حالته</h2><fieldset><legend class="sr-only">حالة الكتاب</legend>' + condOpts('don-cond', '') + '<p class="err" id="err-don-cond"></p></fieldset></section>' +
        '<section class="form-sec"><h2>موعد الاستلام من بابك</h2><fieldset><legend class="sr-only">فترة الاستلام</legend>' + slotPicker('don') + '<p class="err" id="err-don-slot"></p></fieldset>' +
          '<div class="form-grid"><div class="field"><label for="don-district">الحي في ' + esc(u.city) + ' <span class="req">*</span></label><input id="don-district" name="district" class="input" placeholder="مثال: حي النخيل" autocomplete="off"><p class="err" id="err-don-district"></p></div></div>' +
          '<label class="check" for="don-original"><input type="checkbox" id="don-original" name="original"><span>الكتاب نسخة أصلية مطبوعة، وكل صفحاته موجودة. <span class="req">*</span></span></label><p class="err" id="err-don-original"></p>' +
        '</section>' +
        '<div class="row-wrap"><button class="btn btn-primary" type="submit">أكّد التبرع</button><span class="muted" style="font-size:var(--fs-sm)">لديك أكثر من كتاب؟ أضف كل كتاب على حدة، ويستلمها المندوب معاً.</span></div>' +
        '</form>';
    }
    return '<div class="wrap"><header class="page-head"><p class="kicker">التبرع</p><h1>تبرّع بكتابك <span class="hl hl-green">لمكتبة المنصة</span></h1>' +
      '<p class="lede">كتاب انتهى مقرره عندك قد يخفف فصلاً كاملاً عن طالب آخر. نستلمه من بابك مجاناً، ونضيفه لمكتبة مدينتك ليطلبه من يحتاجه.</p></header>' +
      '<div class="split" style="padding-bottom:72px">' +
        '<div class="stack" style="--gap:22px">' +
          '<div class="stack" style="--gap:10px"><h2 style="font-size:1.8rem">ما نقبله</h2><ul class="goals"><li>الكتب الجامعية والمراجع الأكاديمية المطبوعة.</li><li>الحالة «مقبول» فأعلى، وكل الصفحات موجودة.</li><li>الطبعات المستخدمة في المقررات الحالية أو القريبة منها.</li></ul></div>' +
          '<div class="stack" style="--gap:10px"><h2 style="font-size:1.8rem">ما لا نقبله</h2>' + info('النسخ المصوّرة من الكتب، حفاظاً على حقوق المؤلفين والناشرين. والكتب التالفة أو الناقصة.', true) + '</div>' +
          '<div class="stack" style="--gap:10px"><h2 style="font-size:1.8rem">ماذا يحدث بعد التبرع؟</h2><ol class="goals" style="counter-reset:none"><li>يستلم المندوب الكتاب في الفترة التي تختارها، دون رسوم.</li><li>نفحص الكتاب ونضيفه إلى مكتبة مدينتك.</li><li>يطلبه طالب يحتاجه مجاناً، ويدفع رسوم توصيل رمزية فقط.</li></ol></div>' +
          '<a class="btn btn-ghost" href="#article-donate" style="align-self:flex-start">اقرأ: حين يصبح كتابك منحة</a>' +
        '</div>' +
        '<div>' + form + '</div>' +
      '</div></div>';
  }

  /* ---------- مكتبة المنصة ---------- */
  var LF = { q: '', type: 'all', college: 'all', city: 'all', cond: [], notes: false, sort: 'new' };
  function pageLibrary() {
    var u = me();
    if (u && LF.city === 'all' && !LF.touched) LF.city = u.city;
    return '<div class="wrap"><header class="page-head"><p class="kicker">مكتبة المنصة</p><h1>كتب متبرَّع بها، <span class="hl hl-green">مجاناً</span> للطلاب</h1>' +
      '<p class="lede">اطلب الكتاب الذي تحتاجه وادفع رسوم توصيل رمزية فقط: ' + money(C.fees.library) + '. لكل طالب كتابان كحد أقصى في الوقت نفسه، حتى تصل الكتب لأكبر عدد من الطلاب.</p>' +
      '<div class="row-wrap"><a class="btn btn-primary" href="#donate">تبرّع بكتاب</a></div></header>' +
      '<div class="form-grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr));margin-bottom:26px">' +
        '<div class="field"><label for="l-q">بحث</label><input id="l-q" class="input" type="search" data-lfilter="q" value="' + esc(LF.q) + '" placeholder="العنوان أو رمز المقرر" autocomplete="off"></div>' +
        '<div class="field"><label for="l-college">الكلية</label><select id="l-college" class="select" data-lfilter="college">' + collegeOptions(LF.college, true) + '</select></div>' +
        '<div class="field"><label for="l-city">المدينة</label><select id="l-city" class="select" data-lfilter="city">' + cityOptions(LF.city, true) + '</select></div>' +
      '</div>' +
      '<p id="l-count" class="muted" aria-live="polite" style="margin-bottom:18px"></p><div id="l-results" style="padding-bottom:72px"></div></div>';
  }
  function renderLibResults() {
    var box = $('#l-results'); if (!box) return;
    var list = filterBooks(db.library, LF, true);
    $('#l-count').textContent = list.length ? booksCount(list.length) + ' في المكتبة' : '';
    box.className = list.length ? 'books' : '';
    box.innerHTML = list.length ? list.map(bookItem).join('') :
      emptyBox('لا كتب مطابقة في المكتبة', 'جرّب مدينة أخرى أو كلية أخرى، أو كن أول من يتبرع بكتاب في هذا التخصص.', '<a class="btn btn-primary" href="#donate">تبرّع بكتاب</a>');
  }

  /* ---------- التوصيل المجدول ---------- */
  function schedChart() {
    var names = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    var lo = 8, hi = 21, span = hi - lo;
    var pos = function (h) { return ((h - lo) / span * 100).toFixed(3); };
    var hl = function (h) { return h < 12 ? h + ' ص' : (h === 12 ? '12 م' : (h - 12) + ' م'); };
    var rows = [0, 1, 2, 3, 4, 5, 6].map(function (d) {
      if (C.delivery.days.indexOf(d) === -1) {
        return '<div class="sched-row off"><span class="sched-day">' + names[d] + '</span><div class="sched-track"><span class="sched-off">لا توصيل · تخطيط مسارات الأسبوع</span></div></div>';
      }
      var bars = ['am', 'pm'].map(function (k) {
        var w = C.delivery.windows[k];
        return '<span class="sched-bar ' + k + '" style="inset-inline-start:' + pos(w.from) + '%;width:' + ((w.to - w.from) / span * 100).toFixed(3) + '%">' + w.short + '<span class="t">' + w.text + '</span></span>';
      }).join('');
      return '<div class="sched-row"><span class="sched-day">' + names[d] + '</span><div class="sched-track">' + bars + '</div></div>';
    }).join('');
    var axis = [9, 11, 13, 15, 17, 19].map(function (h) { return '<span style="inset-inline-start:' + pos(h) + '%">' + hl(h) + '</span>'; }).join('');
    return '<div class="sched" role="img" aria-label="جدول التوصيل: من الأحد إلى الخميس، فترة صباحية من 9 صباحاً إلى 2 ظهراً، وفترة مسائية من 3 عصراً إلى 8 مساءً. لا توصيل يومي الجمعة والسبت.">' + rows +
      '<div class="sched-axis"><span></span><div class="axis">' + axis + '</div></div></div>';
  }
  function costChart(n) {
    var R = C.routeCostExample, fee = C.fees.purchase, bars = '', xs = '';
    for (var k = 1; k <= 12; k++) {
      var v = R / k, cls = k === n ? ' on' : (v <= fee ? ' ok' : '');
      bars += '<div class="cost-bar' + cls + '" style="--h:' + (v / R * 100).toFixed(2) + '%"><span class="v">' + (Math.round(v * 10) / 10) + '</span></div>';
      xs += '<span>' + k + '</span>';
    }
    return '<div class="cost-chart" aria-hidden="true">' + bars +
      '<div class="fee-line" style="bottom:calc((100% - 22px) * ' + (fee / R).toFixed(4) + ')"><span>رسومنا ' + fee + ' ر.س</span></div></div>' +
      '<div class="cost-x" aria-hidden="true">' + xs + '</div>';
  }
  function costReadout(n) {
    var v = Math.round(C.routeCostExample / n * 10) / 10;
    return 'مسار فيه ' + ordersCount(n) + ': <span class="hl">' + v + ' ر.س</span> لكل طلب';
  }
  function routeArt() {
    return '<svg class="route-art" viewBox="0 0 520 190" role="img" aria-label="رسم توضيحي لمسار توصيل واحد يمر بنقاط استلام وتسليم في الحي نفسه">' +
      '<style>.ra-l{fill:var(--muted);font:600 13px var(--font-ui)}.ra-t{fill:var(--fg);font:700 14px var(--font-ui)}</style>' +
      '<path d="M40 120C110 30 170 160 250 96S400 40 480 110" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="2 9" stroke-linecap="round"/>' +
      '<g><circle cx="40" cy="120" r="10" fill="var(--ink)"/><text class="ra-l" x="40" y="152" text-anchor="middle">استلام</text></g>' +
      '<g><circle cx="146" cy="88" r="10" fill="var(--sheet)" stroke="var(--ink)" stroke-width="3"/><text class="ra-l" x="146" y="66" text-anchor="middle">تسليم</text></g>' +
      '<g><circle cx="250" cy="96" r="10" fill="var(--ink)"/><text class="ra-l" x="250" y="128" text-anchor="middle">استلام</text></g>' +
      '<g><circle cx="370" cy="62" r="10" fill="var(--sheet)" stroke="var(--ink)" stroke-width="3"/><text class="ra-l" x="370" y="40" text-anchor="middle">تسليم</text></g>' +
      '<g><circle cx="480" cy="110" r="10" fill="var(--sheet)" stroke="var(--ink)" stroke-width="3"/><text class="ra-l" x="480" y="142" text-anchor="middle">تسليم</text></g>' +
      '<text class="ra-t" x="260" y="182" text-anchor="middle">مسار واحد · حي واحد · فترة واحدة</text></svg>';
  }
  var costN = 4;
  function pageDelivery() {
    var w = C.delivery.windows;
    return '<div class="wrap"><header class="page-head"><p class="kicker">التوصيل المجدول</p><h1>من الأحد إلى الخميس، <span class="hl">في فترتين ثابتتين</span></h1>' +
      '<p class="lede">نجمع طلبات كل حي في الفترة نفسها ونوصلها في مسار واحد. هكذا تقل الرحلات، وتقل التكلفة على كل طالب.</p></header>' +

      '<section class="section-tight"><div class="windows" style="margin-bottom:26px"><div class="window-card"><b>' + w.am.label + '</b><span>' + w.am.text + '</span></div><div class="window-card"><b>' + w.pm.label + '</b><span>' + w.pm.text + '</span></div></div>' +
        schedChart() +
        '<p class="hint" style="margin-top:12px">الساعة بين 2:00 و3:00 ظهراً مخصصة لتجهيز مسارات الفترة المسائية.</p></section>' +

      '<section class="section-tight"><div class="split">' +
        '<div class="stack" style="--gap:14px"><h2>الرسوم</h2><p class="muted">تُدفع عند الاستلام، نقداً أو بالبطاقة لدى المندوب.</p>' +
          '<dl class="fee-list"><dt>شراء كتاب (يدفعها المشتري)</dt><dd>' + money(C.fees.purchase) + '</dd><dt>تبادل (على كل طرف)</dt><dd>' + money(C.fees.exchange) + '</dd><dt>كتاب من مكتبة المنصة</dt><dd>' + money(C.fees.library) + '</dd><dt>استلام تبرعك من بابك</dt><dd>مجاناً</dd></dl></div>' +
        '<div class="stack" style="--gap:14px"><h2>قواعد الحجز</h2><ul class="goals">' +
          '<li>احجز فترتك قبل الساعة 10 مساءً من اليوم السابق للتوصيل.</li>' +
          '<li>يمكنك إلغاء الطلب من حسابك قبل الموعد نفسه، ثم حجز فترة جديدة.</li>' +
          '<li>يتصل بك المندوب عند وصوله إلى الحي.</li>' +
          '<li>المدن المشمولة: ' + C.cities.join('، ') + '. والتوصيل داخل المدينة الواحدة.</li></ul></div>' +
      '</div></section>' +

      '<section class="section-tight"><div class="split" style="align-items:center">' +
        '<div class="stack" style="--gap:14px"><p class="kicker">لماذا هو أرخص؟</p><h2>كلما امتلأ المسار، قلّت تكلفة كل طلب</h2>' +
          '<p class="muted">للرحلة تكلفة شبه ثابتة: وقت المندوب والوقود. حين نقسمها على طلبات كثيرة في الحي والفترة نفسيهما، ينخفض نصيب كل طلب. حرّك المؤشر لترى الفرق.</p>' + routeArt() + '</div>' +
        '<div class="cost"><label for="cost-n" class="label">عدد الطلبات في المسار</label>' +
          '<input id="cost-n" class="range" type="range" min="1" max="12" value="' + costN + '">' +
          '<p class="cost-readout" id="cost-readout" aria-live="polite">' + costReadout(costN) + '</p>' +
          '<div id="cost-chart">' + costChart(costN) + '</div>' +
          '<div class="legend"><span><i style="background:var(--ink)"></i>الاختيار الحالي</span><span><i style="background:var(--marker-green)"></i>تكلفة الطلب ضمن رسومنا</span></div>' +
          '<p class="hint">مثال توضيحي بتكلفة تقديرية للمسار قدرها ' + C.routeCostExample + ' ريالاً.</p></div>' +
      '</div></section>' +

      '<section class="section-tight"><div class="split">' +
        '<div class="stack" style="--gap:14px"><h2>تتبّع طلبك</h2><p class="muted">اكتب رقم الطلب كما يظهر في حسابك، مثل WB-30418.</p>' +
          '<form class="track" data-form="track" novalidate><label class="sr-only" for="track-id">رقم الطلب</label><input id="track-id" name="id" class="input ltr-input" placeholder="WB-00000" autocomplete="off"><button class="btn btn-primary" type="submit">تتبّع</button></form>' +
          '<div id="track-result" class="track-result" aria-live="polite"></div></div>' +
        '<div class="stack" style="--gap:6px"><h2 style="margin-bottom:8px">أسئلة شائعة</h2><div class="faq">' +
          CT.faq.map(function (x) { return '<details><summary>' + x.q + '</summary><p>' + x.a + '</p></details>'; }).join('') + '</div></div>' +
      '</div></section><div style="height:48px"></div></div>';
  }

  /* ---------- المركز الإعلامي ---------- */
  function poster(i) {
    var cap = CT.campaign.posters[i].caption;
    var inner = [
      '<div class="poster poster-note" role="img" aria-label="منشور الحملة: لا تخلّيه في الدرج، خلّه يكمل رحلته"><div class="poster-in"><div class="p-top"><span class="p-logo">ورق بحبر</span><span class="p-tag">حملة توعوية</span></div>' +
        '<p class="p-head">لا تخلّيه في الدرج…<br><mark>خلّه يكمل رحلته</mark></p>' +
        '<div class="p-bottom"><span class="p-hash">' + C.hashtag + '</span><span class="p-cta">اعرضه في ورق بحبر</span></div></div></div>',
      '<div class="poster poster-swap" role="img" aria-label="منشور التبادل: كتب الفصل اللي فات؟ بدّلها بكتب الفصل الجاي"><div class="poster-in"><div class="p-top"><span class="p-logo">ورق بحبر</span><span class="p-tag">التبادل</span></div>' +
        '<svg viewBox="0 0 120 60" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 18h96M92 4l14 14-14 14"/><path d="M110 44H14M28 30L14 44l14 14"/></svg>' +
        '<p class="p-head">كتب الفصل اللي فات؟<br><mark>بدّلها</mark> بكتب الفصل الجاي</p>' +
        '<div class="p-bottom"><span class="p-hash">' + C.hashtag + '</span><span class="p-cta">بلا ما تدفع ثمن كتاب</span></div></div></div>',
      '<div class="poster poster-gift" role="img" aria-label="منشور التبرع: كتاب واحد منك يخفف فصلاً كاملاً عن طالب آخر"><div class="poster-in"><div class="p-top"><span class="p-logo">ورق بحبر</span><span class="p-tag">مكتبة المنصة</span></div>' +
        '<p class="p-head">كتاب واحد منك<br><mark>يخفّف فصلاً كاملاً</mark><br>عن طالب آخر</p>' +
        '<div class="p-bottom"><span class="p-hash">' + C.hashtag + '</span><span class="p-cta">الاستلام مجاني من بابك</span></div></div></div>'
    ][i];
    return '<figure>' + inner + '<figcaption>' + cap + '</figcaption></figure>';
  }
  function articleItem(a) {
    return '<a class="a-item" href="#article-' + a.id + '"><span class="a-meta"><span class="a-cat">' + a.category + '</span><span>' + readLabel(a) + '</span></span><h3>' + a.title + '</h3><p class="muted">' + a.excerpt + '</p></a>';
  }
  function pageMedia() {
    var cp = CT.campaign, br = CT.brand, pr = CT.press, pc = CT.podcast;
    var subnav = [['m-campaign', 'الحملة'], ['m-articles', 'المقالات'], ['m-calendar', 'التقويم التحريري'], ['m-podcast', 'البودكاست'], ['m-brand', 'الهوية البصرية'], ['m-press', 'البيان الصحفي'], ['m-voice', 'شاركنا']];
    var feat = CT.articles[0];
    return '<header class="masthead"><div class="wrap"><p class="kicker">المركز الإعلامي</p><h1>نحكي رحلة الكتاب من طالب إلى طالب</h1>' +
      '<p class="lede">حملة المنصة، ومقالات تساعدك في البيع والشراء والتبادل، وخطة المحتوى على منصات التواصل، والهوية البصرية وأدوات الإعلام.</p>' +
      '<nav class="subnav" aria-label="أقسام المركز الإعلامي">' + subnav.map(function (s) { return '<button type="button" data-action="scroll" data-target="' + s[0] + '">' + s[1] + '</button>'; }).join('') + '</nav></div></header>' +

      '<section class="section m-section" id="m-campaign"><div class="wrap stack" style="--gap:40px">' +
        '<div class="split"><div class="stack" style="--gap:14px"><p class="kicker">الحملة التوعوية</p><p class="hashtag">' + C.hashtag + '</p><p class="lede">' + cp.summary + '</p></div>' +
        '<dl class="brief">' + cp.brief.map(function (x) { return '<dt>' + x[0] + '</dt><dd>' + x[1] + '</dd>'; }).join('') + '</dl></div>' +
        '<div class="stack" style="--gap:18px"><h2 style="font-size:1.9rem">مراحل الحملة</h2><ol class="phases steps" style="list-style:none;padding:0">' +
          cp.phases.map(function (p, i) { return '<li class="step"><span class="step-n">' + (i + 1) + '</span><h3>' + p.title + '</h3><p>' + p.text + '</p></li>'; }).join('') + '</ol></div>' +
        '<div class="stack" style="--gap:18px"><h2 style="font-size:1.9rem">تصاميم المنشورات</h2><div class="posters">' + poster(0) + poster(1) + poster(2) + '</div></div>' +
        '<div class="stack" style="--gap:18px"><div><h2 style="font-size:1.9rem">القصة المحورية: رحلة كتاب واحد</h2><p class="muted">قصة توضيحية تُبنى عليها فيديوهات الإطلاق.</p></div><ol class="story">' +
          cp.story.map(function (s) { return '<li><b>' + s.when + '</b><p>' + s.text + '</p></li>'; }).join('') + '</ol></div>' +
      '</div></section>' +

      '<section class="section m-section band" id="m-articles"><div class="wrap">' +
        '<div class="sec-head"><div><p class="kicker">المقالات</p><h2>أدلة قصيرة لكل خطوة</h2></div></div>' +
        '<div class="articles"><a class="a-feature" href="#article-' + feat.id + '"><span class="a-meta"><span class="a-cat">' + feat.category + '</span><span>' + readLabel(feat) + '</span></span><h3>' + feat.title + '</h3><p class="lede" style="font-size:1.05rem">' + feat.excerpt + '</p><span class="btn btn-ghost" style="align-self:flex-start">اقرأ المقال</span></a>' +
        '<div class="a-list">' + CT.articles.slice(1).map(articleItem).join('') + '</div></div>' +
      '</div></section>' +

      '<section class="section m-section" id="m-calendar"><div class="wrap stack" style="--gap:24px">' +
        '<div class="sec-head" style="margin:0"><div><p class="kicker">التقويم التحريري</p><h2>أسبوع محتوى نموذجي على منصات التواصل</h2><p>يتكرر أسبوعياً، وتتغير أولوياته مع مواسم الفصل الدراسي.</p></div></div>' +
        '<div class="table-wrap"><table><thead><tr><th scope="col">اليوم</th><th scope="col">المنصة</th><th scope="col">نوع المحتوى</th><th scope="col">الفكرة</th><th scope="col">الشكل</th></tr></thead><tbody>' +
          CT.calendar.map(function (r) { return '<tr><td class="day-cell">' + r.day + '</td><td>' + r.platform + '</td><td>' + r.type + '</td><td>' + r.idea + '</td><td>' + r.format + '</td></tr>'; }).join('') +
        '</tbody></table></div>' +
        '<div class="seasons">' + CT.seasons.map(function (s) { return '<div class="season"><b>' + s.when + '</b><span>' + s.focus + '</span></div>'; }).join('') + '</div>' +
        '<div class="stack" style="--gap:12px"><h3 style="font-size:1.5rem">الحسابات المقترحة للمنصة</h3><div class="social-row">' +
          CT.socials.map(function (s) { return '<div class="social"><b>' + s.name + '</b><span>' + C.handle + '</span><small>' + s.use + '</small></div>'; }).join('') + '</div></div>' +
      '</div></section>' +

      '<section class="section m-section band" id="m-podcast"><div class="wrap">' +
        '<div class="sec-head"><div><p class="kicker">' + pc.status + '</p><h2>' + pc.name + '</h2><p>' + pc.format + '</p></div></div>' +
        '<ol class="episodes">' + pc.episodes.map(function (e, i) { return '<li><span class="ep-n">' + (i + 1) + '</span><h4>' + e.title + '</h4><p>' + e.text + '</p><span class="ep-guest">الضيف: ' + e.guest + '</span></li>'; }).join('') + '</ol>' +
      '</div></section>' +

      '<section class="section m-section" id="m-brand"><div class="wrap stack" style="--gap:36px">' +
        '<div class="split"><div class="stack" style="--gap:14px"><p class="kicker">الهوية البصرية</p><h2>ورقٌ وحبرٌ وقلم تظليل</h2><p class="lede">' + br.story + '</p>' +
          '<p class="muted">كل لون تظليل في المنصة يدل على نوع العرض: الأصفر للبيع، والوردي للتبادل، والأخضر للتبرع. وتُكتب الملاحظات بخط الرقعة، خط الطالب في دفتره.</p></div>' +
        '<div class="logos"><div class="logo-panel on-paper"><span class="logo-lockup">' + LOGO.replace('class="brand-mark"', '') + '<span>ورق بحبر</span></span><small>الشعار على الورق</small></div>' +
          '<div class="logo-panel on-ink"><span class="logo-lockup">' + LOGO.replace('class="brand-mark"', '') + '<span>ورق بحبر</span></span><small>الشعار على الحبر</small></div></div></div>' +
        '<div class="stack" style="--gap:14px"><h3 style="font-size:1.6rem">الألوان</h3><div class="swatches">' +
          br.colors.map(function (c) { return '<div class="swatch"><i style="--sw:' + c.hex + '"></i><div><b>' + c.name + '</b><code>' + c.hex + '</code><small>' + c.role + '</small></div></div>'; }).join('') + '</div></div>' +
        '<div class="stack" style="--gap:6px"><h3 style="font-size:1.6rem;margin-bottom:8px">الخطوط</h3><div class="type-specs">' +
          br.fonts.map(function (f) { return '<div class="type-spec"><div class="meta"><b>' + f.name + '</b><span>' + f.role + '</span></div><p class="sample ' + f.cls + '">' + f.sample + '</p></div>'; }).join('') + '</div></div>' +
        '<div class="stack" style="--gap:14px"><h3 style="font-size:1.6rem">نبرة الصوت</h3><div class="voice">' +
          br.voice.map(function (v) { return '<div class="voice-card"><h4>' + v.title + '</h4><p>' + v.text + '</p><div class="say yes"><b>نقول</b><span>«' + v.yes + '»</span></div><div class="say no"><b>لا نقول</b><span>«' + v.no + '»</span></div></div>'; }).join('') + '</div></div>' +
      '</div></section>' +

      '<section class="section m-section band" id="m-press"><div class="wrap stack" style="--gap:22px">' +
        '<div class="sec-head" style="margin:0"><div><p class="kicker">التواصل الإعلامي</p><h2>' + pr.label + '</h2><p>يُرسل إلى الصحف الجامعية والمواقع الإخبارية مع الشعار وصور المنصة.</p></div></div>' +
        '<article class="press"><div class="pr-top"><span class="red">بيان صحفي · للنشر الفوري</span><span>' + pr.dateline + '، ' + esc(fFull.format(new Date())) + '</span></div>' +
          '<h3>' + pr.headline + '</h3><p><b>' + pr.dateline + ':</b> ' + pr.lead + '</p>' + pr.body.map(function (p) { return '<p>' + p + '</p>'; }).join('') +
          '<p class="pr-about"><b>عن ورق بحبر:</b> ' + pr.about + '</p><p class="pr-end">- انتهى -</p></article>' +
      '</div></section>' +

      '<section class="section m-section" id="m-voice"><div class="wrap split">' +
        '<div class="cta-card"><p class="kicker">استبيان المنصة</p><h3>رأيك يطوّر ورق بحبر</h3><p>استبيان قصير عن عادات الطلاب في شراء الكتب الجامعية وتوقعاتهم من المنصة، وهو أداة جمع البيانات في هذا المشروع.</p>' +
          (C.surveyUrl ? '<a class="btn btn-primary" href="' + esc(C.surveyUrl) + '" target="_blank" rel="noopener" style="align-self:flex-start">شارك في الاستبيان</a>' : '<p class="hint">يُضاف رابط الاستبيان هنا عند نشره.</p>') + '</div>' +
        '<div class="cta-card" style="background:var(--sheet);border:1px solid var(--line)"><p class="kicker">نشرة الفصل</p><h3>رسالة واحدة في بداية كل فصل</h3><p class="muted">أكثر الكتب طلباً، ومواعيد التوصيل، وجديد مكتبة المنصة.</p>' +
          '<form class="inline-form" data-form="newsletter" novalidate><label class="sr-only" for="nl-email">بريدك الإلكتروني</label><input id="nl-email" name="email" type="email" class="input ltr-input" placeholder="name@example.com" autocomplete="email"><button class="btn btn-primary" type="submit">اشترك</button></form><p class="err" id="err-nl-email"></p></div>' +
      '</div></section>';
  }

  /* ---------- المقال ---------- */
  function pageArticle(id) {
    var a = CT.articles.find(function (x) { return x.id === id; });
    if (!a) return pageNotFound('لم نجد هذا المقال.');
    var others = CT.articles.filter(function (x) { return x.id !== id; }).slice(0, 2);
    var body = a.body.map(function (b) {
      if (b[0] === 'h3') return '<h3>' + b[1] + '</h3>';
      if (b[0] === 'ul' || b[0] === 'ol') return '<' + b[0] + '>' + b[1].map(function (li) { return '<li>' + li + '</li>'; }).join('') + '</' + b[0] + '>';
      return '<p>' + b[1] + '</p>';
    }).join('');
    return '<div class="wrap"><article class="article">' +
      '<nav class="crumbs" aria-label="مسار الصفحة"><a href="#media">المركز الإعلامي</a><span>/</span><span>' + a.category + '</span></nav>' +
      '<h1>' + a.title + '</h1><p class="lede">' + a.excerpt + '</p>' +
      '<p class="a-meta"><span>فريق تحرير ورق بحبر</span><span>' + readLabel(a) + '</span></p>' +
      '<div class="a-body">' + body + '</div>' +
      '<div class="a-foot"><span class="hand" style="color:var(--ink);font-size:1.3rem">' + C.hashtag + '</span><button class="btn btn-ghost btn-sm" type="button" data-action="copy-link">' + icon('link') + 'انسخ رابط المقال</button></div>' +
      '<div class="stack" style="--gap:0;margin-top:20px"><p class="kicker" style="margin-bottom:12px">اقرأ أيضاً</p>' + others.map(articleItem).join('') + '</div>' +
      '</article></div>';
  }

  /* ---------- الدخول وإنشاء حساب ---------- */
  function pageLogin(tab) {
    var reg = tab === 'register';
    return '<div class="wrap"><div class="auth">' +
      '<div class="stack" style="--gap:22px"><p class="kicker">حسابك في ورق بحبر</p><h1 style="font-size:clamp(2.2rem,1.6rem + 2.4vw,3.2rem)">سجّل دخولك لتعرض كتبك وتتابع طلباتك</h1>' +
        '<ul class="ticks"><li>' + icon('check') + '<span>اعرض كتبك للبيع أو التبادل في دقيقة.</span></li><li>' + icon('check') + '<span>اطلب الكتب واختر فترة التوصيل المناسبة.</span></li><li>' + icon('check') + '<span>تابع طلباتك وطلبات التبادل الواردة على كتبك.</span></li></ul>' +
        '<div class="demo-box"><b>تجربة سريعة</b><p>حساب تجريبي فيه كتابان معروضان وطلب تبادل ينتظر ردك.</p><button class="btn btn-primary" type="button" data-action="demo-login">الدخول بالحساب التجريبي</button>' +
          '<p class="hint">أو سجّل الدخول بـ <code>demo@waraq-bihibr.test</code> وكلمة المرور <code>demo1234</code></p></div>' +
      '</div>' +
      '<div class="auth-card"><div class="tabs" role="tablist" aria-label="الدخول أو إنشاء حساب">' +
        '<button class="tab" type="button" role="tab" id="tab-login" aria-controls="form-login" aria-selected="' + (!reg) + '" data-action="auth-tab" data-tab="login">تسجيل الدخول</button>' +
        '<button class="tab" type="button" role="tab" id="tab-register" aria-controls="form-register" aria-selected="' + reg + '" data-action="auth-tab" data-tab="register">إنشاء حساب</button></div>' +
        '<form id="form-login" data-form="login" role="tabpanel" aria-labelledby="tab-login" novalidate' + (reg ? ' hidden' : '') + '>' +
          '<div class="field"><label for="login-email">البريد الإلكتروني</label><input id="login-email" name="email" type="email" class="input ltr-input" autocomplete="email" placeholder="name@example.com"></div>' +
          '<div class="field"><label for="login-password">كلمة المرور</label><input id="login-password" name="password" type="password" class="input ltr-input" autocomplete="current-password"></div>' +
          '<p class="err" id="err-login" role="alert"></p><button class="btn btn-primary btn-block" type="submit">دخول</button></form>' +
        '<form id="form-register" data-form="register" role="tabpanel" aria-labelledby="tab-register" novalidate' + (reg ? '' : ' hidden') + '>' +
          '<div class="field"><label for="reg-name">الاسم</label><input id="reg-name" name="name" class="input" autocomplete="name"><p class="err" id="err-reg-name"></p></div>' +
          '<div class="field"><label for="reg-email">البريد الإلكتروني</label><input id="reg-email" name="email" type="email" class="input ltr-input" autocomplete="email" placeholder="name@example.com"><p class="hint">يفضّل بريدك الجامعي.</p><p class="err" id="err-reg-email"></p></div>' +
          '<div class="form-grid"><div class="field"><label for="reg-university">الجامعة</label><select id="reg-university" name="university" class="select"><option value="">اختر جامعتك</option>' + C.universities.map(function (x) { return '<option>' + x + '</option>'; }).join('') + '</select><p class="err" id="err-reg-university"></p></div>' +
          '<div class="field"><label for="reg-city">المدينة</label><select id="reg-city" name="city" class="select"><option value="">اختر مدينتك</option>' + cityOptions('') + '</select><p class="err" id="err-reg-city"></p></div></div>' +
          '<div class="field"><label for="reg-password">كلمة المرور</label><input id="reg-password" name="password" type="password" class="input ltr-input" autocomplete="new-password"><p class="hint">8 أحرف على الأقل.</p><p class="err" id="err-reg-password"></p></div>' +
          '<div class="field"><label for="reg-password2">تأكيد كلمة المرور</label><input id="reg-password2" name="password2" type="password" class="input ltr-input" autocomplete="new-password"><p class="err" id="err-reg-password2"></p></div>' +
          '<button class="btn btn-primary btn-block" type="submit">إنشاء الحساب</button></form>' +
      '</div></div></div>';
  }

  /* ---------- حسابي ---------- */
  var acctTab = null;
  function pageAccount() {
    var u = me();
    if (!u) return gate('سجّل دخولك لترى حسابك', 'من حسابك تدير كتبك المعروضة، وتتابع طلبات الشراء والتبادل ومواعيد التوصيل.', '#account');
    var myBooks = db.books.filter(function (b) { return b.sellerId === u.id; }).sort(byNewest);
    var myOrders = db.orders.filter(function (o) { return o.userId === u.id && o.kind !== 'donation'; }).sort(byNewest);
    var incoming = db.orders.filter(function (o) { return o.ownerId === u.id; }).sort(byNewest);
    var dons = db.orders.filter(function (o) { return o.userId === u.id && o.kind === 'donation'; }).sort(byNewest);
    var pendingIn = incoming.filter(function (o) { return o.status === 'pending'; }).length;
    if (!acctTab) acctTab = pendingIn ? 'incoming' : (myOrders.length ? 'orders' : 'books');

    var upcoming = db.orders.filter(function (o) { return (o.userId === u.id || o.ownerId === u.id) && ['scheduled', 'route'].indexOf(orderState(o).key) !== -1; })
      .sort(function (a, b) { return slotInfo(a.slot).start - slotInfo(b.slot).start; })[0];
    var tabs = [['books', 'كتبي المعروضة', myBooks.length], ['orders', 'طلباتي', myOrders.length], ['incoming', 'طلبات على كتبي', pendingIn], ['donations', 'تبرعاتي', dons.length]];
    var panel = '';
    if (acctTab === 'books') {
      panel = myBooks.length ? '<div class="rows">' + myBooks.map(myBookRow).join('') + '</div>' :
        emptyBox('لم تعرض كتباً بعد', 'اعرض كتاباً للبيع أو التبادل، وستجده هنا مع حالته.', '<a class="btn btn-primary" href="#sell">اعرض كتابك</a>');
    } else if (acctTab === 'orders') {
      panel = myOrders.length ? '<div class="rows">' + myOrders.map(function (o) { return orderRow(o, 'mine'); }).join('') + '</div>' :
        emptyBox('لا طلبات بعد', 'حين تطلب كتاباً أو ترسل طلب تبادل، ستتابع حالته وموعد توصيله من هنا.', '<a class="btn btn-primary" href="#books">تصفح الكتب</a>');
    } else if (acctTab === 'incoming') {
      panel = incoming.length ? '<div class="rows">' + incoming.map(function (o) { return orderRow(o, 'in'); }).join('') + '</div>' :
        emptyBox('لا طلبات على كتبك', 'ستظهر هنا طلبات الشراء والتبادل التي تصل على كتبك المعروضة.', '');
    } else {
      panel = dons.length ? '<div class="rows">' + dons.map(function (o) { return orderRow(o, 'mine'); }).join('') + '</div>' :
        emptyBox('لم تتبرع بكتاب بعد', 'كتاب واحد منك قد يخفف فصلاً كاملاً عن طالب آخر.', '<a class="btn btn-primary" href="#donate">تبرّع بكتاب</a>');
    }
    return '<div class="wrap" style="padding-bottom:72px"><div class="acct-head"><div class="who"><span class="avatar" aria-hidden="true">' + esc(initial(u.name)) + '</span>' +
      '<div><h1>' + esc(u.name) + '</h1><p>' + esc(u.university || '') + ' · ' + esc(u.city) + (u.email ? ' · <span class="ltr">' + esc(u.email) + '</span>' : '') + '</p></div></div>' +
      '<div class="row-wrap"><a class="btn btn-primary btn-sm" href="#sell">' + icon('plus') + 'اعرض كتاباً</a><button class="btn btn-ghost btn-sm" type="button" data-action="logout">تسجيل الخروج</button></div></div>' +
      (upcoming ? '<div class="next-up">' + icon('truck').replace('<svg', '<svg width="22" height="22" style="color:var(--ink)"') + '<span>موعدك القادم: <b>' + esc(slotInfo(upcoming.slot).label) + '</b></span><span class="muted">' + KIND[upcoming.kind] + ' · ' + bd((findBook(upcoming.bookId) || {}).title || '') + '</span></div>' : '') +
      '<div class="tabs" role="tablist" aria-label="أقسام الحساب" style="margin-bottom:8px">' + tabs.map(function (t) {
        return '<button class="tab" type="button" role="tab" aria-selected="' + (acctTab === t[0]) + '" data-action="acct-tab" data-tab="' + t[0] + '">' + t[1] + ' <span class="count' + (t[0] === 'incoming' && t[2] ? ' hot' : '') + '">' + t[2] + '</span></button>';
      }).join('') + '</div><div role="tabpanel">' + panel + '</div></div>';
  }
  function myBookRow(b) {
    var st = { available: ['st-ok', 'معروض'], reserved: ['st-warn', 'محجوز لطلب قائم'], sold: ['st-muted', 'تم البيع'], exchanged: ['st-muted', 'تم التبادل'] }[b.status] || ['st-muted', b.status];
    var pend = db.orders.filter(function (o) { return o.bookId === b.id && o.status === 'pending'; }).length;
    return '<div class="item-row">' + cover(b, { stamp: false }) + '<div class="item-main"><b>' + bd(b.title) + '</b>' +
      '<small><span class="st ' + st[0] + '">' + st[1] + '</span> ' + (b.type !== 'exchange' ? money(b.price) + ' · ' : '') + C.types[b.type].label + ' · ' + cond(b.condition).label + ' · عُرض ' + agoText(b.createdAt) + '</small>' +
      (pend ? '<small style="color:var(--ink);font-weight:600">' + (pend === 1 ? 'عليه طلب تبادل ينتظر ردك' : 'عليه ' + ordersCount(pend) + ' تنتظر ردك') + '</small>' : '') + '</div>' +
      '<div class="item-actions"><a class="btn btn-ghost btn-sm" href="#book-' + b.id + '">عرض</a>' +
      (b.status === 'available' ? '<button class="btn btn-ghost btn-sm" type="button" data-action="mark-sold" data-id="' + b.id + '">بعته خارج المنصة</button><button class="btn btn-danger btn-sm" type="button" data-action="delete-book" data-id="' + b.id + '">حذف</button>' : '') +
      '</div></div>';
  }
  function orderRow(o, side) {
    var b = findBook(o.bookId) || { title: 'كتاب محذوف', college: 'general' };
    var st = orderState(o), title, actions = '';
    var other = userById(side === 'in' ? o.userId : o.ownerId);
    if (o.kind === 'exchange') {
      var ob = findBook(o.offerBookId) || { title: 'كتاب محذوف' };
      title = side === 'in' ? 'عرض تبادل من ' + esc(other ? other.name : 'طالب') + ': ' + bd(ob.title) + ' مقابل كتابك ' + bd(b.title) : 'تبادل: كتابك ' + bd(ob.title) + ' مقابل ' + bd(b.title);
    } else if (o.kind === 'purchase') {
      title = side === 'in' ? 'طلب شراء على كتابك ' + bd(b.title) : 'شراء ' + bd(b.title);
    } else if (o.kind === 'library') {
      title = 'من مكتبة المنصة: ' + bd(b.title);
    } else {
      title = 'تبرع: ' + bd(b.title);
    }
    var label = st.label;
    if (side === 'in' && st.key === 'pending') label = 'ينتظر ردك';
    var when = (o.status === 'pending' ? 'الموعد المقترح: ' : 'الموعد: ') + esc(slotInfo(o.slot).label);
    var fee = o.fee ? 'رسوم التوصيل ' + o.fee + ' ر.س' + (o.kind === 'exchange' ? ' على كل طرف' : '') : 'التوصيل مجاني';
    if (side === 'in' && o.status === 'pending') {
      actions = '<button class="btn btn-primary btn-sm" type="button" data-action="accept" data-id="' + o.id + '">قبول التبادل</button><button class="btn btn-ghost btn-sm" type="button" data-action="decline" data-id="' + o.id + '">اعتذار</button>';
    } else if (side === 'mine') {
      if (o.kind === 'exchange' && o.status === 'pending') {
        var owner = userById(o.ownerId);
        if (owner && !owner.email) actions += '<button class="btn btn-quiet btn-sm" type="button" data-action="simulate-accept" data-id="' + o.id + '" title="لأغراض العرض التجريبي">محاكاة موافقة الطرف الآخر</button>';
      }
      if ((st.key === 'pending' || st.key === 'scheduled') && (o.status === 'pending' || canModify(o))) {
        actions += '<button class="btn btn-danger btn-sm" type="button" data-action="cancel-order" data-id="' + o.id + '">إلغاء</button>';
      }
    }
    return '<div class="item-row">' + cover(b, { stamp: false }) + '<div class="item-main"><b>' + title + '</b>' +
      '<small><span class="st ' + st.cls + '">' + label + '</span> رقم الطلب <span class="order-no">' + o.id + '</span></small>' +
      '<small>' + when + (o.district ? ' · ' + esc(district(o.district)) : '') + ' · ' + fee + '</small>' +
      (o.message ? '<p class="msg">«' + esc(o.message) + '»</p>' : '') + '</div>' +
      '<div class="item-actions">' + actions + '</div></div>';
  }

  function pageNotFound(msg) {
    return '<div class="wrap section"><div class="gate"><p class="kicker">صفحة غير موجودة</p><h2>' + (msg || 'لم نجد هذه الصفحة.') + '</h2><div class="row-wrap"><a class="btn btn-primary" href="#home">الرئيسية</a><a class="btn btn-ghost" href="#books">تصفح الكتب</a></div></div></div>';
  }

  /* =================================================================
     النوافذ المنبثقة والإشعارات
     ================================================================= */
  var lastFocus = null, modalDirty = false, confirmFn = null;
  function openModal(title, body) {
    lastFocus = document.activeElement;
    var m = $('#modal');
    m.innerHTML = '<div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-head"><h2 id="modal-title">' + title + '</h2>' +
      '<button class="btn btn-ghost btn-sm icon-btn" type="button" data-action="close-modal" aria-label="إغلاق">' + icon('close') + '</button></div><div class="modal-body" id="modal-body">' + body + '</div></div>';
    m.hidden = false;
    document.body.style.overflow = 'hidden';
    var first = m.querySelector('.modal-body input, .modal-body button, .modal-body a, .modal-body textarea');
    (first || m.querySelector('[data-action="close-modal"]')).focus({ preventScroll: true });
  }
  function closeModal() {
    var m = $('#modal');
    if (m.hidden) return;
    m.hidden = true; m.innerHTML = ''; document.body.style.overflow = '';
    confirmFn = null;
    if (modalDirty) { modalDirty = false; render(true); }
    if (lastFocus && document.body.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  }
  function confirmBox(title, text, yesLabel, fn, danger) {
    confirmFn = fn;
    openModal(title, '<p>' + text + '</p><div class="row-wrap"><button class="btn ' + (danger ? 'btn-danger' : 'btn-primary') + '" type="button" data-action="confirm-yes">' + yesLabel + '</button><button class="btn btn-ghost" type="button" data-action="close-modal">تراجع</button></div>');
  }
  var toastTimer = null;
  function toast(msg) {
    var t = $('#toast');
    t.innerHTML = '<div class="toast-msg">' + msg + '</div>';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.innerHTML = ''; }, 3800);
  }
  function needLogin(back) {
    db.returnTo = back || location.hash || '#home'; save();
    closeModal();
    toast('سجّل الدخول أولاً لإكمال طلبك.');
    location.hash = '#login';
  }
  function dealSummary(b, lines) {
    return '<div class="deal-sum">' + cover(b, { stamp: false }) + '<div class="stack" style="--gap:6px"><b>' + bd(b.title) + '</b><dl class="sum-lines">' + lines + '</dl></div></div>';
  }
  function canDeal(b, u) {
    if (!b) { toast('لم نجد هذا الكتاب.'); return false; }
    if (!isLib(b) && b.sellerId === u.id) { toast('هذا كتابك، وتديره من صفحة حسابك.'); return false; }
    if (b.status !== 'available') { toast('هذا الكتاب محجوز حالياً.'); return false; }
    if (b.city !== u.city) { toast('الكتاب في ' + b.city + '، والتوصيل حالياً داخل المدينة الواحدة.'); return false; }
    return true;
  }
  function doneView(title, lines, note) {
    return '<div class="done-box"><span class="done-icon">' + icon('check') + '</span><h3 style="font-size:1.8rem">' + title + '</h3>' + lines +
      (note ? '<p class="muted">' + note + '</p>' : '') +
      '<div class="row-wrap"><a class="btn btn-primary" href="#account" data-action="go-account">متابعة في حسابي</a><button class="btn btn-ghost" type="button" data-action="close-modal">متابعة التصفح</button></div></div>';
  }

  function openPurchase(id) {
    var u = me(), b = findBook(id);
    if (!u) return needLogin('#book-' + id);
    if (!canDeal(b, u)) return;
    var fee = C.fees.purchase;
    openModal('طلب شراء',
      dealSummary(b, '<dt>سعر الكتاب</dt><dd>' + money(b.price) + '</dd><dt>رسوم التوصيل المجدول</dt><dd>' + money(fee) + '</dd><dt class="total">الإجمالي عند الاستلام</dt><dd class="total">' + money(b.price + fee) + '</dd>') +
      '<form id="form-purchase" data-form="purchase" data-id="' + b.id + '" novalidate>' +
        '<fieldset><legend>اختر فترة التوصيل</legend>' + slotPicker('buy') + '</fieldset>' +
        '<div class="field"><label for="buy-district">الحي في ' + esc(u.city) + '</label><input id="buy-district" name="district" class="input" placeholder="مثال: حي النخيل" autocomplete="off"></div>' +
        info('الدفع عند الاستلام، نقداً أو بالبطاقة لدى المندوب، بعد أن تتفحص الكتاب.') +
        '<p class="err" id="deal-err" role="alert"></p>' +
        '<button class="btn btn-primary btn-block" type="submit">تأكيد الطلب</button></form>');
  }
  function openSwap(id) {
    var u = me(), b = findBook(id);
    if (!u) return needLogin('#book-' + id);
    if (!canDeal(b, u)) return;
    var dup = db.orders.find(function (o) { return o.kind === 'exchange' && o.userId === u.id && o.bookId === b.id && (o.status === 'pending' || o.status === 'accepted'); });
    if (dup) { toast('أرسلت طلب تبادل على هذا الكتاب من قبل، وتجده في حسابك.'); return; }
    var mine = db.books.filter(function (x) { return x.sellerId === u.id && x.status === 'available'; });
    var owner = userById(b.sellerId);
    if (!mine.length) {
      openModal('طلب تبادل', dealSummary(b, '<dt>صاحب الكتاب</dt><dd>' + esc(owner ? owner.name : 'طالب') + '</dd>') +
        emptyBox('تحتاج كتاباً تعرضه مقابله', 'اعرض أحد كتبك للتبادل أولاً، ثم عد إلى هذا الكتاب لإرسال الطلب.', '<a class="btn btn-primary" href="#sell" data-action="sell-type" data-type="exchange">اعرض كتاباً للتبادل</a>'));
      return;
    }
    var pre = (mine.find(function (m) { return b.wants && matchText(b.wants, m); }) || mine[0]).id;
    openModal('طلب تبادل',
      dealSummary(b, '<dt>صاحب الكتاب</dt><dd>' + esc(owner ? owner.name : 'طالب') + '</dd>' + (b.wants ? '<dt>يريد مقابله</dt><dd>' + bd(b.wants) + '</dd>' : '')) +
      '<form id="form-swap" data-form="swap" data-id="' + b.id + '" novalidate>' +
        '<fieldset><legend>الكتاب الذي تعرضه مقابله</legend>' + optCards('offer', 'offer', mine.map(function (m) {
          return { key: m.id, label: '<bdi>' + esc(m.title) + '</bdi>', desc: cond(m.condition).label + (b.wants && matchText(b.wants, m) ? ' · يطابق ما يريده' : '') };
        }), pre) + '</fieldset>' +
        '<div class="field"><label for="swap-msg">رسالة لصاحب الكتاب (اختياري)</label><textarea id="swap-msg" name="message" class="textarea" maxlength="240" placeholder="مثال: أحتاجه لمقرر هذا الفصل، وكتابي بحالة ممتازة."></textarea></div>' +
        '<fieldset><legend>فترة التوصيل المقترحة</legend>' + slotPicker('swap') + '</fieldset>' +
        '<div class="field"><label for="swap-district">الحي في ' + esc(u.city) + '</label><input id="swap-district" name="district" class="input" placeholder="مثال: حي النخيل" autocomplete="off"></div>' +
        info('رسوم التوصيل ' + C.fees.exchange + ' ر.س على كل طرف، تُدفع عند الاستلام. يُجدول التوصيل بعد موافقة صاحب الكتاب.') +
        '<p class="err" id="deal-err" role="alert"></p>' +
        '<button class="btn btn-primary btn-block" type="submit">' + icon('swap') + 'أرسل طلب التبادل</button></form>');
  }
  function openLibRequest(id) {
    var u = me(), b = findBook(id);
    if (!u) return needLogin('#book-' + id);
    if (!canDeal(b, u)) return;
    var active = db.orders.filter(function (o) { return o.kind === 'library' && o.userId === u.id && isLive(o); }).length;
    if (active >= C.libraryLimit) {
      openModal('طلب من مكتبة المنصة', emptyBox('وصلت إلى الحد الأقصى', 'لديك كتابان قيد التوصيل من المكتبة. يمكنك طلب كتاب جديد بعد استلام أحدهما، حتى تصل الكتب لأكبر عدد من الطلاب.', '<a class="btn btn-ghost" href="#account" data-action="go-account">طلباتي</a>'));
      return;
    }
    openModal('طلب من مكتبة المنصة',
      dealSummary(b, '<dt>الكتاب</dt><dd>مجاناً</dd><dt class="total">رسوم التوصيل عند الاستلام</dt><dd class="total">' + money(C.fees.library) + '</dd>') +
      '<form id="form-lib" data-form="lib-request" data-id="' + b.id + '" novalidate>' +
        '<fieldset><legend>اختر فترة التوصيل</legend>' + slotPicker('lib') + '</fieldset>' +
        '<div class="field"><label for="lib-district">الحي في ' + esc(u.city) + '</label><input id="lib-district" name="district" class="input" placeholder="مثال: حي النخيل" autocomplete="off"></div>' +
        '<p class="err" id="deal-err" role="alert"></p>' +
        '<button class="btn btn-primary btn-block" type="submit">اطلب الكتاب</button></form>');
  }

  /* =================================================================
     التوجيه بين الصفحات
     ================================================================= */
  var PAGES = { home: pageHome, books: pageBooks, sell: pageSell, exchange: pageExchange, donate: pageDonate, library: pageLibrary, delivery: pageDelivery, media: pageMedia, account: pageAccount };
  var pendingScroll = null;
  function route() {
    var h = decodeURIComponent((location.hash || '').replace(/^#/, ''));
    if (!h) return { name: 'home' };
    if (h.indexOf('book-') === 0) return { name: 'book', id: h.slice(5) };
    if (h.indexOf('article-') === 0) return { name: 'article', id: h.slice(8) };
    if (h === 'login' || h === 'register') return { name: 'login', tab: h };
    return PAGES[h] ? { name: h } : { name: 'notfound' };
  }
  var lastRouteKey = null;
  function render(keepScroll) {
    sync();
    var r = route();
    if (r.name === 'login' && me()) { location.replace('#account'); return; }
    var html;
    if (r.name === 'book') html = pageBook(r.id);
    else if (r.name === 'article') html = pageArticle(r.id);
    else if (r.name === 'login') html = pageLogin(r.tab);
    else if (r.name === 'notfound') html = pageNotFound();
    else html = PAGES[r.name]();
    renderChrome(r);
    var view = $('#view');
    view.innerHTML = html;
    var key = location.hash;
    if (r.name === 'books') { if (window.matchMedia('(max-width: 900px)').matches) $('#filters').open = false; renderResults(); }
    if (r.name === 'library') renderLibResults();
    if (r.name === 'sell') { sellPhoto = null; if ($('#form-sell')) updateSell(); }
    if (pendingScroll && r.name === 'media') {
      var target = pendingScroll; pendingScroll = null;
      setTimeout(function () { var el = document.getElementById(target); if (el) el.scrollIntoView({ block: 'start' }); }, 30);
    } else if (!keepScroll || key !== lastRouteKey) {
      window.scrollTo(0, 0);
      var h1 = view.querySelector('h1');
      if (h1 && lastRouteKey !== null) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); }
    }
    lastRouteKey = key;
  }

  /* =================================================================
     الأحداث
     ================================================================= */
  function clearErrs(form) {
    $$('.err', form).forEach(function (e) { e.textContent = ''; });
    $$('[aria-invalid]', form).forEach(function (e) { e.removeAttribute('aria-invalid'); });
  }
  function fieldErr(id, msg) {
    var el = document.getElementById(id), e = document.getElementById('err-' + id);
    if (e) e.textContent = msg;
    if (el && el.tagName !== 'DIV') { el.setAttribute('aria-invalid', 'true'); if (e) el.setAttribute('aria-describedby', e.id); }
    return el;
  }
  function groupErr(errId, msg, focusSel) {
    var e = document.getElementById(errId); if (e) e.textContent = msg;
    return $(focusSel);
  }
  function firstBad(a, b) { return a || b; }
  function goAfterLogin() {
    var to = db.returnTo || '#account';
    db.returnTo = null; save();
    if (location.hash === to) render(); else location.hash = to;
  }

  var actions = {
    'menu': function (el) {
      var nav = $('#mobile-nav'), open = nav.hidden;
      nav.hidden = !open; el.setAttribute('aria-expanded', String(open));
    },
    'dismiss-notice': function () { db.notice = false; save(); $('#notice').innerHTML = ''; },
    'remember': function (el) { db.returnTo = el.getAttribute('data-back'); save(); },
    'demo-login': function () {
      db.session = 'u-demo'; save();
      toast('أهلاً بك في الحساب التجريبي.');
      goAfterLogin();
    },
    'logout': function () { db.session = null; acctTab = null; save(); toast('سجّلت خروجك.'); location.hash = '#home'; },
    'auth-tab': function (el) {
      var reg = el.getAttribute('data-tab') === 'register';
      $('#form-login').hidden = reg; $('#form-register').hidden = !reg;
      $('#tab-login').setAttribute('aria-selected', String(!reg)); $('#tab-register').setAttribute('aria-selected', String(reg));
    },
    'buy': function (el) { openPurchase(el.getAttribute('data-id')); },
    'swap': function (el) { openSwap(el.getAttribute('data-id')); },
    'lib-request': function (el) { openLibRequest(el.getAttribute('data-id')); },
    'close-modal': function () { closeModal(); },
    'go-account': function () { acctTab = null; closeModal(); },
    'confirm-yes': function () { var fn = confirmFn; confirmFn = null; closeModalSilently(); if (fn) fn(); render(true); },
    'acct-tab': function (el) { acctTab = el.getAttribute('data-tab'); if (location.hash === '#account') render(true); },
    'sell-type': function (el) { pendingSellType = el.getAttribute('data-type'); closeModal(); },
    'filter-city': function (el) { F.city = el.getAttribute('data-city'); },
    'clear-filters': function () { F = { q: '', type: 'all', college: 'all', city: 'all', cond: [], notes: false, sort: F.sort }; render(true); },
    'use-suggested': function (el) { var p = $('#sell-price'); p.value = el.getAttribute('data-price'); updateSell(); p.focus(); },
    'donate-again': function () { lastDonation = null; render(); },
    'scroll': function (el) {
      var t = document.getElementById(el.getAttribute('data-target'));
      if (t) t.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    },
    'go-media': function (el) {
      var target = el.getAttribute('data-target');
      if (location.hash === '#media') { actions.scroll(el); return; }
      pendingScroll = target; location.hash = '#media';
    },
    'copy-link': function () {
      var url = location.href;
      var done = function () { toast('نُسخ رابط المقال.'); };
      var fallback = function () {
        openModal('رابط المقال', '<p class="muted">انسخ الرابط من هنا:</p><input class="input ltr-input" id="copy-url" readonly value="' + esc(url) + '">');
        var i = $('#copy-url'); if (i) { i.focus(); i.select(); }
      };
      try { navigator.clipboard.writeText(url).then(done, fallback); } catch (e) { fallback(); }
    },
    'reset-demo': function () {
      confirmBox('إعادة ضبط البيانات', 'سيُحذف كل ما أضفته في هذا المتصفح (الحسابات والكتب والطلبات)، وتعود البيانات التجريبية كما كانت.', 'أعد الضبط', function () {
        db = freshDB(); prepare(); acctTab = null; lastDonation = null;
        F = { q: '', type: 'all', college: 'all', city: 'all', cond: [], notes: false, sort: 'new' };
        LF = { q: '', type: 'all', college: 'all', city: 'all', cond: [], notes: false, sort: 'new' };
        save(); toast('أُعيد ضبط البيانات التجريبية.'); location.hash = '#home'; render();
      }, true);
    },
    'cancel-order': function (el) {
      var o = db.orders.find(function (x) { return x.id === el.getAttribute('data-id'); }); if (!o) return;
      confirmBox('إلغاء الطلب', 'هل تريد إلغاء الطلب <span class="order-no">' + o.id + '</span>؟ يمكنك حجز فترة جديدة بعد الإلغاء.', 'ألغِ الطلب', function () {
        releaseBooks(o); o.status = 'cancelled'; save(); toast('أُلغي الطلب ' + o.id + '.');
      }, true);
    },
    'accept': function (el) { acceptExchange(el.getAttribute('data-id'), false); },
    'simulate-accept': function (el) { acceptExchange(el.getAttribute('data-id'), true); },
    'decline': function (el) {
      var o = db.orders.find(function (x) { return x.id === el.getAttribute('data-id'); }); if (!o) return;
      confirmBox('الاعتذار عن الطلب', 'سنبلغ صاحب الطلب باعتذارك بلطف، ويبقى كتابك معروضاً.', 'أعتذر عن الطلب', function () {
        o.status = 'declined'; save(); toast('اعتذرت عن طلب التبادل.');
      });
    },
    'mark-sold': function (el) {
      var b = findBook(el.getAttribute('data-id')); if (!b) return;
      confirmBox('بعته خارج المنصة؟', 'سيختفي ' + bd(b.title) + ' من نتائج البحث، وتُلغى طلبات التبادل المعلّقة عليه.', 'نعم، بعته', function () {
        b.status = 'sold';
        db.orders.forEach(function (o) { if (o.status === 'pending' && (o.bookId === b.id || o.offerBookId === b.id)) o.status = 'declined'; });
        save(); toast('حدّثنا حالة الكتاب.');
      });
    },
    'delete-book': function (el) {
      var b = findBook(el.getAttribute('data-id')); if (!b) return;
      var busy = db.orders.some(function (o) { return (o.bookId === b.id || o.offerBookId === b.id) && (o.status === 'scheduled' || o.status === 'accepted') && isLive(o); });
      if (busy) { toast('على هذا الكتاب طلب مجدول. ألغِ الطلب أولاً.'); return; }
      confirmBox('حذف الكتاب', 'سيُحذف ' + bd(b.title) + ' من المنصة نهائياً.', 'احذف الكتاب', function () {
        db.orders.forEach(function (o) { if (o.status === 'pending' && (o.bookId === b.id || o.offerBookId === b.id)) o.status = 'declined'; });
        db.books = db.books.filter(function (x) { return x.id !== b.id; });
        save(); toast('حُذف الكتاب.');
      }, true);
    }
  };

  function acceptExchange(id, simulated) {
    var o = db.orders.find(function (x) { return x.id === id; }); if (!o) return;
    var a = findBook(o.bookId), b = findBook(o.offerBookId);
    if (!a || !b || a.status !== 'available' || b.status !== 'available') {
      o.status = 'declined'; save(); render(true);
      toast('لم يعد أحد الكتابين متاحاً، فأُغلق الطلب.'); return;
    }
    if (!canModify(o)) o.slot = slotKey(upcomingDays(1)[0], o.slot.split('|')[1] || 'pm');
    o.status = 'accepted'; a.status = 'reserved'; b.status = 'reserved'; save();
    var other = userById(simulated ? o.ownerId : o.userId);
    toast((simulated ? 'وصلت موافقة ' + esc(other ? other.name : 'صاحب الكتاب') + ' على طلبك. ' : 'قبلت طلب التبادل. ') + 'التوصيل: ' + esc(slotInfo(o.slot).label));
    render(true);
  }

  var forms = {
    'hero-search': function (f) {
      F.q = String(f.elements.namedItem('q').value || '').trim();
      if (location.hash === '#books') render(); else location.hash = '#books';
    },
    'login': function (f) {
      clearErrs(f);
      var email = String(f.elements.namedItem('email').value || '').trim().toLowerCase();
      var pw = String(f.elements.namedItem('password').value || '');
      var u = db.users.find(function (x) { return x.email && x.email.toLowerCase() === email; });
      if (!email || !pw) { $('#err-login').textContent = 'اكتب بريدك الإلكتروني وكلمة المرور.'; return; }
      hashPw(email, pw).then(function (h) {
        if (!u || u.passHash !== h) { $('#err-login').textContent = 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'; return; }
        db.session = u.id; save(); toast('أهلاً بعودتك يا ' + esc(firstName(u.name)) + '.'); goAfterLogin();
      });
    },
    'register': function (f) {
      clearErrs(f);
      var g = function (n) { return String(f.elements.namedItem(n).value || '').trim(); };
      var name = g('name'), email = g('email').toLowerCase(), uni = g('university'), city = g('city'), pw = f.elements.namedItem('password').value, pw2 = f.elements.namedItem('password2').value;
      var bad = null;
      if (name.length < 3) bad = firstBad(bad, fieldErr('reg-name', 'اكتب اسمك (3 أحرف على الأقل).'));
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) bad = firstBad(bad, fieldErr('reg-email', 'اكتب بريداً إلكترونياً صحيحاً، مثل name@example.com.'));
      else if (db.users.some(function (x) { return x.email && x.email.toLowerCase() === email; })) bad = firstBad(bad, fieldErr('reg-email', 'هذا البريد مسجل من قبل. جرّب تسجيل الدخول.'));
      if (!uni) bad = firstBad(bad, fieldErr('reg-university', 'اختر جامعتك.'));
      if (!city) bad = firstBad(bad, fieldErr('reg-city', 'اختر مدينتك لنعرض لك فترات التوصيل فيها.'));
      if (pw.length < 8) bad = firstBad(bad, fieldErr('reg-password', 'كلمة المرور قصيرة: 8 أحرف على الأقل.'));
      if (pw !== pw2) bad = firstBad(bad, fieldErr('reg-password2', 'كلمتا المرور غير متطابقتين.'));
      if (bad) { bad.focus(); return; }
      hashPw(email, pw).then(function (h) {
        var u = { id: 'u' + Date.now().toString(36), name: name, email: email, university: uni, city: city, passHash: h, createdAt: nowIso() };
        db.users.push(u); db.session = u.id; save();
        toast('أهلاً بك يا ' + esc(firstName(name)) + '، أُنشئ حسابك.');
        goAfterLogin();
      });
    },
    'sell': function (f) {
      var u = me(); if (!u) { needLogin('#sell'); return; }
      clearErrs(f);
      var v = readSellForm(f), bad = null;
      if (v.title.length < 2) bad = firstBad(bad, fieldErr('sell-title', 'اكتب عنوان الكتاب.'));
      if (!v.college) bad = firstBad(bad, fieldErr('sell-college', 'اختر الكلية.'));
      if (!v.condition) bad = firstBad(bad, groupErr('err-sell-cond', 'اختر حالة الكتاب.', '#sell-cond-likenew'));
      if (v.type !== 'exchange' && !(v.price > 0)) bad = firstBad(bad, fieldErr('sell-price', 'اكتب سعر الكتاب بالريال.'));
      if (v.type !== 'sale' && v.wants.length < 2) bad = firstBad(bad, fieldErr('sell-wants', 'اكتب الكتاب أو رمز المقرر الذي تريده مقابله.'));
      if (!v.original) bad = firstBad(bad, fieldErr('sell-original', 'نقبل النسخ الأصلية المطبوعة فقط.'));
      if (bad) { bad.focus(); return; }
      var book = {
        id: 'b' + Date.now().toString(36), title: v.title, author: v.author, edition: v.edition, course: v.course, college: v.college,
        condition: v.condition, type: v.type, price: v.type === 'exchange' ? null : v.price, wants: v.type === 'sale' ? '' : v.wants,
        city: v.city || u.city, sellerId: u.id, notes: v.notes, notesText: v.notes ? v.notesText : '', photo: sellPhoto || '',
        status: 'available', createdAt: nowIso()
      };
      db.books.unshift(book);
      var msg = 'نُشر كتابك، وسيظهر لطلاب ' + esc(book.city) + '.';
      if (!save() && book.photo) { book.photo = ''; msg = save() ? 'نُشر كتابك دون الصورة، لأن حجمها أكبر من مساحة الحفظ في متصفحك.' : msg; }
      sellPhoto = null; toast(msg);
      location.hash = '#book-' + book.id;
    },
    'purchase': function (f) {
      var u = me(), b = findBook(f.getAttribute('data-id'));
      var slot = (f.querySelector('input[name="slot"]:checked') || {}).value, district = String(f.elements.namedItem('district').value || '').trim(), err = $('#deal-err');
      if (!slot) { err.textContent = 'اختر فترة التوصيل المناسبة لك.'; return; }
      if (district.length < 2) { err.textContent = 'اكتب اسم الحي لنضيف طلبك إلى مساره.'; $('#buy-district').focus(); return; }
      if (!b || b.status !== 'available') { err.textContent = 'حُجز هذا الكتاب قبل لحظات.'; return; }
      var o = { id: orderId(), kind: 'purchase', userId: u.id, ownerId: b.sellerId, bookId: b.id, slot: slot, district: district, fee: C.fees.purchase, price: b.price, status: 'scheduled', createdAt: nowIso() };
      db.orders.unshift(o); b.status = 'reserved'; save(); modalDirty = true;
      $('#modal-body').innerHTML = doneView('تم تأكيد طلبك',
        '<p>رقم الطلب: <span class="order-no">' + o.id + '</span></p><p>موعد التوصيل: <b>' + esc(slotInfo(slot).label) + '</b></p><p>المبلغ عند الاستلام: <b>' + money(b.price + o.fee) + '</b></p>',
        'يستلم المندوب الكتاب من صاحبه ويسلّمه لك في الفترة نفسها.');
      $('#modal-body .btn').focus();
    },
    'swap': function (f) {
      var u = me(), b = findBook(f.getAttribute('data-id'));
      var offer = (f.querySelector('input[name="offer"]:checked') || {}).value;
      var slot = (f.querySelector('input[name="slot"]:checked') || {}).value, district = String(f.elements.namedItem('district').value || '').trim(), err = $('#deal-err');
      if (!offer) { err.textContent = 'اختر الكتاب الذي تعرضه مقابله.'; return; }
      if (!slot) { err.textContent = 'اقترح فترة للتوصيل.'; return; }
      if (district.length < 2) { err.textContent = 'اكتب اسم الحي.'; $('#swap-district').focus(); return; }
      var o = { id: orderId(), kind: 'exchange', userId: u.id, ownerId: b.sellerId, bookId: b.id, offerBookId: offer, slot: slot, district: district, fee: C.fees.exchange, status: 'pending', message: String(f.elements.namedItem('message').value || '').trim(), createdAt: nowIso() };
      db.orders.unshift(o); save(); modalDirty = true;
      var owner = userById(b.sellerId);
      $('#modal-body').innerHTML = doneView('أُرسل طلب التبادل',
        '<p>صاحب الكتاب: ' + esc(owner ? owner.name : 'طالب') + '</p><p>رقم الطلب: <span class="order-no">' + o.id + '</span></p><p>الموعد المقترح: <b>' + esc(slotInfo(slot).label) + '</b></p>',
        'يُجدول التوصيل للطرفين بعد موافقته. وفي هذا النموذج التجريبي يمكنك محاكاة موافقته من صفحة حسابك.');
      $('#modal-body .btn').focus();
    },
    'lib-request': function (f) {
      var u = me(), b = findBook(f.getAttribute('data-id'));
      var slot = (f.querySelector('input[name="slot"]:checked') || {}).value, district = String(f.elements.namedItem('district').value || '').trim(), err = $('#deal-err');
      if (!slot) { err.textContent = 'اختر فترة التوصيل المناسبة لك.'; return; }
      if (district.length < 2) { err.textContent = 'اكتب اسم الحي.'; $('#lib-district').focus(); return; }
      if (!b || b.status !== 'available') { err.textContent = 'طلب أحد الطلاب هذا الكتاب قبل لحظات.'; return; }
      var o = { id: orderId(), kind: 'library', userId: u.id, ownerId: null, bookId: b.id, slot: slot, district: district, fee: C.fees.library, status: 'scheduled', createdAt: nowIso() };
      db.orders.unshift(o); b.status = 'reserved'; save(); modalDirty = true;
      $('#modal-body').innerHTML = doneView('الكتاب في طريقه إليك',
        '<p>رقم الطلب: <span class="order-no">' + o.id + '</span></p><p>موعد التوصيل: <b>' + esc(slotInfo(slot).label) + '</b></p><p>رسوم التوصيل عند الاستلام: <b>' + money(o.fee) + '</b></p>',
        'حين تنتهي منه، أعده إلى المكتبة بالتبرع به من جديد ليكمل رحلته.');
      $('#modal-body .btn').focus();
    },
    'donate': function (f) {
      var u = me(); if (!u) { needLogin('#donate'); return; }
      clearErrs(f);
      var g = function (n) { return String(f.elements.namedItem(n).value || '').trim(); };
      var condition = (f.querySelector('input[name="condition"]:checked') || {}).value, slot = (f.querySelector('input[name="slot"]:checked') || {}).value;
      var bad = null;
      if (g('title').length < 2) bad = firstBad(bad, fieldErr('don-title', 'اكتب عنوان الكتاب.'));
      if (!g('college')) bad = firstBad(bad, fieldErr('don-college', 'اختر الكلية.'));
      if (!condition) bad = firstBad(bad, groupErr('err-don-cond', 'اختر حالة الكتاب.', '#don-cond-likenew'));
      if (!slot) bad = firstBad(bad, groupErr('err-don-slot', 'اختر فترة يناسبك فيها الاستلام.', '#form-donate input[name="slot"]'));
      if (g('district').length < 2) bad = firstBad(bad, fieldErr('don-district', 'اكتب اسم الحي.'));
      if (!f.elements.namedItem('original').checked) bad = firstBad(bad, fieldErr('don-original', 'نقبل النسخ الأصلية المكتملة فقط.'));
      if (bad) { bad.focus(); return; }
      var lb = { id: 'l' + Date.now().toString(36), title: g('title'), author: g('author'), edition: parseInt(g('edition'), 10) || null, course: g('course').toUpperCase(), college: g('college'), condition: condition, city: u.city, status: 'incoming', createdAt: nowIso(), donorId: u.id };
      db.library.unshift(lb);
      var o = { id: orderId(), kind: 'donation', userId: u.id, ownerId: null, bookId: lb.id, slot: slot, district: g('district'), fee: 0, status: 'scheduled', createdAt: nowIso() };
      db.orders.unshift(o); save();
      lastDonation = o.id; toast('شكراً لك! جُدول استلام تبرعك.');
      render(); window.scrollTo(0, 0);
    },
    'newsletter': function (f) {
      var e = String(f.elements.namedItem('email').value || '').trim().toLowerCase(), err = $('#err-nl-email');
      err.textContent = '';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) { err.textContent = 'اكتب بريداً إلكترونياً صحيحاً.'; f.elements.namedItem('email').focus(); return; }
      if (db.subscribers.indexOf(e) === -1) db.subscribers.push(e);
      save(); f.reset(); toast('اشتركت في نشرة الفصل.');
    },
    'track': function (f) {
      var id = String(f.elements.namedItem('id').value || '').trim().toUpperCase().replace(/\s+/g, '');
      if (/^\d{5}$/.test(id)) id = 'WB-' + id;
      var o = db.orders.find(function (x) { return x.id === id; }), box = $('#track-result');
      if (!o) { box.innerHTML = info('لم نجد طلباً بهذا الرقم. تأكد منه في صفحة «حسابي».', true); return; }
      var b = findBook(o.bookId) || { title: '' }, st = orderState(o);
      box.innerHTML = '<div class="deal-sum">' + cover(b, { stamp: false }) + '<div class="stack" style="--gap:4px"><b>' + KIND[o.kind] + ': ' + bd(b.title) + '</b><span><span class="st ' + st.cls + '">' + st.label + '</span></span><small class="muted">' + esc(slotInfo(o.slot).label) + '</small></div></div>';
    }
  };

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-action]');
    if (el && actions[el.getAttribute('data-action')]) {
      if (el.tagName === 'BUTTON') e.preventDefault();
      actions[el.getAttribute('data-action')](el, e);
    }
    if (e.target.id === 'modal') closeModal();
    var mnav = $('#mobile-nav');
    if (mnav && !mnav.hidden && e.target.closest('#mobile-nav a')) mnav.hidden = true;
  });
  document.addEventListener('submit', function (e) {
    var f = e.target.closest('form[data-form]');
    if (!f) return;
    e.preventDefault();
    if (forms[f.getAttribute('data-form')]) forms[f.getAttribute('data-form')](f);
  });
  document.addEventListener('input', function (e) {
    var t = e.target;
    if (t.hasAttribute('data-filter')) { readFilter(t, F); renderResults(); }
    else if (t.hasAttribute('data-lfilter')) { LF[t.getAttribute('data-lfilter')] = t.value; LF.touched = true; renderLibResults(); }
    else if (t.closest('#form-sell')) updateSell();
    else if (t.id === 'cost-n') {
      costN = parseInt(t.value, 10) || 1;
      $('#cost-readout').innerHTML = costReadout(costN); $('#cost-chart').innerHTML = costChart(costN);
    }
  });
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t.type === 'radio') {
      $$('input[name="' + t.name + '"]', t.form || document).forEach(function (r) { var l = r.closest('.opt, .slot'); if (l) l.classList.toggle('on', r.checked); });
    }
    if (t.hasAttribute('data-filter') && (t.type === 'checkbox' || t.tagName === 'SELECT')) { readFilter(t, F); renderResults(); }
    if (t.hasAttribute('data-lfilter') && t.tagName === 'SELECT') { LF[t.getAttribute('data-lfilter')] = t.value; LF.touched = true; renderLibResults(); }
    if (t.closest('#form-sell')) updateSell();
    if (t.id === 'sell-photo' && t.files && t.files[0]) {
      readPhoto(t.files[0]).then(function (data) {
        sellPhoto = data;
        $('#photo-preview').innerHTML = '<img src="' + data + '" alt="معاينة الصورة"> <button type="button" class="btn btn-quiet btn-sm" data-action="remove-photo">إزالة الصورة</button>';
        updateSell();
      }, function () { toast('تعذّرت قراءة الصورة. جرّب صورة بصيغة JPG أو PNG.'); t.value = ''; });
    }
  });
  actions['remove-photo'] = function () { sellPhoto = null; $('#photo-preview').innerHTML = ''; var i = $('#sell-photo'); if (i) i.value = ''; updateSell(); };
  function readFilter(t, state) {
    var k = t.getAttribute('data-filter');
    if (k === 'cond') state.cond = $$('[data-filter="cond"]:checked').map(function (x) { return x.value; });
    else if (k === 'notes') state.notes = t.checked;
    else state[k] = t.value;
  }
  document.addEventListener('keydown', function (e) {
    var m = $('#modal');
    if (!m || m.hidden) return;
    if (e.key === 'Escape') { closeModal(); return; }
    if (e.key === 'Tab') {
      var f = $$('a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select, textarea', m).filter(function (x) { return x.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  window.addEventListener('hashchange', function () { closeModalSilently(); render(); });
  function closeModalSilently() { var m = $('#modal'); if (m && !m.hidden) { m.hidden = true; m.innerHTML = ''; document.body.style.overflow = ''; modalDirty = false; } }

  /* =================================================================
     التشغيل
     ================================================================= */
  function prepare() {
    var first = upcomingDays(1)[0];
    db.orders.forEach(function (o) { if (o.slot === 'auto') o.slot = slotKey(first, 'pm'); });
    var demo = db.users.find(function (u) { return u.demo; });
    if (demo && !demo.passHash) hashPw(demo.email, 'demo1234').then(function (h) { demo.passHash = h; save(); });
    /* إبقاء طلب التبادل التجريبي قابلاً للرد عليه إن مرّ موعده المقترح */
    db.orders.forEach(function (o) {
      if (o.status === 'pending' && slotInfo(o.slot).start.getTime() < Date.now()) o.slot = slotKey(first, o.slot.split('|')[1] || 'pm');
    });
    save();
  }
  prepare();
  renderFooter();
  render();
})();
