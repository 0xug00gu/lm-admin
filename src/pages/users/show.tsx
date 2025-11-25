import { Show } from "@refinedev/antd";
import { Tabs, Descriptions, Table, Tag } from "antd";

export const UserShow = () => {
  // TODO: useShow 훅으로 데이터 가져오기

  return (
    <Show>
      <Tabs
        defaultActiveKey="info"
        items={[
          {
            key: "info",
            label: "기본 정보",
            children: (
              <Descriptions bordered column={1}>
                <Descriptions.Item label="이름">홍길동</Descriptions.Item>
                <Descriptions.Item label="이메일">user@example.com</Descriptions.Item>
                <Descriptions.Item label="전화번호">010-1234-5678</Descriptions.Item>
                <Descriptions.Item label="가입일">2024-01-01</Descriptions.Item>
              </Descriptions>
            ),
          },
          {
            key: "purchases",
            label: "구매 이력",
            children: (
              <Table dataSource={[]} rowKey="id">
                <Table.Column dataIndex="date" title="날짜" />
                <Table.Column dataIndex="productName" title="상품명" />
                <Table.Column dataIndex="amount" title="금액" />
                <Table.Column dataIndex="paymentMethod" title="결제수단" />
              </Table>
            ),
          },
          {
            key: "classes",
            label: "수강 클래스",
            children: (
              <Table dataSource={[]} rowKey="id">
                <Table.Column dataIndex="className" title="클래스명" />
                <Table.Column dataIndex="period" title="기간" />
                <Table.Column
                  dataIndex="status"
                  title="진행상태"
                  render={(status) => <Tag color="blue">{status}</Tag>}
                />
              </Table>
            ),
          },
          {
            key: "challenges",
            label: "참여 챌린지",
            children: (
              <Table dataSource={[]} rowKey="id">
                <Table.Column dataIndex="challengeName" title="챌린지명" />
                <Table.Column dataIndex="period" title="기간" />
                <Table.Column dataIndex="attendanceRate" title="출석률" />
              </Table>
            ),
          },
        ]}
      />
    </Show>
  );
};
