import { List, useTable } from "@refinedev/antd";
import { Table, Input, DatePicker, Select, Space, Button, Tag } from "antd";
import { SearchOutlined, DownloadOutlined } from "@ant-design/icons";

const { RangePicker } = DatePicker;

export const SalesLog = () => {
  const { tableProps } = useTable({
    resource: "sales",
    syncWithLocation: true,
  });

  return (
    <List
      headerButtons={({ defaultButtons }) => (
        <>
          {defaultButtons}
          <Button type="primary" icon={<DownloadOutlined />}>
            엑셀 다운로드
          </Button>
        </>
      )}
    >
      {/* 검색/필터 영역 */}
      <Space style={{ marginBottom: 16 }} wrap>
        <Input placeholder="상품명 검색" prefix={<SearchOutlined />} style={{ width: 200 }} />
        <RangePicker placeholder={["시작일", "종료일"]} />
        <Select
          placeholder="결제수단"
          style={{ width: 150 }}
          options={[
            { value: "card", label: "카드" },
            { value: "bank", label: "계좌이체" },
            { value: "cash", label: "현금" },
          ]}
        />
        <Button type="primary">검색</Button>
      </Space>

      {/* 테이블 */}
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title="ID" />
        <Table.Column dataIndex="date" title="날짜" />
        <Table.Column dataIndex="productName" title="상품명" />
        <Table.Column dataIndex="buyer" title="구매자" />
        <Table.Column dataIndex="amount" title="금액" />
        <Table.Column dataIndex="paymentMethod" title="결제수단" />
        <Table.Column
          dataIndex="status"
          title="상태"
          render={(status) => (
            <Tag color={status === "completed" ? "green" : "orange"}>
              {status === "completed" ? "완료" : "대기"}
            </Tag>
          )}
        />
      </Table>
    </List>
  );
};
