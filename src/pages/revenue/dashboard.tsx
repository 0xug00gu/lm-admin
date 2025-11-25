import { Card, Row, Col, Statistic, Select, Space } from "antd";
import { DollarOutlined, ShoppingOutlined, CreditCardOutlined } from "@ant-design/icons";

export const RevenueDashboard = () => {
  return (
    <div style={{ padding: 24 }}>
      <h2>매출 대시보드</h2>

      {/* 기간 선택 */}
      <Space style={{ marginBottom: 24 }}>
        <Select
          defaultValue="day"
          style={{ width: 120 }}
          options={[
            { value: "day", label: "일별" },
            { value: "week", label: "주별" },
            { value: "month", label: "월별" },
          ]}
        />
      </Space>

      {/* 요약 지표 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="총 매출"
              value={0}
              prefix={<DollarOutlined />}
              suffix="원"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="총 주문 수"
              value={0}
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="평균 주문 금액"
              value={0}
              prefix={<CreditCardOutlined />}
              suffix="원"
            />
          </Card>
        </Col>
      </Row>

      {/* 기간별 매출 그래프 */}
      <Card title="기간별 매출" style={{ marginBottom: 24 }}>
        <p>그래프가 여기에 표시됩니다</p>
      </Card>

      {/* 상품별 매출 요약 */}
      <Card title="상품별 매출 요약" style={{ marginBottom: 24 }}>
        <p>상품별 매출 차트가 여기에 표시됩니다</p>
      </Card>

      {/* 결제수단별 비율 */}
      <Card title="결제수단별 비율">
        <p>결제수단별 파이 차트가 여기에 표시됩니다</p>
      </Card>
    </div>
  );
};
