import { Show, useForm } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Tabs, Descriptions, Table, Tag, Button, Space, Form, Input } from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined, SaveOutlined, CloseOutlined } from "@ant-design/icons";
import { useState } from "react";

export const UserShow = () => {
  const { queryResult } = useShow({
    resource: "discord_users",
  });

  const userData = queryResult?.data?.data;
  const [isEditing, setIsEditing] = useState(false);

  const { formProps, saveButtonProps, form } = useForm({
    resource: "discord_users",
    action: "edit",
    id: userData?.id,
    redirect: false,
    onMutationSuccess: () => {
      setIsEditing(false);
      queryResult.refetch();
    },
  });

  const handleEdit = () => {
    form.setFieldsValue({
      name: userData?.name || "",
      phone: userData?.phone || "",
      username: userData?.username || "",
      discord_id: userData?.discord_id || "",
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    form.resetFields();
    setIsEditing(false);
  };

  return (
    <Show
      headerButtons={({ defaultButtons }) => (
        <>
          {defaultButtons}
          {!isEditing ? (
            <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
              수정
            </Button>
          ) : (
            <Space>
              <Button icon={<CloseOutlined />} onClick={handleCancel}>
                취소
              </Button>
              <Button type="primary" icon={<SaveOutlined />} {...saveButtonProps}>
                저장
              </Button>
            </Space>
          )}
        </>
      )}
    >
      <Tabs
        defaultActiveKey="info"
        items={[
          {
            key: "info",
            label: "기본 정보",
            children: isEditing ? (
              <Form {...formProps} layout="vertical">
                <Form.Item label="이름" name="name" rules={[{ required: true, message: "이름을 입력하세요" }]}>
                  <Input />
                </Form.Item>
                <Form.Item label="휴대전화" name="phone">
                  <Input />
                </Form.Item>
                <Form.Item label="디스코드 아이디" name="username">
                  <Input />
                </Form.Item>
                <Form.Item label="Discord ID" name="discord_id">
                  <Input disabled />
                </Form.Item>
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="ID">{userData?.id}</Descriptions.Item>
                  <Descriptions.Item label="활성 상태">
                    <Tag color={userData?.is_active ? "green" : "red"}>
                      {userData?.is_active ? "활성" : "비활성"}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Form>
            ) : (
              <Descriptions bordered column={1}>
                <Descriptions.Item label="ID">{userData?.id}</Descriptions.Item>
                <Descriptions.Item label="이름">{userData?.name || "-"}</Descriptions.Item>
                <Descriptions.Item label="휴대전화">{userData?.phone || "-"}</Descriptions.Item>
                <Descriptions.Item label="Discord ID">{userData?.discord_id}</Descriptions.Item>
                <Descriptions.Item label="디스코드 아이디">{userData?.username}</Descriptions.Item>
                <Descriptions.Item label="활성 상태">
                  <Tag color={userData?.is_active ? "green" : "red"}>
                    {userData?.is_active ? "활성" : "비활성"}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            ),
          },
          {
            key: "purchases",
            label: "구매 이력",
            children: (
              <Table dataSource={[]} rowKey="id">
                <Table.Column dataIndex="date" title="날짜" />
                <Table.Column dataIndex="productName" title="상품명" />
                <Table.Column dataIndex="amount" title="금액" />
                <Table.Column dataIndex="paymentMethod" title="결제수단" />
              </Table>
            ),
          },
          {
            key: "classes",
            label: "수강 라이프마스터리",
            children: (
              <Table dataSource={[]} rowKey="id">
                <Table.Column dataIndex="className" title="라이프마스터리명" />
                <Table.Column dataIndex="period" title="기간" />
                <Table.Column
                  dataIndex="status"
                  title="진행상태"
                  render={(status) => <Tag color="blue">{status}</Tag>}
                />
              </Table>
            ),
          },
          {
            key: "challenges",
            label: "참여 챌린지",
            children: (
              <>
                <Space style={{ marginBottom: 16 }}>
                  <Button type="primary" icon={<PlusOutlined />}>
                    챌린지 추가
                  </Button>
                </Space>
                <Table dataSource={[]} rowKey="id">
                  <Table.Column dataIndex="challengeName" title="챌린지명" />
                  <Table.Column dataIndex="team" title="팀" />
                  <Table.Column dataIndex="period" title="기간" />
                  <Table.Column dataIndex="attendanceRate" title="출석률" />
                  <Table.Column
                    title="작업"
                    width={80}
                    render={(_, record: any) => (
                      <Button
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                      >
                        삭제
                      </Button>
                    )}
                  />
                </Table>
              </>
            ),
          },
        ]}
      />
    </Show>
  );
};
