import { List, EditButton, ShowButton, DeleteButton, useTable } from "@refinedev/antd";
import { Table, Input, DatePicker, Space, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const { RangePicker } = DatePicker;

export const ClassList = () => {
  const { tableProps } = useTable({
    resource: "classes",
    syncWithLocation: true,
  });

  return (
    <List>
      {/* 검색/필터 영역 */}
      <Space style={{ marginBottom: 16 }} wrap>
        <Input placeholder="클래스명 검색" prefix={<SearchOutlined />} style={{ width: 200 }} />
        <RangePicker placeholder={["시작일", "종료일"]} />
        <Button type="primary">검색</Button>
      </Space>

      {/* 테이블 */}
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title="ID" />
        <Table.Column dataIndex="name" title="클래스명" />
        <Table.Column dataIndex="period" title="기간" />
        <Table.Column dataIndex="studentCount" title="수강생 수" />
        <Table.Column dataIndex="challengeCount" title="챌린지 수" />
        <Table.Column dataIndex="price" title="가격" />
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
