import { List, EditButton, ShowButton, DeleteButton, useTable } from "@refinedev/antd";
import { Table, Input, DatePicker, Space, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const { RangePicker } = DatePicker;

export const UserList = () => {
  const { tableProps } = useTable({
    resource: "users",
    syncWithLocation: true,
  });

  return (
    <List>
      {/* 검색/필터 영역 */}
      <Space style={{ marginBottom: 16 }} wrap>
        <Input placeholder="이름 검색" prefix={<SearchOutlined />} style={{ width: 200 }} />
        <Input placeholder="이메일 검색" prefix={<SearchOutlined />} style={{ width: 200 }} />
        <Input placeholder="전화번호 검색" prefix={<SearchOutlined />} style={{ width: 200 }} />
        <RangePicker placeholder={["가입일 시작", "가입일 종료"]} />
        <Button type="primary">검색</Button>
      </Space>

      {/* 테이블 */}
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title="ID" />
        <Table.Column dataIndex="name" title="이름" />
        <Table.Column dataIndex="email" title="이메일" />
        <Table.Column dataIndex="phone" title="전화번호" />
        <Table.Column dataIndex="createdAt" title="가입일" />
        <Table.Column dataIndex="purchaseCount" title="구매 횟수" />
        <Table.Column
          title="작업"
          dataIndex="actions"
          render={(_, record: any) => (
            <Space>
              <ShowButton hideText size="small" recordItemId={record.id} />
              <EditButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
