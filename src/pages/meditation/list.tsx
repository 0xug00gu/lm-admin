import { List, useTable } from "@refinedev/antd";
import { Table, Tag, Space, Button } from "antd";
import { EyeOutlined, EditOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

export const MeditationList = () => {
  const navigate = useNavigate();
  const { tableProps } = useTable({
    resource: "challenges",
    filters: {
      permanent: [
        {
          field: "type",
          operator: "eq",
          value: "meditation",
        },
      ],
    },
  });

  return (
    <List
      title="명상 바디더블링 관리"
      createButtonProps={{
        children: "새 명상 챌린지 생성",
        onClick: () => navigate("/meditation/create"),
      }}
    >
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="name" title="챌린지명" />
        <Table.Column dataIndex="period" title="기간" />
        <Table.Column
          dataIndex="participants"
          title="참여자"
          render={(count) => `${count}명`}
        />
        <Table.Column dataIndex="price" title="가격" />
        <Table.Column
          dataIndex="status"
          title="상태"
          render={(status) => {
            const statusMap: Record<string, { color: string; text: string }> = {
              ongoing: { color: "blue", text: "진행중" },
              completed: { color: "green", text: "완료" },
              planned: { color: "orange", text: "예정" },
            };
            const s = statusMap[status] || statusMap.ongoing;
            return <Tag color={s.color}>{s.text}</Tag>;
          }}
        />
        <Table.Column
          title="작업"
          width={150}
          render={(_, record: any) => (
            <Space>
              <Button
                type="primary"
                icon={<EyeOutlined />}
                size="small"
                onClick={() => navigate(`/meditation/show/${record.id}`)}
              >
                상세
              </Button>
              <Button
                icon={<EditOutlined />}
                size="small"
                onClick={() => navigate(`/meditation/edit/${record.id}`)}
              >
                수정
              </Button>
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
