import { List, useTable } from "@refinedev/antd";
import { Table, Input, Space, Button, Select } from "antd";
import { SearchOutlined, DownloadOutlined } from "@ant-design/icons";
import { useState } from "react";
import * as XLSX from "xlsx";

export const UserList = () => {
  const [searchField, setSearchField] = useState("name");
  const [searchValue, setSearchValue] = useState("");

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
      "클래스": user.class_name,
      "명상": user.meditation_name,
      "원래 채널 ID": user.original_channel_id
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
        <Select
          value={searchField}
          onChange={setSearchField}
          style={{ width: 150 }}
          options={[
            { value: "name", label: "이름" },
            { value: "username", label: "디스코드 아이디" },
            { value: "phone_number", label: "전화번호" },
            { value: "class_name", label: "클래스" },
            { value: "meditation_name", label: "명상" }
          ]}
        />
        <Input
          placeholder="검색어를 입력하세요"
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
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
        <Table.Column dataIndex="class_name" title="클래스" width={150} />
        <Table.Column dataIndex="meditation_name" title="명상" width={150} />
      </Table>
    </List>
  );
};
