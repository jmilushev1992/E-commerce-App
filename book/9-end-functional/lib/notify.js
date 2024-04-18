/* eslint-disable linebreak-style */
/* eslint-disable no-multiple-empty-lines */

import { openSnackbarExported } from '../components/Notifier';

export default function notify(obj) {
  openSnackbarExported({ message: obj.message || obj.toString() });
}
