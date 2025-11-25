import { Show } from "@refinedev/antd";
import { Tabs, Descriptions, Table, Button, Input, Space } from "antd";

export const ClassShow = () => {
  // TODO: useShow 훅으로 데이터 가져오기

  return (
    <Show>
      <Tabs
        defaultActiveKey="info"
        items={[
          {
            key: "info",
            label: "클래스 정보",
            children: (
              <Descriptions bordered column={1}>
                <Descriptions.Item label="클래스명">클래스 제목</Descriptions.Item>
                <Descriptions.Item label="기간">2024-01-01 ~ 2024-12-31</Descriptions.Item>
                <Descriptions.Item label="설명">클래스 설명</Descriptions.Item>
                <Descriptions.Item label="가격">100,000원</Descriptions.Item>
              </Descriptions>
            ),
          },
          {
            key: "students",
            label: "수강생 관리",
            children: (
              <>
                <Space style={{ marginBottom: 16 }}>
                  <Button type="primary">수강생 추가</Button>
                  <Button danger>선택 제거</Button>
                </Space>
                <Table dataSource={[]} rowKey="id" rowSelection={{}}>
                  <Table.Column dataIndex="name" title="이름" />
                  <Table.Column dataIndex="email" title="이메일" />
                  <Table.Column dataIndex="purchaseDate" title="구매일" />
                  <Table.Column dataIndex="progress" title="진도율" />
                </Table>
              </>
            ),
          },
          {
            key: "discord",
            label: "디스코드 채널",
            children: (
              <>
                <Descriptions bordered column={1} style={{ marginBottom: 16 }}>
                  <Descriptions.Item label="채널 ID">-</Descriptions.Item>
                  <Descriptions.Item label="채널명">-</Descriptions.Item>
                  <Descriptions.Item label="인증 완료">0명</Descriptions.Item>
                  <Descriptions.Item label="인증 미완료">0명</Descriptions.Item>
                </Descriptions>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Input.TextArea placeholder="초대 링크" rows={2} />
                  <Button type="primary">링크 저장</Button>
                </Space>
              </>
            ),
          },
          {
            key: "challenges",
            label: "연계 챌린지",
            children: (
              <Table dataSource={[]} rowKey="id">
                <Table.Column dataIndex="challengeName" title="챌린지명" />
                <Table.Column dataIndex="participants" title="참여자 수" />
                <Table.Column dataIndex="period" title="기간" />
              </Table>
            ),
          },
        ]}
      />
    </Show>
  );
};
