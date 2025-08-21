import React, { useState } from 'react'
import axios from 'axios'
import CoreSnackbar from '../../components/snackbar'
import { cilSave } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
    CForm,
    CFormInput,
    CButton,
    CAlert,
} from '@coreui/react'
import './Stock.css'

const Stock = () => {
    const [stockItem, setStockItem] = useState({
        product_type: '',
        texture: '',
        length: '',
        color: '',
        quantity_added: '',
        quantity_unit: '',
        unit_price: '',
        vendor_name: '',
        added_date: new Date().toISOString().split('T')[0],
    })

    const [stock, setStock] = useState([])
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

    const showSnackbar = (msg, sev = 'success') => {
        setSnackbar({ open: true, message: msg, severity: sev })
        setTimeout(() => setSnackbar(prev => ({ ...prev, open: false })), 4000)
    }

    const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }))

    const handleChange = (e) => {
        const { name, value } = e.target
        setStockItem(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const newStock = { report_id: `${stock.length + 1}`, ...stockItem }
        try {
            const resp = await axios.post('https://robo-rec.com/api/stock-items', newStock)
            if (resp.status === 200 || resp.status === 201) {
                setStock([newStock, ...stock])
                setStockItem({
                    product_type: '',
                    texture: '',
                    length: '',
                    color: '',
                    quantity_added: '',
                    quantity_unit: '',
                    unit_price: '',
                    purchaseprice:'',
                    shippingcost:'',
                    vendor_name: '',
                    added_date: new Date().toISOString().split('T')[0],

                })
                showSnackbar('✅ Stock added successfully!', 'success')
            }
        } catch {
            console.error('Failed to add stock.')
            showSnackbar('❌ Failed to add stock. Try again.', 'error')
        }
    }

    return (
        <div className="stock-container">
            <div className="header-glass">
                <h2>Add Stock</h2>
            </div>

            <CForm className="sales-form" onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-row">
                        <CFormInput
                            type="text"
                            name="product_type"
                            placeholder="Product Type"
                            value={stockItem.product_type}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <CFormInput
                            type="text"
                            name="texture"
                            placeholder="Texture"
                            value={stockItem.texture}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <CFormInput
                            type="number"
                            name="length"
                            placeholder="Length"
                            value={stockItem.length}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <CFormInput
                            type="text"
                            name="color"
                            placeholder="Color"
                            value={stockItem.color}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <CFormInput
                            type="number"
                            name="quantity_added"
                            placeholder="Quantity Added"
                            value={stockItem.quantity_added}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-row">
                        <CFormInput
                            type="text"
                            name="quantity_unit"
                            placeholder="Unit (e.g., pcs, kg)"
                            value={stockItem.quantity_unit}
                            onChange={handleChange}
                        />
                    </div>

                   
                     <div className="form-row">
                        <CFormInput
                            type="number"
                            name="purchaseprice"
                            placeholder="Purchase Price"
                            value={stockItem.purchaseprice}
                            onChange={handleChange}
                        />
                    </div>
                    
                      <div className="form-row">
                        <CFormInput
                            type="number"
                            name="shippingcost"
                            placeholder="Shipping Cost"
                            value={stockItem.shippingcost}
                            onChange={handleChange}
                        />
                    </div>
                     <div className="form-row">
                        <CFormInput
                            type="number"
                            name="unit_price"
                            placeholder="Saleing Price"
                            value={stockItem.unit_price}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-row">
                        <CFormInput
                            type="text"
                            name="vendor_name"
                            placeholder="Vendor Name"
                            value={stockItem.vendor_name}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-row">
                        <CFormInput
                            type="date"
                            name="added_date"
                            placeholder="Added Date"
                            value={stockItem.added_date}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <CButton type="submit" className="submit-btn" color="primary">
                    <CIcon icon={cilSave} className="me-2"></CIcon>
                    Submit
                </CButton>       </CForm>

            <CoreSnackbar
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={handleCloseSnackbar}
            />
        </div>
    )
}

export default Stock
