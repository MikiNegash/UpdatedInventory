import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {
  CAvatar,
  CBadge,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormSelect,
  CPagination,
  CPaginationItem,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPeople } from '@coreui/icons'

import WidgetsDropdown from '../widgets/WidgetsDropdown'

// Format date to YYYY-MM-DD
const formatDate = (date) => date.toISOString().slice(0, 10)

// Get from/to range based on filter
const getDateRange = (period) => {
  const now = new Date()
  if (period === 'this_month') {
    const from = new Date(now.getFullYear(), now.getMonth(), 1)
    return { from: formatDate(from), to: formatDate(now) }
  } else if (period === 'last_month') {
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const to = new Date(now.getFullYear(), now.getMonth(), 0)
    return { from: formatDate(from), to: formatDate(to) }
  } else {
    const today = formatDate(now)
    return { from: today, to: today }
  }
}

const Dashboard = () => {
  const [tableData, setTableData] = useState([])
  const [period, setPeriod] = useState('this_month')
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  const totalPages = Math.ceil(tableData.length / rowsPerPage)
  const paginatedData = tableData.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  useEffect(() => {
    const { from, to } = getDateRange(period)
    axios
      .get(`https://robo-rec.com/api/inventorybydate?from=${from}&to=${to}`)
      .then((res) => {
        setTableData(res.data.groupedata || [])
        setPage(1) // reset page on filter change
      })
      .catch((err) => {
        console.error('API Error:', err)
      })
  }, [period])

  const handlePageChange = (newPage) => setPage(newPage)

  const renderStockBadge = (quantity) => {
    if (quantity > 0) {
      return quantity < 20 ? (
        <CBadge color="warning">{quantity} left</CBadge>
      ) : (
        <CBadge color="success">In Stock</CBadge>
      )
    }
    return <CBadge color="danger">Out of Stock</CBadge>
  }

  return (
    <>
      <WidgetsDropdown className="mb-4" />
      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <strong>Inventory Data</strong>
              <CFormSelect
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                size="sm"
                style={{ width: '160px' }}
              >
                <option value="this_month">This Month</option>
                <option value="last_month">Last Month</option>
              </CFormSelect>
            </CCardHeader>
            <CCardBody>
              <CTable align="middle" className="mb-0 border" hover responsive>
                <CTableHead className="text-nowrap">
                  <CTableRow>                  
                    <CTableHeaderCell className="bg-body-tertiary">Product Type</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Total Quantity</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Latest Available</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {paginatedData.map((item, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell>{item.product_type}</CTableDataCell>
                      <CTableDataCell>{item.total_quantity}</CTableDataCell>
                      <CTableDataCell>{renderStockBadge(item.total_quantity)}</CTableDataCell>
                     {/*  <CTableDataCell>{item.rate}</CTableDataCell>
                      <CTableDataCell>{item.total_selling}</CTableDataCell> */}
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>

              {/* Pagination */}
              <div className="d-flex justify-content-end mt-3">
                <CPagination align="end">
                  {[...Array(totalPages)].map((_, i) => (
                    <CPaginationItem
                      key={i}
                      active={page === i + 1}
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </CPaginationItem>
                  ))}
                </CPagination>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Dashboard
