import { List, EditButton, ShowButton, DeleteButton, useTable } from "@refinedev/antd";
import { Table, Input, DatePicker, Space, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const { RangePicker } = DatePicker;

export const ClassList = () => {
  const { tableProps } = useTable({
    resource: "program",
    syncWithLocation: true,
  });

  return (
    <List>
      {/* 검색/필터 영역 */}
      <Space style={{ marginBottom: 16 }} wrap>
        <Input placeholder="프로그램명 검색" prefix={<SearchOutlined />} style={{ width: 200 }} />
        <RangePicker placeholder={["시작일", "종료일"]} />
        <Button type="primary">검색</Button>
      </Space>

      {/* 테이블 */}
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title="ID" width={80} />
        <Table.Column dataIndex="name" title="프로그램명" />
        <Table.Column
          dataIndex="start_date"
          title="시작일"
          width={120}
          render={(date) => date ? new Date(date).toLocaleDateString() : "-"}
        />
        <Table.Column
          dataIndex="end_date"
          title="종료일"
          width={120}
          render={(date) => date ? new Date(date).toLocaleDateString() : "-"}
        />
        <Table.Column
          dataIndex="price"
          title="가격"
          width={120}
          render={(price) => price ? `${price.toLocaleString()}원` : "-"}
        />
        <Table.Column
          dataIndex="is_active"
          title="상태"
          width={100}
          render={(is_active) => (
            <span style={{ color: is_active ? "green" : "red" }}>
              {is_active ? "활성" : "비활성"}
            </span>
          )}
        />
        <Table.Column
          title="작업"
          dataIndex="actions"
          width={150}
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
