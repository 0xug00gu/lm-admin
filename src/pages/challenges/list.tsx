import { List, useTable, CreateButton } from "@refinedev/antd";
import { Table, Input, DatePicker, Space, Button, Tag } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useNavigation } from "@refinedev/core";

const { RangePicker } = DatePicker;

export const ChallengeList = () => {
  const { tableProps } = useTable({
    resource: "challenges",
    syncWithLocation: true,
  });

  const { show } = useNavigation();

  return (
    <List
      headerButtons={({ defaultButtons }) => (
        <>
          {defaultButtons}
          <CreateButton>챌린지 생성</CreateButton>
        </>
      )}
    >
      {/* 검색/필터 영역 */}
      <Space style={{ marginBottom: 16 }} wrap>
        <Input placeholder="챌린지명 검색" prefix={<SearchOutlined />} style={{ width: 200 }} />
        <RangePicker placeholder={["시작일", "종료일"]} />
        <Button type="primary">검색</Button>
      </Space>

      {/* 테이블 */}
      <Table
        {...tableProps}
        rowKey="id"
        onRow={(record: any) => {
          return {
            onClick: () => {
              if (record.type === "meditation") {
                show("meditation", record.id);
              } else {
                show("challenges", record.id);
              }
            },
            style: { cursor: "pointer" },
          };
        }}
      >
        <Table.Column dataIndex="id" title="ID" width={80} />
        <Table.Column dataIndex="name" title="챌린지명" />
        <Table.Column
          dataIndex="type"
          title="타입"
          width={200}
          render={(type) => {
            const typeMap: Record<string, { label: string; color: string }> = {
              lifemastery: { label: "🏆 라이프마스터리", color: "cyan" },
              "lifemastery-club": { label: "🎯 라이프마스터리 클럽", color: "geekblue" },
              meditation: { label: "🧘 명상 바디더블링", color: "purple" },
              "weekly-planning": { label: "📅 위클리 플래닝", color: "blue" },
            };
            const typeInfo = typeMap[type] || typeMap["lifemastery"];
            return <Tag color={typeInfo.color}>{typeInfo.label}</Tag>;
          }}
        />
        <Table.Column dataIndex="period" title="기간" />
        <Table.Column dataIndex="price" title="가격" width={120} />
        <Table.Column dataIndex="participants" title="참여자 수" width={100} align="center" />
        <Table.Column
          dataIndex="status"
          title="상태"
          width={100}
          render={(status) => {
            const colorMap: Record<string, string> = {
              ongoing: "blue",
              upcoming: "orange",
              completed: "green",
            };
            const labelMap: Record<string, string> = {
              ongoing: "진행중",
              upcoming: "예정",
              completed: "완료",
            };
            return <Tag color={colorMap[status]}>{labelMap[status]}</Tag>;
          }}
        />
      </Table>
    </List>
  );
};
