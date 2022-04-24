import { notice, success, error } from '@pnotify/core';
import '@pnotify/core/dist/PNotify.css';
import '@pnotify/core/dist/BrightTheme.css';

export default {
  showNotice() {
    notice({
      title: 'Місто не знайдено!',
      delay: 3000,
      width: 50,
    });
  },

//   showSuccess() {
//     success({
//       title: 'Yahoooo! Found...',
//       delay: 2000,
//     });
//   },

  showError() {
    error({
      title: `Введіть назву міста!`,
      delay: 2000,
      width: 50,
    });
  },
};