import { List, useTable } from "@refinedev/antd";
import { Table, Input, Space, Button, Tag } from "antd";
import { SearchOutlined, DownloadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";

export const UserList = () => {
  const { tableProps } = useTable({
    resource: "discord_users",
    syncWithLocation: true,
  });

  // 엑셀 다운로드 함수
  const handleExcelDownload = () => {
    const dataSource = tableProps.dataSource || [];

    // 엑셀에 들어갈 데이터 형식 변환
    const excelData = dataSource.map((user: any) => ({
      "이름": user.name,
      "디스코드 아이디": user.username,
      "전화번호": user.phone_number,
      "원래 채널 ID": user.original_channel_id,
      "활성 상태": user.is_active ? "활성" : "비활성"
    }));

    // 워크시트 생성
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "사용자 목록");

    // 파일 다운로드
    const fileName = `Discord사용자_목록_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
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
        <Input placeholder="디스코드 아이디 검색" prefix={<SearchOutlined />} style={{ width: 200 }} />
        <Input placeholder="전화번호 검색" prefix={<SearchOutlined />} style={{ width: 200 }} />
        <Button type="primary">검색</Button>
      </Space>

      {/* 테이블 */}
      <Table
        {...tableProps}
        rowKey="id"
        onRow={(record) => ({
          onClick: () => {
            window.location.href = `/users/show/${record.id}`;
          },
          style: { cursor: 'pointer' }
        })}
      >
        <Table.Column dataIndex="name" title="이름" width={120} />
        <Table.Column dataIndex="username" title="디스코드 아이디" width={150} />
        <Table.Column dataIndex="phone_number" title="전화번호" width={150} />
        <Table.Column
          dataIndex="is_active"
          title="활성 상태"
          width={100}
          align="center"
          render={(value) => <Tag color={value ? "green" : "red"}>{value ? "활성" : "비활성"}</Tag>}
        />
      </Table>
    </List>
  );
};
