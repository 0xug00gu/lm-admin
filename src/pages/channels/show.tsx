import { Show, useTable } from "@refinedev/antd";
import { useShow, useList } from "@refinedev/core";
import { Descriptions, Tag, Tabs, Table, Button, Space, Modal, Form, Select, message } from "antd";
import { PlusOutlined, DeleteOutlined, UserOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useState } from "react";

export const ChannelShow = () => {
  const { queryResult } = useShow({
    resource: "channels",
  });

  const { data, isLoading } = queryResult;
  const record = data?.data;

  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [addUserForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 모든 디스코드 유저 목록 가져오기 (추가할 때 선택용)
  const { data: usersData } = useList({
    resource: "discord_users",
    pagination: {
      mode: "off",
    },
  });

  const allUsers = usersData?.data || [];

  // 채널 멤버 목록 가져오기
  const { tableProps: membersTableProps, tableQueryResult: membersQueryResult } = useTable({
    resource: "channel_members",
    filters: {
      permanent: [
        {
          field: "channel_id",
          operator: "eq",
          value: record?.id,
        },
      ],
    },
    meta: {
      expand: "discord_user_id",
    },
    syncWithLocation: false,
  });

  const members = membersTableProps.dataSource || [];

  // 유저 추가
  const handleAddUser = async () => {
    try {
      const values = await addUserForm.validateFields();
      setLoading(true);

      // 선택한 유저의 discord_id 찾기
      const selectedUser = allUsers.find((user: any) => user.id === values.user_record_id);

      if (!selectedUser?.discord_id) {
        message.error("선택한 유저의 Discord ID를 찾을 수 없습니다.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `http://146.56.158.19/api/admin/discord/channels/${record?.channel_id}/members`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            discord_user_id: selectedUser.discord_id,
            role: values.role || "member",
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        message.success("유저가 채널에 추가되었습니다.");
        setIsAddUserModalOpen(false);
        addUserForm.resetFields();

        // PocketBase 서버에서 업데이트될 시간을 고려하여 약간의 딜레이 후 refetch
        setTimeout(async () => {
          await membersQueryResult.refetch();
        }, 500);
      } else {
        message.error(result.message || "유저 추가에 실패했습니다.");
      }
    } catch (error) {
      message.error("유저 추가 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 유저 제거
  const handleRemoveUser = (discordId: string, userName: string) => {
    if (!discordId) {
      message.error("Discord ID를 찾을 수 없습니다.");
      return;
    }

    Modal.confirm({
      title: "유저를 채널에서 제거하시겠습니까?",
      content: `${userName} 님을 이 채널에서 제거합니다.`,
      okText: "제거",
      okType: "danger",
      cancelText: "취소",
      onOk: async () => {
        try {
          const url = `http://146.56.158.19/api/admin/discord/channels/${record?.channel_id}/members/${discordId}`;

          const response = await fetch(url, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          });

          const result = await response.json();

          if (result.success) {
            message.success("유저가 채널에서 제거되었습니다.");

            // PocketBase 서버에서 업데이트될 시간을 고려하여 약간의 딜레이 후 refetch
            setTimeout(async () => {
              await membersQueryResult.refetch();
            }, 500);
          } else {
            message.error(result.message || "유저 제거에 실패했습니다.");
          }
        } catch (error) {
          message.error("유저 제거 중 오류가 발생했습니다.");
        }
      },
    });
  };

  return (
    <Show isLoading={isLoading}>
      <Tabs
        defaultActiveKey="info"
        items={[
          {
            key: "info",
            label: "채널 정보",
            icon: <InfoCircleOutlined />,
            children: (
              <Descriptions bordered column={1}>
                <Descriptions.Item label="ID">{record?.id}</Descriptions.Item>
                <Descriptions.Item label="채널 ID">{record?.channel_id || "-"}</Descriptions.Item>
                <Descriptions.Item label="채널명">{record?.name || "-"}</Descriptions.Item>
                <Descriptions.Item label="길드 ID">{record?.guild_id || "-"}</Descriptions.Item>
                <Descriptions.Item label="타입">{record?.type || "-"}</Descriptions.Item>
                <Descriptions.Item label="부모 ID">{record?.parent_id || "-"}</Descriptions.Item>
                <Descriptions.Item label="소유자 ID">{record?.owner_id || "-"}</Descriptions.Item>
                <Descriptions.Item label="주제">{record?.topic || "-"}</Descriptions.Item>
                <Descriptions.Item label="비공개 여부">
                  <Tag color={record?.is_private ? "red" : "green"}>
                    {record?.is_private ? "비공개" : "공개"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="활성 상태">
                  <Tag color={record?.is_active ? "green" : "red"}>
                    {record?.is_active ? "활성" : "비활성"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="생성일">
                  {record?.created ? new Date(record.created).toLocaleString() : "-"}
                </Descriptions.Item>
                <Descriptions.Item label="수정일">
                  {record?.updated ? new Date(record.updated).toLocaleString() : "-"}
                </Descriptions.Item>
              </Descriptions>
            ),
          },
          {
            key: "members",
            label: "멤버 관리",
            icon: <UserOutlined />,
            children: (
              <>
                <Space style={{ marginBottom: 16 }}>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsAddUserModalOpen(true)}
                  >
                    유저 추가
                  </Button>
                </Space>
                <Table {...membersTableProps} rowKey="id" pagination={false}>
                  <Table.Column
                    dataIndex={["expand", "discord_user_id", "name"]}
                    title="이름"
                    width={150}
                    render={(name, record: any) => name || record.discord_user_id || "-"}
                  />
                  <Table.Column
                    dataIndex={["expand", "discord_user_id", "username"]}
                    title="디스코드 아이디"
                    width={200}
                  />
                  <Table.Column
                    dataIndex={["expand", "discord_user_id", "email"]}
                    title="이메일"
                    width={200}
                  />
                  <Table.Column
                    dataIndex="role"
                    title="역할"
                    width={100}
                    render={(role) => (
                      <Tag color="blue">{role || "member"}</Tag>
                    )}
                  />
                  <Table.Column
                    dataIndex="created"
                    title="추가일"
                    width={180}
                    render={(created) => (created ? new Date(created).toLocaleString() : "-")}
                  />
                  <Table.Column
                    title="작업"
                    width={100}
                    render={(_, record: any) => (
                      <Button
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => {
                          const discordId = record.expand?.discord_user_id?.discord_id;
                          const userName = record.expand?.discord_user_id?.name || record.expand?.discord_user_id?.username || "알 수 없음";
                          handleRemoveUser(discordId, userName);
                        }}
                      >
                        제거
                      </Button>
                    )}
                  />
                </Table>

                <Modal
                  title="채널에 유저 추가"
                  open={isAddUserModalOpen}
                  onOk={handleAddUser}
                  onCancel={() => {
                    setIsAddUserModalOpen(false);
                    addUserForm.resetFields();
                  }}
                  okText="추가"
                  cancelText="취소"
                  confirmLoading={loading}
                >
                  <Form form={addUserForm} layout="vertical">
                    <Form.Item
                      name="user_record_id"
                      label="유저 선택"
                      rules={[{ required: true, message: "유저를 선택하세요" }]}
                    >
                      <Select
                        showSearch
                        placeholder="유저를 선택하세요"
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                        }
                        options={allUsers.map((user: any) => ({
                          label: `${user.name} (${user.username}) - Discord ID: ${user.discord_id}`,
                          value: user.id,
                        }))}
                      />
                    </Form.Item>
                    <Form.Item
                      name="role"
                      label="역할"
                      initialValue="member"
                    >
                      <Select
                        options={[
                          { label: "멤버", value: "member" },
                          { label: "관리자", value: "admin" },
                          { label: "모더레이터", value: "moderator" },
                        ]}
                      />
                    </Form.Item>
                  </Form>
                </Modal>
              </>
            ),
          },
        ]}
      />
    </Show>
  );
};
