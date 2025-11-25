import { List, EditButton, ShowButton, DeleteButton, useTable } from "@refinedev/antd";
import { Table, Input, DatePicker, Space, Button, Tag, Tooltip } from "antd";
import { SearchOutlined, DownloadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";

const { RangePicker } = DatePicker;

export const UserList = () => {
  const { tableProps } = useTable({
    resource: "users",
    syncWithLocation: true,
  });

  // 엑셀 다운로드 함수
  const handleExcelDownload = () => {
    const dataSource = tableProps.dataSource || [];

    // 엑셀에 들어갈 데이터 형식 변환
    const excelData = dataSource.map((user: any) => ({
      "ID": user.id,
      "이름": user.name,
      "이메일": user.email,
      "전화번호": user.phone,
      "가입일": user.createdAt,
      "구매 횟수": user.purchaseCount,
      "Discord ID": user.discordId,
      "구매 중인 상품": user.currentProducts?.map((p: any) => `${p.name} (${p.status})`).join(", ") || "-"
    }));

    // 워크시트 생성
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "사용자 목록");

    // 파일 다운로드
    const fileName = `사용자_목록_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // 구매 중인 상품 렌더링 (최대 2개 표시, 나머지는 툴팁)
  const renderCurrentProducts = (products: any[]) => {
    if (!products || products.length === 0) {
      return <Tag>없음</Tag>;
    }

    const visibleProducts = products.slice(0, 2);
    const hiddenProducts = products.slice(2);

    const statusColors: Record<string, string> = {
      ongoing: "blue",
      completed: "green",
      upcoming: "orange"
    };

    return (
      <Space size={4} wrap>
        {visibleProducts.map((product, index) => (
          <Tag key={index} color={statusColors[product.status] || "default"}>
            {product.name}
          </Tag>
        ))}
        {hiddenProducts.length > 0 && (
          <Tooltip
            title={
              <div>
                {hiddenProducts.map((product, index) => (
                  <div key={index}>{product.name} ({product.status})</div>
                ))}
              </div>
            }
          >
            <Tag style={{ cursor: "pointer" }}>+{hiddenProducts.length}개 더보기</Tag>
          </Tooltip>
        )}
      </Space>
    );
  };

  return (
    <List
      headerButtons={({ defaultButtons }) => (
        <>
          {defaultButtons}
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExcelDownload}
          >
            엑셀 다운로드
          </Button>
        </>
      )}
    >
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
        <Table.Column dataIndex="id" title="ID" width={80} />
        <Table.Column dataIndex="name" title="이름" width={100} />
        <Table.Column dataIndex="email" title="이메일" width={200} />
        <Table.Column dataIndex="phone" title="전화번호" width={130} />
        <Table.Column dataIndex="createdAt" title="가입일" width={120} />
        <Table.Column dataIndex="purchaseCount" title="구매 횟수" width={100} align="center" />
        <Table.Column
          dataIndex="currentProducts"
          title="구매 중인 상품"
          render={(products) => renderCurrentProducts(products)}
        />
        <Table.Column
          title="작업"
          dataIndex="actions"
          width={120}
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
