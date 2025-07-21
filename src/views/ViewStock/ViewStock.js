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
} from '@coreui/react'
import './ViewStock.css'

const ViewStock = () => {
  const [stock, setStock] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  const itemsPerPage = 10

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
    if (!isOnline) {
      setLoading(false)
      return
    }

    fetch('https://robo-rec.com/api/live-inventory')
      .then((res) => res.json())
      .then((data) => {
        setStock(Array.isArray(data) ? data : data.data || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to fetch stock:', err)
        setLoading(false)
      })
  }, [isOnline])

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

  return (
    <div className="view-stock-container">
      <div className="header-glass">
        <h2>Stock Data</h2>
      </div>

      <div className="mb-3 d-flex justify-content-end">
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
            <CTableHead color="primary">
              <CTableRow>
                <CTableHeaderCell>Product Type</CTableHeaderCell>
                <CTableHeaderCell>Texture</CTableHeaderCell>
                <CTableHeaderCell>Length</CTableHeaderCell>
                <CTableHeaderCell>Color</CTableHeaderCell>
                <CTableHeaderCell>Added</CTableHeaderCell>
                <CTableHeaderCell>Sold</CTableHeaderCell>
                <CTableHeaderCell>Qty</CTableHeaderCell>
                <CTableHeaderCell>Unit</CTableHeaderCell>
                <CTableHeaderCell>Unit Price</CTableHeaderCell>
                <CTableHeaderCell>Stock Value</CTableHeaderCell>
                <CTableHeaderCell>Date</CTableHeaderCell>
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
                    <CTableDataCell>{item.quantity_unit}</CTableDataCell>
                    <CTableDataCell>${item.unit_price}</CTableDataCell>
                    <CTableDataCell>${item.stock_value}</CTableDataCell>
                    <CTableDataCell>
                      {new Date(item.created_at).toLocaleDateString('en-US')}
                    </CTableDataCell>
                  </CTableRow>
                ))
              ) : (
                <CTableRow>
                  <CTableDataCell colSpan="11" className="text-center">
                    No data available for this filter.
                  </CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>

          {/* Pagination */}
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
    </div>
  )
}

export default ViewStock
