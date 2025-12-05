import { List, useTable } from "@refinedev/antd";
import { Table, Input, Space, Button, Select, Tag, message, Modal } from "antd";
import { SearchOutlined, DownloadOutlined, SyncOutlined, ReloadOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { api } from "../../config/env";

export const UserList = () => {
  const [searchField, setSearchField] = useState("name");
  const [searchValue, setSearchValue] = useState("");
  const [syncLoading, setSyncLoading] = useState(false);
  const [guilds, setGuilds] = useState<any[]>([]);
  const [selectedGuildId, setSelectedGuildId] = useState<string>("");

  const { tableProps, tableQueryResult } = useTable({
    resource: "discord_users",
    syncWithLocation: true,
    meta: {
      expand: "programs",
    },
  });

  // 길드 목록 가져오기
  useEffect(() => {
    fetchGuilds();
  }, []);

  const fetchGuilds = async () => {
    try {
      const response = await fetch(api.discord.guilds());
      const result = await response.json();
      if (result.success && result.data.length > 0) {
        setGuilds(result.data);
        setSelectedGuildId(result.data[0].id);
      }
    } catch (error) {
      console.error("길드 목록 가져오기 실패:", error);
    }
  };

  // 테이블 새로고침
  const handleRefresh = () => {
    tableQueryResult.refetch();
    message.success("목록을 새로고침했습니다.");
  };

  // Discord에서 사용자 동기화
  const handleSyncUsers = async () => {
    if (!selectedGuildId) {
      message.warning("길드를 선택해주세요.");
      return;
    }

    Modal.confirm({
      title: "Discord 사용자 동기화",
      content: (
        <div>
          <p>Discord 서버에서 사용자 목록을 가져와 동기화합니다.</p>
          <p style={{ color: "#888", fontSize: 12 }}>
            이 작업은 시간이 걸릴 수 있습니다.
          </p>
        </div>
      ),
      okText: "동기화",
      cancelText: "취소",
      onOk: async () => {
        setSyncLoading(true);
        try {
          const response = await fetch(api.discord.syncMembers(selectedGuildId), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });

          const result = await response.json();

          if (result.success) {
            message.success(`${result.data?.synced || 0}명의 사용자가 동기화되었습니다.`);
            // 테이블 새로고침
            tableQueryResult.refetch();
          } else {
            message.error(result.message || "동기화에 실패했습니다.");
          }
        } catch (error) {
          console.error("사용자 동기화 실패:", error);
          message.error("사용자 동기화 중 오류가 발생했습니다.");
        } finally {
          setSyncLoading(false);
        }
      },
    });
  };

  // 엑셀 다운로드 함수
  const handleExcelDownload = () => {
    const dataSource = tableProps.dataSource || [];

    // 엑셀에 들어갈 데이터 형식 변환
    const excelData = dataSource.map((user: any) => {
      let phoneDisplay = "-";
      if (user.phone && user.phone !== 0) {
        const phoneStr = String(user.phone);
        phoneDisplay = phoneStr.startsWith("0") ? phoneStr : `0${phoneStr}`;
      }

      // 프로그램 정보 추출
      let programsDisplay = "-";
      if (user.expand && user.expand.programs) {
        const programs = Array.isArray(user.expand.programs)
          ? user.expand.programs
          : [user.expand.programs];
        programsDisplay = programs.map((p: any) => p.name).join(", ");
      } else {
        const programs = [user.class_name, user.meditation_name].filter(Boolean);
        if (programs.length > 0) {
          programsDisplay = programs.join(", ");
        }
      }

      return {
        "이름": user.name,
        "디스코드 아이디": user.username,
        "전화번호": phoneDisplay,
        "이메일": user.email || "-",
        "참여 프로그램": programsDisplay,
        "원래 채널 ID": user.original_channel_id
      };
    });

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
          <Select
            placeholder="길드 선택"
            style={{ width: 200 }}
            value={selectedGuildId}
            onChange={setSelectedGuildId}
            options={guilds.map((guild) => ({
              label: guild.name,
              value: guild.id,
            }))}
          />
          <Button
            icon={<SyncOutlined spin={syncLoading} />}
            onClick={handleSyncUsers}
            loading={syncLoading}
          >
            Discord 동기화
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
          >
            새로고침
          </Button>
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
            { value: "phone", label: "전화번호" },
            { value: "email", label: "이메일" },
            { value: "challenge_name", label: "프로그램" }
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
        <Table.Column
          dataIndex="phone"
          title="전화번호"
          width={150}
          render={(phone) => {
            if (!phone || phone === 0) return "-";
            const phoneStr = String(phone);
            return phoneStr.startsWith("0") ? phoneStr : `0${phoneStr}`;
          }}
        />
        <Table.Column dataIndex="email" title="이메일" width={200} />
        <Table.Column
          title="참여 프로그램"
          width={250}
          render={(_, record: any) => {
            // expand된 프로그램 정보가 있으면 사용
            if (record.expand && record.expand.programs) {
              const programs = Array.isArray(record.expand.programs)
                ? record.expand.programs
                : [record.expand.programs];

              return (
                <Space wrap>
                  {programs.map((program: any, index: number) => (
                    <Tag key={index} color="blue">
                      {program.name}
                    </Tag>
                  ))}
                </Space>
              );
            }

            // fallback: 기존 필드 사용
            const programs = [record.class_name, record.meditation_name]
              .filter(Boolean);

            if (programs.length > 0) {
              return (
                <Space wrap>
                  {programs.map((name: string, index: number) => (
                    <Tag key={index} color="blue">
                      {name}
                    </Tag>
                  ))}
                </Space>
              );
            }

            return "-";
          }}
        />
      </Table>
    </List>
  );
};
