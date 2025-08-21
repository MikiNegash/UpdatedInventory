import React, { useState, useEffect } from 'react'
import {
    CForm,
    CFormInput,
    CFormSelect,
    CButton,
    CAlert,
} from '@coreui/react'
import { cilSave } from '@coreui/icons'
import axios from 'axios'
import './Sales.css'
import CIcon from '@coreui/icons-react'

const Sales = () => {
    const [saleItem, setSaleItem] = useState({
        product_type: '',
        texture: '',
        length: '',
        color: '',
        quantity_sold: '',
        quantity_unit: '',
        price_per_unit: '',
        customer_name: '',
        payment_method: 'Cash',
        sale_date: new Date().toISOString().split('T')[0],
    })

    const [items, setItems] = useState([])
    const [selectedItemId, setSelectedItemId] = useState('')
    const [sales, setSales] = useState([])
    const [alert, setAlert] = useState({ show: false, message: '', color: 'success' })

    const showAlert = (message, color = 'success') => {
        setAlert({ show: true, message, color })
        setTimeout(() => setAlert({ show: false, message: '', color: 'success' }), 3000)
    }

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await axios.get('https://robo-rec.com/api/stock-items')
                setItems(response.data)
            } catch (error) {
                console.error('❌ Failed to fetch product items:', error)
            }
        }

        fetchItems()
    }, [])

    const handleItemSelect = (e) => {
        const itemId = e.target.value
        setSelectedItemId(itemId)

        const selected = items.find((item) => item.item_id.toString() === itemId)
        console.log('Selected item:', selected)

        if (selected) {
            setSaleItem((prev) => ({
                ...prev,
                product_type: selected.product_type || '',
                texture: selected.texture || '',
                length: selected.length || '',
                color: selected.color || '',
                quantity_unit: selected.quantity_unit || '',
                unit_price: selected.unit_price || ''
               

            }))
        } else {
            console.warn('No matching item found for ID:', itemId)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setSaleItem((prev) => ({ ...prev, [name]: value }))
    }

   const handleSubmit = async (e) => {
    e.preventDefault();

    const newSale = {
        sale_id: `${sales.length + 1}`,
        ...saleItem,
    };

    try {
        const response = await axios.post('https://robo-rec.com/api/sales', newSale, {
            headers: { 'Content-Type': 'application/json' },
        });

        if (response.status === 200 || response.status === 201) {
            setSales([newSale, ...sales]);
            setSaleItem({
                product_type: '',
                texture: '',
                length: '',
                color: '',
                quantity_sold: '',
                quantity_unit: '',
                unit_price: '',
                customer_name: '',
                payment_method: 'Cash',
                sale_date: new Date().toISOString().split('T')[0],
            });
            setSelectedItemId('');
            showAlert('✅ Sale added successfully!', 'success');
        }
    } catch (error) {
        if (error.response) {
            // Check specific status codes
            switch (error.response.status) {
                case 422:
                    showAlert('⚠️ Validation error — please check your input.', 'warning');
                    break;
                case 500:
                    showAlert('💥 Server error — please try again later.', 'danger');
                    break;
                case 400:
                    showAlert('💥 Insufficent Stock.', 'danger');
                    break;
                default:
                    showAlert(`❌ Error: ${error.response.status} — Something went wrong.`, 'danger');
            }
        } else if (error.request) {
            // No response from server
            showAlert('📡 Network error — could not reach server.', 'danger');
        } else {
            // Something else happened
            showAlert(`❌ Unexpected error: ${error.message}`, 'danger');
        }
    }
};


    return (
        <div className="sales-container">
            <div className="header-glass">
                <h2>Add Sale</h2>
            </div>

            {alert.show && <CAlert color={alert.color}>{alert.message}</CAlert>}

            <CForm onSubmit={handleSubmit} className="sales-form">
                <div className="form-grid">
                    <div className="form-row">
                        <CFormSelect value={selectedItemId} onChange={handleItemSelect}>
                            <option value="">-- Select Product Type--</option>
                            {items.map((item) => (
                                <option key={item.item_id} value={item.item_id}>
                                    {item.product_type} - {item.texture} - {item.length}" - {item.color}
                                </option>
                            ))}
                        </CFormSelect>
                    </div>

                    <div className="form-row">
                        <CFormInput name="product_type" placeholder="Product Type"
                            value={saleItem.product_type} onChange={handleChange}
                            required 
                            readOnly
                            disabled/>
                    </div>

                    <div className="form-row">

                        <CFormInput name="texture" placeholder='Texture' value={saleItem.texture}
                            onChange={handleChange}
                            required 
                            readOnly
                            disabled/>
                    </div>


                    <div className="form-row">
                        <CFormInput name="length" placeholder='Length' value={saleItem.length}
                            onChange={handleChange}
                            required 
                            readOnly
                            disabled/>
                    </div>

                    <div className="form-row">
                        <CFormInput name="color" placeholder='Color' value={saleItem.color}
                            onChange={handleChange}
                            required 
                            readOnly
                            disabled/>
                    </div>

                   
                     <div className="form-row">
                        
                        <CFormInput
                            type="number"
                            name="unit_price"
                            placeholder='Price Perunit'
                            value={saleItem.unit_price}
                            onChange={handleChange}
                            readOnly
                            disabled
                        />
                    </div>

                    <div className="form-row">
                       
                        <CFormInput
                            name="quantity_unit"
                            placeholder='Quantity Unit'
                            value={saleItem.quantity_unit}
                            onChange={handleChange}
                            required
                            readOnly
                            disabled

                        />
                    </div>

                    <div className="form-row">
                        <CFormInput
                            type="number"
                            placeholder='Quantity Sold'
                            name="quantity_sold"
                            value={saleItem.quantity_sold}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <CFormInput
                            name="customer_name"
                            placeholder='Customer Name'
                            value={saleItem.customer_name}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-row">
                        <CFormInput
                            name="payment_method"
                            placeholder='Payment Method'
                            value={saleItem.payment_method}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-row">
                        <CFormInput
                            type="date"
                            name="sale_date"
                            value={saleItem.sale_date}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <CButton type="submit" className="submit-btn" color="primary">
                    <CIcon icon={cilSave} className="me-2"></CIcon>
                    Submit
                </CButton>
            </CForm>
        </div>
    )
}

export default Sales
