import { HugeiconsIcon } from '@hugeicons/react';
import {
  /* wayfinding */
  Home01Icon, Menu01Icon, Search01Icon, ArrowLeft01Icon, ArrowRight01Icon,
  Cancel01Icon, Tick02Icon, Add01Icon, Edit02Icon, Delete02Icon, SaveIcon,
  Refresh01Icon, Settings01Icon, Logout01Icon, DashboardSquare01Icon,
  /* contact */
  Location01Icon, Call02Icon, Mail01Icon, Globe02Icon, Clock01Icon, Link02Icon,
  Share01Icon, InboxCheckIcon, InboxDownloadIcon, Megaphone01Icon, Mic01Icon,
  /* people */
  User03Icon, UserCircleIcon, UserGroupIcon, UserAdd01Icon, UserCheck01Icon,
  UserSettings01Icon, Shield01Icon, HandshakeIcon, TeacherIcon,
  /* time + place */
  Calendar03Icon, Calendar02Icon, HistoryIcon, Building01Icon, Building02Icon,
  City01Icon, Factory01Icon, Airplane01Icon,
  /* documents */
  News01Icon, Note01Icon, Note03Icon, Notebook01Icon, Book02Icon, Book03Icon,
  Pdf01Icon, File01Icon, Folder01Icon, FolderOpenIcon, Attachment01Icon,
  Image01Icon, Presentation01Icon, Task01Icon, CertificateIcon, LegalDocument01Icon,
  /* meaning */
  ChampionIcon, Award01Icon, Diamond02Icon, StarIcon, IdeaIcon, Target01Icon,
  Rocket01Icon, Alert02Icon, LockIcon, EyeIcon, JusticeScale01Icon, Ticket01Icon,
  Money01Icon, Briefcase01Icon, GraduationCapIcon, LaptopIcon, Video01Icon,
  Analytics01Icon, Upload01Icon, Download01Icon, PinIcon, CopyrightIcon,
  PaintBrush01Icon, ToggleOnIcon, ToggleOffIcon, CityIcon,
  /* quantity surveying — the work the Institute actually does */
  ConstructionIcon, Estimate01Icon, ContractsIcon, IdentityCardIcon, BellIcon,
} from '@hugeicons/core-free-icons';

/**
 * The one icon on this site.
 *
 * Before this, the site had two icon systems and neither was a library. The
 * admin panel used Material icons through react-icons; every public page drew
 * its icons as emoji — 150 of them across 54 files. Emoji are not a typeface
 * decision, they are the *reader's* typeface decision: the same character is a
 * flat glyph on Windows, a glossy 3D one on an iPhone and something else again
 * on Android, so a page the design was signed off on looked different on every
 * device it was opened on. They also cannot take a colour, which is why none of
 * them ever matched the navy and gold everything else is drawn in.
 *
 * Icons are addressed by *meaning* rather than by library name — `phone`, not
 * `Call02Icon`. That keeps pages readable, and it means swapping the underlying
 * set again is a change to this file rather than to sixty others.
 *
 * Everything is imported by name above, so Rollup keeps only what is listed;
 * the free set has 13,556 icons and none of the rest reaches the bundle.
 */

