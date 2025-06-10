import Home from '../pages/Home';
import Files from '../pages/Files';
import Recent from '../pages/Recent';
import Shared from '../pages/Shared';
import Trash from '../pages/Trash';
import NotFound from '../pages/NotFound';

export const routes = {
  home: {
    id: 'home',
    label: 'Home',
    path: '/home',
    icon: 'Home',
    component: Home
  },
  files: {
    id: 'files',
    label: 'Files',
    path: '/files',
    icon: 'Folder',
    component: Files
  },
  recent: {
    id: 'recent',
    label: 'Recent',
    path: '/recent',
    icon: 'Clock',
    component: Recent
  },
  shared: {
    id: 'shared',
    label: 'Shared',
    path: '/shared',
    icon: 'Share2',
    component: Shared
  },
  trash: {
    id: 'trash',
    label: 'Trash',
    path: '/trash',
    icon: 'Trash2',
    component: Trash
  }
};

export const routeArray = Object.values(routes);