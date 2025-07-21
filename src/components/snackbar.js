// components/common/CoreSnackbar.js
import React from 'react'
import PropTypes from 'prop-types'
import { CAlert } from '@coreui/react'

const CoreSnackbar = ({ open, message, severity = 'success', onClose }) => {
  if (!open) return null

  return (
    <CAlert
      color={severity === 'success' ? 'success' : 'danger'}
      dismissible
      onClose={onClose}
      className="mt-3"
    >
      {message}
    </CAlert>
  )
}

CoreSnackbar.propTypes = {
  open: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  severity: PropTypes.oneOf(['success', 'error']),
  onClose: PropTypes.func.isRequired,
}

export default CoreSnackbar
