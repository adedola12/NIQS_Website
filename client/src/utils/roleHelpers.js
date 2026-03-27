import {
  MdDashboard,
  MdPeople,
  MdEvent,
  MdArticle,
  MdPayment,
  MdSettings,
  MdAdminPanelSettings,
  MdLocationCity,
  MdWork,
  MdHandshake,
  MdMail,
  MdGroups,
  MdBrandingWatermark,
  MdAccountCircle,
} from 'react-icons/md';

export function canManageAdmins(role) {
  return role === 'main_admin';
}

export function canManageNational(role) {
  return role === 'main_admin' || role === 'national_admin';
}

export function canManageChapter(role, adminChapter, targetChapter) {
  if (role === 'main_admin' || role === 'national_admin') {
    return true;
  }
  if (role === 'state_admin') {
    return adminChapter === targetChapter;
  }
  return false;
}

export function canDelete(role) {
  return role === 'main_admin';
}

export function getAdminLabel(role) {
  const labels = {
    main_admin: 'Main Administrator',
    national_admin: 'National Administrator',
    state_admin: 'State Chapter Administrator',
  };
  return labels[role] || 'Unknown Role';
}

export function getAdminSidebarItems(role) {
  const items = [
    {
      label: 'Dashboard',
      path: '/admin/dashboard',
      icon: MdDashboard,
    },
    {
      label: 'News',
      path: '/admin/news',
      icon: MdArticle,
    },
    {
      label: 'Events',
      path: '/admin/events',
      icon: MdEvent,
    },
    {
      label: 'Exco Members',
      path: '/admin/exco',
      icon: MdGroups,
    },
    {
      label: 'Members',
      path: '/admin/members',
      icon: MdPeople,
    },
    {
      label: 'Contact Messages',
      path: '/admin/messages',
      icon: MdMail,
    },
  ];

  if (canManageNational(role)) {
    items.push(
      {
        label: 'Chapters',
        path: '/admin/chapters',
        icon: MdLocationCity,
      },
      {
        label: 'Jobs',
        path: '/admin/jobs',
        icon: MdWork,
      },
      {
        label: 'Partners',
        path: '/admin/partners',
        icon: MdHandshake,
      },
      {
        label: 'Brand Materials',
        path: '/admin/brand-materials',
        icon: MdBrandingWatermark,
      },
      {
        label: 'President Profile',
        path: '/admin/president',
        icon: MdAccountCircle,
      }
    );
  }

  if (canManageAdmins(role)) {
    items.push({
      label: 'Admin Management',
      path: '/admin/admins',
      icon: MdAdminPanelSettings,
    });
  }

  return items;
}
