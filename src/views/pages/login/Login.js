import React, { useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'
import { useSnackbar } from 'notistack'

import yadaHairImg from 'src/assets/images/YADA_HAIR.png' // Ensure path is correct

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("https://www.robo-rec.com/api/super/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message || "Login failed")
      }

      localStorage.setItem("token", data.authorisation.token)
      localStorage.setItem("username", data.user.name)

      enqueueSnackbar("✅ Login successful", { variant: "success" })
      navigate("/dashboard")
    } catch (error) {
      enqueueSnackbar(error.message || "❌ Login failed", { variant: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-column justify-content-center">
      <CContainer>
        <CRow className="justify-content-center align-items-center">
          <CCol xs={12} md={10} lg={8}>
            <CRow className="g-0">
              {/* Left Side Image */}
              <CCol
                xs={12}
                md={6}
                className="bg-primary d-flex align-items-center justify-content-center p-4"
              >
                <img
                  src={yadaHairImg}
                  alt="Yada Hair"
                  className="img-fluid"
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: '8px',
                    padding: '10px',
                  }}
                />
              </CCol>

              {/* Right Side Login Form */}
              <CCol xs={12} md={6}>
                <CCard className="p-4 h-100 border-0 rounded-0">
                  <CCardBody>
                    <CForm onSubmit={handleFormSubmit}>
                      <h1>Login</h1>
                      <p className="text-body-secondary">Sign in to your account</p>

                      <CInputGroup className="mb-3">
                        <CInputGroupText>
                          <CIcon icon={cilUser} />
                        </CInputGroupText>
                        <CFormInput
                          type="email"
                          name="email"
                          placeholder="Email"
                          value={formData.email}
                          onChange={handleChange}
                          autoComplete="email"
                          required
                        />
                      </CInputGroup>

                      <CInputGroup className="mb-4">
                        <CInputGroupText>
                          <CIcon icon={cilLockLocked} />
                        </CInputGroupText>
                        <CFormInput
                          type="password"
                          name="password"
                          placeholder="Password"
                          value={formData.password}
                          onChange={handleChange}
                          autoComplete="current-password"
                          required
                        />
                      </CInputGroup>

                      <CRow>
                        <CCol xs={6}>
                          <CButton
                            type="submit"
                            color="primary"
                            className="px-4"
                            disabled={loading}
                          >
                            {loading ? 'Logging in...' : 'Login'}
                          </CButton>
                        </CCol>
                        <CCol xs={6} className="text-end">
                          <CButton color="link" className="px-0">
                            Forgot password?
                          </CButton>
                        </CCol>
                      </CRow>
                    </CForm>
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
