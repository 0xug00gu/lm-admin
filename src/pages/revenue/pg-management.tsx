import { Card, Descriptions, Button, Table, Space, Tag } from "antd";
import { SyncOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

export const PGManagement = () => {
  return (
    <div style={{ padding: 24 }}>
      <h2>PG 연동 관리</h2>

      {/* PG 연동 상태 */}
      <Card title="PG 연동 상태" style={{ marginBottom: 24 }}>
        <Descriptions bordered column={1}>
          <Descriptions.Item label="연동 상태">
            <Tag icon={<CheckCircleOutlined />} color="success">
              연동됨
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="PG사">토스페이먼츠</Descriptions.Item>
          <Descriptions.Item label="마지막 동기화">2024-01-01 10:00:00</Descriptions.Item>
          <Descriptions.Item label="연동 계정">merchant@example.com</Descriptions.Item>
        </Descriptions>

        <Space style={{ marginTop: 16 }}>
          <Button type="primary" icon={<SyncOutlined />}>
            데이터 동기화
          </Button>
          <Button>연동 설정 변경</Button>
        </Space>
      </Card>

      {/* 동기화 로그 */}
      <Card title="동기화 로그">
        <Table
          dataSource={[]}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        >
          <Table.Column dataIndex="timestamp" title="시간" />
          <Table.Column dataIndex="type" title="유형" />
          <Table.Column
            dataIndex="status"
            title="상태"
            render={(status) => (
              <Tag
                icon={status === "success" ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                color={status === "success" ? "success" : "error"}
              >
                {status === "success" ? "성공" : "실패"}
              </Tag>
            )}
          />
          <Table.Column dataIndex="recordCount" title="처리 건수" />
          <Table.Column dataIndex="message" title="메시지" />
        </Table>
      </Card>
    </div>
  );
};
