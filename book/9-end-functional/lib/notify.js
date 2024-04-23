import { openSnackbarExported } from '../components/Notifier';

/**
 * Notifies the user by displaying a snackbar message.
 * @param {object|string} obj - The object containing the message or a string message directly.
 */
export default function notify(obj) {
  // Extract the message from the object or convert object to string
  const message = obj.message || obj.toString();
  // Call the openSnackbarExported function to display the snackbar with the message
  openSnackbarExported({ message });
}
