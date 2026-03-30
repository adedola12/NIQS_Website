import {
  MdDashboard,
  MdPeople,
  MdEvent,
  MdArticle,
  MdSettings,
  MdAdminPanelSettings,
  MdLocationCity,
  MdWork,
  MdHandshake,
  MdMail,
  MdGroups,
  MdBrandingWatermark,
  MdAccountCircle,
  MdHistory,
  MdLink,
  MdContactPhone,
  MdDomain,
  MdAssignment,
  MdMenuBook,
  MdVideoLibrary,
  MdFolderOpen,
  MdLibraryBooks,
  MdManageAccounts,
} from 'react-icons/md';

export function canManageAdmins(role) {
  return role === 'main_admin';
}

export function canManageNational(role) {
  return role === 'main_admin' || role === 'national_admin';
}

export function canManageChapter(role, adminChapter, targetChapter) {
  if (role === 'main_admin' || role === 'national_admin') return true;
  if (role === 'state_admin') return adminChapter === targetChapter;
  return false;
}

export function canDelete(role) {
  return role === 'main_admin';
}

export function getAdminLabel(role) {
  const labels = {
    main_admin:     'Main Administrator',
    national_admin: 'National Administrator',
    state_admin:    'State Chapter Administrator',
    waqsn_admin:    'WAQSN Administrator',
    yqsf_admin:     'YQSF Administrator',
  };
  return labels[role] || 'Unknown Role';
}

export function getAdminSidebarItems(role) {
  /* ── Base items every admin sees ── */
  const items = [
    { label: 'Dashboard', path: '/admin', icon: MdDashboard },
  ];

  /* ── WAQSN admin ── */
  if (role === 'waqsn_admin') {
    items.push(
      { label: 'Webinars',          path: '/admin/webinars',           icon: MdVideoLibrary },
      { label: 'Workshop Materials',path: '/admin/workshop-materials', icon: MdFolderOpen   },
      { label: 'Contact Info',      path: '/admin/contact-info',       icon: MdContactPhone },
    );
    return items;
  }

  /* ── YQSF admin ── */
  if (role === 'yqsf_admin') {
    items.push(
      { label: 'Webinars',          path: '/admin/webinars',           icon: MdVideoLibrary },
      { label: 'Workshop Materials',path: '/admin/workshop-materials', icon: MdFolderOpen   },
      { label: 'Contact Info',      path: '/admin/contact-info',       icon: MdContactPhone },
    );
    return items;
  }

  /* ── State admin ── */
  if (role === 'state_admin') {
    items.push(
      { label: 'Exco Members',      path: '/admin/exco',               icon: MdGroups       },
      { label: 'Contact Messages',  path: '/admin/messages',           icon: MdMail         },
      { label: 'Chapter',           path: '/admin/chapters',           icon: MdLocationCity },
      { label: 'Members',           path: '/admin/members',            icon: MdPeople       },
      { label: 'Webinars',          path: '/admin/webinars',           icon: MdVideoLibrary },
      { label: 'Workshop Materials',path: '/admin/workshop-materials', icon: MdFolderOpen   },
    );
    return items;
  }

  /* ── National admin + Main admin ── */
  items.push(
    { label: 'News',             path: '/admin/news',     icon: MdArticle          },
    { label: 'Events',           path: '/admin/events',      icon: MdEvent            },
    { label: 'Published Results', path: '/admin/exam-results', icon: MdAssignment       },
    { label: 'Exco Members',     path: '/admin/exco',     icon: MdGroups           },
    { label: 'Members',          path: '/admin/members',  icon: MdPeople           },
    { label: 'Contact Messages', path: '/admin/messages', icon: MdMail             },
    { label: 'Chapters',         path: '/admin/chapters', icon: MdLocationCity     },
    { label: 'Jobs',             path: '/admin/jobs',     icon: MdWork             },
    { label: 'Partners',         path: '/admin/partners', icon: MdHandshake        },
    { label: 'Brand Materials',  path: '/admin/brand-materials', icon: MdBrandingWatermark },
    { label: 'President Profile',path: '/admin/president',       icon: MdAccountCircle     },
    { label: 'Past Presidents',  path: '/admin/past-presidents', icon: MdHistory           },
    { label: 'QS Firms',          path: '/admin/qs-firms',           icon: MdDomain       },
    { label: 'QS Connect',        path: '/admin/qs-connect',         icon: MdMenuBook     },
    { label: 'Webinars',          path: '/admin/webinars',           icon: MdVideoLibrary },
    { label: 'Workshop Materials',path: '/admin/workshop-materials', icon: MdFolderOpen   },
    { label: 'Journal of QS',     path: '/admin/journal',            icon: MdLibraryBooks },
    { label: 'Contact Info',     path: '/admin/contact-info',    icon: MdContactPhone      },
    { label: 'Site Settings',    path: '/admin/site-settings',   icon: MdLink              },
  );

  if (canManageAdmins(role)) {
    items.push({ label: 'Admin Management', path: '/admin/admins', icon: MdAdminPanelSettings });
  }

  return items;
}
