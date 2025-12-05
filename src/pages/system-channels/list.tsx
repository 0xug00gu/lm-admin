import { List } from "@refinedev/antd";
import { Table, Button, Space, Tag, Modal, Form, Select, Input, Switch, message, Card, Empty } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { getPocketBaseInstance } from "../../providers/pocketbaseDataProvider";
import { api } from "../../config/env";

const SYSTEM_CHANNEL_TYPES = [
  { label: "부활방", value: "revival_room" },
  { label: "휴식방", value: "rest_room" },
  { label: "공지방", value: "announcement" },
];

const getTypeLabel = (type: string) => {
  const found = SYSTEM_CHANNEL_TYPES.find((t) => t.value === type);
  return found ? found.label : type;
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "revival_room":
      return "orange";
    case "rest_room":
      return "blue";
    case "announcement":
      return "green";
    default:
      return "default";
  }
};

export const SystemChannelList = () => {
  const [guilds, setGuilds] = useState<any[]>([]);
  const [selectedGuildId, setSelectedGuildId] = useState<string>("");
  const [systemChannels, setSystemChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 모달 상태
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<any>(null);

  // 폼
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // 디스코드 카테고리 목록
  const [categories, setCategories] = useState<any[]>([]);
  const [createLoading, setCreateLoading] = useState(false);

  // 길드 목록 가져오기
  const fetchGuilds = async () => {
    try {
      const response = await fetch(api.discord.guilds());
      const result = await response.json();
      if (result.success) {
        setGuilds(result.data);
        // 첫 번째 길드 자동 선택
        if (result.data.length > 0) {
          setSelectedGuildId(result.data[0].id);
        }
      }
    } catch (error) {
      console.error("길드 목록 가져오기 실패:", error);
      message.error("길드 목록을 가져오는데 실패했습니다.");
    }
  };

  // 시스템 채널 목록 가져오기 (PocketBase)
  const fetchSystemChannels = async (guildId: string) => {
    if (!guildId) return;

    setLoading(true);
    try {
      const pb = await getPocketBaseInstance();
      if (!pb) {
        message.error("DB 연결에 실패했습니다.");
        setLoading(false);
        return;
      }

      const result = await pb.collection("system_channels").getFullList({
        filter: `guild_id='${guildId}'`,
      });
      setSystemChannels(result || []);
    } catch (error) {
      console.error("시스템 채널 목록 가져오기 실패:", error);
      message.error("시스템 채널 목록을 가져오는데 실패했습니다.");
      setSystemChannels([]);
    } finally {
      setLoading(false);
    }
  };


  // 컴포넌트 마운트 시 길드 목록 가져오기
  useEffect(() => {
    fetchGuilds();
  }, []);

  // 길드 선택 시 시스템 채널 및 카테고리 목록 가져오기
  useEffect(() => {
    if (selectedGuildId) {
      fetchSystemChannels(selectedGuildId);
      fetchCategories(selectedGuildId);
    }
  }, [selectedGuildId]);

  // 디스코드 카테고리 목록 가져오기
  const fetchCategories = async (guildId: string) => {
    try {
      const response = await fetch(api.discord.guildCategories(guildId));
      const result = await response.json();
      if (result.success) {
        setCategories(result.data || []);
      }
    } catch (error) {
      console.error("카테고리 목록 가져오기 실패:", error);
    }
  };

  // 이미 생성된 시스템 채널 타입 가져오기
  const getExistingTypes = () => {
    return systemChannels.map((ch: any) => ch.type);
  };

  // 생성 가능한 시스템 채널 타입 (휴식방, 리셋방은 1개만)
  const getAvailableTypes = () => {
    const existingTypes = getExistingTypes();
    return SYSTEM_CHANNEL_TYPES.filter((type) => {
      // 공지방은 여러 개 가능
      if (type.value === "announcement") return true;
      // 휴식방, 리셋방은 이미 있으면 제외
      return !existingTypes.includes(type.value);
    });
  };

  // 시스템 채널 생성 - PocketBase insert 방식 (백엔드 Hook이 Discord 채널 자동 생성)
  const handleCreate = async () => {
    try {
      const values = await createForm.validateFields();
      setCreateLoading(true);

      // 휴식방/리셋방 중복 체크
      const existingTypes = getExistingTypes();
      if ((values.type === "revival_room" || values.type === "rest_room") && existingTypes.includes(values.type)) {
        const typeName = values.type === "revival_room" ? "부활방" : "휴식방";
        message.error(`${typeName}은(는) 길드당 1개만 생성할 수 있습니다.`);
        setCreateLoading(false);
        return;
      }

      const pb = await getPocketBaseInstance();
      if (!pb) {
        message.error("DB 연결에 실패했습니다.");
        setCreateLoading(false);
        return;
      }

      // system_channels 테이블에 insert → 백엔드 Hook이 Discord 채널 자동 생성
      await pb.collection("system_channels").create({
        guild_id: selectedGuildId,
        type: values.type,
        name: values.name,
        parent_id: values.parent_id || "",
        is_private: values.is_private || false,
        is_active: true,
      });

      message.success("시스템 채널이 생성되었습니다.");
      setIsCreateModalOpen(false);
      createForm.resetFields();
      fetchSystemChannels(selectedGuildId);
    } catch (error: any) {
      console.error("시스템 채널 생성 에러:", error);
      const errorMessage = error?.data?.message || error?.message || "시스템 채널 생성 중 오류가 발생했습니다.";
      message.error(errorMessage);
    } finally {
      setCreateLoading(false);
    }
  };

  // 시스템 채널 수정 모달 열기
  const handleEditOpen = (channel: any) => {
    setEditingChannel(channel);
    editForm.setFieldsValue({
      name: channel.name,
      is_active: channel.is_active,
    });
    setIsEditModalOpen(true);
  };

  // 시스템 채널 수정 (PocketBase)
  const handleEdit = async () => {
    try {
      const values = await editForm.validateFields();

      const pb = await getPocketBaseInstance();
      if (!pb) {
        message.error("DB 연결에 실패했습니다.");
        return;
      }

      // system_channels 테이블 업데이트 → 백엔드 Hook이 Discord 채널 업데이트
      await pb.collection("system_channels").update(editingChannel.id, {
        name: values.name,
        is_active: values.is_active,
      });

      message.success("시스템 채널이 수정되었습니다.");
      setIsEditModalOpen(false);
      setEditingChannel(null);
      editForm.resetFields();
      fetchSystemChannels(selectedGuildId);
    } catch (error: any) {
      console.error("시스템 채널 수정 에러:", error);
      const errorMessage = error?.data?.message || error?.message || "시스템 채널 수정 중 오류가 발생했습니다.";
      message.error(errorMessage);
    }
  };

  // 시스템 채널 삭제 (Discord 채널 + DB)
  const handleDelete = (channel: any) => {
    Modal.confirm({
      title: "⚠️ 시스템 채널을 삭제하시겠습니까?",
      content: (
        <div>
          <p><strong>"{channel.name}"</strong> 시스템 채널을 삭제합니다.</p>
          <p style={{ color: "#ff4d4f", fontWeight: "bold" }}>
            Discord 서버에서 해당 채널이 영구적으로 삭제되며, 이 작업은 되돌릴 수 없습니다.
          </p>
        </div>
      ),
      okText: "삭제",
      okType: "danger",
      cancelText: "취소",
      onOk: async () => {
        const pb = await getPocketBaseInstance();
        if (!pb) {
          message.error("DB 연결에 실패했습니다.");
          return;
        }

        try {
          // system_channels 테이블에서 삭제 → 백엔드 Hook이 Discord 채널 자동 삭제
          await pb.collection("system_channels").delete(channel.id);

          message.success("시스템 채널이 삭제되었습니다.");
          fetchSystemChannels(selectedGuildId);
        } catch (error: any) {
          console.error("시스템 채널 삭제 에러:", error);
          const errorMessage = error?.data?.message || error?.message || "시스템 채널 삭제 중 오류가 발생했습니다.";
          message.error(errorMessage);
        }
      },
    });
  };

  return (
    <List
      headerButtons={() => (
        <Space>
          <Select
            placeholder="길드 선택"
            style={{ width: 250 }}
            value={selectedGuildId}
            onChange={setSelectedGuildId}
            options={guilds.map((guild) => ({
              label: `${guild.name} (${guild.member_count}명)`,
              value: guild.id,
            }))}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsCreateModalOpen(true)}
            disabled={!selectedGuildId}
          >
            시스템 채널 추가
          </Button>
        </Space>
      )}
    >
      <Card>
        {systemChannels.length === 0 && !loading ? (
          <Empty description="등록된 시스템 채널이 없습니다." />
        ) : (
          <Table
            dataSource={systemChannels}
            rowKey="id"
            loading={loading}
            pagination={false}
          >
            <Table.Column
              dataIndex="type"
              title="타입"
              width={120}
              render={(type) => (
                <Tag color={getTypeColor(type)}>{getTypeLabel(type)}</Tag>
              )}
            />
            <Table.Column dataIndex="name" title="채널 이름" width={200} />
            <Table.Column
              dataIndex="channel_id"
              title="Discord 채널 ID"
              width={200}
            />
            <Table.Column
              dataIndex="is_active"
              title="상태"
              width={100}
              render={(is_active) => (
                <Tag color={is_active ? "green" : "red"}>
                  {is_active ? "활성" : "비활성"}
                </Tag>
              )}
            />
            <Table.Column
              title="작업"
              width={150}
              render={(_, record: any) => (
                <Space>
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => handleEditOpen(record)}
                  >
                    수정
                  </Button>
                  <Button
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(record)}
                  >
                    삭제
                  </Button>
                </Space>
              )}
            />
          </Table>
        )}
      </Card>

      {/* 시스템 채널 생성 Modal */}
      <Modal
        title="시스템 채널 추가"
        open={isCreateModalOpen}
        onOk={handleCreate}
        onCancel={() => {
          setIsCreateModalOpen(false);
          createForm.resetFields();
        }}
        okText="추가"
        cancelText="취소"
        confirmLoading={createLoading}
      >
        <Form form={createForm} layout="vertical">
          <Form.Item
            name="type"
            label="채널 타입"
            rules={[{ required: true, message: "채널 타입을 선택하세요" }]}
          >
            <Select
              placeholder="채널 타입을 선택하세요"
              options={getAvailableTypes()}
            />
          </Form.Item>
          {getAvailableTypes().length === 0 && (
            <div style={{ color: "#ff4d4f", marginBottom: 16 }}>
              모든 시스템 채널이 이미 생성되어 있습니다.
            </div>
          )}
          <Form.Item
            name="parent_id"
            label="Discord 카테고리"
          >
            <Select
              placeholder="카테고리를 선택하세요 (선택사항)"
              allowClear
              options={categories.map((cat) => ({
                label: cat.name,
                value: cat.id,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="name"
            label="채널 이름"
            rules={[{ required: true, message: "채널 이름을 입력하세요" }]}
          >
            <Input placeholder="채널 이름을 입력하세요" />
          </Form.Item>
          <Form.Item
            name="is_private"
            label="비공개 채널"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      {/* 시스템 채널 수정 Modal */}
      <Modal
        title="시스템 채널 수정"
        open={isEditModalOpen}
        onOk={handleEdit}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditingChannel(null);
          editForm.resetFields();
        }}
        okText="저장"
        cancelText="취소"
      >
        <Form form={editForm} layout="vertical">
          <Form.Item label="채널 타입">
            <Tag color={getTypeColor(editingChannel?.type)}>
              {getTypeLabel(editingChannel?.type || "")}
            </Tag>
          </Form.Item>
          <Form.Item
            name="name"
            label="채널 이름"
            rules={[{ required: true, message: "채널 이름을 입력하세요" }]}
          >
            <Input placeholder="채널 이름을 입력하세요" />
          </Form.Item>
          <Form.Item
            name="is_active"
            label="활성 상태"
            valuePropName="checked"
          >
            <Switch checkedChildren="활성" unCheckedChildren="비활성" />
          </Form.Item>
        </Form>
      </Modal>
    </List>
  );
};
