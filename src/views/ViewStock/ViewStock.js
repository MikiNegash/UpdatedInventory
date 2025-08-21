import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CPagination,
  CPaginationItem,
  CFormSelect,
  CSpinner,
  CAlert,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormLabel,
  CToaster,
  CToast,
  CToastBody,
  CToastClose
} from '@coreui/react'
import './ViewStock.css'
import { exportToExcel } from '../../utils/exportToExcel'

const ViewStock = () => {
  const [stock, setStock] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedType, setSelectedType] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  const [toast, setToast] = useState(null)

  const itemsPerPage = 10

  // Show toast notification
  const showToast = (message, color = 'success') => {
    setToast(
      <CToaster placement="top-end">
        <CToast visible={true} color={color}>
          <CToastBody>{message}</CToastBody>
          <CToastClose className="me-2 m-auto" />
        </CToast>
      </CToaster>
    )
    setTimeout(() => setToast(null), 3000)
  }

  // Online/offline status tracking
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Fetch data
  useEffect(() => {
    const fetchStockData = async () => {
      try {
        if (!isOnline) {
          throw new Error('No internet connection')
        }

        setLoading(true)
        setError(null)

        const response = await fetch('https://robo-rec.com/api/live-inventory', {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`)
        }

        const data = await response.json()
        setStock(Array.isArray(data) ? data : data.data || [])
      } catch (err) {
        console.error('Failed to fetch stock:', err)
        setError(err.message || 'Failed to load stock data')
      } finally {
        setLoading(false)
      }
    }

    fetchStockData()
  }, [isOnline])

  // Handle delete item
  const handleDelete = async () => {
    try {
      if (!itemToDelete?.item_id) {
        throw new Error('No item selected for deletion')
      }

      const response = await fetch(
        `https://robo-rec.com/api/live-inventory/${itemToDelete.item_id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to delete item')
      }

      setStock(stock.filter((item) => item.item_id !== itemToDelete.item_id))
      showToast('Item deleted successfully')
    } catch (error) {
      console.error('Error deleting item:', error)
      showToast(error.message || 'Failed to delete item', 'danger')
    } finally {
      setDeleteModalVisible(false)
      setItemToDelete(null)
    }
  }

  // Handle update item
  const handleUpdate = async (e) => {
    debugger;
    e.preventDefault()
    try {
      if (!editingItem?.inventory_id) {
        throw new Error('No item selected for update')
      }

      const response = await fetch(
        `https://robo-rec.com/api/live-inventory/${editingItem.inventory_id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editingItem),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to update item')
      }

      const updatedItem = await response.json()
      setStock(stock.map((item) => 
        item.inventory_id === updatedItem.inventory_id ? updatedItem : item
      ))
      showToast('Item updated successfully')
      setEditModalVisible(false)
    } catch (error) {
      console.error('Error updating item:', error)
      showToast(error.message || 'Failed to update item', 'danger')
    }
  }

  // Handle input change for edit form
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditingItem({
      ...editingItem,
      [name]: value,
    })
  }

  const productTypes = ['All', ...new Set(stock.map((item) => item.product_type))]

  const filteredStock =
    selectedType === 'All' ? stock : stock.filter((item) => item.product_type === selectedType)

  const totalPages = Math.ceil(filteredStock.length / itemsPerPage)
  const paginatedStock = filteredStock.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  if (!isOnline) {
    return (
      <CAlert color="danger" className="text-center mt-4">
        ❌ No internet connection. Please check your network.
      </CAlert>
    )
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center mt-5">
        <CSpinner color="primary" />
      </div>
    )
  }

  const handleExport = () => {
    const today = new Date()
    const formattedDate = today.toISOString().split('T')[0]
    const exportData = filteredStock.map((item) => ({
      'Product Type': item.product_type,
      Texture: item.texture,
      Length: item.length,
      Color: item.color,
      Added: item.Item_added,
      'Sold Item': item.sold_item,
      'Remaining Qty': item.quantity_available,
      'Unit Price': item.unit_price,
      'Stock Value': item.stock_value,
      'Added Date': new Date(item.created_at).toLocaleDateString('en-US'),
    }))
    exportToExcel({
      data: exportData,
      filename: `Stock Data ${formattedDate}.xlsx`,
      sheetName: 'Stock Data',
    })
  }

  return (
    <div className="view-stock-container">
      {toast}
      <div className="header-glass">
        <h2>Stock Data</h2>
      </div>

      <div className="mb-3 d-flex justify-content-end gap-3">
        <CButton color="primary" onClick={handleExport}>
          Export to Excel
        </CButton>
        <CFormSelect
          style={{ width: '240px' }}
          value={selectedType}
          onChange={(e) => {
            setSelectedType(e.target.value)
            setCurrentPage(1)
          }}
        >
          {productTypes.map((type, idx) => (
            <option key={idx} value={type}>
              {type}
            </option>
          ))}
        </CFormSelect>
      </div>

      <CCard>
        <CCardBody>
          <CTable striped hover responsive>
            <CTableHead style={{ backgroundColor: '#918888ff' }}>
              <CTableRow>
                <CTableHeaderCell>Product Type</CTableHeaderCell>
                <CTableHeaderCell>Texture</CTableHeaderCell>
                <CTableHeaderCell>Length</CTableHeaderCell>
                <CTableHeaderCell>Color</CTableHeaderCell>
                <CTableHeaderCell>Added</CTableHeaderCell>
                <CTableHeaderCell>Sold Item</CTableHeaderCell>
                <CTableHeaderCell>Remaining Qty</CTableHeaderCell>
                <CTableHeaderCell>Unit Price</CTableHeaderCell>
                <CTableHeaderCell>Stock Value</CTableHeaderCell>
                <CTableHeaderCell>Added Date</CTableHeaderCell>
                <CTableHeaderCell>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {paginatedStock.length > 0 ? (
                paginatedStock.map((item) => (
                  <CTableRow key={item.item_id}>
                    <CTableDataCell>{item.product_type}</CTableDataCell>
                    <CTableDataCell>{item.texture}</CTableDataCell>
                    <CTableDataCell>{item.length}</CTableDataCell>
                    <CTableDataCell>{item.color}</CTableDataCell>
                    <CTableDataCell>{item.Item_added}</CTableDataCell>
                    <CTableDataCell>{item.sold_item}</CTableDataCell>
                    <CTableDataCell>{item.quantity_available}</CTableDataCell>
                    <CTableDataCell>{item.unit_price}</CTableDataCell>
                    <CTableDataCell>{item.stock_value}</CTableDataCell>
                    <CTableDataCell>
                      {new Date(item.created_at).toLocaleDateString('en-US')}
                    </CTableDataCell>
                    <CTableDataCell>
                      <div className="d-flex gap-2">
                        <CButton
                          color="warning"
                          size="sm"
                          onClick={() => {
                            setEditingItem({ ...item })
                            setEditModalVisible(true)
                          }}
                        >
                          Edit
                        </CButton>
                        <CButton
                          color="danger"
                          size="sm"
                          onClick={() => {
                            setItemToDelete(item)
                            setDeleteModalVisible(true)
                          }}
                        >
                          Delete
                        </CButton>
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                ))
              ) : (
                <CTableRow>
                  <CTableDataCell colSpan="12" className="text-center">
                    No data available for this filter.
                  </CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>

          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <CPagination>
                <CPaginationItem
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Previous
                </CPaginationItem>
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <CPaginationItem
                    key={idx}
                    active={idx + 1 === currentPage}
                    onClick={() => handlePageChange(idx + 1)}
                  >
                    {idx + 1}
                  </CPaginationItem>
                ))}
                <CPaginationItem
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </CPaginationItem>
              </CPagination>
            </div>
          )}
        </CCardBody>
      </CCard>

      {/* Delete Confirmation Modal */}
      <CModal visible={deleteModalVisible} onClose={() => setDeleteModalVisible(false)}>
        <CModalHeader onClose={() => setDeleteModalVisible(false)}>
          <CModalTitle>Confirm Delete</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Are you sure you want to delete this item? This action cannot be undone.
          <br />
          <strong>Product:</strong> {itemToDelete?.product_type} - {itemToDelete?.color}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteModalVisible(false)}>
            Cancel
          </CButton>
          <CButton color="danger" onClick={handleDelete}>
            Delete
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Edit Modal */}
      <CModal visible={editModalVisible} onClose={() => setEditModalVisible(false)}>
        <CModalHeader onClose={() => setEditModalVisible(false)}>
          <CModalTitle>Edit Item</CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleUpdate}>
          <CModalBody>
            <div className="mb-3">
              <CFormLabel>Product Type</CFormLabel>
              <CFormInput
                type="text"
                name="product_type"
                value={editingItem?.product_type || ''}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <CFormLabel>Texture</CFormLabel>
              <CFormInput
                type="text"
                name="texture"
                value={editingItem?.texture || ''}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <CFormLabel>Length</CFormLabel>
              <CFormInput
                type="text"
                name="length"
                value={editingItem?.length || ''}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <CFormLabel>Color</CFormLabel>
              <CFormInput
                type="text"
                name="color"
                value={editingItem?.color || ''}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <CFormLabel>Quantity Available</CFormLabel>
              <CFormInput
                type="number"
                name="quantity_available"
                value={editingItem?.quantity_available || ''}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <CFormLabel>Unit Price</CFormLabel>
              <CFormInput
                type="number"
                step="0.01"
                name="unit_price"
                value={editingItem?.unit_price || ''}
                onChange={handleInputChange}
                required
              />
            </div>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setEditModalVisible(false)}>
              Cancel
            </CButton>
            <CButton color="primary" type="submit">
              Save Changes
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>
    </div>
  )
}

export default ViewStock