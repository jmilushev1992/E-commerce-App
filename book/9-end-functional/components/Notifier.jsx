/* eslint-disable linebreak-style */
/* eslint-disable no-multiple-empty-lines */

import React from 'react';
import Snackbar from '@mui/material/Snackbar';

// Function to hold the reference of the openSnackbar function
let openSnackbarFn;

// Class component for rendering a snackbar notifier
class Notifier extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
      message: '',
    };
  }

  // Set the openSnackbar function reference when component mounts
  componentDidMount() {
    openSnackbarFn = this.openSnackbar;
  }

  // Handle closing the snackbar
  handleSnackbarRequestClose = () => {
    this.setState({
      open: false,
      message: '',
    });
  };

  // Function to open the snackbar
  openSnackbar = ({ message }) => {
    this.setState({ open: true, message });
  };

  render() {
    // Render the message as HTML
    const message = (
      <span id="snackbar-message-id" dangerouslySetInnerHTML={{ __html: this.state.message }} />
    );

    return (
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={this.state.open}
        message={message}
        autoHideDuration={5000}
        onClose={this.handleSnackbarRequestClose}
        ContentProps={{
          'aria-describedby': 'snackbar-message-id',
        }}
      />
    );
  }
}

// Exported function to open the snackbar
export function openSnackbarExported({ message }) {
  openSnackbarFn({ message });
}

export default Notifier;
