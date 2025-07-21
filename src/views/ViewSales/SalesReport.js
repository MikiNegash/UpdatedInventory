import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { exportToExcel } from '../../utils/exportToExcel'
import './SalesReport.css'

const SalesReport = () => {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterProduct, setFilterProduct] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetch('https://robo-rec.com/api/sales-report-details')
      .then(res => res.json())
      .then(data => {
        setSales(Array.isArray(data) ? data : data.data || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching sales data:', err)
        setLoading(false)
      })
  }, [])

  const calculateReportData = () => {
    return sales.map((sale) => {
      const purchasePrice = parseFloat(sale.purchase_price) || 0
      const shippingCost = parseFloat(sale.shipping_cost) || 0
      const rate = parseFloat(sale.rate) || 0
      const quantity = parseInt(sale.quantity_sold) || 0

      const totalPurchase = (purchasePrice + shippingCost).toFixed(2)
      const totalSelling = (quantity * rate).toFixed(2)
      const profit = (totalSelling - totalPurchase * quantity).toFixed(2)

      return {
        ...sale,
        purchase_price: purchasePrice.toFixed(2),
        shipping_cost: shippingCost.toFixed(2),
        rate: rate.toFixed(2),
        total_purchase: totalPurchase,
        total_selling: totalSelling,
        profit: profit,
      }
    })
  }

  const reportData = calculateReportData()
  const filteredData =
    filterProduct === 'All'
      ? reportData
      : reportData.filter((sale) => sale.product_type === filterProduct)

  const totalProfit = filteredData.reduce((sum, item) => sum + parseFloat(item.profit), 0).toFixed(2)
  const totalRevenue = filteredData.reduce((sum, item) => sum + parseFloat(item.total_selling), 0).toFixed(2)

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleExport = () => {
    const exportData = filteredData.map((sale) => ({
      Product: sale.product_type,
      Length: `${sale.length}"`,
      Qty: sale.quantity_sold,
      Unit: sale.quantity_unit,
      'Unit Price': sale.rate,
      'Purchase Cost': sale.purchase_price,
      Shipping: sale.shipping_cost,
      'Total Cost': sale.total_purchase,
      Revenue: sale.total_selling,
      Profit: sale.profit,
      Date: sale.sale_date,
    }))
    exportToExcel({
      data: exportData,
      filename: 'sales_report.xlsx',
      sheetName: 'Sales Report',
    })
  }

  const uniqueProductTypes = ['All', ...new Set(reportData.map((s) => s.product_type))]

  if (loading) return <p>Loading sales report...</p>

  return (
    <div className="sales-report">
      <div className="header-glass">
        <h2>Sales Report</h2>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <h3>Total Sales</h3>
          <p>{filteredData.length}</p>
        </div>
        <div className="summary-card">
          <h3>Total Revenue</h3>
          <p>${totalRevenue}</p>
        </div>
        <div className="summary-card">
          <h3>Total Profit</h3>
          <p>${totalProfit}</p>
        </div>
      </div>

      <div className="filter-row" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <label htmlFor="filterProduct" style={{ marginRight: '8px' }}>Filter by Product:</label>
          <select
            id="filterProduct"
            value={filterProduct}
            onChange={(e) => {
              setFilterProduct(e.target.value)
              setCurrentPage(1)
            }}
            style={{ padding: '6px 12px', borderRadius: '4px' }}
          >
            {uniqueProductTypes.map((type, idx) => (
              <option key={idx} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="report-table-container">
        <table className="report-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Length</th>
              <th>Qty</th>
              <th>Unit</th>
              <th>Unit Price</th>
              <th>Purchase Cost</th>
              <th>Shipping</th>
              <th>Total Cost</th>
              <th>Revenue</th>
              <th>Profit</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((sale, index) => (
                <tr key={`${sale.sale_id}-${index}`}>
                  <td>{sale.product_type}</td>
                  <td>{sale.length}"</td>
                  <td>{sale.quantity_sold}</td>
                  <td>{sale.quantity_unit}</td>
                  <td>${sale.rate}</td>
                  <td>${sale.purchase_price}</td>
                  <td>${sale.shipping_cost}</td>
                  <td>${sale.total_purchase}</td>
                  <td>${sale.total_selling}</td>
                  <td className={parseFloat(sale.profit) >= 0 ? 'profit-positive' : 'profit-negative'}>
                    ${sale.profit}
                  </td>
                  <td>{sale.sale_date}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" style={{ textAlign: 'center', padding: '1rem' }}>
                  No sales data for selected product type.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination-controls">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          >
            Prev
          </button>
          {[...Array(totalPages)].map((_, idx) => (
            <button
              key={idx}
              className={currentPage === idx + 1 ? 'active' : ''}
              onClick={() => setCurrentPage(idx + 1)}
            >
              {idx + 1}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          >
            Next
          </button>
        </div>
      )}

      <div className="report-actions">
        <button className="export-btn" onClick={handleExport}>
          Export to Excel
        </button>
      </div>
    </div>
  )
}

export default SalesReport
