/**
 * Bengali dictionary (PWEB-3). Deliberately incomplete -- a real editorial dictionary grows key by
 * key, and `TranslateService`/`TranslatePipe` fall back to {@link EN_DICTIONARY} for any key
 * missing here (ADR-0011, requirement-spec.md's "Bengali content missing a translation row" edge
 * case), never a blank string. `'cta.checking'` is intentionally left untranslated as a standing
 * regression check for that fallback path (see `translate.pipe.spec.ts`).
 */
export const BN_DICTIONARY: Record<string, string> = {
  'nav.home': 'হোম',
  'nav.programs': 'প্রোগ্রামসমূহ',
  'header.skipToContent': 'মূল বিষয়বস্তুতে যান',
  'header.account.guest': 'সাইন ইন করুন',
  'header.account.loggedInAs': '{role} হিসেবে সাইন ইন করা আছে',
  'theme.toggleLabel': '{mode} থিমে পরিবর্তন করুন',
  'theme.light': 'লাইট',
  'theme.dark': 'ডার্ক',
  'locale.english': 'English',
  'locale.bengali': 'বাংলা',
  'locale.switchLabel': 'ভাষা পরিবর্তন করুন',
  'home.hero.fallbackHeadline': 'শেখার, আবিষ্কারের এবং আপন হয়ে ওঠার একটি জায়গা',
  'home.hero.fallbackSubhead': 'আমাদের প্রোগ্রাম, শিক্ষক এবং ক্যাম্পাস জীবন সম্পর্কে জানুন।',
  'home.hero.explore': 'প্রোগ্রামসমূহ দেখুন',
  'home.notices.heading': 'সাম্প্রতিক নোটিশ',
  'home.notices.empty': 'এই মুহূর্তে কোনো নোটিশ নেই -- শীঘ্রই আবার দেখুন।',
  'home.events.heading': 'আসন্ন অনুষ্ঠান',
  'home.events.empty': 'এই মুহূর্তে কোনো আসন্ন অনুষ্ঠান নেই -- শীঘ্রই আবার দেখুন।',
  'home.viewAll': 'সব দেখুন',
  'cta.applyNow': 'এখনই আবেদন করুন',
  'cta.admissionOpensOn': 'ভর্তি শুরু হবে {date}',
  'cta.applicationsClosed': 'আবেদন গ্রহণ বর্তমানে বন্ধ',
  'programs.catalog.heading': 'প্রোগ্রাম ক্যাটালগ',
  'programs.catalog.filterFaculty': 'অনুষদ',
  'programs.catalog.filterDepartment': 'বিভাগ',
  'programs.catalog.allFaculties': 'সকল অনুষদ',
  'programs.catalog.allDepartments': 'সকল বিভাগ',
  'programs.catalog.empty': 'এই ফিল্টারের সাথে মিলে যাওয়া কোনো প্রোগ্রাম নেই।',
  'programs.catalog.resultCount': '{count}টি প্রোগ্রাম',
  'programs.detail.backToCatalog': 'প্রোগ্রাম ক্যাটালগে ফিরে যান',
  'programs.detail.about': 'এই প্রোগ্রাম সম্পর্কে',
  'programs.detail.quickFacts': 'সংক্ষিপ্ত তথ্য',
  'programs.detail.department': 'বিভাগ',
  'programs.detail.faculty': 'অনুষদ',
  'programs.detail.status': 'অবস্থা',
  'programs.detail.notFound': 'এই প্রোগ্রামটি খুঁজে পাওয়া যায়নি।',
  'programs.detail.noLongerAvailable': 'এই প্রোগ্রামটি আর উপলব্ধ নেই।',
  'common.loading': 'লোড হচ্ছে…',
  'common.retry': 'পুনরায় চেষ্টা করুন',
  'common.error': 'কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।',
};
