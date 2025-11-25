import { Card, Col, Row, Statistic } from "antd";
import { UserOutlined, BookOutlined, TrophyOutlined, DollarOutlined } from "@ant-design/icons";

export const DashboardPage = () => {
  return (
    <div style={{ padding: 24 }}>
      <h2>대시보드</h2>

      {/* 전체 요약 지표 */}
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="총 사용자 수"
              value={0}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="활성 클래스 수"
              value={0}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="진행 중인 챌린지 수"
              value={0}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="이번 달 매출"
              value={0}
              prefix={<DollarOutlined />}
              suffix="원"
            />
          </Card>
        </Col>
      </Row>

      {/* 최근 활동 피드 */}
      <Card title="최근 활동" style={{ marginTop: 24 }}>
        <p>최근 활동 내역이 여기에 표시됩니다.</p>
      </Card>
    </div>
  );
};
