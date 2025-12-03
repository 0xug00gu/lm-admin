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
    <List>
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
              show("challenges", record.id);
            },
            style: { cursor: "pointer" },
          };
        }}
      >
        <Table.Column dataIndex="id" title="ID" width={80} />
        <Table.Column dataIndex="name" title="챌린지명" />
        <Table.Column dataIndex="channel_id" title="채널 ID" width={150} />
        <Table.Column dataIndex="role_id" title="역할 ID" width={150} />
        <Table.Column dataIndex="category_id" title="카테고리 ID" width={150} />
        <Table.Column
          dataIndex="is_active"
          title="상태"
          width={100}
          render={(is_active) => (
            <Tag color={is_active ? "blue" : "red"}>
              {is_active ? "활성" : "비활성"}
            </Tag>
          )}
        />
        <Table.Column
          dataIndex="description"
          title="설명"
          ellipsis
        />
      </Table>
    </List>
  );
};
