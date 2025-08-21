import React, { useState, useEffect } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CForm,
  CFormInput,
  CFormSelect,
  CButton,
  CFormLabel,
  CAlert,
  CSpinner,
  CFormFeedback,
  CNav,
  CBadge,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CPagination,
  CPaginationItem
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPencil, cilTrash, cilArrowLeft, cilArrowRight, cilBuilding } from '@coreui/icons';

import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import './product.css'

const ProductInputPage = ({ productId }) => {
  // API endpoints
  const API_ENDPOINTS = {
    STORE: 'https://robo-rec.com/api/lookup-store',
    PRODUCT: 'https://robo-rec.com/api/lookup-product',
    INVENTORY: 'https://robo-rec.com/api/store'
  };

  // State management
  const [loading, setLoading] = useState({
    store: false,
    product: false,
    inventory: false,
    stores: false,
    products: false,
    inventories: false
  });
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [inventories, setInventories] = useState([]);
  const [notification, setNotification] = useState({
    visible: false,
    message: '',
    color: ''
  });
  const [isEditMode, setIsEditMode] = useState(!!productId);
  const [activeTab, setActiveTab] = useState('store');

  // Pagination states
  const [currentPage, setCurrentPage] = useState({
    store: 1,
    product: 1,
    inventory: 1
  });
  const [itemsPerPage] = useState(5);

  // Form validation schemas
  const storeValidation = Yup.object().shape({
    store_code: Yup.string().required('Store code is required'),
    store_type: Yup.string().required('Store type is required'),
    store_name: Yup.string().required('Store name is required')
  });

  const productValidation = Yup.object().shape({
    product_code: Yup.string().required('Product code is required'),
    product_type: Yup.string().required('Product type is required'),
    texture: Yup.string().required('Texture is required'),
    length: Yup.string().required('Length is required'),
    color: Yup.string().required('Color is required'),
    vendor_name: Yup.string()
  });

  const inventoryValidation = Yup.object().shape({
    store_id: Yup.string().required('Store is required'),
    product_id: Yup.string().required('Product is required'),
    quantity: Yup.number()
      .required('Quantity is required')
      .min(1, 'Quantity must be at least 1'),
    shippingcost: Yup.number()
      .required('Shipping cost is required')
      .min(0, 'Shipping cost cannot be negative'),
    purchaseprice: Yup.number()
      .required('Purchase price is required')
      .min(0, 'Purchase price cannot be negative')
  });

  // Formik setups
  const storeFormik = useFormik({
    initialValues: {
      store_code: '',
      store_type: '',
      store_name: ''
    },
    validationSchema: storeValidation,
    onSubmit: async (values, { resetForm }) => {
      try {
        debugger;
        setLoading(prev => ({ ...prev, store: true }));

        if (isEditMode) {
          const storeId = storeFormik.values.id || productId;
          await axios.put(`${API_ENDPOINTS.STORE}/${storeId}`, values);
          showNotification('Store information updated successfully!', 'success');
        } else {
          await axios.post(API_ENDPOINTS.STORE, values);
          showNotification('Store information saved successfully!', 'success');
          resetForm();
        }
        fetchStores();
      } catch (error) {
        console.error('Store save error:', error);
        showNotification('Error saving store information. Please try again.', 'danger');
      } finally {
        setLoading(prev => ({ ...prev, store: false }));
      }
    }
  });

  const productFormik = useFormik({
    initialValues: {
      product_code: '',
      product_type: '',
      texture: '',
      length: '',
      color: '',
      vendor_name: ''
    },
    validationSchema: productValidation,
    onSubmit: async (values, { resetForm }) => {
      try {
        debugger
        setLoading(prev => ({ ...prev, product: true }));

        if (isEditMode) {
          const productId = productFormik.values.id || productId;
          await axios.put(`${API_ENDPOINTS.PRODUCT}/${productId}`, values);
          showNotification('Product details updated successfully!', 'success');
        } else {
          await axios.post(API_ENDPOINTS.PRODUCT, values);
          showNotification('Product details saved successfully!', 'success');
          resetForm();
        }
        fetchProducts();
      } catch (error) {
        console.error('Product save error:', error);
        showNotification('Error saving product details. Please try again.', 'danger');
      } finally {
        setLoading(prev => ({ ...prev, product: false }));
      }
    }
  });

  const inventoryFormik = useFormik({
    initialValues: {
      store_id: '',
      product_id: '',
      quantity: '',
      shippingcost: '',
      purchaseprice: ''
    },
    validationSchema: inventoryValidation,
    onSubmit: async (values, { resetForm }) => {
      try {
        setLoading(prev => ({ ...prev, inventory: true }));

        if (isEditMode) {
          const productId = inventoryFormik.values.id;
          await axios.put(`${API_ENDPOINTS.INVENTORY}/${productId}`, values);
          showNotification('Inventory information updated successfully!', 'success');
        } else {
          await axios.post(API_ENDPOINTS.INVENTORY, values);
          showNotification('Inventory information saved successfully!', 'success');
          resetForm();
        }
        fetchInventories();
      } catch (error) {
        console.error('Inventory save error:', error);
        showNotification('Error saving inventory information. Please try again.', 'danger');
      } finally {
        setLoading(prev => ({ ...prev, inventory: false }));
      }
    }
  });

  // Data fetching functions
  const fetchStores = async () => {
    try {
      setLoading(prev => ({ ...prev, stores: true }));
      const response = await axios.get(API_ENDPOINTS.STORE);
      setStores(response.data);
    } catch (error) {
      console.error('Error fetching stores:', error);
      showNotification('Error loading stores. Please refresh the page.', 'danger');
    } finally {
      setLoading(prev => ({ ...prev, stores: false }));
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(prev => ({ ...prev, products: true }));
      const response = await axios.get(API_ENDPOINTS.PRODUCT);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      showNotification('Error loading products. Please refresh the page.', 'danger');
    } finally {
      setLoading(prev => ({ ...prev, products: false }));
    }
  };

  const fetchInventories = async () => {
    try {
      setLoading(prev => ({ ...prev, inventories: true }));
      const response = await axios.get(API_ENDPOINTS.INVENTORY);
      setInventories(response.data);
    } catch (error) {
      console.error('Error fetching inventories:', error);
      showNotification('Error loading inventories. Please refresh the page.', 'danger');
    } finally {
      setLoading(prev => ({ ...prev, inventories: false }));
    }
  };

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading({
          store: true,
          product: true,
          inventory: true,
          stores: true,
          products: true,
          inventories: true
        });

        await fetchStores();
        await fetchProducts();
        await fetchInventories();

        // If in edit mode, fetch existing data
        if (isEditMode) {
          const storeResponse = await axios.get(`${API_ENDPOINTS.STORE}/${productId}`);
          storeFormik.setValues(storeResponse.data);

          const productResponse = await axios.get(`${API_ENDPOINTS.PRODUCT}/${productId}`);
          productFormik.setValues(productResponse.data);

          const inventoryResponse = await axios.get(`${API_ENDPOINTS.INVENTORY}/${productId}`);
          inventoryFormik.setValues(inventoryResponse.data);
        }
      } catch (error) {
        console.error('Data fetching error:', error);
        showNotification('Error loading data. Please refresh the page.', 'danger');
      } finally {
        setLoading({
          store: false,
          product: false,
          inventory: false,
          stores: false,
          products: false,
          inventories: false
        });
      }
    };

    fetchInitialData();
  }, [productId]);

  // Show notification
  const showNotification = (message, color) => {
    setNotification({ visible: true, message, color });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, 5000);
  };

  // Handle edit for each entity
  const handleEdit = (entity, data) => {
    setIsEditMode(true);
    switch (entity) {
      case 'store':
        storeFormik.setValues(data);
        setActiveTab('store');
        break;
      case 'product':
        productFormik.setValues(data);
        setActiveTab('product');
        break;
      case 'inventory':
        inventoryFormik.setValues(data);
        setActiveTab('inventory');
        break;
      default:
        break;
    }
  };

  // Handle delete for each entity
  const handleDelete = async (entity, id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;

    try {
      setLoading(prev => ({ ...prev, [entity]: true }));

      switch (entity) {
        case 'store':
          await axios.delete(`${API_ENDPOINTS.STORE}/${id}`);
          showNotification('Store deleted successfully!', 'success');
          fetchStores();
          break;
        case 'product':
          await axios.delete(`${API_ENDPOINTS.PRODUCT}/${id}`);
          showNotification('Product deleted successfully!', 'success');
          fetchProducts();
          break;
        case 'inventory':
          await axios.delete(`${API_ENDPOINTS.INVENTORY}/${id}`);
          showNotification('Inventory record deleted successfully!', 'success');
          fetchInventories();
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`Error deleting ${entity}:`, error);
      showNotification(`Error deleting ${entity}. Please try again.`, 'danger');
    } finally {
      setLoading(prev => ({ ...prev, [entity]: false }));
    }
  };

  // Pagination logic
  const paginate = (items, currentPage, itemsPerPage) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  };

  const handlePageChange = (entity, page) => {
    setCurrentPage(prev => ({ ...prev, [entity]: page }));
  };

  if (loading.store && loading.product && loading.inventory &&
    loading.stores && loading.products && loading.inventories) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
        <CSpinner color="primary" size="lg" />
      </div>
    );
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className='header-glass'>
            <strong>{isEditMode ? 'Edit' : 'Create'} Setting</strong>
          </CCardHeader>
          <CCardBody>
            {notification.visible && (
              <CAlert color={notification.color} dismissible onClose={() => setNotification({ visible: false })}>
                {notification.message}
              </CAlert>
            )}

            <CNav variant="tabs">
              <CNavItem>
                <CNavLink
                  active={activeTab === 'store'}
                  onClick={() => setActiveTab('store')}
                >
                  Store
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink
                  active={activeTab === 'product'}
                  onClick={() => setActiveTab('product')}
                >
                  Product
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink
                  active={activeTab === 'inventory'}
                  onClick={() => setActiveTab('inventory')}
                >
                  Product Details
                </CNavLink>
              </CNavItem>
            </CNav>

            <CTabContent className="mt-3">
              {/* Store Information Tab */}
              <CTabPane visible={activeTab === 'store'}>
                <CForm onSubmit={storeFormik.handleSubmit}>
                  <CRow className="mb-3">
                    <CCol md={4}>
                      <CFormLabel htmlFor="store_code">Store Code</CFormLabel>
                      <CFormInput
                        type="text"
                        id="store_code"
                        name="store_code"
                        value={storeFormik.values.store_code}
                        onChange={storeFormik.handleChange}
                        onBlur={storeFormik.handleBlur}
                        invalid={storeFormik.touched.store_code && !!storeFormik.errors.store_code}
                      />
                      <CFormFeedback>{storeFormik.errors.store_code}</CFormFeedback>
                    </CCol>
                    <CCol md={4}>
                      <CFormLabel htmlFor="store_type">Store Type</CFormLabel>
                      <CFormSelect
                        id="store_type"
                        name="store_type"
                        value={storeFormik.values.store_type}
                        onChange={storeFormik.handleChange}
                        onBlur={storeFormik.handleBlur}
                        invalid={storeFormik.touched.store_type && !!storeFormik.errors.store_type}
                      >
                        <option value="">Select store type</option>
                        <option value="store">Store</option>
                        <option value="shop">Shop</option>
                        <option value="warehouse">Warehouse</option>
                      </CFormSelect>
                      <CFormFeedback>{storeFormik.errors.store_type}</CFormFeedback>
                    </CCol>
                    <CCol md={4}>
                      <CFormLabel htmlFor="store_name">Store Name</CFormLabel>
                      <CFormInput
                        type="text"
                        id="store_name"
                        name="store_name"
                        value={storeFormik.values.store_name}
                        onChange={storeFormik.handleChange}
                        onBlur={storeFormik.handleBlur}
                        invalid={storeFormik.touched.store_name && !!storeFormik.errors.store_name}
                      />
                      <CFormFeedback>{storeFormik.errors.store_name}</CFormFeedback>
                    </CCol>
                  </CRow>
                  <div className="d-flex justify-content-end">
                    <CButton
                      color="primary"
                      type="submit"
                      disabled={loading.store || !storeFormik.isValid}
                    >
                      {loading.store ? (
                        <CSpinner size="sm" />
                      ) : isEditMode ? (
                        'Update Store'
                      ) : (
                        'Save Store'
                      )}
                    </CButton>
                    {isEditMode && (
                      <CButton
                        color="danger"
                        className="ms-2"
                        onClick={() => {
                          storeFormik.resetForm();
                          setIsEditMode(false);
                        }}
                      >
                        Cancel
                      </CButton>
                    )}
                   {/*  <CButton
                      color="secondary"
                      className="ms-2"
                      onClick={() => setActiveTab('product')}
                    >
                      Next: Product
                    </CButton> */}
                  </div>
                </CForm>

                {/* Stores Table */}
                <div className="mt-4">
                  <CCard className="shadow-sm">
                    <CCardHeader className="header-glass">
                      <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                          <CIcon icon={cilBuilding} className="me-2" />
                          Stores
                        </h5>
                       {/*  <CBadge color="light" className="text-dark">
                          Total: {stores.length}
                        </CBadge> */}
                      </div>
                    </CCardHeader>
                    <CCardBody>
                      {loading.stores ? (
                        <div className="text-center py-5">
                          <CSpinner color="primary" size="lg" />
                          <p className="mt-2 text-muted">Loading stores...</p>
                        </div>
                      ) : (
                        <>
                          <div className="table-responsive">
                            <CTable striped hover className="mb-0">
                              <CTableHead className="custom-table-head">
                                <CTableRow>
                                  <CTableHeaderCell className="fw-semibold">Code</CTableHeaderCell>
                                  <CTableHeaderCell className="fw-semibold">Name</CTableHeaderCell>
                                  <CTableHeaderCell className="fw-semibold">Type</CTableHeaderCell>
                                  <CTableHeaderCell className="fw-semibold text-end">Actions</CTableHeaderCell>
                                </CTableRow>
                              </CTableHead>
                              <CTableBody>
                                {paginate(stores, currentPage.store, itemsPerPage).map(store => (
                                  <CTableRow key={store.id} className="align-middle">
                                    <CTableDataCell>
                                      <CBadge color="primary" className="py-1 px-2">
                                        {store.store_code}
                                      </CBadge>
                                    </CTableDataCell>
                                    <CTableDataCell className="fw-semibold">
                                      {store.store_name}
                                    </CTableDataCell>
                                    <CTableDataCell>
                                      <CBadge
                                        color={
                                          store.store_type === 'warehouse' ? 'info' :
                                            store.store_type === 'shop' ? 'warning' : 'success'
                                        }
                                        className="py-1 px-2"
                                      >
                                        {store.store_type}
                                      </CBadge>
                                    </CTableDataCell>
                                    <CTableDataCell className="text-end">
                                      <CButton
                                        color="info"
                                        size="sm"
                                        className="me-2"
                                        onClick={() => handleEdit('store', store)}
                                        shape="rounded-pill"
                                      >
                                        <CIcon icon={cilPencil} className="me-1" />

                                      </CButton>
                                      <CButton
                                        color="danger"
                                        size="sm"
                                        onClick={() => handleDelete('store', store.id)}
                                        shape="rounded-pill"
                                      >
                                        <CIcon icon={cilTrash} className="me-1" />

                                      </CButton>
                                    </CTableDataCell>
                                  </CTableRow>
                                ))}
                              </CTableBody>
                            </CTable>
                          </div>

                          <CPagination className="mt-3 justify-content-center">
                            <CPaginationItem
                              disabled={currentPage.store === 1}
                              onClick={() => handlePageChange('store', currentPage.store - 1)}
                              className="mx-1"
                            >
                              <CIcon icon={cilArrowLeft} />
                            </CPaginationItem>
                            {[...Array(Math.ceil(stores.length / itemsPerPage)).keys()].map(number => (
                              <CPaginationItem
                                key={number + 1}
                                active={number + 1 === currentPage.store}
                                onClick={() => handlePageChange('store', number + 1)}
                                className="mx-1"
                              >
                                {number + 1}
                              </CPaginationItem>
                            ))}
                            <CPaginationItem
                              disabled={currentPage.store === Math.ceil(stores.length / itemsPerPage)}
                              onClick={() => handlePageChange('store', currentPage.store + 1)}
                              className="mx-1"
                            >
                              <CIcon icon={cilArrowRight} />
                            </CPaginationItem>
                          </CPagination>
                        </>
                      )}
                    </CCardBody>
                  </CCard>
                </div>

              </CTabPane>

              {/* Product Details Tab */}
              <CTabPane visible={activeTab === 'product'}>
                <CForm onSubmit={productFormik.handleSubmit}>
                  <CRow className="mb-3">
                    <CCol md={6}>
                      <CFormLabel htmlFor="product_code">Product Code</CFormLabel>
                      <CFormInput
                        type="text"
                        id="product_code"
                        name="product_code"
                        value={productFormik.values.product_code}
                        onChange={productFormik.handleChange}
                        onBlur={productFormik.handleBlur}
                        invalid={productFormik.touched.product_code && !!productFormik.errors.product_code}
                      />
                      <CFormFeedback>{productFormik.errors.product_code}</CFormFeedback>
                    </CCol>
                    <CCol md={6}>
                      <CFormLabel htmlFor="product_type">Product Type</CFormLabel>
                      <CFormInput
                        type="text"
                        id="product_type"
                        name="product_type"
                        value={productFormik.values.product_type}
                        onChange={productFormik.handleChange}
                        onBlur={productFormik.handleBlur}
                        invalid={productFormik.touched.product_type && !!productFormik.errors.product_type}
                      />
                      <CFormFeedback>{productFormik.errors.product_type}</CFormFeedback>
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol md={6}>
                      <CFormLabel htmlFor="texture">Texture</CFormLabel>
                      <CFormInput
                        type="text"
                        id="texture"
                        name="texture"
                        value={productFormik.values.texture}
                        onChange={productFormik.handleChange}
                        onBlur={productFormik.handleBlur}
                        invalid={productFormik.touched.texture && !!productFormik.errors.texture}
                      />
                      <CFormFeedback>{productFormik.errors.texture}</CFormFeedback>
                    </CCol>
                    <CCol md={6}>
                      <CFormLabel htmlFor="length">Length</CFormLabel>
                      <CFormInput
                        type="text"
                        id="length"
                        name="length"
                        value={productFormik.values.length}
                        onChange={productFormik.handleChange}
                        onBlur={productFormik.handleBlur}
                        invalid={productFormik.touched.length && !!productFormik.errors.length}
                      />
                      <CFormFeedback>{productFormik.errors.length}</CFormFeedback>
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol md={6}>
                      <CFormLabel htmlFor="color">Color</CFormLabel>
                      <CFormInput
                        type="text"
                        id="color"
                        name="color"
                        value={productFormik.values.color}
                        onChange={productFormik.handleChange}
                        onBlur={productFormik.handleBlur}
                        invalid={productFormik.touched.color && !!productFormik.errors.color}
                      />
                      <CFormFeedback>{productFormik.errors.color}</CFormFeedback>
                    </CCol>
                    <CCol md={6}>
                      <CFormLabel htmlFor="vendor_name">Vendor Name</CFormLabel>
                      <CFormInput
                        type="text"
                        id="vendor_name"
                        name="vendor_name"
                        value={productFormik.values.vendor_name}
                        onChange={productFormik.handleChange}
                        onBlur={productFormik.handleBlur}
                      />
                    </CCol>
                  </CRow>
                  <div className="d-flex justify-content-between">
                  {/*   <CButton
                      color="secondary"
                      onClick={() => setActiveTab('store')}
                    >
                      Back to Store
                    </CButton> */}
                    <div>
                      <CButton
                        color="primary"
                        type="submit"
                        disabled={loading.product || !productFormik.isValid}
                        className="me-2"
                      >
                        {loading.product ? (
                          <CSpinner size="sm" />
                        ) : isEditMode ? (
                          'Update Product'
                        ) : (
                          'Save Product'
                        )}
                      </CButton>
                      {isEditMode && (
                        <CButton
                          color="danger"
                          className="me-2"
                          onClick={() => {
                            productFormik.resetForm();
                            setIsEditMode(false);
                          }}
                        >
                          Cancel
                        </CButton>
                      )}
                    {/*   <CButton
                        color="primary"
                        onClick={() => setActiveTab('inventory')}
                      >
                        Next: Product Details
                      </CButton> */}
                    </div>
                  </div>
                </CForm>

                {/* Products Table */}
                <div className="mt-4">
                  <CCard className="shadow-sm">
                    <CCardHeader className="header-glass">
                      <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                          <CIcon icon={cilBuilding} className="me-2" />
                          Products
                        </h5>
                        
                      </div>
                    </CCardHeader>
                    <CCardBody>
                      {loading.products ? (
                        <div className="text-center py-5">
                          <CSpinner color="primary" size="lg" />
                          <p className="mt-2 text-muted">Loading products...</p>
                        </div>
                      ) : (
                        <>
                          <div className="table-responsive">
                            <CTable striped hover className="mb-0">
                              <CTableHead className="custom-table-head">
                                <CTableRow>
                                  <CTableHeaderCell className="fw-semibold">Code</CTableHeaderCell>
                                  <CTableHeaderCell className="fw-semibold">Type</CTableHeaderCell>
                                  <CTableHeaderCell className="fw-semibold">Texture</CTableHeaderCell>
                                  <CTableHeaderCell className="fw-semibold">Length</CTableHeaderCell>
                                  <CTableHeaderCell className="fw-semibold">Color</CTableHeaderCell>
                                  <CTableHeaderCell className="fw-semibold text-end">Actions</CTableHeaderCell>
                                </CTableRow>
                              </CTableHead>
                              <CTableBody>
                                {paginate(products, currentPage.product, itemsPerPage).map(product => (
                                  <CTableRow key={product.id} className="align-middle">
                                    <CTableDataCell>
                                      <CBadge color="primary" className="py-1 px-2">
                                        {product.product_code}
                                      </CBadge>
                                    </CTableDataCell>
                                    <CTableDataCell>{product.product_type}</CTableDataCell>
                                    <CTableDataCell>{product.texture}</CTableDataCell>
                                    <CTableDataCell>{product.length}</CTableDataCell>
                                    <CTableDataCell>{product.color}</CTableDataCell>
                                    <CTableDataCell className="text-end">
                                      <CButton
                                        color="info"
                                        size="sm"
                                        className="me-2"
                                        onClick={() => handleEdit('product', product)}
                                        shape="rounded-pill"
                                      >
                                        <CIcon icon={cilPencil} className="me-1" />
                                      </CButton>
                                      <CButton
                                        color="danger"
                                        size="sm"
                                        onClick={() => handleDelete('product', product.id)}
                                        shape="rounded-pill"
                                      >
                                        <CIcon icon={cilTrash} className="me-1" />
                                      </CButton>
                                    </CTableDataCell>
                                  </CTableRow>
                                ))}
                              </CTableBody>
                            </CTable>
                          </div>

                          <CPagination className="mt-3 justify-content-center">
                            <CPaginationItem
                              disabled={currentPage.product === 1}
                              onClick={() => handlePageChange('product', currentPage.product - 1)}
                              className="mx-1"
                            >
                              <CIcon icon={cilArrowLeft} />
                            </CPaginationItem>
                            {[...Array(Math.ceil(products.length / itemsPerPage)).keys()].map(number => (
                              <CPaginationItem
                                key={number + 1}
                                active={number + 1 === currentPage.product}
                                onClick={() => handlePageChange('product', number + 1)}
                                className="mx-1"
                              >
                                {number + 1}
                              </CPaginationItem>
                            ))}
                            <CPaginationItem
                              disabled={currentPage.product === Math.ceil(products.length / itemsPerPage)}
                              onClick={() => handlePageChange('product', currentPage.product + 1)}
                              className="mx-1"
                            >
                              <CIcon icon={cilArrowRight} />
                            </CPaginationItem>
                          </CPagination>
                        </>
                      )}
                    </CCardBody>
                  </CCard>
                </div>

              </CTabPane>

              {/* Inventory Tab */}
              <CTabPane visible={activeTab === 'inventory'}>
                <CForm onSubmit={inventoryFormik.handleSubmit}>
                  <CRow className="mb-3">
                    <CCol md={6}>
                      <CFormLabel htmlFor="store_id">Store</CFormLabel>
                      <CFormSelect
                        id="store"
                        name="store_id"
                        type='number'
                        value={inventoryFormik.values.store_id}
                        onChange={inventoryFormik.handleChange}
                        onBlur={inventoryFormik.handleBlur}
                        invalid={inventoryFormik.touched.store_id && !!inventoryFormik.errors.store_id}
                      >
                        <option value="">Select a store</option>
                        {stores.map(store => (
                          <option key={store.id} value={store.id}>
                            {store.store_name} ({store.store_code})
                          </option>
                        ))}
                      </CFormSelect>
                      <CFormFeedback>{inventoryFormik.errors.store_id}</CFormFeedback>
                    </CCol>
                    <CCol md={6}>
                      <CFormLabel htmlFor="product_id">Product</CFormLabel>
                      <CFormSelect
                        id="product"
                        name="product_id"
                        type='number'
                        value={inventoryFormik.values.product_id}
                        onChange={inventoryFormik.handleChange}
                        onBlur={inventoryFormik.handleBlur}
                        invalid={inventoryFormik.touched.product_id && !!inventoryFormik.errors.product_id}
                      >
                        <option value="">Select a product</option>
                        {products.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.product_code} ({product.product_type})
                          </option>
                        ))}
                      </CFormSelect>
                      <CFormFeedback>{inventoryFormik.errors.product_id}</CFormFeedback>
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol md={4}>
                      <CFormLabel htmlFor="quantity">Quantity</CFormLabel>
                      <CFormInput
                        type="number"
                        id="quantity"
                        name="quantity"
                        value={inventoryFormik.values.quantity}
                        onChange={inventoryFormik.handleChange}
                        onBlur={inventoryFormik.handleBlur}
                        invalid={inventoryFormik.touched.quantity && !!inventoryFormik.errors.quantity}
                      />
                      <CFormFeedback>{inventoryFormik.errors.quantity}</CFormFeedback>
                    </CCol>
                    <CCol md={4}>
                      <CFormLabel htmlFor="shippingcost">Shipping Cost</CFormLabel>
                      <CFormInput
                        type="number"
                        id="shippingcost"
                        name="shippingcost"
                        value={inventoryFormik.values.shippingcost}
                        onChange={inventoryFormik.handleChange}
                        onBlur={inventoryFormik.handleBlur}
                        invalid={inventoryFormik.touched.shippingcost && !!inventoryFormik.errors.shippingcost}
                      />
                      <CFormFeedback>{inventoryFormik.errors.shippingcost}</CFormFeedback>
                    </CCol>
                    <CCol md={4}>
                      <CFormLabel htmlFor="purchaseprice">Purchase Price</CFormLabel>
                      <CFormInput
                        type="number"
                        id="purchaseprice"
                        name="purchaseprice"
                        value={inventoryFormik.values.purchaseprice}
                        onChange={inventoryFormik.handleChange}
                        onBlur={inventoryFormik.handleBlur}
                        invalid={inventoryFormik.touched.purchaseprice && !!inventoryFormik.errors.purchaseprice}
                      />
                      <CFormFeedback>{inventoryFormik.errors.purchaseprice}</CFormFeedback>
                    </CCol>
                  </CRow>
                  <div className="d-flex justify-content-between">
                   {/*  <CButton
                      color="secondary"
                      onClick={() => setActiveTab('product')}
                    >
                      Back to Product
                    </CButton> */}
                    <div>
                      <CButton
                        color="primary"
                        type="submit"
                        disabled={loading.inventory || !inventoryFormik.isValid}
                        className="me-2"
                      >
                        {loading.inventory ? (
                          <CSpinner size="sm" />
                        ) : isEditMode ? (
                          'Update Product Detail'
                        ) : (
                          'Save Product Detail'
                        )}
                      </CButton>
                      {isEditMode && (
                        <CButton
                          color="danger"
                          onClick={() => {
                            inventoryFormik.resetForm();
                            setIsEditMode(false);
                          }}
                        >
                          Cancel
                        </CButton>
                      )}
                    </div>
                  </div>
                </CForm>

                {/* Product Details Table */}
                <div className="mt-4">
                  <CCard className="shadow-sm">
                    <CCardHeader className="header-glass">
                      <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                          <CIcon icon={cilBuilding} className="me-2" />
                          Product Details
                        </h5>
                        
                      </div>
                    </CCardHeader>
                    <CCardBody>
                      {loading.inventories ? (
                        <div className="text-center py-5">
                          <CSpinner color="primary" size="lg" />
                          <p className="mt-2 text-muted">Loading Product Details...</p>
                        </div>
                      ) : (
                        <>
                          <div className="table-responsive">
                            <CTable striped hover className="mb-0">
                              <CTableHead>
                                <CTableRow>
                                  <CTableHeaderCell className="fw-semibold">Store</CTableHeaderCell>
                                  <CTableHeaderCell className="fw-semibold">Product</CTableHeaderCell>
                                  <CTableHeaderCell className="fw-semibold">Quantity</CTableHeaderCell>
                                  <CTableHeaderCell className="fw-semibold">Shipping Cost</CTableHeaderCell>
                                  <CTableHeaderCell className="fw-semibold">Purchase Price</CTableHeaderCell>
                                  <CTableHeaderCell className="fw-semibold text-end">Actions</CTableHeaderCell>
                                </CTableRow>
                              </CTableHead>
                              <CTableBody>
                                {paginate(inventories, currentPage.inventory, itemsPerPage).map(inventory => {
                                  debugger
                                  const store = stores.find(s => s.id === Number(inventory.store_id));
                                  const product = products.find(p => p.id === Number(inventory.product_id));
                                  return (
                                    <CTableRow key={inventory.id} className="align-middle">
                                      <CTableDataCell>
                                        {store ? (
                                          <CBadge color="secondary" className="py-1 px-2">
                                            {store.store_name} ({store.store_code})
                                          </CBadge>
                                        ) : 'N/A'}
                                      </CTableDataCell>
                                      <CTableDataCell>
                                        {product ? (
                                          <CBadge color="info" className="py-1 px-2">
                                            {product.product_code} ({product.product_type})
                                          </CBadge>
                                        ) : 'N/A'}
                                      </CTableDataCell>
                                      <CTableDataCell>{inventory.quantity}</CTableDataCell>
                                      <CTableDataCell>{inventory.shippingcost}</CTableDataCell>
                                      <CTableDataCell>{inventory.purchaseprice}</CTableDataCell>
                                      <CTableDataCell className="text-end">
                                        <CButton
                                          color="info"
                                          size="sm"
                                          className="me-2"
                                          onClick={() => handleEdit('inventory', inventory)}
                                          shape="rounded-pill"
                                        >
                                          <CIcon icon={cilPencil} className="me-1" />
                                        </CButton>
                                        <CButton
                                          color="danger"
                                          size="sm"
                                          onClick={() => handleDelete('inventory', inventory.id)}
                                          shape="rounded-pill"
                                        >
                                          <CIcon icon={cilTrash} className="me-1" />
                                        </CButton>
                                      </CTableDataCell>
                                    </CTableRow>
                                  );
                                })}
                              </CTableBody>
                            </CTable>
                          </div>

                          <CPagination className="mt-3 justify-content-center">
                            <CPaginationItem
                              disabled={currentPage.inventory === 1}
                              onClick={() => handlePageChange('inventory', currentPage.inventory - 1)}
                              className="mx-1"
                            >
                              <CIcon icon={cilArrowLeft} />
                            </CPaginationItem>
                            {[...Array(Math.ceil(inventories.length / itemsPerPage)).keys()].map(number => (
                              <CPaginationItem
                                key={number + 1}
                                active={number + 1 === currentPage.inventory}
                                onClick={() => handlePageChange('inventory', number + 1)}
                                className="mx-1"
                              >
                                {number + 1}
                              </CPaginationItem>
                            ))}
                            <CPaginationItem
                              disabled={currentPage.inventory === Math.ceil(inventories.length / itemsPerPage)}
                              onClick={() => handlePageChange('inventory', currentPage.inventory + 1)}
                              className="mx-1"
                            >
                              <CIcon icon={cilArrowRight} />
                            </CPaginationItem>
                          </CPagination>
                        </>
                      )}
                    </CCardBody>
                  </CCard>
                </div>

              </CTabPane>
            </CTabContent>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default ProductInputPage;