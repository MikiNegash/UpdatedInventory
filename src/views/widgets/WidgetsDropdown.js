import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import {
  CRow,
  CCol,
  CDropdown,
  CDropdownMenu,
  CDropdownItem,
  CDropdownToggle,
  CWidgetStatsA,
} from '@coreui/react'

import { getStyle } from '@coreui/utils'
import { CChartLine, CChartBar } from '@coreui/react-chartjs'
import CIcon from '@coreui/icons-react'
import { cilArrowBottom, cilArrowTop, cilOptions } from '@coreui/icons'

const ChartDropdown = () => (
  <CDropdown alignment="end">
    <CDropdownToggle color="transparent" caret={false} className="text-white p-0">
      <CIcon icon={cilOptions} />
    </CDropdownToggle>
    <CDropdownMenu>
      <CDropdownItem>Action</CDropdownItem>
      <CDropdownItem>Another action</CDropdownItem>
    </CDropdownMenu>
  </CDropdown>
)

const getTodayDateString = () => new Date().toISOString().slice(0, 10)

const WidgetsDropdown = ({ className }) => {
  const [stats, setStats] = useState(null)
  const widgetChartRef1 = useRef(null)
  const widgetChartRef2 = useRef(null)

  useEffect(() => {
    const today = getTodayDateString()

    axios
      .get(`https://robo-rec.com/api/inventorybydate?from=2025-07-01&to=${today}`)
      .then((res) => setStats(res.data))
      .catch((err) => console.error('Failed to fetch stats:', err))
  }, [])

  useEffect(() => {
    document.documentElement.addEventListener('ColorSchemeChange', () => {
      if (widgetChartRef1.current) {
        widgetChartRef1.current.data.datasets[0].pointBackgroundColor = getStyle('--cui-primary')
        widgetChartRef1.current.update()
      }

      if (widgetChartRef2.current) {
        widgetChartRef2.current.data.datasets[0].pointBackgroundColor = getStyle('--cui-info')
        widgetChartRef2.current.update()
      }
    })
  }, [])

  return (
    <CRow className={className} xs={{ gutter: 4 }}>
      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsA
          color="primary"
          value={
            <>
              {stats?.total ?? '...'}{' '}
              <span className="fs-6 fw-normal">
             {/*    (-12.4% <CIcon icon={cilArrowBottom} />) */}
              </span>
            </>
          }
          title="Total Sold Items"
          action={<ChartDropdown />}
          chart={
            <CChartLine
              ref={widgetChartRef1}
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                datasets: [
                  {
                    label: 'Items',
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(255,255,255,.55)',
                    pointBackgroundColor: getStyle('--cui-primary'),
                    data: [65, 59, 84, 84, 51, 55, 40],
                  },
                ],
              }}
              options={{
                plugins: { legend: { display: false } },
                maintainAspectRatio: false,
                scales: {
                  x: { grid: { display: false }, ticks: { display: false } },
                  y: { min: 30, max: 89, display: false },
                },
                elements: {
                  line: { borderWidth: 1, tension: 0.4 },
                  point: { radius: 4, hitRadius: 10 },
                },
              }}
            />
          }
        />
      </CCol>

      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsA
          color="info"
          value={
            <>
              {stats?.total ? `$${stats.total}` : '...'}{' '}
              <span className="fs-6 fw-normal">
{/*                 (40.9% <CIcon icon={cilArrowTop} />)
 */}              </span>
            </>
          }
          title="Total Stock Value"
          action={<ChartDropdown />}
          chart={
            <CChartLine
              ref={widgetChartRef2}
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                datasets: [
                  {
                    label: 'Value',
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(255,255,255,.55)',
                    pointBackgroundColor: getStyle('--cui-info'),
                    data: [1, 18, 9, 17, 34, 22, 11],
                  },
                ],
              }}
              options={{
                plugins: { legend: { display: false } },
                maintainAspectRatio: false,
                scales: {
                  x: { grid: { display: false }, ticks: { display: false } },
                  y: { min: -9, max: 39, display: false },
                },
                elements: {
                  line: { borderWidth: 1 },
                  point: { radius: 4, hitRadius: 10 },
                },
              }}
            />
          }
        />
      </CCol>
{/* 
      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsA
          color="warning"
          value={
            <>
              {stats?.total_sales ?? '...'}{' '}
              <span className="fs-6 fw-normal">
                (+89.7% <CIcon icon={cilArrowTop} />)
              </span>
            </>
          }
          title="Total Sales"
          action={<ChartDropdown />}
          chart={
            <CChartLine
              className="mt-3"
              style={{ height: '70px' }}
              data={{
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                datasets: [
                  {
                    label: 'Sales',
                    backgroundColor: 'rgba(255,255,255,.2)',
                    borderColor: 'rgba(255,255,255,.55)',
                    data: [78, 81, 80, 45, 34, 12, 40],
                    fill: true,
                  },
                ],
              }}
              options={{
                plugins: { legend: { display: false } },
                maintainAspectRatio: false,
                scales: {
                  x: { display: false },
                  y: { display: false },
                },
                elements: {
                  line: { borderWidth: 2, tension: 0.4 },
                  point: { radius: 0, hitRadius: 10 },
                },
              }}
            />
          }
        />
      </CCol>

      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsA
          color="danger"
          value={
            <>
              {stats?.total_expenses ?? '...'}{' '}
              <span className="fs-6 fw-normal">
                (-23.6% <CIcon icon={cilArrowBottom} />)
              </span>
            </>
          }
          title="Expenses"
          action={<ChartDropdown />}
          chart={
            <CChartBar
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: Array.from({ length: 16 }, (_, i) => `M${i + 1}`),
                datasets: [
                  {
                    label: 'Expenses',
                    backgroundColor: 'rgba(255,255,255,.2)',
                    borderColor: 'rgba(255,255,255,.55)',
                    data: [78, 81, 80, 45, 34, 12, 40, 85, 65, 23, 12, 98, 34, 84, 67, 82],
                    barPercentage: 0.6,
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false }, ticks: { display: false } },
                  y: { grid: { display: false }, ticks: { display: false } },
                },
              }}
            />
          }
        />
      </CCol> */}
    </CRow>
  )
}

WidgetsDropdown.propTypes = {
  className: PropTypes.string,
}

export default WidgetsDropdown
