import HomePage from '@/components/pages/HomePage';
import FilesPage from '@/components/pages/FilesPage';
import RecentPage from '@/components/pages/RecentPage';
import SharedPage from '@/components/pages/SharedPage';
import TrashPage from '@/components/pages/TrashPage';
import AccessiblePage from '@/components/pages/AccessiblePage';
import NotFoundPage from '@/components/pages/NotFoundPage';
export const routes = {
  home: {
    id: 'home',
    label: 'Home',
    path: '/home',
    icon: 'Home',
component: HomePage
  },
  files: {
    id: 'files',
    label: 'Files',
    path: '/files',
    icon: 'Folder',
component: FilesPage
  },
  recent: {
    id: 'recent',
    label: 'Recent',
    path: '/recent',
    icon: 'Clock',
component: RecentPage
  },
  shared: {
    id: 'shared',
    label: 'Shared',
    path: '/shared',
    icon: 'Share2',
component: SharedPage
  },
trash: {
    id: 'trash',
    label: 'Trash',
    path: '/trash',
    icon: 'Trash2',
    component: TrashPage
  },
  accessible: {
    id: 'accessible',
    label: 'Accessible',
    path: '/accessible',
    icon: 'Star',
    component: AccessiblePage
  }
};

export const routeArray = Object.values(routes);