const REGISTRY = {
  /* ── wayfinding ── */
  home: Home01Icon,
  menu: Menu01Icon,
  search: Search01Icon,
  back: ArrowLeft01Icon,
  forward: ArrowRight01Icon,
  close: Cancel01Icon,
  check: Tick02Icon,
  add: Add01Icon,
  edit: Edit02Icon,
  delete: Delete02Icon,
  save: SaveIcon,
  refresh: Refresh01Icon,
  settings: Settings01Icon,
  logout: Logout01Icon,
  dashboard: DashboardSquare01Icon,
  toggleOn: ToggleOnIcon,
  toggleOff: ToggleOffIcon,

  /* ── contact ── */
  location: Location01Icon,
  phone: Call02Icon,
  email: Mail01Icon,
  web: Globe02Icon,
  clock: Clock01Icon,
  link: Link02Icon,
  share: Share01Icon,
  inbox: InboxCheckIcon,
  moveToInbox: InboxDownloadIcon,
  announcement: Megaphone01Icon,
  speaker: Mic01Icon,

  /* ── people ── */
  user: User03Icon,
  account: UserCircleIcon,
  group: UserGroupIcon,
  userAdd: UserAdd01Icon,
  userVerified: UserCheck01Icon,
  userSettings: UserSettings01Icon,
  shield: Shield01Icon,
  handshake: HandshakeIcon,
  mentorship: TeacherIcon,

  /* ── time and place ── */
  calendar: Calendar03Icon,
  event: Calendar02Icon,
  history: HistoryIcon,
  institution: Building01Icon,
  office: Building02Icon,
  chapter: City01Icon,
  city: CityIcon,
  industry: Factory01Icon,
  international: Airplane01Icon,

  /* ── documents ── */
  news: News01Icon,
  note: Note01Icon,
  template: Note03Icon,
  journal: Notebook01Icon,
  book: Book02Icon,
  library: Book03Icon,
  pdf: Pdf01Icon,
  file: File01Icon,
  folder: Folder01Icon,
  folderOpen: FolderOpenIcon,
  attachment: Attachment01Icon,
  image: Image01Icon,
  slides: Presentation01Icon,
  task: Task01Icon,
  certificate: CertificateIcon,
  legal: LegalDocument01Icon,

  /* ── meaning ── */
  trophy: ChampionIcon,
  award: Award01Icon,
  diamond: Diamond02Icon,
  star: StarIcon,
  idea: IdeaIcon,
  target: Target01Icon,
  rocket: Rocket01Icon,
  warning: Alert02Icon,
  lock: LockIcon,
  eye: EyeIcon,
  advocacy: JusticeScale01Icon,
  ticket: Ticket01Icon,
  money: Money01Icon,
  jobs: Briefcase01Icon,
  education: GraduationCapIcon,
  technology: LaptopIcon,
  video: Video01Icon,
  chart: Analytics01Icon,
  upload: Upload01Icon,
  download: Download01Icon,
  pin: PinIcon,
  brand: CopyrightIcon,
  design: PaintBrush01Icon,

  /* ── the profession ── */
  costManagement: ConstructionIcon,
  procurement: Estimate01Icon,
  contract: ContractsIcon,
  idCard: IdentityCardIcon,
  notification: BellIcon,
};

/**
 * Sizes.
 *
 * Deliberately larger than the emoji they replace — an emoji renders at the
 * font size around it and so was always the size of body copy, which is why the
 * feature cards on the public pages read as text with a picture in front rather
 * than as icons. These are set in pixels because an icon is a fixed object, not
 * a letter, and should not resize with the paragraph it sits beside.
 */
export const SIZES = {
  sm: 20,   // inline, sitting beside a line of text
  md: 28,   // default — list rows, buttons, table actions
  lg: 40,   // card headers, section marks
  xl: 56,   // feature and value cards, empty states
};

export default function Icon({
  name,
  size = 'md',
  strokeWidth = 1.8,
  color = 'currentColor',
  title,
  className,
  style,
  ...rest
}) {
  const icon = REGISTRY[name];

  if (!icon) {
    // Loud in development, silent in production: a missing icon should be
    // caught while someone is looking at the page, but should never be the
    // reason a public page fails to render.
    if (import.meta.env.DEV) console.warn(`<Icon> has no icon named "${name}"`);
    return null;
  }

  const px = typeof size === 'number' ? size : (SIZES[size] ?? SIZES.md);

  return (
    <HugeiconsIcon
      icon={icon}
      size={px}
      color={color}
      strokeWidth={strokeWidth}
      className={className}
      // Vertically centres the glyph against adjacent text; without it an icon
      // sitting inline drops onto the baseline and pushes the line box down.
      style={{ flexShrink: 0, verticalAlign: 'middle', ...style }}
      /* Decorative unless it is given a label. Most of these replace emoji that
         sat beside the words they illustrate, so announcing them again would
         make a screen reader repeat itself. */
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      {...rest}
    />
  );
}

/** Names the registry knows — used by the icon audit script. */
export const ICON_NAMES = Object.keys(REGISTRY);
